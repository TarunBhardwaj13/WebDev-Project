const Request = require('../models/Request');
const User = require('../models/User');

exports.sendRequest = async (req, res) => {
  try {
    const { receiverId, skillOffered, skillWanted, message } = req.body;

    if (!receiverId || !skillOffered || !skillWanted) {
      return res.status(400).json({
        success: false,
        message: 'receiverId, skillOffered, aur skillWanted zaroori hain'
      });
    }

    if (receiverId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Aap khud ko swap request nahi bhej sakte'
      });
    }

    const existingReq = await Request.findOne({
      sender: req.user._id,
      receiver: receiverId,
      status: 'pending'
    });

    if (existingReq) {
      return res.status(400).json({
        success: false,
        message: 'Aap pehle hi is user ko ek pending request bhej chuke hain'
      });
    }

    const newRequest = await Request.create({
      sender: req.user._id,
      receiver: receiverId,
      skillOffered,
      skillWanted,
      message: message || ''
    });

    res.status(201).json({
      success: true,
      message: 'Request successfully bhej di gayi!',
      data: newRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const received = await Request.find({ receiver: req.user._id })
      .populate('sender', 'name email college xp')
      .sort({ createdAt: -1 });

    const sent = await Request.find({ sender: req.user._id })
      .populate('receiver', 'name email college xp')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { received, sent }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.respondToRequest = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status sirf accepted ya rejected ho sakta hai'
      });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request nahi mili' });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Aap is request ko respond karne ke liye authorized nahi hain'
      });
    }

    request.status = status;
    await request.save();

    if (status === 'accepted') {
      const incUpdate = {};
      incUpdate['$inc'] = { xp: 20 };
      await User.findByIdAndUpdate(request.sender, incUpdate);
      await User.findByIdAndUpdate(request.receiver, incUpdate);
    }

    res.status(200).json({
      success: true,
      message: 'Request update ho gayi!',
      data: request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};