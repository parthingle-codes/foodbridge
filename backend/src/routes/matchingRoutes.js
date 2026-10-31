const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const matchingController = require('../controllers/matchingController');

router.get('/:listingId', authenticate, matchingController.getMatches);

module.exports = router;
