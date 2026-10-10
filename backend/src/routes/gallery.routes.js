const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery.controller');

// Public Gallery Route
router.get('/', galleryController.getPublicGallery);

module.exports = router;
