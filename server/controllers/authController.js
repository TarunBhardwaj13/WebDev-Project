const User = require("../models/User");
const jwt = require("jsonwebtoken");

// =====================================
// 1. GENERATE JWT TOKEN
// =====================================

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// =====================================
// 2. REGISTER USER
// =====================================

exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      college,
      location,
      skillsToTeach,
      skillsToLearn,
    } = req.body;

    // Required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input format.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Name and email cannot be empty.",
      });
    }

    // Check existing account
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered. Please login.",
      });
    }

    // Always create normal user.
    // Never accept role from req.body.
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      college: college || "",
      location: location || "",
      skillsToTeach: Array.isArray(skillsToTeach)
        ? skillsToTeach
        : [],
      skillsToLearn: Array.isArray(skillsToLearn)
        ? skillsToLearn
        : [],
      role: "user",
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        location: user.location,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
};

// =====================================
// 3. LOGIN USER / ADMIN
// =====================================

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Password is excluded by default in User.js.
    const user = await User.findOne({
      email: cleanEmail,
    }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Block inactive accounts
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Contact support.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        location: user.location,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to login. Please try again.",
    });
  }
};

// =====================================
// 4. GET LOGGED-IN USER
// =====================================

exports.getMe = async (req, res) => {
  try {
    // protect middleware must authenticate the user first.
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch user profile.",
    });
  }
};