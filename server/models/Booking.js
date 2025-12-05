const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true,
  },
  date: {
    type: String,
    required: true,
    index: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  specialRequests: {
    type: String,
    default: '',
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  versionKey: false,
});

// Update the updatedAt field before saving
schema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Update the updatedAt field before updating
schema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Index for efficient querying
schema.index({ customerId: 1, date: 1 });
schema.index({ barberId: 1, date: 1 });
schema.index({ status: 1, createdAt: 1 });

const Booking = mongoose.model('Booking', schema);

module.exports = Booking;
