const express = require('express');
const router = express.Router();

const Ride = require('../Models/Ride');
const User = require('../Models/User');
const RideRequest = require('../Models/RideRequest');

const authMiddleware = require('../middleware/authMiddleware');
const protect = authMiddleware.protect;

async function bookSeatHandler(req, res) {
    var rideId = req.body.rideId;
    var seatsRequested = req.body.seatsRequested;
    var passengerId = req.user && req.user.id;

    if (!rideId || !seatsRequested) {
        return res.status(400).json({ error: 'Missing rideId or seatsRequested' });
    }

    try {
        var ride = await Ride.findById(rideId);
        if (!ride || ride.status !== 'Active') {
            return res.status(404).json({ error: 'Ride not available.' });
        }
        if (ride.availableSeats < seatsRequested) {
            return res.status(400).json({ error: 'Not enough seats available.' });
        }

        var totalCost = ride.costPerSeat * seatsRequested;

        var updatedUser = await User.findOneAndUpdate(
            { _id: passengerId, 'wallet.balance': { $gte: totalCost } },
            { $inc: { 'wallet.balance': -totalCost, 'wallet.totalSpent': totalCost } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({ error: 'Insufficient wallet balance to complete request.' });
        }

        var rideUpdateResult = await Ride.updateOne(
            { _id: rideId, availableSeats: { $gte: seatsRequested } },
            { $inc: { availableSeats: -seatsRequested } }
        );

        if ((rideUpdateResult.modifiedCount && rideUpdateResult.modifiedCount === 0) || (rideUpdateResult.nModified && rideUpdateResult.nModified === 0)) {
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

        return res.status(200).json({ message: 'Seat booked and funds secured successfully.' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

router.post('/book-seat', protect, bookSeatHandler);

module.exports = router;