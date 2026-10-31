const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const rewardsController = require('../controllers/rewardsController');

router.get('/', authenticate, rewardsController.getRewards);
router.get('/leaderboard', authenticate, rewardsController.getLeaderboard);
router.get('/badges', authenticate, rewardsController.getBadges);

module.exports = router;
