const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');
const { createCustomerToken } = require('../utils/customerToken');

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function sanitizeUser(user) {
  return user ? user.toJSON() : null;
}

function setAuthSession(req, res, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((sessionError) => {
      if (sessionError) {
        return reject(sessionError);
      }

      req.session.userId = user._id.toString();
      req.session.role = user.role;
      req.session.userName = user.name;
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');

      res.cookie('XSRF-TOKEN', req.session.csrfToken, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      });

      req.session.save((saveError) => {
        if (saveError) {
          return reject(saveError);
        }
        resolve();
      });
    });
  });
}

async function signup(req, res) {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!name || !cleanEmail || !phone || !password || !confirmPassword) {
      return errorResponse(res, 'Please complete all fields.', 400);
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists.', 409);
    }

    const passwordHash = await User.hashPassword(password);
    const verificationToken = crypto.randomBytes(24).toString('hex');

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      passwordHash,
      provider: 'local',
      isVerified: false,
      role: 'CUSTOMER',
      verificationToken,
      verificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    if (process.env.NODE_ENV !== 'production') {
      return successResponse(res, {
        user: sanitizeUser(user),
        verificationToken
      }, 201, 'Account created successfully. Please verify your email.');
    }
    
    return successResponse(res, {
      user: sanitizeUser(user)
    }, 201, 'Account created successfully. Please verify your email.');
  } catch (error) {
    return errorResponse(res, 'Unable to create account at the moment.', 500);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    const genericErrorMsg = 'Invalid email or password.';

    if (!user) {
      return errorResponse(res, genericErrorMsg, 401);
    }

    if (user.isLocked()) {
      const waitMinutes = Math.ceil((user.lockedUntil - Date.now()) / (60 * 1000));
      return errorResponse(res, `Account temporarily locked. Please try again in ${waitMinutes} minute(s).`, 423);
    }

    if (!user.isActive) {
      return errorResponse(res, 'This account is inactive. Please contact support.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      }
      await user.save();
      return errorResponse(res, genericErrorMsg, 401);
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    await setAuthSession(req, res, user);

    return successResponse(res, {
      user: sanitizeUser(user),
      token: createCustomerToken(user)
    }, 200, 'Login successful.');
  } catch (error) {
    return errorResponse(res, 'An error occurred during login.', 500);
  }
}

async function googleLogin(req, res) {
  try {
    const { credential } = req.body || {};
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!credential) {
      return errorResponse(res, 'A valid Google credential is required.', 400);
    }

    if (!googleClientId) {
      return errorResponse(res, 'Google authentication is not configured on this server.', 400);
    }

    const client = new OAuth2Client(googleClientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: googleClientId });
    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email || payload.email_verified !== true) {
      return errorResponse(res, 'Google sign-in failed. Please try again.', 400);
    }

    const safeEmail = payload.email.toLowerCase().trim();
    let user = await User.findOne({ email: safeEmail });

    if (user) {
      if (!user.googleId && payload.sub) {
        user.googleId = payload.sub;
      }
      user.provider = user.provider === 'local' ? 'google' : user.provider;
      user.isVerified = true;
      user.name = user.name || payload.name || 'Customer';
      if (!user.profileImage && payload.picture) user.profileImage = payload.picture;
      if (!user.phone) user.phone = '';
      await user.save();
    } else {
      user = await User.create({
        name: payload.name || 'Google Customer',
        email: safeEmail,
        phone: '',
        profileImage: payload.picture || '',
        provider: 'google',
        googleId: payload.sub,
        isVerified: true,
        role: 'CUSTOMER',
        passwordHash: '',
        isActive: true
      });
    }

    await setAuthSession(req, res, user);

    return successResponse(res, {
      user: sanitizeUser(user),
      token: createCustomerToken(user)
    }, 200, 'Google login successful.');
  } catch (error) {
    return errorResponse(res, 'Google authentication failed. Please try again.', 500);
  }
}

async function logout(req, res) {
  try {
    req.customer.tokenVersion = (req.customer.tokenVersion || 0) + 1;
    await req.customer.save();

    req.session.destroy((error) => {
      if (error) {
        return errorResponse(res, 'Could not log out. Please try again.', 500);
      }
      res.clearCookie(process.env.SESSION_NAME || 'ecolith.sid');
      return successResponse(res, null, 200, 'Logged out successfully.');
    });
  } catch (error) {
    return errorResponse(res, 'Error during logout.', 500);
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail) {
      return errorResponse(res, 'Please provide your email address.', 400);
    }

    const user = await User.findOne({ email: cleanEmail });
    if (user) {
      const resetToken = crypto.randomBytes(24).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      if (process.env.NODE_ENV !== 'production') {
        return successResponse(res, { resetToken }, 200, 'If an account exists, a reset link has been sent.');
      }
    }

    return successResponse(res, null, 200, 'If an account exists, a reset link has been sent.');
  } catch (error) {
    return errorResponse(res, 'Unable to process password reset request.', 500);
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return errorResponse(res, 'Reset token and new password are required.', 400);
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, 'Invalid or expired reset token.', 400);
    }

    user.passwordHash = await User.hashPassword(password);
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    user.isVerified = true;
    await user.save();

    return successResponse(res, null, 200, 'Password reset successfully.');
  } catch (error) {
    return errorResponse(res, 'Unable to reset password.', 500);
  }
}

