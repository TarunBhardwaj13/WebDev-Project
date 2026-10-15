const express = require("express");
const router = express.Router();

// GET /api/admin
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Learn Unique Admin API is working!",
  });
});

module.exports = router;