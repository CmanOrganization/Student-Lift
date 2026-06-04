const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL || '';

app.use(express.json());
app.use(cors());

// Serve static directories explicitly so routes like '/' and '/pages/*' resolve
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use('/css', express.static(path.join(__dirname, 'assets', 'css')));


// Mount existing route modules
const rideRoutes = require('./routes/rideRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/auth', authRoutes);

function healthHandler(req, res) {
  res.json({ status: 'Server is running! 🚀' });
}

app.get('/api/health', healthHandler);

function rootHandler(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
}

app.get('/', rootHandler);

function onDbConnected() {
  console.log('MongoDB connected');
  startServer();
}

function onDbError(err) {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}

function connectDB() {
  if (!MONGODB_URI) {
    console.error('No MongoDB URI provided. Set MONGODB_URI environment variable.');
    process.exit(1);
  }

  mongoose.connect(MONGODB_URI)
    .then(function () { onDbConnected(); })
    .catch(function (err) { onDbError(err); });
}

function startServer() {
  function onListen() {
    console.log('Student Lift server running on port ' + PORT);
  }
  app.listen(PORT, onListen);
}

process.on('SIGINT', function () {
  mongoose.disconnect().then(function () {
    console.log('MongoDB disconnected due to app termination');
    process.exit(0);
  });
});

connectDB();

module.exports = app;
