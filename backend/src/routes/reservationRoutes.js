const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const reservationController = require('../controllers/reservationController');

router.post('/', authenticate, authorize('DISTRIBUTOR'), reservationController.createReservation);
router.patch('/:id/accept', authenticate, authorize('DONOR'), reservationController.acceptReservation);
router.patch('/:id/decline', authenticate, reservationController.declineReservation);

module.exports = router;
