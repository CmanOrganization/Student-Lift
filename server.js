const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.')); // serve your existing HTML/CSS/JS

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running! 🚀' });
});

// Placeholder route for rides
app.get('/api/rides', (req, res) => {
  res.json({ rides: [] });
});

app.post('/api/rides', (req, res) => {
  res.json({ message: 'Ride request received', data: req.body });
});

// Start server
app.listen(PORT, () => {
  console.log(`Student Lift server running on port ${PORT}`);
});
