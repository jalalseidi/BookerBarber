const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');

    // Check if DATABASE_URL is defined
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not defined in environment variables');
      console.error('Please create a .env file with DATABASE_URL=mongodb://username:password@host:port/database');
      throw new Error('DATABASE_URL is not defined');
    }

    // Log connection string with credentials masked
    console.log(`Connection string: ${process.env.DATABASE_URL.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

    // Add connection options to handle timeouts and retries
    const options = {
      serverSelectionTimeoutMS: 30000, // Timeout for server selection (increased from default 30000ms)
      connectTimeoutMS: 30000, // Timeout for initial connection (increased from default 30000ms)
      socketTimeoutMS: 45000, // Timeout for operations (increased from default 30000ms)
      maxPoolSize: 10, // Maximum number of connections in the connection pool
      minPoolSize: 2, // Minimum number of connections in the connection pool
      retryWrites: true, // Enable retryable writes
      retryReads: true, // Enable retryable reads
    };

    console.log('Connection options:', JSON.stringify(options, null, 2));

    const startTime = Date.now();
    console.log(`Starting MongoDB connection at ${new Date().toISOString()}`);

    // Default to a local MongoDB instance if DATABASE_URL is not a valid connection string
    let connectionString = process.env.DATABASE_URL;
    if (!connectionString.startsWith('mongodb://') && !connectionString.startsWith('mongodb+srv://')) {
      console.warn('DATABASE_URL does not appear to be a valid MongoDB connection string');
      console.warn('Defaulting to mongodb://localhost:27017/barberbooker');
      connectionString = 'mongodb://localhost:27017/barberbooker';
    }

    const conn = await mongoose.connect(connectionString, options);

    console.log(`MongoDB connection established in ${Date.now() - startTime}ms`);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Log database name and collections
    const dbName = conn.connection.db.databaseName;
    console.log(`Connected to database: ${dbName}`);

    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`Available collections: ${collections.map(c => c.name).join(', ') || 'No collections found'}`);

    // Check if required collections exist
    const requiredCollections = ['users', 'bookings'];
    const missingCollections = requiredCollections.filter(
      c => !collections.some(col => col.name === c)
    );

    if (missingCollections.length > 0) {
      console.warn(`Missing required collections: ${missingCollections.join(', ')}`);
      console.warn('This may cause errors when trying to create or retrieve data');
    }

    // Error handling after initial connection
    mongoose.connection.on('error', err => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB shutdown:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('MongoDB connection failed:');
    console.error(`Error name: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);

    // Provide more specific error messages based on the error type
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB server. Please check that MongoDB is running.');
    } else if (error.name === 'MongoNetworkError') {
      console.error('Network error occurred while connecting to MongoDB. Please check your network connection.');
    } else if (error.name === 'MongoParseError') {
      console.error('Invalid MongoDB connection string. Please check your DATABASE_URL in .env file.');
    }

    // Rethrow the error to be caught by the server.js error handler
    throw error;
  }
};

module.exports = {
  connectDB,
};
