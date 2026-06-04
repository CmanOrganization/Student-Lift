const express = require('express');
const router = express.Router();
const Ride = require('../Models/Ride');
const User = require('../Models/User');
const WalletTransaction = require('../Models/WalletTransaction');
const authMiddleware = require('../middleware/authMiddleware');

async function getRidesByStatus() {
    var results = await Ride.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    var map = {};
    for (var i = 0; i < results.length; i++) {
        var row = results[i];
        map[row._id] = row.count;
    }
    return map;
}

async function getTotalRevenueByType() {
    var results = await WalletTransaction.aggregate([
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);
    var map = { Credit: 0, Debit: 0 };
    for (var i = 0; i < results.length; i++) {
        var row = results[i];
        map[row._id] = row.total;
    }
    return map;
}

async function platformSummaryHandler(req, res) {
    try {
        var totalRides = await Ride.countDocuments();
        var activeRides = await Ride.countDocuments({ status: 'Active' });
        var completedRides = await Ride.countDocuments({ status: 'Completed' });
        var totalUsers = await User.countDocuments();
        var ridesByStatus = await getRidesByStatus();
        var revenueByType = await getTotalRevenueByType();

        return res.json({
            metricsTimestamp: new Date(),
            totalRidesCreated: totalRides,
            totalUsers: totalUsers,
            activePoolRatio: totalRides > 0 ? (activeRides / totalRides) * 100 : 0,
            completionRate: totalRides > 0 ? (completedRides / totalRides) * 100 : 0,
            ridesByStatus: ridesByStatus,
            revenueByType: revenueByType,
            totalRevenueExchanged: revenueByType.Debit || 0
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

router.get('/platform-summary', authMiddleware.protect, platformSummaryHandler);

module.exports = router;