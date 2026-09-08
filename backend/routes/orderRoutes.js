const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/me', orderController.getMyOrders);
router.put('/:id/cancel', orderController.cancelOrder);

module.exports = router;
