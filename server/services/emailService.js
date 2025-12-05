const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    // Initialize the transporter with Gmail SMTP (you can change this)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // Replace with your Gmail
        pass: process.env.EMAIL_PASS || 'your-app-password'     // Replace with your app password
      }
    });
  }

  /**
   * Send an email
   * @param {Object} options
   * @param {String} options.to - Recipient email
   * @param {String} options.subject - Email subject
   * @param {String} options.text - Plain text content
   * @param {String} options.html - HTML content
   * @returns {Promise<void>}
   */
  async sendEmail({ to, subject, text, html }) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to,
        subject,
        text,
        html
      };

      // For development, log instead of actually sending
      if (process.env.NODE_ENV === 'development') {
        logger.info('📧 Email would be sent:', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          text: mailOptions.text
        });
        return Promise.resolve({ messageId: 'mock-email-id' });
      }

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}: ${result.messageId}`);
      return result;
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send notification email
   * @param {Object} notification
   * @returns {Promise<void>}
   */
  async sendNotificationEmail(notification) {
    try {
      const { title, message, data } = notification;
      const user = await require('../models/User').findById(notification.userId);
      
      if (!user || !user.email) {
        throw new Error('User email not found');
      }

      // Create HTML template
      const html = this.createEmailTemplate(title, message, data);

      await this.sendEmail({
        to: user.email,
        subject: title,
        text: message,
        html
      });

      logger.info(`Notification email sent to ${user.email} for ${notification.type}`);
    } catch (error) {
      logger.error('Error sending notification email:', error);
      throw error;
    }
  }

  /**
   * Create HTML template for emails
   * @param {String} title
   * @param {String} message
   * @param {Object} data
   * @returns {String}
   */
  createEmailTemplate(title, message, data) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: #4A90E2; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
            .content { padding: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
            .btn { display: inline-block; padding: 12px 24px; background: #4A90E2; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚿 BarberBooker</h1>
              <h2>${title}</h2>
            </div>
            <div class="content">
              <p>${message}</p>
              ${data.service ? `
                <div class="details">
                  <h3>📋 Booking Details:</h3>
                  <p><strong>Service:</strong> ${data.service}</p>
                  <p><strong>Date:</strong> ${data.date}</p>
                  <p><strong>Time:</strong> ${data.time}</p>
                  ${data.barber ? `<p><strong>Barber:</strong> ${data.barber}</p>` : ''}
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>This is an automated message from BarberBooker.</p>
              <p>If you have any questions, please contact us.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
