const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const otpController = require('../controllers/otpController');

// Frontend contract routes
router.post('/pickup/:assignmentId/request', authenticate, otpController.requestPickupOTP);
router.post('/pickup/:assignmentId/verify', authenticate, otpController.verifyPickupOTP);
router.post('/delivery/:assignmentId/request', authenticate, otpController.requestDeliveryOTP);
router.post('/delivery/:assignmentId/verify', authenticate, otpController.verifyDeliveryOTP);
router.post('/:type/:assignmentId/resend', authenticate, otpController.resendOTP);

// Direct generate & verify aliases
router.post('/generate', authenticate, otpController.generateOTPHandler);
router.post('/verify', authenticate, otpController.verifyOTPHandler);

module.exports = router;
