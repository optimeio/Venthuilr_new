const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const messageController = require('../controllers/messageController');
const inventoryController = require('../controllers/inventoryController');
const orderController = require('../controllers/orderController');
const { auth, admin } = require('../middleware/auth');
const upload = require('../utils/upload');

// Apply auth and admin check to all routes in this file
router.use(auth);
router.use(admin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);

router.get('/products', adminController.getAdminProducts);
router.post('/products', adminController.addProduct);

// Orders
router.get('/orders', orderController.getOrders);
router.put('/orders/:id/status', orderController.updateOrderStatus);
router.delete('/orders/:id', adminController.deleteOrder);

// Users
router.delete('/users/:id', adminController.deleteUser);

router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

router.post('/upload', upload.array('images', 10), adminController.uploadImages);

router.get('/messages', messageController.getAdminMessages);
router.put('/messages/:id/resolve', adminController.resolveMessage);
router.get('/logs', adminController.getLogs);

// Inventory Dashboard
router.get('/inventory', inventoryController.getInventory);
router.put('/inventory/:productId/restock', inventoryController.restockProduct);
router.put('/inventory/offers/:offerId/restock', inventoryController.restockOffer);

module.exports = router;
