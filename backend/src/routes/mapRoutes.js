const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const mapController = require('../controllers/mapController');

router.get('/markers', authenticate, mapController.getMarkers);

module.exports = router;
