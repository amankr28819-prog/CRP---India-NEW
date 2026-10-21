const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { escapeRegex } = require('../middleware/sanitize');
const { getCanonicalDeptOfficerMap, resolveAssignedOfficer } = require('./complaintController');

const categoryDepartmentMap = {
  'Roads & Potholes': 'Public Works Department (Roads)',
  'Garbage & Sanitation': 'Solid Waste & Sanitation Department',
  'Streetlights': 'Municipal Electrical & Lighting Division',
  'Water Supply': 'Water Supply & Jal Board',
  'Drainage': 'Stormwater Drainage & Sewerage Board',
  'Public Spaces': 'Parks & Public Amenities Directorate',
  'Other Issues': 'Central Civic Redressal Cell'
};

/**
 * Resolves the authorized query scope for an authority user.
 * - Upper authority (authority_admin): Organization-wide access (no category/dept constraint).
 * - Lower authority (authority_category or authority with category/dept): Strictly constrained
 *   to complaints belonging to their assigned category or assigned department.
 */
const getAuthorityComplaintScope = (user) => {
  if (!user) {
    return { _id: null };
  }

  // Upper municipal authority: organization-wide scope
  if (user.role === 'authority_admin') {
    return {};
  }

  // Lower municipal authority
  const orConditions = [];
  if (user.assignedCategory && typeof user.assignedCategory === 'string' && user.assignedCategory.trim()) {
    orConditions.push({ category: user.assignedCategory.trim() });
  }
  if (user.department && typeof user.department === 'string' && user.department.trim()) {
    orConditions.push({ assignedDepartment: user.department.trim() });
    // Also map department to standard category if applicable
    const matchedCategory = Object.keys(categoryDepartmentMap).find(
      cat => categoryDepartmentMap[cat] === user.department.trim()
    );
    if (matchedCategory && matchedCategory !== user.assignedCategory) {
      orConditions.push({ category: matchedCategory });
    }
  }

  if (orConditions.length === 1) {
    return orConditions[0];
  } else if (orConditions.length > 1) {
    return { $or: orConditions };
  }

  // Fallback: If lower authority has neither category nor department assigned, deny data
  return { _id: null };
};

/**
 * Parses optional timeRange query parameters:
 * Supports: 'All Time' (default), 'Today', 'This Week', 'This Month', 'This Year', or 'custom'
 */
const parseDateRange = (timeRange, customStart, customEnd) => {
  if (!timeRange || timeRange === 'All Time' || timeRange === 'all') {
    return null;
  }

  const now = new Date();
  let startDate = null;
  let endDate = new Date(now.getTime());

  if (timeRange === 'Today' || timeRange === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  } else if (timeRange === 'This Week' || timeRange === 'week' || timeRange === '7days') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (timeRange === 'This Month' || timeRange === 'month' || timeRange === '30days') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (timeRange === 'This Year' || timeRange === 'year' || timeRange === '365days') {
    startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  } else if (timeRange === 'custom' && customStart) {
    startDate = new Date(customStart);
    if (customEnd) {
      endDate = new Date(customEnd);
      if (customEnd.length <= 10) {
        endDate.setHours(23, 59, 59, 999);
      }
    }
  }

  if (startDate && !isNaN(startDate.getTime())) {
    return {
      $gte: startDate,
      $lte: !isNaN(endDate.getTime()) ? endDate : now
    };
  }

  return null;
};

/**
 * Formats average turnaround duration in hours according to readable rules:
 * - Round duration to the nearest whole hour (half-hour values round up). Never display fractional hours.
 * - If average is less than 24 hours: display in whole hours (e.g. 5.4 -> '5 hours', 5.5 -> '6 hours', 23.7 -> '24 hours').
 * - If 24 hours or more: convert rounded total hours into complete days and remaining hours (e.g. 24 -> '1 day', 30.4 -> '1 day 6 hours', 397.7 -> '16 days 14 hours').
 * - One day equals exactly 24 hours. Does not round total duration up to the next full day.
 * - Handles singular and plural correctly ('1 day', '2 days', '1 hour', '2 hours').
 * - Omits '0 hours' when remaining hours after day conversion is zero.
 * - Returns 'N/A' if hours is null, undefined, invalid, or negative.
 */
const formatTurnaroundTime = (hours) => {
  if (hours === null || hours === undefined || typeof hours !== 'number' || isNaN(hours) || hours < 0) {
    return 'N/A';
  }

  // Values below 24 hours: display only whole hours
  if (hours < 24) {
    const roundedHours = Math.round(hours);
    return roundedHours === 1 ? '1 hour' : `${roundedHours} hours`;
  }

  // Values 24 hours and above: round to whole hours, split into complete days and remaining hours
  const totalRoundedHours = Math.round(hours);
  const days = Math.floor(totalRoundedHours / 24);
  const remainingHours = totalRoundedHours % 24;

  const dayLabel = days === 1 ? '1 day' : `${days} days`;

  if (remainingHours === 0) {
    return dayLabel;
  }

  const hourLabel = remainingHours === 1 ? '1 hour' : `${remainingHours} hours`;
  return `${dayLabel} ${hourLabel}`;
};

