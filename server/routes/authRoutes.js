const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// =====================================
// USER REGISTRATION
// POST /api/auth/register
// =====================================

router.post("/register", registerUser);

// =====================================
// USER / ADMIN LOGIN
// POST /api/auth/login
// =====================================

router.post("/login", loginUser);

// =====================================
// GET LOGGED-IN USER
// GET /api/auth/me
// =====================================

router.get("/me", protect, getMe);

module.exports = router;