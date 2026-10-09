const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['factory', 'battery', 'quality', 'facility'],
      default: 'facility',
      index: true
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true
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

module.exports = mongoose.model('Gallery', GallerySchema);
