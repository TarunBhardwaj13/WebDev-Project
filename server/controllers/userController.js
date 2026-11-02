const User = require('../models/User');

// GET /api/users/profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User nahi mila.' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/users/profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User nahi mila.' });
    }

    user.college = req.body.college ?? user.college;
    user.location = req.body.location ?? user.location;
    user.bio = req.body.bio ?? user.bio;
    
    if (Array.isArray(req.body.skillsToTeach)) {
      user.skillsToTeach = req.body.skillsToTeach;
    }
    if (Array.isArray(req.body.skillsToLearn)) {
      user.skillsToLearn = req.body.skillsToLearn;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile update ho gayi!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        location: user.location,
        bio: user.bio,
        rating: user.rating,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};