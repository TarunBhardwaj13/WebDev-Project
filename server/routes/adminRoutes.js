const express = require("express");

const router = express.Router();

// Admin controller functions
const {
getDashboardStats,
getAllUsers,
getUserById,
deleteUser,
} = require("../controllers/adminController");

// Authentication middleware
const {
protect,
adminOnly,
} = require("../middleware/authMiddleware");

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// GET /api/admin
router.get("/", (req, res) => {
res.status(200).json({
success: true,
message: "Learn Unique Admin API is working!",
});
});

// GET /api/admin/dashboard
router.get("/dashboard", getDashboardStats);

// GET /api/admin/users
router.get("/users", getAllUsers);

// GET /api/admin/users/:id
router.get("/users/:id", getUserById);

// DELETE /api/admin/users/:id
router.delete("/users/:id", deleteUser);

module.exports = router;
