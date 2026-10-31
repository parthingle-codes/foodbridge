const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const wasteController = require('../controllers/wasteRecoveryController');

router.get('/available', authenticate, wasteController.getAvailableWaste);
router.get('/', authenticate, wasteController.getWasteListings);
router.post('/', authenticate, authorize('DONOR', 'ADMIN'), wasteController.createWasteRecovery);
router.post('/:id/accept', authenticate, authorize('BIOFARM'), wasteController.acceptWasteRecovery);
router.post('/:id/decline', authenticate, authorize('BIOFARM'), wasteController.declineWasteRecovery);
router.post('/:id/reserve', authenticate, authorize('BIOFARM'), wasteController.reserveWasteRecovery);
router.post('/:id/collect', authenticate, authorize('BIOFARM'), wasteController.collectWasteRecovery);
router.put('/:id/processing', authenticate, authorize('BIOFARM'), wasteController.updateProcessing);
router.patch('/:id/status', authenticate, authorize('BIOFARM'), wasteController.updateProcessing);

module.exports = router;
