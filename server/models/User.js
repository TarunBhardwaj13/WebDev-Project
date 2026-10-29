const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// =====================================
// USER SCHEMA
// =====================================

const userSchema = new mongoose.Schema(
  {
    // User Name
    name: {
      type: String,
      required: [true, "Name zaroori hai"],
      trim: true,
    },

    // Email Address
    email: {
      type: String,
      required: [true, "Email zaroori hai"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Encrypted Password
    password: {
      type: String,
      required: [true, "Password zaroori hai"],
      minlength: 6,
      select: false,
    },

    // College Name
    college: {
      type: String,
      default: "",
      trim: true,
    },

    // User Location
    location: {
      type: String,
      default: "",
      trim: true,
    },

    // User Biography
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    // Learning Mode - Online Only
learningMode: {
  type: String,
  enum: ["Online"],
  default: "Online",
},

    // Skills User Can Teach
    skillsToTeach: [
      {
        name: {
          type: String,
          trim: true,
        },

        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced"],
          default: "Intermediate",
        },
      },
    ],

    // Skills User Wants to Learn
    skillsToLearn: [
      {
        name: {
          type: String,
          trim: true,
        },

        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced"],
          default: "Beginner",
        },
      },
    ],

    // Experience Points
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },

    // User Rating
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },

    // User Role
    // Normal registration always defaults to user.
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================
// PASSWORD ENCRYPTION
// =====================================

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

// =====================================
// PASSWORD VERIFICATION
// =====================================

userSchema.methods.matchPassword = async function (
  enteredPassword
) {
  return bcrypt.compare(enteredPassword, this.password);
  
};

// =====================================
// EXPORT USER MODEL
// =====================================

module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);
