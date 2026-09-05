const Complaint = require('../models/Complaint');
const { escapeRegex } = require('../middleware/sanitize');

// @desc Get Authority Dashboard metrics and recent complaints
// @route GET /api/authority/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    // If category-wise authority, strictly scope queries to assigned category
    const isCategoryAuth = req.user && req.user.role === 'authority_category';
    const baseQuery = isCategoryAuth
      ? { category: req.user.assignedCategory, deletedByCitizen: { $ne: true } }
      : { deletedByCitizen: { $ne: true } };

    const total = await Complaint.countDocuments(baseQuery);
    const submitted = await Complaint.countDocuments({ ...baseQuery, status: 'Submitted' });
    const underReview = await Complaint.countDocuments({ ...baseQuery, status: 'Under Review' });
    const assigned = await Complaint.countDocuments({ ...baseQuery, status: 'Assigned' });
    const inProgress = await Complaint.countDocuments({ ...baseQuery, status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ ...baseQuery, status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ ...baseQuery, status: 'Rejected' });

    // Category breakdown
    const categoryPipeline = [
      { $match: { deletedByCitizen: { $ne: true } } }
    ];
    if (isCategoryAuth) {
      categoryPipeline.push({ $match: { category: req.user.assignedCategory } });
    }
    categoryPipeline.push(
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    );
    const categoryStats = await Complaint.aggregate(categoryPipeline);

    // Ward breakdown (top active wards)
    const wardPipeline = [
      { $match: { deletedByCitizen: { $ne: true } } }
    ];
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

// @desc Get Deleted Complaints (Municipal Authority only, scoped by category role)
// @route GET /api/authority/deleted-complaints
const getDeletedComplaints = async (req, res, next) => {
  try {
    const authorityRoles = ['authority', 'authority_admin', 'authority_category'];
    if (!req.user || !authorityRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Municipal Authority privilege required.'
      });
    }

    const { category, search, page = 1, limit = 20 } = req.query;
    const query = {
      deletedByCitizen: true
    };

    // Category Authority strict boundary enforcement
    if (req.user.role === 'authority_category') {
      // If client requests a category parameter that differs from assigned category, reject!
      if (category && category !== 'All' && category !== req.user.assignedCategory) {
        return res.status(403).json({
          success: false,
          message: `Access denied: You are only authorized to view deleted complaints in your assigned category (${req.user.assignedCategory}).`
        });
      }
      query.category = req.user.assignedCategory;
    } else {
      // Main Authority / Admin can filter by category or view all
      if (category && category !== 'All') {
        query.category = category;
      }
    }

    if (search && typeof search === 'string' && search.trim()) {
      const cleanSearch = escapeRegex(search.trim());
      if (cleanSearch) {
        query.$or = [
          { referenceId: { $regex: cleanSearch, $options: 'i' } },
          { title: { $regex: cleanSearch, $options: 'i' } },
          { location: { $regex: cleanSearch, $options: 'i' } },
          { description: { $regex: cleanSearch, $options: 'i' } },
          { ward: { $regex: cleanSearch, $options: 'i' } },
          { city: { $regex: cleanSearch, $options: 'i' } }
        ];
      }
    }

    const cleanPage = Math.max(1, parseInt(page) || 1);
    const cleanLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (cleanPage - 1) * cleanLimit;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort({ deletedAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(cleanLimit);

    res.json({
      success: true,
      count: complaints.length,
      total,
      page: cleanPage,
      pages: Math.ceil(total / cleanLimit),
      complaints
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getDeletedComplaints
};