const express = require('express');
const router = express.Router();
const customerAuthController = require('../controllers/customerAuth.controller');
const { requireCustomer } = require('../middleware/customerAuth');
const { validateBody } = require('../middleware/validation');
const { profileUpdateSchema, changePasswordSchema } = require('../validators/auth.validator');

router.get('/', requireCustomer, customerAuthController.getMe);
router.put('/', requireCustomer, validateBody(profileUpdateSchema), customerAuthController.updateProfile);
router.put('/password', requireCustomer, validateBody(changePasswordSchema), customerAuthController.changePassword);

module.exports = router;
