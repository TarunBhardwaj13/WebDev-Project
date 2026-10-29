const mongoose = require("mongoose");
const User = require("../models/User");

// =====================================
// 1. DASHBOARD STATISTICS
// GET /api/admin/dashboard
// =====================================

exports.getDashboardStats = async (req, res) => {
try {
const [
totalUsers,
activeUsers,
suspendedUsers,
totalAdmins,
] = await Promise.all([
User.countDocuments({ role: "user" }),
User.countDocuments({ role: "user", isActive: true }),
User.countDocuments({ role: "user", isActive: false }),
User.countDocuments({ role: "admin" }),
]);


res.status(200).json({
  success: true,
  message: "Dashboard statistics fetched successfully",
  stats: {
    totalUsers,
    activeUsers,
    suspendedUsers,
    totalAdmins,
  },
});


} catch (error) {
console.error("Dashboard statistics error:", error);


res.status(500).json({
  success: false,
  message: "Failed to fetch dashboard statistics",
});


}
};

// =====================================
// 2. GET ALL USERS
// GET /api/admin/users
// =====================================

exports.getAllUsers = async (req, res) => {
try {
const {
search = "",
status = "all",
role = "all",
page = "1",
limit = "20",
} = req.query;


const pageNumber = Math.max(1, Number(page) || 1);
const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));

const filter = {};

// Role filter
if (role === "all" || role === "") {
  // Include both users and admins.
} else if (role === "user" || role === "admin") {
  filter.role = role;
} else {
  return res.status(400).json({
    success: false,
    message: "Invalid role filter",
  });
}

// Status filter
if (status === "all" || status === "") {
  // Do not apply a status filter.
} else if (status === "active") {
  filter.isActive = { $ne: false };
} else if (status === "suspended") {
  filter.isActive = false;
} else {
  return res.status(400).json({
    success: false,
    message: "Invalid status filter",
  });
}

// Search by name, email, college, or location
const searchText = search.trim();

if (searchText) {
  const escapedSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const searchConditions = [
    { name: { $regex: escapedSearch, $options: "i" } },
    { email: { $regex: escapedSearch, $options: "i" } },
    { college: { $regex: escapedSearch, $options: "i" } },
    { location: { $regex: escapedSearch, $options: "i" } },
  ];

  if (filter.$or) {
    filter.$and = [
      { $or: filter.$or },
      { $or: searchConditions },
    ];
    delete filter.$or;
  } else {
    filter.$or = searchConditions;
  }
}

const [users, totalUsers] = await Promise.all([
  User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .lean(),

  User.countDocuments(filter),
]);

res.status(200).json({
  success: true,
  users,
  pagination: {
    totalUsers,
    currentPage: pageNumber,
    totalPages: Math.ceil(totalUsers / pageSize),
    pageSize,
  },
});


} catch (error) {
console.error("Get users error:", error);


res.status(500).json({
  success: false,
  message: "Failed to fetch users",
});


}
};

// =====================================
// 3. GET SINGLE USER
// GET /api/admin/users/:id
// =====================================

exports.getUserById = async (req, res) => {
try {
const { id } = req.params;


if (!mongoose.isValidObjectId(id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid user ID",
  });
}

const user = await User.findById(id)
  .select("-password")
  .lean();

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found",
  });
}

res.status(200).json({
  success: true,
  user,
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
// 4. SUSPEND / REACTIVATE USER
// PATCH /api/admin/users/:id/status
// =====================================

exports.updateUserStatus = async (req, res) => {
try {
const { id } = req.params;
const { isActive } = req.body;


if (!mongoose.isValidObjectId(id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid user ID",
  });
}

if (typeof isActive !== "boolean") {
  return res.status(400).json({
    success: false,
    message: "isActive must be true or false",
  });
}

const user = await User.findOne({
  _id: id,
  role: "user",
});

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found",
  });
}

user.isActive = isActive;
await user.save();

res.status(200).json({
  success: true,
  message: isActive
    ? "User account reactivated successfully"
    : "User account suspended successfully",
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
  },
});


} catch (error) {
console.error("Update user status error:", error);


res.status(500).json({
  success: false,
  message: "Failed to update user status",
});


}
};

// =====================================
// 5. DELETE USER
// DELETE /api/admin/users/:id
// =====================================

exports.deleteUser = async (req, res) => {
try {
const { id } = req.params;


if (!mongoose.isValidObjectId(id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid user ID",
  });
}

const user = await User.findOne({
  _id: id,
  role: "user",
});

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found",
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
