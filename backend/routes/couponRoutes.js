const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { auth, admin } = require('../middleware/auth');

// Public endpoints
router.post('/validate', couponController.validateCoupon);
router.post('/checkout', couponController.applyCheckout);
router.get('/public', couponController.getPublicCoupons);

// Admin endpoints
router.get('/', auth, admin, couponController.getAllCoupons);
router.post('/', auth, admin, couponController.createCoupon);
router.put('/:id', auth, admin, couponController.updateCoupon);
router.delete('/:id', auth, admin, couponController.deleteCoupon);

module.exports = router;
