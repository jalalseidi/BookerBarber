const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false // Not all notifications are booking-related
  },
  type: {
    type: String,
    enum: [
      'booking_confirmation',
      'booking_reminder_24h',
      'booking_reminder_2h', 
      'booking_cancelled',
      'booking_rescheduled',
      'new_booking_request', // for barbers
      'daily_summary', // for barbers
      'new_review' // for barbers
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {} // Additional context like booking details, barber info, etc.
  },
  channel: {
    type: String,
    enum: ['email', 'sms', 'in_app'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
    default: 'pending'
  },
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  sentAt: {
    type: Date
  },
  readAt: {
    type: Date
  },
  errorMessage: {
    type: String // Store error details if delivery fails
  },
  retryCount: {
    type: Number,
    default: 0,
    max: 3 // Maximum retry attempts
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ scheduledAt: 1, status: 1 });

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Method to mark notification as sent
notificationSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

// Method to mark notification as failed
notificationSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.retryCount += 1;
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
