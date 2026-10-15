const SkillResource = require('../models/SkillResource');

// 1. ADD / CREATE (Naya item add karna)
// POST /api/resources
exports.addResource = async (req, res) => {
  try {
    const { title, skillName, linkOrNote } = req.body;

    if (!title || !skillName || !linkOrNote) {
      return res.status(400).json({
        success: false,
        message: 'Kripya saari fields bharein (title, skillName, linkOrNote)'
      });
    }

    const newResource = await SkillResource.create({
      title,
      skillName,
      linkOrNote
    });

    res.status(201).json({
      success: true,
      message: 'Item successfully add ho gaya!',
      data: newResource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Add karne me error: ' + error.message
    });
  }
};

// 2. FETCH / GET ALL (Saare items nikaalna)
// GET /api/resources
exports.fetchResources = async (req, res) => {
  try {
    const resources = await SkillResource.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Fetch karne me error: ' + error.message
    });
  }
};

// 3. DELETE (ID ke zariye delete karna)
// DELETE /api/resources/:id
exports.deleteResource = async (req, res) => {
  try {
    const resource = await SkillResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Item nahi mila'
      });
    }

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item successfully delete ho gaya!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Delete karne me error: ' + error.message
    });
  }
};