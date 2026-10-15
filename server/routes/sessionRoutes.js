const express = require('express');
const router = express.Router();

const {
  createSession,
  getMySessions,
  updateSessionStatus
} = require('../controllers/sessionController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSession);
router.get('/my', protect, getMySessions);
router.put('/:id/status', protect, updateSessionStatus);
module.exports = router;
