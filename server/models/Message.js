const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Reference to the booking this message is about
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  
  // Sender (barber) information
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Recipient (customer) information
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Message content
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Compound indexes for efficient queries
messageSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
messageSchema.index({ bookingId: 1, createdAt: -1 });

// Virtual for formatted date
messageSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Ensure virtuals are included when converting to JSON
messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
