const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);
router.get('/sitemap.xml', productController.getSitemap);
router.get('/:id', productController.getProductById);

module.exports = router;
