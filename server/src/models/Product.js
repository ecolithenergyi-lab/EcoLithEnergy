const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      enum: ['LFP', 'NMC'],
      index: true
    },
    technology: {
      type: String,
      required: true,
      trim: true
    },
    voltage: {
      type: String,
      required: true,
      trim: true
    },
    capacity: {
      type: String,
      required: true,
      trim: true
    },
    energy: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      trim: true,
      default: 'Light Weight Battery'
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    shortDescription: {
      type: String,
      trim: true
    },
    features: {
      type: [String],
      default: []
    },
    applications: {
      type: [String],
      default: []
    },
    warranty: {
      type: String,
      trim: true,
      default: 'Contact for Warranty Details'
    },
    price: {
      type: Number,
      default: 0
    },
    showPrice: {
      type: Boolean,
      default: false
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    gallery: {
      type: [String],
      default: []
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true
    },
    seoTitle: {
      type: String,
      trim: true
    },
    seoDescription: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Slug generator helper
ProductSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
