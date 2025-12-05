const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  startTime: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
  },
  endTime: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
  },
  isAvailable: {
    type: Boolean,
    default: true,
    index: true,
  },
  notes: {
    type: String,
    default: '',
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
availabilitySchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Update the updatedAt field before updating
availabilitySchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Compound indexes for efficient querying
availabilitySchema.index({ barberId: 1, date: 1 });
availabilitySchema.index({ barberId: 1, date: 1, isAvailable: 1 });
availabilitySchema.index({ date: 1, isAvailable: 1 });

// Ensure no overlapping availability slots for same barber on same date
availabilitySchema.index(
  { barberId: 1, date: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;
