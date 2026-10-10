const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Public Product Routes
router.get('/', productController.getPublicProducts);
router.get('/:slug', productController.getPublicProductBySlug);

module.exports = router;
