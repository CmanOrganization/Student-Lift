const express = require('express');
const router = express.Router();
const Ride = require('../Models/Ride');
const User = require('../Models/User');

router.get('/platform-summary', async (req, res) => {
    try {
        const totalRides = await Ride.countDocuments();
        const activeRides = await Ride.countDocuments({ status: 'Active' });
        const completedRides = await Ride.countDocuments({ status: 'Completed' });
        
        
        const financialVolume = await Ride.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, totalPool: { $sum: "$completionDetails.totalCost" } } }
        ]);

        res.json({
            metricsTimestamp: new Date(),
            totalRidesCreated: totalRides,
            activePoolRatio: totalRides > 0 ? (activeRides / totalRides) * 100 : 0,
            completionRate: totalRides > 0 ? (completedRides / totalRides) * 100 : 0,
            totalRevenueExchanged: financialVolume[0]?.totalPool || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;