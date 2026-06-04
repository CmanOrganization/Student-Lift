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
app.use(express.static(path.join(__dirname, 'assets')));

// Mount existing route modules
const rideRoutes = require('./routes/rideRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const metricsRoutes = require('./routes/metricsRoutes');

app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/metrics', metricsRoutes);

function healthHandler(req, res) {
  res.json({ status: 'Server is running! 🚀' });
}

app.get('/api/health', healthHandler);

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

  mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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
