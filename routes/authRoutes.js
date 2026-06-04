const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../Models/User');
const authMiddleware = require('../middleware/authMiddleware');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'fallback_secret_key';
}

async function registerHandler(req, res) {
  try {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email && req.body.email.toLowerCase();
    var phoneNumber = req.body.phoneNumber;
    var password = req.body.password;
    var campus = req.body.campus;
    var studentID = req.body.studentID;
    var role = req.body.role || 'User';
    if (role !== 'User' && role !== 'Admin') {
      role = 'User';
    }

    if (!firstName || !lastName || !email || !phoneNumber || !password || !campus || !studentID) {
      return res.status(400).json({ error: 'Missing required registration fields.' });
    }

    var existing = await User.findOne({ $or: [ { email: email }, { studentID: studentID } ] });
    if (existing) {
      return res.status(409).json({ error: 'User with that email or student ID already exists.' });
    }

    var passwordHash = bcrypt.hashSync(password, 10);

    var newUser = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: phoneNumber,
      passwordHash: passwordHash,
      campus: campus,
      studentID: studentID,
      role: role,
      avatar: (firstName && firstName.charAt(0).toUpperCase()) || 'U'
    });

    var saved = await newUser.save();

    var token = jwt.sign({ id: saved._id, email: saved.email }, getJwtSecret(), { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    return res.status(201).json({ token: token, role: saved.role });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function loginHandler(req, res) {
  try {
    var email = req.body.email && req.body.email.toLowerCase();
    var password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required.' });
    }

    var user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    var passwordMatches = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    user.lastLogin = new Date();
    await user.save();

    var token = jwt.sign({ id: user._id, email: user.email }, getJwtSecret(), { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    return res.json({ token: token, role: user.role });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function meHandler(req, res) {
  try {
    var userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    var user = await User.findById(userId).select('-passwordHash -__v');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/me', authMiddleware.protect, meHandler);

module.exports = router;
