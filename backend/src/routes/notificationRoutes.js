const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const notifController = require('../controllers/notificationController');

router.get('/', authenticate, notifController.getNotifications);
router.get('/unread-count', authenticate, notifController.getUnreadCount);
router.put('/read-all', authenticate, notifController.markAllRead);
router.put('/:id/read', authenticate, notifController.markAsRead);
router.patch('/read', authenticate, notifController.markAsRead);

module.exports = router;
