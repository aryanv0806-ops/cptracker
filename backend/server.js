// Server entrypoint - CP Tracker (Atlas Connected)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/platforms', require('./routes/platforms'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Coding Platform Tracker API is running' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
