const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { auth, admin } = require('../middleware/auth');
const upload = require('../utils/upload');

// ── PUBLIC ──────────────────────────────────────────────────────
// Customer-facing: only returns active/live offers
router.get('/active', offerController.getActiveOffers);

// ── ADMIN (Auth Required) ────────────────────────────────────────
router.get('/', auth, admin, offerController.getAllOffers);
router.post('/', auth, admin, offerController.createOffer);
router.put('/:id', auth, admin, offerController.updateOffer);
router.delete('/:id', auth, admin, offerController.deleteOffer);

module.exports = router;
