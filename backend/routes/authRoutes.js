const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-otp', authController.sendOTP);
router.post('/send-register-otp', authController.sendRegisterOTP);
router.post('/verify-register-otp', authController.verifyRegisterOTP);
router.post('/verify-otp', authController.verifyOTP);
router.get('/me', auth, authController.getMe);
router.put('/address', auth, authController.updateAddress);
router.put('/profile', auth, authController.updateProfile);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOTP);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
