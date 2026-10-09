const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: 'Home' },
    type: { type: String, enum: ['HOME', 'WORK', 'OTHER'], default: 'HOME' },
    line1: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    postalCode: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'India' }
  },
  { _id: true }
);

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1 }
  },
  { _id: true }
);

const UserSchema = new mongoose.Schema(
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
    phone: {
      type: String,
      default: '',
      trim: true,
      maxlength: 20
    },
    passwordHash: {
      type: String,
      default: ''
    },
    profileImage: {
      type: String,
      default: ''
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    googleId: {
      type: String,
      default: null,
      index: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    role: {
      type: String,
      enum: ['CUSTOMER', 'DEALER', 'DISTRIBUTOR'],
      default: 'CUSTOMER'
    },
    shopName: {
      type: String,
      default: '',
      trim: true
    },
    gstNumber: {
      type: String,
      default: '',
      trim: true
    },
    dealerAddress: {
      type: String,
      default: '',
      trim: true
    },
    dealerStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    cart: [cartItemSchema],
    addresses: [addressSchema],
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
    },
    tokenVersion: {
      type: Number,
      default: 0
    },
    verificationToken: {
      type: String,
      default: null
    },
    verificationExpiry: {
      type: Date,
      default: null
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpiry: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

UserSchema.methods.isLocked = function () {
  return !!(this.lockedUntil && this.lockedUntil > Date.now());
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.verificationToken;
  delete obj.verificationExpiry;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpiry;
  return obj;
};

UserSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

module.exports = mongoose.model('User', UserSchema);
