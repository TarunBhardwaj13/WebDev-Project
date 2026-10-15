const express = require('express');
const router = express.Router();

const {
  getMatches,
  getUserById,
  updateProfile,
  getLeaderboard
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');

router.get('/leaderboard', getLeaderboard);
router.get('/matches', protect, getMatches);
router.put('/profile', protect, updateProfile);
router.get('/:id', getUserById);

module.exports = router;