const mongoose = require("mongoose");

// =====================================
// REQUEST SCHEMA
// =====================================

const requestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    skillOffered: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    skillWanted: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    message: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// =====================================
// INDEXES
// =====================================

requestSchema.index({
  sender: 1,
  status: 1,
  createdAt: -1,
});

requestSchema.index({
  receiver: 1,
  status: 1,
  createdAt: -1,
});

// =====================================
// EXPORT MODEL
// =====================================

module.exports =
  mongoose.models.Request ||
  mongoose.model("Request", requestSchema);