const express = require('express');
const router = express.Router();
const Ride = require('../Models/Ride');
const User = require('../Models/User');
const RideRequest = require('../Models/RideRequest');
const { protect } = require('../middleware/authMiddleware');

// POST /v1/bookings/book-seat
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
            { returnDocument: 'after' }
        );

        if (!updatedUser) {
            return res.status(400).json({ error: 'Insufficient wallet balance to complete request.' });
        }

        const rideUpdateResult = await Ride.updateOne(
            { _id: rideId, availableSeats: { $gte: seatsRequested } },
            { $inc: { availableSeats: -seatsRequested } }
        );

        if (rideUpdateResult.modifiedCount === 0) {
            // Rollback wallet deduction
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

// GET /v1/bookings/my-requests  — all ride requests for the logged-in passenger
router.get('/my-requests', protect, async (req, res) => {
    try {
        const requests = await RideRequest.find({ passengerID: req.user.id })
            .populate('rideID', 'fromLocation toLocation departureDate departureTime costPerSeat status campus')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH /v1/bookings/:id/cancel  — passenger cancels their own ride request & refunds wallet
router.patch('/:id/cancel', protect, async (req, res) => {
    try {
        const request = await RideRequest.findOne({ _id: req.params.id, passengerID: req.user.id });
        if (!request) return res.status(404).json({ error: 'Request not found or not yours.' });
        if (['Cancelled', 'Rejected'].includes(request.status)) {
            return res.status(400).json({ error: 'Request is already cancelled.' });
        }

        const ride = await Ride.findById(request.rideID);
        const refundAmount = ride ? ride.costPerSeat * request.numberOfSeats : 0;

        // Refund wallet and restore seats
        await Promise.all([
            User.updateOne(
                { _id: req.user.id },
                { $inc: { 'wallet.balance': refundAmount, 'wallet.totalSpent': -refundAmount } }
            ),
            ride ? Ride.updateOne({ _id: ride._id }, { $inc: { availableSeats: request.numberOfSeats } }) : Promise.resolve(),
            RideRequest.updateOne({ _id: req.params.id }, { status: 'Cancelled', respondedAt: new Date() })
        ]);

        res.json({ message: `Request cancelled. R${refundAmount.toFixed(2)} refunded to your wallet.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
