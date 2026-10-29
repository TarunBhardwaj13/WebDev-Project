const mongoose = require("mongoose");
const Request = require("../models/Request");
const User = require("../models/User");

// ============================================
// 1. SEND SKILL EXCHANGE REQUEST
// POST /api/requests
// ============================================

exports.sendRequest = async (req, res) => {
  try {
    const {
      receiverId,
      skillOffered,
      skillWanted,
      message,
    } = req.body;

    const senderId = req.user?._id;

    if (!senderId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to send a request.",
      });
    }

    if (!receiverId || !skillOffered || !skillWanted) {
      return res.status(400).json({
        success: false,
        message:
          "Receiver, offered skill, and wanted skill are required.",
      });
    }

    if (!mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver ID.",
      });
    }

    if (
      receiverId.toString() === senderId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a request to yourself.",
      });
    }

    const cleanSkillOffered = String(skillOffered).trim();
    const cleanSkillWanted = String(skillWanted).trim();

    if (!cleanSkillOffered || !cleanSkillWanted) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid skill names.",
      });
    }

    if (
      cleanSkillOffered.length > 100 ||
      cleanSkillWanted.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Skill names cannot exceed 100 characters.",
      });
    }

    const [sender, receiver] = await Promise.all([
      User.findById(senderId).select("_id isActive"),
      User.findById(receiverId).select("_id isActive"),
    ]);

    if (!sender || sender.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is unavailable.",
      });
    }

    if (!receiver || receiver.isActive === false) {
      return res.status(404).json({
        success: false,
        message: "This user is unavailable.",
      });
    }

    // Check for an existing pending request
    // in the same direction.
    const existingRequest = await Request.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        code: "REQUEST_ALREADY_PENDING",
        message: "You have already sent a request to this user.",
        data: existingRequest,
      });
    }

    // Do not create a new request if the users
    // are already connected through an accepted request.
    const existingConnection = await Request.findOne({
      status: "accepted",
      $or: [
        {
          sender: senderId,
          receiver: receiverId,
        },
        {
          sender: receiverId,
          receiver: senderId,
        },
      ],
    });

    if (existingConnection) {
      return res.status(409).json({
        success: false,
        code: "ALREADY_CONNECTED",
        message: "You are already connected with this user.",
      });
    }

    // Reuse a previously rejected request when possible.
    // This prevents unnecessary duplicate request documents.
    let request = await Request.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "rejected",
    }).sort({ updatedAt: -1 });

    if (request) {
      request.skillOffered = cleanSkillOffered;
      request.skillWanted = cleanSkillWanted;
      request.message = String(message || "").trim();
      request.status = "pending";

      await request.save();
    } else {
      request = await Request.create({
        sender: senderId,
        receiver: receiverId,
        skillOffered: cleanSkillOffered,
        skillWanted: cleanSkillWanted,
        message: String(message || "").trim(),
        status: "pending",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Request sent successfully!",
      data: request,
    });
  } catch (error) {
    console.error("Send request error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send request.",
    });
  }
};

// ============================================
// 2. GET SENT AND RECEIVED REQUESTS
// GET /api/requests/my
// ============================================

exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to view your requests.",
      });
    }

    const [received, sent] = await Promise.all([
      Request.find({
        receiver: userId,
      })
        .populate(
          "sender",
          "name email college location bio xp rating skillsToTeach skillsToLearn"
        )
        .sort({ createdAt: -1 }),

      Request.find({
        sender: userId,
      })
        .populate(
          "receiver",
          "name email college location bio xp rating skillsToTeach skillsToLearn"
        )
        .sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        received,
        sent,
      },
    });
  } catch (error) {
    console.error("Get requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch requests.",
    });
  }
};

// ============================================
// 3. ACCEPT OR REJECT REQUEST
// PUT /api/requests/:id/respond
// ============================================

exports.respondToRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to respond to requests.",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID.",
      });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be accepted or rejected.",
      });
    }

    // Atomically update only a pending request
    // addressed to the currently logged-in user.
    const request = await Request.findOneAndUpdate(
      {
        _id: id,
        receiver: userId,
        status: "pending",
      },
      {
        $set: {
          status,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!request) {
      const existingRequest = await Request.findById(id);

      if (!existingRequest) {
        return res.status(404).json({
          success: false,
          message: "Request not found.",
        });
      }

      if (
        existingRequest.receiver.toString() !==
        userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot respond to this request.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "This request has already been processed.",
        data: existingRequest,
      });
    }

    // Award XP only after a successful acceptance.
    // The pending-only atomic update prevents repeated
    // acceptance of the same request from awarding XP again.
    if (status === "accepted") {
      await User.updateMany(
        {
          _id: {
            $in: [request.sender, request.receiver],
          },
        },
        {
          $inc: {
            xp: 20,
          },
        }
      );
    }

    return res.status(200).json({
      success: true,
      message:
        status === "accepted"
          ? "Request accepted successfully!"
          : "Request rejected successfully!",
      data: request,
    });
  } catch (error) {
    console.error("Respond to request error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process the request.",
    });
  }
};