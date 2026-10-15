const mongoose = require('mongoose');

const skillResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title zaroori hai'],
      trim: true
    },
    skillName: {
      type: String,
      required: [true, 'Skill name zaroori hai'],
      trim: true
    },
    linkOrNote: {
      type: String,
      required: [true, 'Link ya notes text zaroori hai']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SkillResource', skillResourceSchema);