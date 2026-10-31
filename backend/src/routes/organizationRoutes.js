const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const orgController = require('../controllers/organizationController');

router.get('/dashboard', authenticate, authorize('DISTRIBUTOR'), orgController.getDashboard);
router.get('/available-food', authenticate, authorize('DISTRIBUTOR'), orgController.getAvailableFood);
router.post('/listings/:id/accept', authenticate, authorize('DISTRIBUTOR'), orgController.acceptListing);
router.post('/listings/:id/decline', authenticate, authorize('DISTRIBUTOR'), orgController.declineListing);
router.post('/listings/:id/reserve', authenticate, authorize('DISTRIBUTOR'), orgController.reserveListing);
router.get('/reservations', authenticate, authorize('DISTRIBUTOR'), orgController.getReservations);
router.get('/profile', authenticate, authorize('DISTRIBUTOR', 'BIOFARM'), orgController.getProfile);
router.put('/profile', authenticate, authorize('DISTRIBUTOR', 'BIOFARM'), orgController.updateProfile);

module.exports = router;
