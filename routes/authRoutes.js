const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// POST /v1/auth/register
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, campus, studentID, password } = req.body;

        if (!firstName || !lastName || !email || !phoneNumber || !campus || !studentID || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const existing = await User.findOne({ $or: [{ email }, { studentID }] });
        if (existing) {
            return res.status(409).json({ error: 'Email or Student ID already registered.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({ firstName, lastName, email, phoneNumber, campus, studentID, passwordHash });

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                campus: user.campus,
                wallet: user.wallet,
                ratingSummary: user.ratingSummary
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /v1/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                campus: user.campus,
                wallet: user.wallet,
                ratingSummary: user.ratingSummary
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /v1/auth/me  — returns current user from token
router.get('/me', require('../middleware/authMiddleware').protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

// POST /v1/auth/wallet/topup  — add funds to wallet
router.post('/wallet/topup', require('../middleware/authMiddleware').protect, async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount.' });
        if (amount > 5000) return res.status(400).json({ error: 'Maximum top-up is R5000 at a time.' });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $inc: { 'wallet.balance': amount, 'wallet.totalAdded': amount }, 'wallet.lastUpdated': new Date() },
            { returnDocument: 'after' }
        ).select('-passwordHash');

        res.json({ message: `R${amount} added to your wallet.`, wallet: user.wallet });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
