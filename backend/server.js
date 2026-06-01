// Server entrypoint - CP Tracker (Atlas Connected)
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables from .env file (only locally, Vercel injects them automatically)
if (!process.env.VERCEL) {
  require('dotenv').config();
}

// Initialize express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ensure DB is connected before handling any request (critical for serverless cold starts)
let dbConnected = false;
app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (err) {
      console.error('DB middleware connection error:', err.message);
      return res.status(500).json({ message: 'Database connection failed. Check MONGO_URI and Atlas IP whitelist.' });
    }
  }
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/platforms', require('./routes/platforms'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Coding Platform Tracker API is running' });
});

// Start Server only in local/non-serverless environments
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
