const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const volController = require('../controllers/volunteerController');

router.get('/dashboard', authenticate, authorize('VOLUNTEER'), volController.getDashboard);
router.get('/assignments', authenticate, authorize('VOLUNTEER', 'DISTRIBUTOR'), volController.getAssignments);
router.put('/assignments/:id/status', authenticate, authorize('VOLUNTEER'), volController.updateAssignmentStatus);
router.patch('/assignments/:id/status', authenticate, authorize('VOLUNTEER'), volController.updateAssignmentStatus);
router.post('/assignments', authenticate, authorize('DISTRIBUTOR'), volController.createAssignment);
router.get('/profile', authenticate, authorize('VOLUNTEER'), volController.getVolunteerProfile);
router.put('/profile', authenticate, authorize('VOLUNTEER'), volController.updateVolunteerProfile);

module.exports = router;
