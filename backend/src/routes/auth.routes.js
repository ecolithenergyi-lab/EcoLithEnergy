const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimit');
const { validateBody } = require('../middleware/validation');
const { loginSchema } = require('../validators/auth.validator');

// Rate-limited login
router.post('/login', loginLimiter, validateBody(loginSchema), authController.login);

// Authenticated auth routes
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.getMe);
router.get('/csrf', authController.getCsrfToken);

module.exports = router;
