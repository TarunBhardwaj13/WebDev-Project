const Session = require('../models/Session');
const User = require('../models/User');

exports.createSession = async (req, res) => {
  try {
    const { partnerId, skillTaught, date, duration, meetLink, notes } = req.body;

    if (!partnerId || !skillTaught || !date) {
      return res.status(400).json({
        success: false,
        message: 'partnerId, skillTaught aur date zaroori hain'
      });
    }

    const newSession = await Session.create({
      partner1: req.user._id,
      partner2: partnerId,
      skillTaught,
      date,
      duration: duration || 60,
      meetLink: meetLink || '',
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Session schedule ho gaya!',
      data: newSession
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMySessions = async (req, res) => {
  try {
    const query = {};
    query['$or'] = [{ partner1: req.user._id }, { partner2: req.user._id }];

    const sessions = await Session.find(query)
      .populate('partner1', 'name email college')
      .populate('partner2', 'name email college')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['completed', 'cancelled', 'scheduled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session nahi mili' });
    }

    const isParticipant =
      session.partner1.toString() === req.user._id.toString() ||
      session.partner2.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Aap is session ko update karne ke liye authorized nahi hain'
      });
    }

    session.status = status;
    await session.save();

    if (status === 'completed') {
      const incUpdate = {};
      incUpdate['$inc'] = { xp: 50 };
      await User.findByIdAndUpdate(session.partner1, incUpdate);
      await User.findByIdAndUpdate(session.partner2, incUpdate);
    }

    res.status(200).json({
      success: true,
      message: 'Session status update ho gaya!',
      data: session
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};