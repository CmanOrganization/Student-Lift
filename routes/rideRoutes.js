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

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
router.get('/search', async (req, res) => {
    try {
        const { campus, date, passengers, maxBudget, pickup, dropoff } = req.query;

        const filter = { status: 'Active' };

        if (campus) {
            filter.campus = { $regex: new RegExp(`^${escapeRegex(campus)}$`, 'i') };
        }
        if (pickup) {
            filter.fromLocation = { $regex: new RegExp(escapeRegex(pickup), 'i') };
        }
        if (dropoff) {
            filter.toLocation = { $regex: new RegExp(escapeRegex(dropoff), 'i') };
        }
        if (passengers) filter.availableSeats = { $gte: parseInt(passengers) };
        if (maxBudget) filter.costPerSeat = { $lte: parseFloat(maxBudget) };

        if (date) {
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);

            filter.departureDate = {
                $gte: searchDate,
                $lt: nextDay
            };
        }

        const rides = await Ride.find(filter)
            .populate('driverID', 'firstName lastName ratingSummary profilePhoto')
            .sort({ departureDate: 1 });

        res.json(rides);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/my-rides', protect, async (req, res) => {
    try {
        const rides = await Ride.find({ driverID: req.user.id })
            .sort({ createdAt: -1 });
        res.json(rides);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

router.get('/:id', async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id).populate('driverID', 'firstName lastName ratingSummary profilePhoto');
        if (!ride) return res.status(404).json({ error: 'Ride not found.' });
        res.json(ride);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
