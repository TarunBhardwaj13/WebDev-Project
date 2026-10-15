const express = require("express");
const router = express.Router();

// Controller
const {
  getMatches,
} = require("../controllers/matchController");

// Authentication middleware
const {
  protect,
} = require("../middleware/authMiddleware");

// =====================================
// FIND SKILL PARTNERS
// GET /api/matches
// =====================================

router.get("/", protect, getMatches);

// =====================================
// EXPORT ROUTER
// =====================================

module.exports = router;