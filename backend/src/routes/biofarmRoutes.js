const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const biofarmController = require('../controllers/biofarmController');

router.get('/dashboard', authenticate, authorize('BIOFARM'), biofarmController.getDashboard);
router.get('/history', authenticate, authorize('BIOFARM'), biofarmController.getHistory);
router.get('/', authenticate, biofarmController.getBiofarms);

module.exports = router;
