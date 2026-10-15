const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Token helper
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'learn_unique_secret_key_123',
    { expiresIn: '30d' }
  );
};

// 1. REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, college, location, skillsToTeach, skillsToLearn } = req.body;

    console.log('--- Register Request Received ---');
    console.log('Payload:', { name, email, college, location });

    // Basic validation
    if (!name || !email || !password) {
      console.log('Validation Error: Missing name, email, ya password');
      return res.status(400).json({
        success: false,
        message: 'Name, email aur password zaroori hain'
      });
    }

    if (password.length < 6) {
      console.log('Validation Error: Password length < 6');
      return res.status(400).json({
        success: false,
        message: 'Password kam se kam 6 characters ka hona chahiye'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Pehle check karo ki email exist karta hai ya nahi
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      console.log(`Duplicate Email Found: ${cleanEmail}`);
      return res.status(400).json({
        success: false,
        message: 'Ye email pehle se registered hai. Sign In karein.'
      });
    }

    // Naya user create karein
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      college: college || '',
      location: location || '',
      skillsToTeach: skillsToTeach || [],
      skillsToLearn: skillsToLearn || []
    });

    console.log('User created successfully in DB, ID:', user._id);

    res.status(201).json({
      success: true,
      message: 'Account successfully create ho gaya!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        location: user.location,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Registration Error Details:', error);

    // MongoDB duplicate key error code E11000 handling
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ye email pehle se registered hai'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server error aayi hai'
    });
  }
};

// 2. LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('--- Login Request Received ---');
    console.log('Email:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email aur password dono daalein'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      console.log('Login failed: Invalid credentials');
      return res.status(401).json({
        success: false,
        message: 'Galat email ya password'
      });
    }

    console.log('Login successful for ID:', user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        location: user.location,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Login Error Details:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error aayi hai'
    });
  }
};

// 3. GET LOGGED IN USER
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User nahi mila'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('GetMe Error Details:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error aayi hai'
    });
  }
};