async function verifyEmail(req, res) {
  try {
    const { token } = req.body;
    if (!token) {
      return errorResponse(res, 'Verification token is required.', 400);
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, 'Invalid or expired verification link.', 400);
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationExpiry = null;
    await user.save();

    return successResponse(res, null, 200, 'Email verified successfully.');
  } catch (error) {
    return errorResponse(res, 'Unable to verify email.', 500);
  }
}

async function getMe(req, res) {
  try {
    const user = req.customer;
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }
    return successResponse(res, { user: sanitizeUser(user) }, 200);
  } catch (error) {
    return errorResponse(res, 'Unable to retrieve profile.', 500);
  }
}

async function getWishlist(req, res) {
  try {
    const user = await req.customer.populate('wishlist');
    return successResponse(res, { wishlist: user?.wishlist || [] }, 200);
  } catch (error) {
    return errorResponse(res, 'Unable to fetch wishlist.', 500);
  }
}

async function addToWishlist(req, res) {
  try {
    const { productId } = req.params;
    const user = req.customer;
    if (!user) return errorResponse(res, 'User not found.', 404);
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    return successResponse(res, { wishlist: user.wishlist }, 200, 'Product added to wishlist.');
  } catch (error) {
    return errorResponse(res, 'Unable to add to wishlist.', 500);
  }
}

async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;
    const user = req.customer;
    if (!user) return errorResponse(res, 'User not found.', 404);
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();
    return successResponse(res, { wishlist: user.wishlist }, 200, 'Product removed from wishlist.');
  } catch (error) {
    return errorResponse(res, 'Unable to remove from wishlist.', 500);
  }
}

async function getCart(req, res) {
  try {
    const user = await req.customer.populate('cart.productId');
    return successResponse(res, { cart: user?.cart || [] }, 200);
  } catch (error) {
    return errorResponse(res, 'Unable to fetch cart.', 500);
  }
}

async function addToCart(req, res) {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;
    const user = req.customer;
    if (!user) return errorResponse(res, 'User not found.', 404);
    const existingItem = user.cart.find((item) => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += Number(quantity || 1);
    } else {
      user.cart.push({ productId, quantity: Number(quantity || 1) });
    }
    await user.save();
    return successResponse(res, { cart: user.cart }, 200, 'Product added to cart.');
  } catch (error) {
    return errorResponse(res, 'Unable to add to cart.', 500);
  }
}

async function updateCartItem(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const user = req.customer;
    if (!user) return errorResponse(res, 'User not found.', 404);
    const item = user.cart.find((entry) => entry.productId.toString() === productId);
    if (!item) return errorResponse(res, 'Cart item not found.', 404);
    item.quantity = Number(quantity || 1);
    await user.save();
    return successResponse(res, { cart: user.cart }, 200, 'Cart updated.');
  } catch (error) {
    return errorResponse(res, 'Unable to update cart.', 500);
  }
}

async function removeFromCart(req, res) {
  try {
    const { productId } = req.params;
    const user = req.customer;
    if (!user) return errorResponse(res, 'User not found.', 404);
    user.cart = user.cart.filter((item) => item.productId.toString() !== productId);
    await user.save();
    return successResponse(res, { cart: user.cart }, 200, 'Product removed from cart.');
  } catch (error) {
    return errorResponse(res, 'Unable to remove cart item.', 500);
  }
}

async function applyForDealer(req, res) {
  try {
    const user = req.customer;
    if (!user) return errorResponse(res, 'User not found.', 404);

    const { shopName, gstNumber, dealerAddress } = req.body;
    user.shopName = shopName || user.shopName;
    user.gstNumber = gstNumber || user.gstNumber;
    user.dealerAddress = dealerAddress || user.dealerAddress;
    user.role = 'DEALER';
    user.dealerStatus = 'PENDING';
    await user.save();

    return successResponse(res, { user: sanitizeUser(user) }, 200, 'Dealer application submitted successfully.');
  } catch (error) {
    return errorResponse(res, 'Unable to submit dealer application.', 500);
  }
}

async function updateProfile(req, res) {
  try {
    const user = req.customer;
    const { name, phone, profileImage, addresses } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (addresses !== undefined) user.addresses = addresses;

    await user.save();
    return successResponse(res, { user: sanitizeUser(user) }, 200, 'Profile updated successfully.');
  } catch (error) {
    return errorResponse(res, 'Unable to update profile.', 500);
  }
}

async function changePassword(req, res) {
  try {
    const user = req.customer;
    const { currentPassword, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return errorResponse(res, 'Passwords do not match.', 400);
    }

    if (user.provider === 'local') {
      if (!currentPassword) {
        return errorResponse(res, 'Current password is required.', 400);
      }

      const isCurrentValid = await user.comparePassword(currentPassword);
      if (!isCurrentValid) {
        return errorResponse(res, 'Current password is incorrect.', 400);
      }
    }

    user.passwordHash = await User.hashPassword(password);
    user.provider = user.provider || 'local';
    await user.save();

    return successResponse(res, null, 200, 'Password changed successfully.');
  } catch (error) {
    return errorResponse(res, 'Unable to change password.', 500);
  }
}

module.exports = {
  signup,
  login,
  googleLogin,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  applyForDealer,
  updateProfile,
  changePassword
};
