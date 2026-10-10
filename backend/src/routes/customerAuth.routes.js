const express = require('express');
const router = express.Router();
const customerAuthController = require('../controllers/customerAuth.controller');
const { requireCustomer } = require('../middleware/customerAuth');
const { customerAuthLimiter } = require('../middleware/rateLimit');
const { validateBody } = require('../middleware/validation');
const { errorResponse } = require('../utils/response');
const { passport, googleOAuthConfigured } = require('../config/passport');
const env = require('../config/env');
const crypto = require('crypto');
const {
  customerSignupSchema,
  customerLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema
} = require('../validators/auth.validator');

function beginGoogleAuth(intent) {
  return (req, res, next) => {
    if (!googleOAuthConfigured) {
      return errorResponse(res, 'Google authentication is not configured on this server.', 503);
    }

    req.session.googleAuthIntent = intent;
    req.session.save((error) => {
      if (error) return next(error);
      passport.authenticate('google', {
        scope: ['openid', 'profile', 'email'],
        state: true
      })(req, res, next);
    });
  };
}

function googleAuthCallback(req, res, next) {
  if (!googleOAuthConfigured) {
    return errorResponse(res, 'Google authentication is not configured on this server.', 503);
  }

  passport.authenticate('google', (error, user, info) => {
    if (error) return next(error);

    const intent = req.session?.googleAuthIntent;
    if (!user) {
      const destination = info?.code === 'account_exists'
        ? '/login?google=account-exists'
        : info?.code === 'account_inactive'
          ? '/login?google=account-inactive'
          : info?.code === 'account_locked'
            ? '/login?google=account-locked'
          : info?.code === 'account_not_found'
            ? '/signup?google=account-not-found'
            : `/${intent === 'login' ? 'login' : 'signup'}?google=failed`;
      return res.redirect(new URL(destination, env.FRONTEND_URL).toString());
    }

    return req.logIn(user, (loginError) => {
      if (loginError) return next(loginError);

      req.session.userId = user._id.toString();
      req.session.role = user.role;
      req.session.userName = user.name;
      req.session.authVersion = user.authVersion || 0;
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
      res.cookie('XSRF-TOKEN', req.session.csrfToken, {
        httpOnly: false,
        sameSite: 'lax',
        secure: env.isProduction,
        path: '/'
      });
      res.setHeader('X-CSRF-Token', req.session.csrfToken);

      return req.session.save((saveError) => {
        if (saveError) return next(saveError);
        return res.redirect(new URL('/dashboard', env.FRONTEND_URL).toString());
      });
    });
  })(req, res, next);
}

router.get('/google/signup', customerAuthLimiter, beginGoogleAuth('signup'));
router.get('/google/login', customerAuthLimiter, beginGoogleAuth('login'));
router.get('/google/callback', customerAuthLimiter, googleAuthCallback);
router.post('/signup', customerAuthLimiter, validateBody(customerSignupSchema, { includeErrors: true }), customerAuthController.signup);
router.post('/login', customerAuthLimiter, validateBody(customerLoginSchema), customerAuthController.login);
router.post('/forgot-password', customerAuthLimiter, validateBody(forgotPasswordSchema), customerAuthController.forgotPassword);
router.post('/reset-password', customerAuthLimiter, validateBody(resetPasswordSchema), customerAuthController.resetPassword);
router.post('/verify-email', customerAuthLimiter, customerAuthController.verifyEmail);
router.post('/logout', requireCustomer, customerAuthController.logout);
router.get('/me', requireCustomer, customerAuthController.getMe);
router.get('/wishlist', requireCustomer, customerAuthController.getWishlist);
router.post('/wishlist/:productId', requireCustomer, customerAuthController.addToWishlist);
router.delete('/wishlist/:productId', requireCustomer, customerAuthController.removeFromWishlist);
router.get('/cart', requireCustomer, customerAuthController.getCart);
router.post('/cart/:productId', requireCustomer, customerAuthController.addToCart);
router.put('/cart/:productId', requireCustomer, customerAuthController.updateCartItem);
router.delete('/cart/:productId', requireCustomer, customerAuthController.removeFromCart);
router.post('/apply-dealer', requireCustomer, customerAuthController.applyForDealer);

module.exports = router;
