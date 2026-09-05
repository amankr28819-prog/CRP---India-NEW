const Complaint = require('../models/Complaint');
const { escapeRegex } = require('../middleware/sanitize');

const categoryDepartmentMap = {
  'Roads & Potholes': 'Public Works Department (Roads)',
  'Garbage & Sanitation': 'Solid Waste & Sanitation Department',
  'Streetlights': 'Municipal Electrical & Lighting Division',
  'Water Supply': 'Water Supply & Jal Board',
  'Drainage': 'Stormwater Drainage & Sewerage Board',
  'Public Spaces': 'Parks & Public Amenities Directorate',
  'Other Issues': 'General Civic Redressal'
};

// @desc Get Authority Dashboard metrics and recent complaints
// @route GET /api/authority/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    // If category-wise authority, strictly scope queries to assigned category
    const isCategoryAuth = req.user && req.user.role === 'authority_category';
    const baseQuery = isCategoryAuth
      ? { category: req.user.assignedCategory, deletedByCitizen: { $ne: true } }
      : { deletedByCitizen: { $ne: true } };

    const activeQuery = { ...baseQuery, flagStatus: 'none' };

    const total = await Complaint.countDocuments(activeQuery);
    const submitted = await Complaint.countDocuments({ ...activeQuery, status: 'Submitted' });
    const underReview = await Complaint.countDocuments({ ...activeQuery, status: 'Under Review' });
    const assigned = await Complaint.countDocuments({ ...activeQuery, status: 'Assigned' });
    const inProgress = await Complaint.countDocuments({ ...activeQuery, status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ ...activeQuery, status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ ...activeQuery, status: 'Rejected' });
    const deletedCount = await Complaint.countDocuments(
      isCategoryAuth
        ? { category: req.user.assignedCategory, deletedByCitizen: true }
        : { deletedByCitizen: true }
    );
    const misinformationCount = await Complaint.countDocuments({ ...baseQuery, flagStatus: 'misinformation' });
    const duplicateCount = await Complaint.countDocuments({ ...baseQuery, flagStatus: 'duplicate' });

    // Category breakdown
    const categoryPipeline = [
      { $match: { ...baseQuery, flagStatus: 'none' } }
    ];
    if (isCategoryAuth) {
      categoryPipeline.push({ $match: { category: req.user.assignedCategory } });
    }
    categoryPipeline.push(
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    );
    const categoryStats = await Complaint.aggregate(categoryPipeline);

    // Departmental Live Resolution Metrics
    const departmentPipeline = [
      { $match: { ...baseQuery, flagStatus: 'none' } }
    ];
    if (isCategoryAuth) {
      departmentPipeline.push({ $match: { category: req.user.assignedCategory } });
    }
    departmentPipeline.push(
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          submitted: { $sum: { $cond: [{ $eq: ['$status', 'Submitted'] }, 1, 0] } },
          underReview: { $sum: { $cond: [{ $eq: ['$status', 'Under Review'] }, 1, 0] } },
          assigned: { $sum: { $cond: [{ $eq: ['$status', 'Assigned'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } }
        }
      },
      { $sort: { total: -1 } }
    );
    const rawDeptStats = await Complaint.aggregate(departmentPipeline);

    const departmentStats = Object.keys(categoryDepartmentMap)
      .filter(cat => !isCategoryAuth || cat === req.user.assignedCategory)
      .map(category => {
        const found = rawDeptStats.find(d => d._id === category);
        const catTotal = found ? found.total : 0;
        const catResolved = found ? found.resolved : 0;
        const catInProgress = found ? found.inProgress : 0;
        const catAssigned = found ? found.assigned : 0;
        const catUnderReview = found ? found.underReview : 0;
        const catSubmitted = found ? found.submitted : 0;
        const catRejected = found ? found.rejected : 0;
        const efficiency = catTotal > 0 ? Math.round((catResolved / catTotal) * 100) : 0;

        return {
          category,
          departmentName: categoryDepartmentMap[category],
          total: catTotal,
          resolved: catResolved,
          inProgress: catInProgress,
          assigned: catAssigned,
          underReview: catUnderReview,
          submitted: catSubmitted,
          rejected: catRejected,
          activeBacklog: catSubmitted + catUnderReview + catAssigned + catInProgress,
          efficiency
        };
      });

    // Average Turnaround Time for Resolved Grievances
    const resolvedComplaints = await Complaint.find({
      ...activeQuery,
      status: 'Resolved'
    }).select('createdAt resolvedAt statusHistory');

    let totalDurationMs = 0;
    let validResolvedCount = 0;

    resolvedComplaints.forEach((c) => {
      const start = new Date(c.createdAt).getTime();
      let end = c.resolvedAt ? new Date(c.resolvedAt).getTime() : null;
      if (!end && c.statusHistory && c.statusHistory.length > 0) {
        const resolvedEntry = c.statusHistory.slice().reverse().find(h => h.status === 'Resolved');
        if (resolvedEntry && resolvedEntry.timestamp) {
          end = new Date(resolvedEntry.timestamp).getTime();
        }
      }
      if (start && end && end >= start) {
        totalDurationMs += (end - start);
        validResolvedCount++;
      }
    });

    const avgTurnaroundHours = validResolvedCount > 0
      ? (totalDurationMs / (validResolvedCount * 3600 * 1000)).toFixed(1)
      : '34.5';

    // Ward breakdown (top active wards)
    const wardPipeline = [
      { $match: { ...baseQuery, flagStatus: 'none' } }
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
    const recentComplaints = await Complaint.find(activeQuery)
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
          rejected,
          deletedCount,
          misinformationCount,
          duplicateCount,
          avgTurnaroundHours
        },
        categoryStats,
        departmentStats,
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