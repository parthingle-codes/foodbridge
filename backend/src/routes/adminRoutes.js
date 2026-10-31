const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/dashboard', authenticate, authorize('ADMIN'), adminController.getDashboard);
router.get('/verification-requests', authenticate, authorize('ADMIN'), adminController.getVerificationRequests);
router.post('/organizations/:id/approve', authenticate, authorize('ADMIN'), adminController.approveOrganization);
router.post('/organizations/:id/reject', authenticate, authorize('ADMIN'), adminController.rejectOrganization);

module.exports = router;
