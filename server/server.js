// Load environment variables
const path = require('path');
require("dotenv").config({ path: path.join(__dirname, '.env') });
const mongoose = require("mongoose");
const express = require("express");
// const session = require("express-session"); // Uncomment if session management is needed
// const MongoStore = require('connect-mongo'); // Uncomment if session store is needed
const basicRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const barberRoutes = require("./routes/barberRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { connectDB } = require("./config/database");
const cors = require("cors");
const logger = require("./utils/logger");

// Initialize scheduler for notifications
require('./services/scheduler');

if (!process.env.DATABASE_URL) {
  logger.error("Error: DATABASE_URL variable in .env missing.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;
// Pretty-print JSON responses
app.enable('json spaces');
// We want to be consistent with URL paths, so we enable strict routing
app.enable('strict routing');

// CORS configuration for mobile and desktop compatibility
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5174',
      'http://localhost:3000',
      'https://booker-barber.vercel.app',
      'https://barber-booker1.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// Check if MongoDB is installed and running
const { exec } = require('child_process');

// Connect to database
let dbConnected = false;
const initializeDatabase = async () => {
  if (!dbConnected) {
    try {
      logger.info('Connecting to MongoDB...');
      await connectDB();
      dbConnected = true;
      logger.info('MongoDB connected successfully');
    } catch (error) {
      logger.error(`MongoDB connection failed: ${error.message}`);
      throw error;
    }
  }
};

// Middleware to ensure database is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Start server if not in serverless environment (Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  (async () => {
    try {
      // Check if MongoDB is running (platform-specific)
      if (process.platform === 'win32') {
        logger.info('Checking if MongoDB is running on Windows...');
        exec('sc query MongoDB', (error, stdout) => {
          if (error || stdout.includes('STOPPED')) {
            logger.warn('MongoDB service might not be running. Please start MongoDB before using this application.');
            logger.warn('You can start MongoDB by running: net start MongoDB');
          } else if (stdout.includes('RUNNING')) {
            logger.info('MongoDB service appears to be running.');
          }
        });
      } else if (process.platform === 'linux' || process.platform === 'darwin') {
        logger.info(`Checking if MongoDB is running on ${process.platform}...`);
        exec('pgrep mongod', (error) => {
          if (error) {
            logger.warn('MongoDB process might not be running. Please start MongoDB before using this application.');
            logger.warn('You can start MongoDB by running: sudo service mongod start (Linux) or brew services start mongodb-community (macOS)');
          } else {
            logger.info('MongoDB process appears to be running.');
          }
        });
      }

      // Attempt to connect to MongoDB
      await initializeDatabase();

      // Start the server only after successful database connection
      app.listen(port, () => {
        logger.info(`Server running at http://localhost:${port}`);
      });
    } catch (error) {
      logger.error('Failed to connect to MongoDB. Server will not start.');
      logger.error(`Error details: ${error.message}`);

      // Provide helpful instructions based on the error
      if (error.name === 'MongoServerSelectionError') {
        logger.error('\nPossible solutions:');
        logger.error('1. Make sure MongoDB is installed and running');
        logger.error('2. Check if the MongoDB connection string in .env file is correct');
        logger.error('3. Verify that MongoDB is listening on the specified port');

        if (process.platform === 'win32') {
          logger.error('\nOn Windows, you can:');
          logger.error('- Check MongoDB service status: sc query MongoDB');
          logger.error('- Start MongoDB service: net start MongoDB');
        } else if (process.platform === 'linux') {
          logger.error('\nOn Linux, you can:');
          logger.error('- Check MongoDB service status: sudo systemctl status mongod');
          logger.error('- Start MongoDB service: sudo systemctl start mongod');
        } else if (process.platform === 'darwin') {
          logger.error('\nOn macOS, you can:');
          logger.error('- Check MongoDB service status: brew services list | grep mongodb');
          logger.error('- Start MongoDB service: brew services start mongodb-community');
        }
      }

      process.exit(1);
    }
  })();
}

app.on("error", (error) => {
  logger.error(`Server error: ${error.message}`);
  logger.error(error.stack);
});

// Basic Routes
app.use(basicRoutes);
// Authentication Routes
app.use('/api/auth', authRoutes);
// Barber Routes
app.use('/api/barbers', barberRoutes);
// Booking Routes
app.use('/api/bookings', bookingRoutes);
// Service Routes
app.use('/api/services', serviceRoutes);
// Notification Routes
app.use('/api/notifications', notificationRoutes);
// Message Routes
app.use('/api/messages', messageRoutes);

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  const { ErrorTypes } = require('./utils/errorHandler');
  next(ErrorTypes.NOT_FOUND(`Route ${req.originalUrl} not found`));
});

// Global error handling middleware
const { errorMiddleware } = require('./utils/errorHandler');
app.use(errorMiddleware);

// Export app for Vercel serverless
module.exports = app;
