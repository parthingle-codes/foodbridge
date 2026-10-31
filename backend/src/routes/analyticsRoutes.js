const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

router.get('/overview', authenticate, analyticsController.getOverview);
router.get('/donation-trends', authenticate, analyticsController.getDonationTrends);

module.exports = router;
