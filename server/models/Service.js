const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  nameEn: {
    type: String,
    trim: true,
  },
  nameTr: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  descriptionEn: {
    type: String,
    default: '',
  },
  descriptionTr: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    required: true,
    min: 5, // minimum 5 minutes
    max: 300, // maximum 5 hours
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ['haircut', 'beard', 'shave', 'styling', 'treatment', 'package'],
    index: true,
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

// Ensure nameEn and nameTr are set if not provided
schema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  
  // Set default values for multilingual fields
  if (!this.nameEn) {
    this.nameEn = this.name;
  }
  if (!this.nameTr) {
    this.nameTr = this.name;
  }
  if (!this.descriptionEn) {
    this.descriptionEn = this.description;
  }
  if (!this.descriptionTr) {
    this.descriptionTr = this.description;
  }
  
  next();
});

// Update the updatedAt field before updating
schema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Indexes for efficient querying
schema.index({ category: 1, isActive: 1 });
schema.index({ price: 1 });
schema.index({ duration: 1 });
schema.index({ name: 'text', description: 'text' });

const Service = mongoose.model('Service', schema);

module.exports = Service;
