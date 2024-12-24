require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const notificationRoutes = require('./routes/notificationRoutes');
const logger = require('./utils/logger');
const apiLimiter = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Add rate limiter middleware
app.use('/notifications', apiLimiter);

// Routes
app.use('/notifications', notificationRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => logger.info('Connected to MongoDB'))
.catch((err) => logger.error('MongoDB connection error:', err));

// Start the server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

