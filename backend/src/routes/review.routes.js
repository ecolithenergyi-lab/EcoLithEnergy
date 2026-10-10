const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');

// Public Reviews Route
router.get('/', reviewController.getPublicReviews);

module.exports = router;
