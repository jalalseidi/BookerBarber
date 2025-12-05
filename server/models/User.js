const mongoose = require('mongoose');

const { validatePassword, isPasswordHash } = require('../utils/password.js');
const {randomUUID} = require("crypto");

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    validate: { validator: isPasswordHash, message: 'Invalid password hash' },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  refreshToken: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['customer', 'barber'],
    default: 'customer',
  },
  name: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  address: {
    type: String,
    default: '',
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'tr'],
    default: 'en',
  },
  notificationPreferences: {
    // Primary channel for external notifications (email or sms)
    primaryChannel: {
      type: String,
      enum: ['email', 'sms'],
      default: 'email'
    },
    // Specific notification type preferences
    bookingConfirmations: {
      type: Boolean,
      default: true
    },
    bookingReminders: {
      type: Boolean,
      default: true
    },
    bookingCancellations: {
      type: Boolean,
      default: true
    },
    bookingChanges: {
      type: Boolean,
      default: true
    },
    // For barbers only
    newBookingRequests: {
      type: Boolean,
      default: true
    },
    dailySummary: {
      type: Boolean,
      default: true
    },
    newReviews: {
      type: Boolean,
      default: true
    },
    // Timing preferences for reminders
    reminderTiming: {
      twentyFourHours: {
        type: Boolean,
        default: true
      },
      twoHours: {
        type: Boolean,
        default: true
      }
    }
  },
}, {
  versionKey: false,
});

// Pre-save hook to generate name from email if name is empty
schema.pre('save', function(next) {
  // If name is empty or null, generate it from email
  if (!this.name || this.name.trim() === '') {
    const emailName = this.email.split('@')[0];
    this.name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
  }
  next();
});

schema.set('toJSON', {
  /* eslint-disable */
  transform: (doc, ret, options) => {
    delete ret.password;
    return ret;
  },
  /* eslint-enable */
});

const User = mongoose.model('User', schema);

module.exports = User;
