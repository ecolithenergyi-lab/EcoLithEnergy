const express = require('express');
const router = express.Router();
const customerAuthController = require('../controllers/customerAuth.controller');
const { requireCustomer } = require('../middleware/customerAuth');
const { customerAuthLimiter } = require('../middleware/rateLimit');
const { validateBody } = require('../middleware/validation');
const {
  customerSignupSchema,
  customerLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema,
  changePasswordSchema,
  googleAuthSchema
} = require('../validators/auth.validator');

router.post('/signup', customerAuthLimiter, validateBody(customerSignupSchema, { includeErrors: true }), customerAuthController.signup);
router.post('/login', customerAuthLimiter, validateBody(customerLoginSchema), customerAuthController.login);
router.post('/google', customerAuthLimiter, validateBody(googleAuthSchema), customerAuthController.googleLogin);
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
