const express = require('express');
const router = express.Router();

const {
  sendRequest,
  getMyRequests,
  respondToRequest
} = require('../controllers/requestController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendRequest);
router.get('/my', protect, getMyRequests);
router.put('/:id/respond', protect, respondToRequest);

module.exports = router;