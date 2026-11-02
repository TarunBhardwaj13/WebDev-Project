const SwapRequest = require('../models/SwapRequest');

// POST /api/requests/send
exports.sendRequest = async (req, res) => {
  try {
    const { recipientId, topic, message } = req.body;
    
    if (!recipientId || !topic) {
      return res.status(400).json({ success: false, message: 'Recipient ID aur Topic zaroori hai.' });
    }

    if (req.user._id.toString() === recipientId.toString()) {
      return res.status(400).json({ success: false, message: 'Aap khud ko request nahi bhej sakte.' });
    }

    const newRequest = await SwapRequest.create({
      sender: req.user._id,
      recipient: recipientId,
      topic,
      message: message || '',
    });

    res.status(201).json({ success: true, request: newRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/requests/sent
exports.getSentRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({ sender: req.user._id })
      .populate('recipient', 'name email college')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/requests/received
exports.getReceivedRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({ recipient: req.user._id })
      .populate('sender', 'name email college location')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/requests/:id/respond
exports.respondToRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const request = await SwapRequest.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request nahi mili.' });
    }

    request.status = status;
    await request.save();

    res.status(200).json({ success: true, message: `Request ${status} ho gayi.`, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};