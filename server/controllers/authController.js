const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'learnunique_secret_key', {
    expiresIn: '30d',
  });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    let { name, email, password, role, college, location, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email aur password dena zaroori hai.',
      });
    }

    // String conversion & sanitation
    email = String(email).trim().toLowerCase();
    name = String(name).trim();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Yeh email pehle se registered hai.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: ['student', 'professor'].includes(role) ? role : 'student',
      college: college ? String(college).trim() : '',
      location: location ? String(location).trim() : '',
      department: department ? String(department).trim() : '',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account successfully create ho gaya!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        location: user.location,
        rating: user.rating,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed.',
    });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email aur password dalein.',
      });
    }

    // String conversion & sanitation (Crash guard)
    email = String(email).trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ya password galat hai.',
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Aapka account admin dwara suspend kiya gaya hai.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ya password galat hai.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        location: user.location,
        rating: user.rating,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed.',
    });
  }
};