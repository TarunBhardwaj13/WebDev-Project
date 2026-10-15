const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    partner1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    partner2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    skillTaught: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    duration: {
      type: Number,
      default: 60
    },
    meetLink: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);