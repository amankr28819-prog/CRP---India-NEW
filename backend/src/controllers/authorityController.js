const Complaint = require('../models/Complaint');

// @desc Get Authority Dashboard metrics and recent complaints
// @route GET /api/authority/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    // If category-wise authority, strictly scope queries to assigned category
    const isCategoryAuth = req.user && req.user.role === 'authority_category';
    const baseQuery = isCategoryAuth ? { category: req.user.assignedCategory } : {};

    const total = await Complaint.countDocuments(baseQuery);
    const submitted = await Complaint.countDocuments({ ...baseQuery, status: 'Submitted' });
    const underReview = await Complaint.countDocuments({ ...baseQuery, status: 'Under Review' });
    const assigned = await Complaint.countDocuments({ ...baseQuery, status: 'Assigned' });
    const inProgress = await Complaint.countDocuments({ ...baseQuery, status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ ...baseQuery, status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ ...baseQuery, status: 'Rejected' });

    // Category breakdown
    const categoryPipeline = [];
    if (isCategoryAuth) {
      categoryPipeline.push({ $match: { category: req.user.assignedCategory } });
    }
    categoryPipeline.push(
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    );
    const categoryStats = await Complaint.aggregate(categoryPipeline);

    // Ward breakdown (top active wards)
    const wardPipeline = [];
    if (isCategoryAuth) {
      wardPipeline.push({ $match: { category: req.user.assignedCategory } });
    }
    wardPipeline.push(
      { $group: { _id: '$ward', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    );
    const wardStats = await Complaint.aggregate(wardPipeline);

    // Recent 8 complaints
    const recentComplaints = await Complaint.find(baseQuery)
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