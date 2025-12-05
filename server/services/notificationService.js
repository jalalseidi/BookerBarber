const Notification = require('../models/Notification');
const User = require('../models/User');
const Booking = require('../models/Booking');
const logger = require('../utils/logger');
const emailService = require('./emailService');
const smsService = require('./smsService');

/**
 * Notification service to manage sending notifications
 */
class NotificationService {
  /**
   * Send notifications based on user preferences
   * @param {Object} options
   * @param {String} options.type
   * @param {ObjectId} options.userId
   * @param {Object} options.data
   * @returns {Promise<void>}
   */
  async handleNotification({ type, userId, data = {} }) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        logger.warn(`⚠️  User ${userId} not found for notification ${type}. This might be an orphaned booking.`);
        logger.info('💡 Consider running data cleanup script to fix orphaned bookings.');
        return; // Gracefully skip instead of throwing error
      }

      const preferences = user.notificationPreferences;
      
      // Check if user has this notification type enabled
      const typeKey = this.getPreferenceKey(type);
      if (!preferences[typeKey]) {
        logger.info(`Notification ${type} disabled for user ${userId}`);
        return;
      }
      
      // Prepare the notification
      const notificationData = this.prepareNotification(type, user, data);
      
      // Always send in-app notifications
      await this.createNotification({
        ...notificationData,
        channel: 'in_app',
      });

      // Send to user's preferred channel if available
      const canSendToPreferredChannel = this.canSendToChannel(user, preferences.primaryChannel);
      if (canSendToPreferredChannel) {
        await this.createNotification({
          ...notificationData,
          channel: preferences.primaryChannel,
        });
      } else {
        logger.warn(`Cannot send ${type} to ${preferences.primaryChannel} for user ${userId}. Missing required data.`);
        
        // If SMS is preferred but no phone, fallback to email
        if (preferences.primaryChannel === 'sms' && this.canSendToChannel(user, 'email')) {
          await this.createNotification({
            ...notificationData,
            channel: 'email',
          });
          logger.info(`Sent ${type} via email fallback for user ${userId}`);
        }
      }

    } catch (error) {
      logger.error(`Error handling notification for user ${userId}: ${error.message}`);
    }
  }

  /**
   * Check if we can send to a specific channel
   * @param {Object} user
   * @param {String} channel
   * @returns {Boolean}
   */
  canSendToChannel(user, channel) {
    switch (channel) {
      case 'email':
        return user.email && user.email.trim() !== '';
      case 'sms':
        return user.phone && user.phone.trim() !== '';
      case 'in_app':
        return true; // Always available
      default:
        return false;
    }
  }

  /**
   * Get preference key from notification type
   * @param {String} type
   * @returns {String}
   */
  getPreferenceKey(type) {
    const typeMap = {
      'booking_confirmation': 'bookingConfirmations',
      'booking_reminder_24h': 'bookingReminders',
      'booking_reminder_2h': 'bookingReminders',
      'booking_cancelled': 'bookingCancellations',
      'booking_rescheduled': 'bookingChanges',
      'new_booking_request': 'newBookingRequests',
      'daily_summary': 'dailySummary',
      'new_review': 'newReviews'
    };
    return typeMap[type] || type;
  }

  /**
   * Prepare notification data
   * @param {String} type
   * @param {Object} user
   * @param {Object} data
   * @returns {Object}
   */
  prepareNotification(type, user, data) {
    const messageTemplates = {
      booking_confirmation: `Hello ${user.name}, your booking for ${data.service} on ${data.date} at ${data.time} is confirmed!`,
      booking_reminder_24h: `Reminder: Your appointment for ${data.service} is in 24 hours.`,
      booking_reminder_2h: `Reminder: Your appointment for ${data.service} is in 2 hours.`,
      booking_cancelled: `Notice: Your appointment for ${data.service} has been cancelled.`,
      booking_rescheduled: `Notice: Your appointment for ${data.service} has been rescheduled to ${data.newDate} at ${data.newTime}.`,
      new_booking_request: `New booking request for ${data.service} on ${data.date} at ${data.time}.`,
      daily_summary: `Daily summary: You have ${data.count} appointments tomorrow.`,
      new_review: `New review from ${data.customerName}: "${data.review}"`
    };

    const titleTemplates = {
      booking_confirmation: 'Booking Confirmed',
      booking_reminder_24h: 'Appointment Reminder',
      booking_reminder_2h: 'Appointment Reminder',
      booking_cancelled: 'Appointment Cancelled',
      booking_rescheduled: 'Appointment Rescheduled',
      new_booking_request: 'New Booking Request',
      daily_summary: 'Daily Summary',
      new_review: 'New Review'
    };

    return {
      userId: user._id,
      bookingId: data.bookingId,
      type,
      title: titleTemplates[type] || type.replace(/_/g, ' ').toUpperCase(),
      message: messageTemplates[type] || 'New notification',
      data,
    };
  }

  /**
   * Create a new notification
   * @param {Object} options
   * @param {ObjectId} options.userId - ID of the user
   * @param {String} options.type - Type of the notification
   * @param {String} options.title - Title of the notification
   * @param {String} options.message - Message content
   * @param {String} options.channel - [email | sms | in_app]
   * @param {Object} [options.data] - Additional data
   * @param {Date} [options.scheduledAt] - When to send the notification
   * @returns {Promise<Notification>}
   */
  async createNotification({ userId, type, title, message, channel, data = {}, scheduledAt = new Date() }) {
    try {
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        channel,
        data,
        scheduledAt
      });
      await notification.save();
      
      // Automatically send the notification
      await this.sendNotification(notification);
      
      logger.info(`Created and sent ${type} notification for user ${userId} via ${channel}`);
      return notification;
    } catch (err) {
      logger.error('Error creating notification:', err);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Send a notification
   * @param {Notification} notification
   * @returns {Promise<void>}
   */
  async sendNotification(notification) {
    try {
      switch (notification.channel) {
        case 'email':
          await emailService.sendNotificationEmail(notification);
          break;
        case 'sms':
          await smsService.sendNotificationSMS(notification);
          break;
        case 'in_app':
          // In-app notifications are stored in database and shown in UI
          // No external sending required
          logger.info(`In-app notification ${notification._id} ready for display`);
          break;
        default:
          logger.warn(`Unknown notification channel: ${notification.channel}`);
      }

      // Mark as sent
      await notification.markAsSent();
      logger.info(`Sent notification ${notification._id} via ${notification.channel}`);
    } catch (err) {
      logger.error('Error sending notification:', err);
      await notification.markAsFailed(err.message);
      throw new Error('Failed to send notification');
    }
  }

  /**
   * Get user notifications
   * @param {ObjectId} userId
   * @param {Object} options
   * @returns {Promise<Array>}
   */
  async getUserNotifications(userId, { limit = 20, skip = 0, unreadOnly = false } = {}) {
    try {
      const query = { userId };
      if (unreadOnly) {
        query.readAt = null;
      }

      return await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
    } catch (err) {
      logger.error('Error fetching user notifications:', err);
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Mark notification as read
   * @param {ObjectId} notificationId
   * @param {ObjectId} userId
   * @returns {Promise<void>}
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({ _id: notificationId, userId });
      if (!notification) throw new Error('Notification not found');
      
      await notification.markAsRead();
      logger.info(`Marked notification ${notificationId} as read`);
    } catch (err) {
      logger.error('Error marking notification as read:', err);
      throw new Error('Failed to mark notification as read');
    }
  }

  /**
   * Mock send function for testing
   * @param {Notification} notification
   * @returns {Promise<void>}
   */
  async mockSendFunction(notification) {
    return new Promise((resolve) => {
      logger.info(`Sending ${notification.type} to ${notification.channel}`);
      setTimeout(() => resolve(), 1000); // Simulate network delay
    });
  }
}

// Export as singleton
module.exports = new NotificationService();

