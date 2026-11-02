// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner',
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Naam dena zaroori hai'], trim: true },
    email: {
      type: String,
      required: [true, 'Email dena zaroori hai'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password dena zaroori hai'],
      minlength: 6,
    },
    // 2 types of user + admin
    role: {
      type: String,
      enum: ['student', 'professor', 'admin'],
      default: 'student',
    },
    isActive: { type: Boolean, default: true },
    college: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    bio: { type: String, default: '' },
    // Professor specific fields
    department: { type: String, default: '' },
    title: { type: String, default: '' }, // e.g., Assistant Professor, HOD
    // Learning & Teaching
    skillsToTeach: [skillSchema],
    skillsToLearn: [skillSchema],
    xp: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);