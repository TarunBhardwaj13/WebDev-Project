const User = require("../models/User");

// =====================================
// 1. GET DASHBOARD STATISTICS
// =====================================

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const activeUsers = await User.countDocuments({
      isActive: true,
    });

    const totalAdmins = await User.countDocuments({
      role: "admin",
    });

    res.status(200).json({
      success: true,
      message: "Dashboard statistics fetched successfully",
      data: {
        totalUsers,
        activeUsers,
        totalAdmins,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

// =====================================
// 2. GET ALL USERS
// =====================================

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// =====================================
// 3. GET SINGLE USER
// =====================================

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

// =====================================
// 4. DELETE USER
// =====================================

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent an admin from deleting their own account.
    if (
      req.user &&
      req.user._id &&
      req.user._id.toString() === user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account here",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};