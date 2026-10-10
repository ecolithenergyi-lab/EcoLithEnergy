const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5
    },
    review: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    source: {
      type: String,
      trim: true,
      default: 'Google Business Profile'
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Review', ReviewSchema);
