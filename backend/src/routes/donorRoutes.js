const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const donorController = require('../controllers/donorController');

router.get('/dashboard', authenticate, authorize('DONOR'), donorController.getDonorDashboard);
router.get('/listings', authenticate, authorize('DONOR'), donorController.getDonorListings);
router.get('/profile', authenticate, authorize('DONOR'), donorController.getDonorProfile);
router.put('/profile', authenticate, authorize('DONOR'), donorController.updateDonorProfile);

module.exports = router;
