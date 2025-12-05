#!/usr/bin/env node

/**
 * Clear Data Script for Barber Booking System
 * This script clears all data and problematic indexes
 */

const mongoose = require('mongoose');
const { connectDB } = require('../config/database');

// Import models
const User = require('../models/User');
const Barber = require('../models/Barber');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

const clearData = async () => {
  try {
    console.log('🧹 Starting data clearing process...');
    
    // Connect to database
    await connectDB();

    // Drop collections completely to clear any problematic indexes
    try {
      await mongoose.connection.db.collection('users').drop();
      console.log('✅ Dropped users collection');
    } catch (error) {
      console.log('ℹ️ Users collection doesn\'t exist or already empty');
    }

    try {
      await mongoose.connection.db.collection('barbers').drop();
      console.log('✅ Dropped barbers collection');
    } catch (error) {
      console.log('ℹ️ Barbers collection doesn\'t exist or already empty');
    }

    try {
      await mongoose.connection.db.collection('services').drop();
      console.log('✅ Dropped services collection');
    } catch (error) {
      console.log('ℹ️ Services collection doesn\'t exist or already empty');
    }

    try {
      await mongoose.connection.db.collection('bookings').drop();
      console.log('✅ Dropped bookings collection');
    } catch (error) {
      console.log('ℹ️ Bookings collection doesn\'t exist or already empty');
    }

    console.log('🎉 All data cleared successfully!');

  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📱 Database connection closed');
    process.exit(0);
  }
};

// Handle script execution
if (require.main === module) {
  clearData();
}

module.exports = { clearData };
