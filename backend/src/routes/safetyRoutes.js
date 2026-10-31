const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const safetyController = require('../controllers/safetyController');

router.post('/donor-check/:listingId', authenticate, safetyController.donorCheck);
router.post('/pickup-check/:assignmentId', authenticate, safetyController.pickupCheck);
router.get('/:listingId', authenticate, safetyController.getSafetyChecks);
router.post('/checks', authenticate, safetyController.createSafetyCheck);

module.exports = router;
