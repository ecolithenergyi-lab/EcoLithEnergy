const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      maxlength: 120
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
      default: 'ADMIN'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockedUntil: {
      type: Date,
      default: null
    },
    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Method to verify password
AdminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method to check if account is locked
AdminSchema.methods.isLocked = function () {
  return !!(this.lockedUntil && this.lockedUntil > Date.now());
};

// Transform to remove sensitive passwordHash
AdminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

// Static helper to hash password
AdminSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

module.exports = mongoose.model('Admin', AdminSchema);
