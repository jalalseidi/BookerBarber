const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  specialties: [{
    type: String,
    enum: ['haircut', 'beard', 'shave', 'styling', 'treatment', 'package'],
  }],
  bio: {
    type: String,
    default: '',
  },
  bioEn: {
    type: String,
    default: '',
  },
  bioTr: {
    type: String,
    default: '',
  },
  profilePhoto: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
    index: true,
  },
  workingHours: {
    start: {
      type: String,
      required: true,
      default: '09:00',
    },
    end: {
      type: String,
      required: true,
      default: '18:00',
    },
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
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

// Indexes for efficient querying
schema.index({ email: 1 });
schema.index({ isAvailable: 1, isActive: 1 });
schema.index({ specialties: 1 });
schema.index({ rating: -1 });

const Barber = mongoose.model('Barber', schema);

module.exports = Barber;
