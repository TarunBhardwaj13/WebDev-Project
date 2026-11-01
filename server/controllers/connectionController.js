// server/controllers/connectionController.js
const Connection = require('../models/Connection');
const crypto = require('crypto');

// 1. Send Request
exports.sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    const existing = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Request already exists' });
    }

    const newConnection = await Connection.create({
      sender: senderId,
      receiver: receiverId,
      status: 'pending'
    });

    res.status(201).json({ success: true, connection: newConnection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Accept Request & Create Meeting Room ID
exports.acceptRequest = async (req, res) => {
  try {
    const { connectionId } = req.body;

    // Unique meeting room banaya
    const roomId = crypto.randomBytes(6).toString('hex');

    const updated = await Connection.findByIdAndUpdate(
      connectionId,
      { status: 'accepted', meetingRoomId: roomId },
      { new: true }
    );

    res.status(200).json({ success: true, connection: updated, roomId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};