const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const { isSuperAdmin, isAdminOrAbove, isEditorOrAbove } = require('../middleware/admin');
const { validateBody } = require('../middleware/validation');

const productController = require('../controllers/product.controller');
const reviewController = require('../controllers/review.controller');
const inquiryController = require('../controllers/inquiry.controller');
const galleryController = require('../controllers/gallery.controller');
const settingsController = require('../controllers/settings.controller');
const adminController = require('../controllers/admin.controller');

const { productSchema } = require('../validators/product.validator');
const { reviewSchema } = require('../validators/review.validator');
const { gallerySchema } = require('../validators/gallery.validator');
const { inquiryStatusSchema } = require('../validators/inquiry.validator');
const { settingsSchema } = require('../validators/settings.validator');
const { adminCreateSchema, adminUpdateSchema } = require('../validators/auth.validator');

// All admin routes require session authentication
router.use(requireAuth);

// Dashboard
router.get('/dashboard', isEditorOrAbove, adminController.getDashboardStats);

// Product Management (Editor, Admin, SuperAdmin)
router.get('/products', isEditorOrAbove, productController.getAdminProducts);
router.get('/products/:id', isEditorOrAbove, productController.getAdminProductById);
router.post('/products', isEditorOrAbove, validateBody(productSchema), productController.createProduct);
router.put('/products/:id', isEditorOrAbove, validateBody(productSchema), productController.updateProduct);
router.delete('/products/:id', isAdminOrAbove, productController.deleteProduct);
router.patch('/products/:id/toggle-publish', isEditorOrAbove, productController.togglePublish);

// Review Management (Editor, Admin, SuperAdmin)
router.get('/reviews', isEditorOrAbove, reviewController.getAdminReviews);
router.post('/reviews', isEditorOrAbove, validateBody(reviewSchema), reviewController.createReview);
router.put('/reviews/:id', isEditorOrAbove, validateBody(reviewSchema), reviewController.updateReview);
router.delete('/reviews/:id', isAdminOrAbove, reviewController.deleteReview);

// Gallery Management (Editor, Admin, SuperAdmin)
router.get('/gallery', isEditorOrAbove, galleryController.getAdminGallery);
router.post('/gallery', isEditorOrAbove, validateBody(gallerySchema), galleryController.createGalleryItem);
router.put('/gallery/:id', isEditorOrAbove, validateBody(gallerySchema), galleryController.updateGalleryItem);
router.delete('/gallery/:id', isAdminOrAbove, galleryController.deleteGalleryItem);

// Inquiry Management (Admin, SuperAdmin)
router.get('/inquiries/export-csv', isAdminOrAbove, inquiryController.exportCsv);
router.get('/inquiries', isAdminOrAbove, inquiryController.getAdminInquiries);
router.get('/inquiries/:id', isAdminOrAbove, inquiryController.getAdminInquiryById);
router.put('/inquiries/:id/status', isAdminOrAbove, validateBody(inquiryStatusSchema), inquiryController.updateInquiryStatus);
router.delete('/inquiries/:id', isAdminOrAbove, inquiryController.deleteInquiry);

// Site Settings Management (Admin, SuperAdmin)
router.get('/settings', isAdminOrAbove, settingsController.getAdminSettings);
router.put('/settings', isAdminOrAbove, validateBody(settingsSchema), settingsController.updateSettings);

// Admin Users Management (SUPER_ADMIN only)
router.get('/users', isSuperAdmin, adminController.getAdmins);
router.post('/users', isSuperAdmin, validateBody(adminCreateSchema), adminController.createAdminUser);
router.put('/users/:id', isSuperAdmin, validateBody(adminUpdateSchema), adminController.updateAdminUser);
router.delete('/users/:id', isSuperAdmin, adminController.deleteAdminUser);

// Audit Logs (Admin, SuperAdmin)
router.get('/audit-logs', isAdminOrAbove, adminController.getAuditLogs);

module.exports = router;
