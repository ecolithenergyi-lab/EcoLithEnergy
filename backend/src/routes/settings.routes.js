const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');

// Public Settings Route
router.get('/public', settingsController.getPublicSettings);

module.exports = router;
