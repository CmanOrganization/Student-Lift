const express = require('express');
const router = express.Router();
const Ride = require('../Models/Ride');
const { protect } = require('../middleware/authMiddleware');

// POST /v1/rides/post-Ride  — driver posts a new ride
router.post('/post-Ride', protect, async (req, res) => {
    try {
        const newRide = new Ride({
            ...req.body,
            driverID: req.user.id
        });
        const savedRide = await newRide.save();
        res.status(201).json(savedRide);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /v1/rides/all-Rides  — all active rides (public)
router.get('/all-Rides', async (req, res) => {
    try {
        const rides = await Ride.find({ status: 'Active' })
            .populate('driverID', 'firstName lastName campus ratingSummary')
            .sort({ departureDate: 1 });
        res.json(rides);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /v1/rides/my-rides  — rides posted by the logged-in driver
router.get('/my-rides', protect, async (req, res) => {
    try {
        const rides = await Ride.find({ driverID: req.user.id })
            .sort({ createdAt: -1 });
        res.json(rides);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH /v1/rides/:id/cancel  — driver cancels their own ride
router.patch('/:id/cancel', protect, async (req, res) => {
    try {
        const ride = await Ride.findOneAndUpdate(
            { _id: req.params.id, driverID: req.user.id },
            { status: 'Cancelled' },
            { returnDocument: 'after' }
        );
        if (!ride) return res.status(404).json({ error: 'Ride not found or not yours.' });
        res.json(ride);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

// PATCH /v1/rides/:id/complete  — driver marks their own ride as completed
router.patch('/:id/complete', protect, async (req, res) => {
    try {
        const ride = await Ride.findOne({ _id: req.params.id, driverID: req.user.id, status: 'Active' });
        if (!ride) return res.status(404).json({ error: 'Active ride not found or not yours.' });

        const actualPassengers = ride.totalSeats - ride.availableSeats;
        const totalCost = actualPassengers * ride.costPerSeat;

        ride.status = 'Completed';
        ride.completionDetails = {
            actualPassengers,
            totalCost,
            completionStatus: 'Completed',
            completedAt: new Date()
        };
        await ride.save();

        res.json({ message: 'Ride marked as completed.', ride });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
