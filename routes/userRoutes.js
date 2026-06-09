const express = require('express');
const router = express.Router();
const User = require('../Models/User');

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('firstName lastName campus email phoneNumber avatar bio ratingSummary');
        if (!user) return res.status(404).json({ error: 'Driver not found.' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
