const cron = require('node-cron');
const moment = require('moment');
const Booking = require('../models/Booking');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');

console.log('Scheduler initiated');

// Run every hour at the 0 minute mark
// It will check for both 24h and 2h reminders
cron.schedule('0 * * * *', async () => {
  try {
    logger.info('Running scheduled reminder check');

    const now = moment();

    // Find bookings that need 24h reminder (only confirmed bookings)
    const bookings24h = await Booking.find({
      'status': 'confirmed',
      'date': { $gt: now.toDate(), $lte: now.add(24, 'hours').toDate() }
    }).populate('customerId', '_id email').populate('barberId', '_id email');

    for (let booking of bookings24h) {
      // Skip bookings with missing customers or barbers
      if (!booking.customerId || !booking.barberId) {
        logger.warn(`⚠️  Skipping booking ${booking._id} - missing customer or barber data`);
        continue;
      }
      
      await notificationService.handleNotification({
        type: 'booking_reminder_24h',
        userId: booking.customerId._id,
        data: {
          bookingId: booking._id,
          service: booking.serviceDetails?.name,
          date: booking.date,
          time: booking.time
        }
      });
    }

    // Find bookings that need 2h reminder
    const bookings2h = await Booking.find({
      'status': 'confirmed',
      'date': { $gt: now.toDate(), $lte: now.add(2, 'hours').toDate() }
    }).populate('customerId', '_id email').populate('barberId', '_id email');

    for (let booking of bookings2h) {
      // Skip bookings with missing customers or barbers
      if (!booking.customerId || !booking.barberId) {
        logger.warn(`⚠️  Skipping booking ${booking._id} - missing customer or barber data`);
        continue;
      }
      
      await notificationService.handleNotification({
        type: 'booking_reminder_2h',
        userId: booking.customerId._id,
        data: {
          bookingId: booking._id,
          service: booking.serviceDetails?.name,
          date: booking.date,
          time: booking.time
        }
      });
    }

    logger.info('Reminder check completed');
  } catch (error) {
    logger.error('Error in scheduled job:', error);
  }
});

