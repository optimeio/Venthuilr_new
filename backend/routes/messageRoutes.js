const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

// Public to submit
router.post('/', messageController.submitMessage);

// Protected for user to view their own
router.get('/', auth, messageController.getUserMessages);

module.exports = router;
