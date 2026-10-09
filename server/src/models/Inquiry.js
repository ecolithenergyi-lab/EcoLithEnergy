const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
      maxlength: 30
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 120
    },
    company: {
      type: String,
      trim: true,
      maxlength: 150
    },
    requirement: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'IN_PROGRESS', 'CONVERTED', 'CLOSED', 'SPAM'],
      default: 'NEW',
      index: true
    },
    source: {
      type: String,
      default: 'Website Contact Form'
    },
    ipHash: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

InquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Inquiry', InquirySchema);
