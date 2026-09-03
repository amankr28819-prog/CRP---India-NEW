const Complaint = require('../models/Complaint');

// @desc Get Authority Dashboard metrics and recent complaints
// @route GET /api/authority/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const total = await Complaint.countDocuments();
    const submitted = await Complaint.countDocuments({ status: 'Submitted' });
    const underReview = await Complaint.countDocuments({ status: 'Under Review' });
    const assigned = await Complaint.countDocuments({ status: 'Assigned' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ status: 'Rejected' });

    // Category breakdown
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Ward breakdown (top active wards)
    const wardStats = await Complaint.aggregate([
      { $group: { _id: '$ward', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // Recent 8 complaints
    const recentComplaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      data: {
        stats: {
          total,
          submitted,
          underReview,
          assigned,
          inProgress,
          resolved,
          rejected
        },
        categoryStats,
        wardStats,
        recentComplaints
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats
};