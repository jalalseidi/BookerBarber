const logger = require('../utils/logger');

class SMSService {
  constructor() {
    // In a real application, you would initialize Twilio or another SMS provider here
    // For now, we'll mock the SMS functionality
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Send an SMS message
   * @param {Object} options
   * @param {String} options.to - Recipient phone number
   * @param {String} options.message - SMS message content
   * @returns {Promise<void>}
   */
  async sendSMS({ to, message }) {
    try {
      // In development, just log the SMS
      if (!this.isProduction) {
        logger.info('📱 SMS would be sent:', {
          to: to,
          message: message
        });
        return Promise.resolve({ messageId: 'mock-sms-id', status: 'sent' });
      }

      // In production, you would integrate with a real SMS service like Twilio
      /*
      const client = require('twilio')(accountSid, authToken);
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });
      */

      // For now, mock the response
      logger.info(`SMS sent successfully to ${to}`);
      return { messageId: 'mock-sms-id', status: 'sent' };
      
    } catch (error) {
      logger.error(`Failed to send SMS to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send notification SMS
   * @param {Object} notification
   * @returns {Promise<void>}
   */
  async sendNotificationSMS(notification) {
    try {
      const user = await require('../models/User').findById(notification.userId);
      
      if (!user || !user.phone) {
        throw new Error('User phone number not found');
      }

      // Create SMS message (keep it concise for SMS)
      const smsMessage = this.createSMSMessage(notification);

      await this.sendSMS({
        to: user.phone,
        message: smsMessage
      });

      logger.info(`Notification SMS sent to ${user.phone} for ${notification.type}`);
    } catch (error) {
      logger.error('Error sending notification SMS:', error);
      throw error;
    }
  }

  /**
   * Create SMS message content (keep it short and concise)
   * @param {Object} notification
   * @returns {String}
   */
  createSMSMessage(notification) {
    const { type, title, data } = notification;
    
    const smsTemplates = {
      booking_confirmation: `✅ BarberBooker: Your ${data.service} appointment is confirmed for ${data.date} at ${data.time}. See you soon!`,
      booking_reminder_24h: `⏰ BarberBooker: Reminder - Your ${data.service} appointment is tomorrow at ${data.time}. We look forward to seeing you!`,
      booking_reminder_2h: `🚨 BarberBooker: Your ${data.service} appointment starts in 2 hours at ${data.time}. Please arrive on time!`,
      booking_cancelled: `❌ BarberBooker: Your ${data.service} appointment has been cancelled. Please reschedule if needed.`,
      booking_rescheduled: `📅 BarberBooker: Your appointment has been rescheduled to ${data.newDate} at ${data.newTime}.`,
      new_booking_request: `📋 BarberBooker: New booking request for ${data.service} on ${data.date} at ${data.time}.`,
      daily_summary: `📊 BarberBooker: You have ${data.count} appointments tomorrow. Have a great day!`,
      new_review: `⭐ BarberBooker: You received a new review from ${data.customerName}!`
    };

    return smsTemplates[type] || `BarberBooker: ${title}`;
  }

  /**
   * Validate phone number format
   * @param {String} phoneNumber
   * @returns {Boolean}
   */
  isValidPhoneNumber(phoneNumber) {
    // Basic phone number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Format phone number for SMS sending
   * @param {String} phoneNumber
   * @returns {String}
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digits except +
    let formatted = phoneNumber.replace(/[^\d\+]/g, '');
    
    // Add + if not present and doesn't start with country code
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    
    return formatted;
  }
}

module.exports = new SMSService();