// @desc Get Authority Dashboard metrics and recent complaints
// @route GET /api/authority/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const isUpperAuthority = req.user && req.user.role === 'authority_admin';
    const scopeFilter = getAuthorityComplaintScope(req.user);
    const dateFilter = parseDateRange(req.query.timeRange, req.query.startDate, req.query.endDate);

    // Single authoritative base query enforcing authority boundaries and citizen deletion status
    const baseQuery = {
      ...scopeFilter,
      deletedByCitizen: { $ne: true }
    };

    if (dateFilter) {
      baseQuery.createdAt = dateFilter;
    }

    // Active complaints query excluding administrative flags (misinformation, duplicate)
    const activeQuery = {
      ...baseQuery,
      flagStatus: 'none'
    };

    // 1. Current Status Metrics strictly derived from the single scoped dataset
    const total = await Complaint.countDocuments(activeQuery);
    const submitted = await Complaint.countDocuments({ ...activeQuery, status: 'Submitted' });
    const underReview = await Complaint.countDocuments({ ...activeQuery, status: 'Under Review' });
    const assigned = await Complaint.countDocuments({ ...activeQuery, status: 'Assigned' });
    const inProgress = await Complaint.countDocuments({ ...activeQuery, status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ ...activeQuery, status: 'Resolved' });

    // Active operational backlog (all non-resolved, non-flagged active stages)
    const activeBacklog = submitted + underReview + assigned + inProgress;

    // Mathematical resolution rate: (resolved / total) * 100
    const resolutionRate = total > 0 ? Number(((resolved / total) * 100).toFixed(1)) : 0;

    // Archival & Flagged metrics scoped strictly to authority boundary
    const deletedQuery = {
      ...scopeFilter,
      deletedByCitizen: true,
      ...(dateFilter ? { createdAt: dateFilter } : {})
    };
    const deletedCount = await Complaint.countDocuments(deletedQuery);
    const misinformationCount = await Complaint.countDocuments({
      ...baseQuery,
      flagStatus: 'misinformation'
    });
    const duplicateCount = await Complaint.countDocuments({
      ...baseQuery,
      flagStatus: 'duplicate'
    });

    // 2. Average Turnaround Time for Resolved Grievances
    // Only resolved complaints with valid resolved timestamps >= created timestamps are averaged
    const resolvedComplaints = await Complaint.find({
      ...activeQuery,
      status: 'Resolved'
    }).select('createdAt resolvedAt statusHistory');

    let totalDurationMs = 0;
    let validResolvedCount = 0;

    resolvedComplaints.forEach((c) => {
      const start = c.createdAt ? new Date(c.createdAt).getTime() : NaN;
      let end = c.resolvedAt ? new Date(c.resolvedAt).getTime() : null;

      if (!end && Array.isArray(c.statusHistory) && c.statusHistory.length > 0) {
        const resolvedEntry = c.statusHistory.slice().reverse().find(h => h.status === 'Resolved');
        if (resolvedEntry && resolvedEntry.timestamp) {
          end = new Date(resolvedEntry.timestamp).getTime();
        }
      }

      if (!isNaN(start) && end !== null && !isNaN(end) && end >= start) {
        totalDurationMs += (end - start);
        validResolvedCount++;
      }
    });

    const avgTurnaroundHours = validResolvedCount > 0
      ? Number((totalDurationMs / (validResolvedCount * 3600 * 1000)).toFixed(1))
      : null;

    const avgTurnaroundDisplay = formatTurnaroundTime(avgTurnaroundHours);

    // 3. Departmental Live Resolution Metrics
    // For Lower Authority: strictly restricted to their authorized department(s)
    // For Upper Authority: lists all municipal departments
    const authorizedCategories = isUpperAuthority
      ? Object.keys(categoryDepartmentMap)
      : Object.keys(categoryDepartmentMap).filter(cat => {
          const deptName = categoryDepartmentMap[cat];
          const matchCat = req.user.assignedCategory && cat === req.user.assignedCategory;
          const matchDept = req.user.department && deptName === req.user.department;
          return matchCat || matchDept;
        });

    const departmentPipeline = [
      { $match: activeQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          submitted: { $sum: { $cond: [{ $eq: ['$status', 'Submitted'] }, 1, 0] } },
          underReview: { $sum: { $cond: [{ $eq: ['$status', 'Under Review'] }, 1, 0] } },
          assigned: { $sum: { $cond: [{ $eq: ['$status', 'Assigned'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } }
        }
      },
      { $sort: { total: -1 } }
    ];

    const rawDeptStats = await Complaint.aggregate(departmentPipeline);

    const departmentStats = authorizedCategories.map(category => {
      const found = rawDeptStats.find(d => d._id === category);
      const catTotal = found ? found.total : 0;
      const catResolved = found ? found.resolved : 0;
      const catInProgress = found ? found.inProgress : 0;
      const catAssigned = found ? found.assigned : 0;
      const catUnderReview = found ? found.underReview : 0;
      const catSubmitted = found ? found.submitted : 0;
      const efficiency = catTotal > 0 ? Number(((catResolved / catTotal) * 100).toFixed(1)) : 0;

      return {
        category,
        departmentName: categoryDepartmentMap[category] || category,
        total: catTotal,
        resolved: catResolved,
        inProgress: catInProgress,
        assigned: catAssigned,
        underReview: catUnderReview,
        submitted: catSubmitted,
        activeBacklog: catSubmitted + catUnderReview + catAssigned + catInProgress,
        efficiency
      };
    });

    // 4. Category breakdown (scoped to activeQuery)
    const categoryPipeline = [
      { $match: activeQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ];
    const categoryStats = await Complaint.aggregate(categoryPipeline);

    // 5. Ward breakdown (scoped to activeQuery)
    const wardPipeline = [
      { $match: activeQuery },
      { $group: { _id: '$ward', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ];
    const wardStats = await Complaint.aggregate(wardPipeline);

    // 6. Recent 8 complaints (scoped to activeQuery)
    const recentComplaints = await Complaint.find(activeQuery)
      .sort({ createdAt: -1 })
      .limit(8);

    // 7. Authority Scope Metadata for UI display
    const authorityScope = {
      role: req.user.role,
      isUpperAuthority,
      assignedCategory: req.user.assignedCategory || '',
      department: req.user.department || '',
      scopeTitle: isUpperAuthority
        ? 'Central Municipal Administration (All Departments)'
        : (req.user.department || (req.user.assignedCategory ? `${req.user.assignedCategory} Division` : 'Assigned Department'))
    };

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
          activeBacklog,
          resolutionRate,
          deletedCount,
          misinformationCount,
          duplicateCount,
          avgTurnaroundHours,
          avgTurnaroundDisplay
        },
        categoryStats,
        departmentStats,
        wardStats,
        recentComplaints,
        authorityScope
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

    const deptOfficerMap = await getCanonicalDeptOfficerMap();
    const formattedComplaints = complaints.map(c => {
      const obj = c.toObject ? c.toObject() : { ...c };
      return resolveAssignedOfficer(obj, deptOfficerMap);
    });

    res.json({
      success: true,
      count: formattedComplaints.length,
      total,
      page: cleanPage,
      pages: Math.ceil(total / cleanLimit),
      complaints: formattedComplaints
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get real authority officers mapped to their departments
// @route GET /api/authority/officers
const getDepartmentOfficers = async (req, res, next) => {
  try {
    // Only fetch subordinate departmental officers (exclude Central Commissioner 'authority_admin')
    const officers = await User.find({
      role: { $in: ['authority_category', 'authority'] }
    }).select('name email role department designation assignedCategory').lean();

    // Deduplicate by user account ID first
    const seenUserIds = new Set();
    const uniqueOfficers = [];
    for (const o of officers) {
      const idStr = o._id.toString();
      if (!seenUserIds.has(idStr)) {
        seenUserIds.add(idStr);
        uniqueOfficers.push(o);
      }
    }

    // Ensure 1 officer per department:
    // If a department has an 'authority_category' officer, prefer it as canonical.
    // Otherwise, use the generic 'authority' officer for that department.
    const deptOfficerMap = new Map();
    for (const o of uniqueOfficers) {
      if (!o.department) continue;
      if (!deptOfficerMap.has(o.department)) {
        deptOfficerMap.set(o.department, o);
      } else {
        const existing = deptOfficerMap.get(o.department);
        if (existing.role !== 'authority_category' && o.role === 'authority_category') {
          deptOfficerMap.set(o.department, o);
        }
      }
    }

    const canonicalOfficers = Array.from(deptOfficerMap.values());

    res.json({
      success: true,
      officers: canonicalOfficers.map(o => ({
        id: o._id,
        name: o.name,
        role: o.role,
        department: o.department,
        designation: o.designation || '',
        assignedCategory: o.assignedCategory || ''
      }))
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getDeletedComplaints,
  getDepartmentOfficers,
  getAuthorityComplaintScope,
  categoryDepartmentMap,
  formatTurnaroundTime
};