const User = require('../models/User');

// 1. GET ALL MATCHES / EXPLORE USERS (GET /api/users/matches)
exports.getMatches = async (req, res) => {
  try {
    const { skill, mode, college } = req.query;
    let query = {};

    // Current user ko khud ke matches me nahi dikhana
    if (req.user) {
      query._id = { $ne: req.user._id };
    }

    // Skill search filter
    if (skill) {
      query['skillsToTeach.name'] = { $regex: skill, $options: 'i' };
    }

    // Learning Mode filter (Online / Offline)
    if (mode && mode !== 'All') {
      query.learningMode = { $in: [mode, 'Both'] };
    }

    // College filter
    if (college) {
      query.college = { $regex: college, $options: 'i' };
    }

    const users = await User.find(query).select('-password').sort({ xp: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET USER PROFILE BY ID (GET /api/users/:id)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User nahi mila' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. UPDATE PROFILE (PUT /api/users/profile)
exports.updateProfile = async (req, res) => {
  try {
    const { bio, college, location, learningMode, skillsToTeach, skillsToLearn } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User nahi mila' });
    }

    if (bio !== undefined) user.bio = bio;
    if (college !== undefined) user.college = college;
    if (location !== undefined) user.location = location;
    if (learningMode !== undefined) user.learningMode = learningMode;
    if (skillsToTeach) user.skillsToTeach = skillsToTeach;
    if (skillsToLearn) user.skillsToLearn = skillsToLearn;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile update ho gayi!',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. GET LEADERBOARD (GET /api/users/leaderboard)
exports.getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find({})
      .select('name college xp rating skillsToTeach')
      .sort({ xp: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: topUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};