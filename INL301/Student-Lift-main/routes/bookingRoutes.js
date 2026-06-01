router.post('/book-seat', protect, async (req, res) => {
    const { rideId, seatsRequested } = req.body;
    const passengerId = req.user.id;

    try {
        
        const ride = await Ride.findById(rideId);
        if (!ride || ride.status !== 'Active') {
            return res.status(404).json({ error: 'Ride not available.' });
        }
        if (ride.availableSeats < seatsRequested) {
            return res.status(400).json({ error: 'Not enough seats available.' });
        }

        const totalCost = ride.costPerSeat * seatsRequested;

        
        const updatedUser = await User.findOneAndUpdate(
            { _id: passengerId, 'wallet.balance': { $gte: totalCost } },
            { $inc: { 'wallet.balance': -totalCost, 'wallet.totalSpent': totalCost } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({ error: 'Insufficient wallet balance to complete request.' });
        }

        
        const rideUpdateResult = await Ride.updateOne(
            { _id: rideId, availableSeats: { $gte: seatsRequested } },
            { $inc: { availableSeats: -seatsRequested } }
        );

        
        if (rideUpdateResult.modifiedCount === 0) {
            
            await User.updateOne(
                { _id: passengerId },
                { $inc: { 'wallet.balance': totalCost, 'wallet.totalSpent': -totalCost } }
            );
            return res.status(400).json({ error: 'Seats were taken by another student. Wallet refunded.' });
        }

        
        await RideRequest.create({
            rideID: rideId,
            passengerID: passengerId,
            numberOfSeats: seatsRequested,
            status: 'Accepted', 
            notes: 'Automated booking payment completed.'
        });

        res.status(200).json({ message: 'Seat booked and funds secured successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});