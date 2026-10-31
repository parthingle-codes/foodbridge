const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const volController = require('../controllers/volunteerController');

// These mirror the volunteer routes for the /api/assignments prefix
router.post('/', authenticate, authorize('DISTRIBUTOR'), volController.createAssignment);
router.get('/', authenticate, authorize('DISTRIBUTOR', 'VOLUNTEER'), volController.getAssignments);
router.patch('/:id/status', authenticate, authorize('VOLUNTEER'), volController.updateAssignmentStatus);

module.exports = router;
