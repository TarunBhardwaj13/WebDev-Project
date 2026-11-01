const express = require("express");

const router = express.Router();

// Admin controller functions
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  deleteUser,
  toggleUserStatus,
  updateUserRole,
} = require("../controllers/adminController");

// Authentication middleware
const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// GET /api/admin - Health check
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Learn Unique Admin API is working!",
  });
});

// GET /api/admin/dashboard - Platform statistics
router.get("/dashboard", getDashboardStats);

// GET /api/admin/users - Users list with search & filter
router.get("/users", getAllUsers);

// GET /api/admin/users/:id - Single user details
router.get("/users/:id", getUserById);

// PATCH /api/admin/users/:id/toggle-status - Active/Suspended toggle
router.patch("/users/:id/toggle-status", toggleUserStatus);

// PATCH /api/admin/users/:id/role - Role change (user <-> admin)
router.patch("/users/:id/role", updateUserRole);

// DELETE /api/admin/users/:id - Permanent delete user
router.delete("/users/:id", deleteUser);

module.exports = router;