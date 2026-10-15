const User = require("../models/User");

// =====================================
// GET SKILL MATCHES
// GET /api/matches
// =====================================

exports.getMatches = async (req, res) => {
  try {
    // Logged-in user ki ID
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Please login to find skill partners",
      });
    }

    // Current user ka profile fetch karo
    const currentUser = await User.findById(currentUserId)
      .select("skillsToTeach skillsToLearn learningMode")
      .lean();

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    // Current user ke skills
    const skillsToTeach = (currentUser.skillsToTeach || [])
      .map((skill) => skill.name?.trim().toLowerCase())
      .filter(Boolean);

    const skillsToLearn = (currentUser.skillsToLearn || [])
      .map((skill) => skill.name?.trim().toLowerCase())
      .filter(Boolean);

    // Current user ke alawa active users
    const candidates = await User.find({
      _id: { $ne: currentUserId },
      isActive: { $ne: false },
    })
      .select(
        "name email college location bio learningMode skillsToTeach skillsToLearn xp rating"
      )
      .lean();

    // Matching calculate karo
    const matches = candidates
      .map((candidate) => {
        const candidateTeaches = (
          candidate.skillsToTeach || []
        )
          .map((skill) => skill.name?.trim().toLowerCase())
          .filter(Boolean);

        const candidateLearns = (
          candidate.skillsToLearn || []
        )
          .map((skill) => skill.name?.trim().toLowerCase())
          .filter(Boolean);

        // Candidate woh skill sikhata hai
        // jo current user seekhna chahta hai.
        const skillsTheyCanTeachYou = skillsToLearn.filter(
          (skill) => candidateTeaches.includes(skill)
        );

        // Candidate woh skill seekhna chahta hai
        // jo current user sikhata hai.
        const skillsYouCanTeachThem = skillsToTeach.filter(
          (skill) => candidateLearns.includes(skill)
        );

        const score =
          skillsTheyCanTeachYou.length +
          skillsYouCanTeachThem.length;

        return {
          ...candidate,
          skillsTheyCanTeachYou,
          skillsYouCanTeachThem,
          matchScore: score,
        };
      })
      // Sirf relevant skill matches return karo
      .filter((candidate) => candidate.matchScore > 0)
      // Best matches pehle
      .sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    console.error("Get matches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to find skill partners",
    });
  }
};