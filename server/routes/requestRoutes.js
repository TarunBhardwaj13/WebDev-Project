const express = require('express');
const router = express.Router();
const {
  sendRequest,
  getSentRequests,
  getReceivedRequests,
  respondToRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Sabhi request routes login maangte hain

router.post('/send', sendRequest);
router.get('/sent', getSentRequests);
router.get('/received', getReceivedRequests);
router.patch('/:id/respond', respondToRequest);

module.exports = router;