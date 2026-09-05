const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Vote = require('../models/Vote');
const { generateReferenceId } = require('../utils/referenceGenerator');
const { escapeRegex } = require('../middleware/sanitize');

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
 * Data Minimization / Privacy Masking
 * Masks citizen contact details for public and unauthorized requests
 */
const maskCitizenPii = (complaint, reqUser) => {
  if (!complaint) return null;
  const compObj = complaint.toObject ? complaint.toObject() : { ...complaint };

  const isAuthority = reqUser && ['authority', 'authority_admin', 'authority_category'].includes(reqUser.role);
  const isOwner = reqUser && compObj.citizen?.userId && reqUser._id && compObj.citizen.userId.toString() === reqUser._id.toString();

  if (!isAuthority && !isOwner && compObj.citizen) {
    const rawPhone = compObj.citizen.phone || '';
    const rawEmail = compObj.citizen.email || '';

    let maskedPhone = 'Confidential';
    if (rawPhone.length > 4) {
      maskedPhone = '*'.repeat(Math.max(0, rawPhone.length - 4)) + rawPhone.slice(-4);
    }

    let maskedEmail = 'Confidential';
    if (rawEmail.includes('@')) {
      const [local, domain] = rawEmail.split('@');
      maskedEmail = (local[0] || '') + '***@' + (domain || '');
    }

    compObj.citizen = {
      name: compObj.citizen.name || 'Citizen',
      phone: maskedPhone,
      email: maskedEmail
    };
  }

  return compObj;
};

// @desc Create a new civic complaint
// @route POST /api/complaints
const createComplaint = async (req, res, next) => {
  try {
    const {
      category,
      title,
      description,
      location,
      ward,
      city,
      latitude,
      longitude,
      citizenName,
      citizenPhone,
      citizenEmail
    } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in or register to report a civic issue.'
      });
    }

    // Disciplinary Suspension Check: Suspended citizens cannot submit complaints
    if (req.user.isSuspended) {
      if (req.user.suspendedUntil && new Date(req.user.suspendedUntil) > new Date()) {
        return res.status(403).json({
          success: false,
          message: `Your account is suspended until ${new Date(req.user.suspendedUntil).toLocaleDateString()} due to receiving 3 warnings. You cannot submit new complaints while suspended.`
        });
      } else {
        req.user.isSuspended = false;
        req.user.suspendedUntil = null;
        await req.user.save();
      }
    }

    const agreed = req.body.agreedToTerms === true || req.body.agreedToTerms === 'true';
    if (!agreed) {
      return res.status(400).json({
        success: false,
        message: 'Please agree to the Privacy Policy and Terms of Service before submitting your complaint.'
      });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Location is required. Please provide the location of the issue.'
      });
    }

    // Validate GPS Coordinates
    if (latitude === undefined || latitude === null || latitude === '' ||
        longitude === undefined || longitude === null || longitude === '') {
      return res.status(400).json({
        success: false,
        message: 'GPS location is required. Please enter your coordinates or use your current device GPS.'
      });
    }

    const numLat = Number(latitude);
    const numLng = Number(longitude);

    if (isNaN(numLat) || numLat < -90 || numLat > 90) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GPS Latitude. Latitude must be a valid number between -90 and 90.'
      });
    }

    if (isNaN(numLng) || numLng < -180 || numLng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GPS Longitude. Longitude must be a valid number between -180 and 180.'
      });
    }

    if (!category || !title || !description || !ward || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields: category, title, description, location, ward, and city.'
      });
    }

    if (!categoryDepartmentMap[category]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint category selected.'
      });
    }

    if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: 'Complaint title must be between 3 and 150 characters.'
      });
    }

    if (typeof description !== 'string' || description.trim().length < 10 || description.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Complaint description must be between 10 and 2000 characters.'
      });
    }

    if (
      typeof location !== 'string' || location.trim().length > 200 ||
      typeof ward !== 'string' || ward.trim().length > 100 ||
      typeof city !== 'string' || city.trim().length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Location, ward, and city must be valid text within length limits.'
      });
    }

    // Retrieve verified contact info strictly from the authenticated user account (Security: do NOT trust client body)
    const name = (req.user.name || '').trim();
    const phone = (req.user.phone || '').trim();
    const email = (req.user.email || '').trim();
    const userId = req.user._id;

    if (!name || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: 'Your registered account profile is missing required contact details (Full Name, Phone Number, or Email). Please update your account profile before submitting a complaint.'
      });
    }

    // Process uploaded images
    const imagePaths = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        imagePaths.push(`/uploads/${file.filename}`);
      });
    } else if (req.file) {
      imagePaths.push(`/uploads/${req.file.filename}`);
    }

    const referenceId = await generateReferenceId();
    const assignedDepartment = categoryDepartmentMap[category] || 'Central Civic Redressal Cell';

    const complaint = await Complaint.create({
      referenceId,
      citizen: {
        name,
        phone,
        email,
        userId
      },
      category,
      title,
      description,
      location: location.trim(),
      ward,
      city,
      latitude: numLat,
      longitude: numLng,
      images: imagePaths,
      status: 'Submitted',
      assignedDepartment,
      assignedOfficer: 'Pending Allocation',
      statusHistory: [
        {
          status: 'Submitted',
          changedBy: name,
          remark: 'Complaint registered successfully on the civic portal.',
          timestamp: new Date()
        }
      ],
      agreedToTerms: true
    });

    // Create confirmation notification for the citizen
    try {
      await Notification.create({
        recipient: userId,
        title: 'Complaint Registered',
        message: `Your grievance regarding "${complaint.title}" has been registered successfully with Reference ID ${complaint.referenceId}.`,
        type: 'submission',
        complaintId: complaint._id,
        referenceId: complaint.referenceId
      });
    } catch (notifErr) {
      console.error('[NOTIFICATION] Failed to create submission notification:', notifErr);
    }

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      referenceId: complaint.referenceId,
      complaint
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get single complaint by referenceId or mongo ID
// @route GET /api/complaints/:referenceId
const getComplaintByRefId = async (req, res, next) => {
  try {
    const { referenceId } = req.params;
    if (!referenceId || typeof referenceId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Reference ID is required.'
      });
    }

    const cleanRef = referenceId.trim();
    if (cleanRef.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Reference ID format.'
      });
    }

    const escapedRef = escapeRegex(cleanRef);

    // Query either by human reference ID (e.g., CRP-2026-00101) or Mongo ObjectId
    const query = cleanRef.startsWith('CRP-')
      ? { referenceId: { $regex: new RegExp(`^${escapedRef}$`, 'i') } }
      : { $or: [{ referenceId: cleanRef }, { _id: cleanRef.match(/^[0-9a-fA-F]{24}$/) ? cleanRef : null }] };

    const complaint = await Complaint.findOne(query);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found. Please check your reference ID.'
      });
    }

    // Security: If logged-in user is a category-wise authority, strictly verify complaint category
    if (req.user && req.user.role === 'authority_category') {
      if (complaint.category !== req.user.assignedCategory) {
        return res.status(403).json({
          success: false,
          message: `Access denied: You do not have authorization to view complaints outside your assigned category (${req.user.assignedCategory}).`
        });
      }
    }

    const masked = maskCitizenPii(complaint, req.user);
    if (req.user && req.user.role === 'citizen') {
      const existingVote = await Vote.findOne({ citizen: req.user._id, complaint: complaint._id });
      masked.userVote = existingVote ? existingVote.voteType : null;
    } else {
      masked.userVote = null;
    }

    res.json({
      success: true,
      complaint: masked
    });
  } catch (err) {
    next(err);
  }
};

// @desc List complaints with filters, search, pagination
// @route GET /api/complaints
const getComplaints = async (req, res, next) => {
  try {
    const { status, category, ward, search, page = 1, limit = 20, myReports, assignedOfficer, assignedOnly, sort, flagFilter } = req.query;
    const query = {
      deletedByCitizen: { $ne: true }
    };

    // Flag filtering (default: active complaints pool)
    if (flagFilter === 'misinformation') {
      query.flagStatus = 'misinformation';
    } else if (flagFilter === 'duplicate') {
      query.flagStatus = 'duplicate';
    } else if (flagFilter === 'all') {
      // Don't constrain flagStatus
    } else {
      query.flagStatus = 'none';
    }

    // Status filtering: 'Total Complaints' or 'All' queries all statuses
    if (status && status !== 'All' && status !== 'Total Complaints') {
      query.status = status;
    }

    if (category && category !== 'All' && categoryDepartmentMap[category]) {
      query.category = category;
    }

    // Security: If logged-in user is a category-wise authority, strictly enforce category filter
    if (req.user && req.user.role === 'authority_category') {
      query.category = req.user.assignedCategory;
    }

    if (ward && ward !== 'All' && typeof ward === 'string' && ward.length <= 100) {
      query.ward = ward.trim();
    }

    if (assignedOnly === 'true') {
      query.assignedOfficer = { $ne: 'Unassigned' };
    }

    if (assignedOfficer && assignedOfficer !== 'All' && typeof assignedOfficer === 'string') {
      const cleanOfficer = escapeRegex(assignedOfficer.trim());
      if (cleanOfficer) {
        query.assignedOfficer = { $regex: cleanOfficer, $options: 'i' };
      }
    }

    // Search by Name (Title) or ID (Reference ID) with partial case-insensitive matching
    if (search && typeof search === 'string') {
      const cleanSearch = escapeRegex(search.trim());
      if (cleanSearch) {
        query.$or = [
          { referenceId: { $regex: cleanSearch, $options: 'i' } },
          { title: { $regex: cleanSearch, $options: 'i' } },
          { location: { $regex: cleanSearch, $options: 'i' } },
          { description: { $regex: cleanSearch, $options: 'i' } }
        ];
      }
    }

    // Filter to user's complaints if requested and authenticated
    if (myReports === 'true' && req.user) {
      query['citizen.userId'] = req.user._id;
    }

    const cleanPage = Math.max(1, parseInt(page) || 1);
    const cleanLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (cleanPage - 1) * cleanLimit;

    // Sorting: default is Newest First; votes sort is netScore descending with tiebreaker newest first
    let sortObj = { createdAt: -1 };
    if (sort === 'votes' || sort === 'highest_votes' || sort === 'netScore') {
      sortObj = { netScore: -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sort === 'category_asc') {
      sortObj = { category: 1, createdAt: -1 };
    } else if (sort === 'category_desc') {
      sortObj = { category: -1, createdAt: -1 };
    } else if (sort === 'status') {
      sortObj = { status: 1, createdAt: -1 };
    } else if (sort === 'id') {
      sortObj = { referenceId: 1 };
    } else {
      sortObj = { createdAt: -1 };
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(cleanLimit);

    // Populate active user's vote if authenticated citizen
    let voteMap = new Map();
    if (req.user && req.user.role === 'citizen') {
      const complaintIds = complaints.map(c => c._id);
      const userVotes = await Vote.find({
        citizen: req.user._id,
        complaint: { $in: complaintIds }
      });
      userVotes.forEach(v => voteMap.set(v.complaint.toString(), v.voteType));
    }

    const formattedComplaints = complaints.map(c => {
      const masked = maskCitizenPii(c, req.user);
      masked.userVote = voteMap.get(c._id.toString()) || null;
      return masked;
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

// @desc Get public read-only Citizen dashboard metrics, distributions, and recent complaints
// @route GET /api/complaints/dashboard-stats
const getCitizenDashboardStats = async (req, res, next) => {
  try {
    const baseFilter = { deletedByCitizen: { $ne: true } };
    const activeFilter = { ...baseFilter, flagStatus: 'none' };

    // Change 3: Exclude "Submitted" card. Five parity KPI metrics:
    const total = await Complaint.countDocuments(activeFilter);
    const underReview = await Complaint.countDocuments({ ...activeFilter, status: 'Under Review' });
    const assigned = await Complaint.countDocuments({ ...activeFilter, status: 'Assigned' });
    const inProgress = await Complaint.countDocuments({ ...activeFilter, status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ ...activeFilter, status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ ...activeFilter, status: 'Rejected' });
    const misinformationCount = await Complaint.countDocuments({ ...baseFilter, flagStatus: 'misinformation' });
    const duplicateCount = await Complaint.countDocuments({ ...baseFilter, flagStatus: 'duplicate' });

    // Category breakdown
    const categoryStats = await Complaint.aggregate([
      { $match: activeFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Top active wards
    const wardStats = await Complaint.aggregate([
      { $match: activeFilter },
      { $group: { _id: '$ward', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // Recent 8 complaints (strictly PII-masked for citizen privacy)
    const rawRecent = await Complaint.find(activeFilter)
      .sort({ createdAt: -1 })
      .limit(8);

    let voteMap = new Map();
    if (req.user && req.user.role === 'citizen') {
      const recentIds = rawRecent.map(c => c._id);
      const userVotes = await Vote.find({
        citizen: req.user._id,
        complaint: { $in: recentIds }
      });
      userVotes.forEach(v => voteMap.set(v.complaint.toString(), v.voteType));
    }

    const recentComplaints = rawRecent.map(c => {
      const masked = maskCitizenPii(c, req.user);
      masked.userVote = voteMap.get(c._id.toString()) || null;
      return masked;
    });

    res.json({
      success: true,
      data: {
        stats: {
          total,
          underReview,
          assigned,
          inProgress,
          resolved,
          rejected,
          misinformationCount,
          duplicateCount
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

// @desc Update complaint status (Authority only)
// @route PATCH /api/complaints/:id/status
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remark, resolutionNote } = req.body;

    const allowedStatuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const complaint = mongoose.Types.ObjectId.isValid(id)
      ? await Complaint.findById(id)
      : await Complaint.findOne({ referenceId: id });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    // Security: Category Authority cannot update complaints outside their assigned category
    if (req.user && req.user.role === 'authority_category') {
      if (complaint.category !== req.user.assignedCategory) {
        return res.status(403).json({
          success: false,
          message: `Access denied: You cannot update status of complaints outside your assigned category (${req.user.assignedCategory}).`
        });
      }
    }

    const officerName = req.user ? `${req.user.name} (${req.user.designation || 'Authority'})` : 'Municipal Authority';

    // When status is "Resolved", resolution photo proof is strictly required
    if (status === 'Resolved') {
      if (req.file) {
        complaint.resolutionPhoto = `/uploads/${req.file.filename}`;
      } else if (!complaint.resolutionPhoto) {
        return res.status(400).json({
          success: false,
          message: 'A photo showing proof of resolution is required when marking a complaint as Resolved.'
        });
      }

      complaint.resolutionNote = (resolutionNote && resolutionNote.trim()) || (remark && remark.trim()) || complaint.resolutionNote || 'Civic defect resolved and verified by municipal authority.';
      complaint.resolvedAt = new Date();
      complaint.resolvedBy = officerName;
    }

    const auditRemark = (status === 'Resolved' && complaint.resolutionNote)
      ? `Resolved: ${complaint.resolutionNote}`
      : (remark || `Status updated to ${status}.`);

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      changedBy: officerName,
      remark: auditRemark,
      timestamp: new Date()
    });

    if (remark || (status === 'Resolved' && complaint.resolutionNote)) {
      complaint.remarks.push({
        text: remark || complaint.resolutionNote,
        author: officerName,
        createdAt: new Date()
      });
    }

    await complaint.save();

    // Notify citizen of status update / resolution
    if (complaint.citizen && complaint.citizen.userId) {
      try {
        const isResolved = status === 'Resolved';
        await Notification.create({
          recipient: complaint.citizen.userId,
          title: isResolved ? 'Complaint Resolved' : `Status Updated: ${status}`,
          message: isResolved
            ? `Your grievance ${complaint.referenceId} has been marked as Resolved by municipal authorities.`
            : `Status of grievance ${complaint.referenceId} has been updated to "${status}". Remark: ${auditRemark}`,
          type: isResolved ? 'resolution' : 'status_change',
          complaintId: complaint._id,
          referenceId: complaint.referenceId
        });
      } catch (notifErr) {
        console.error('[NOTIFICATION] Failed to create status notification:', notifErr);
      }
    }

    res.json({
      success: true,
      message: `Complaint status updated to ${status}.`,
      complaint
    });
  } catch (err) {
    next(err);
  }
};

// @desc Assign complaint to department & officer (Authority only)
// @route PATCH /api/complaints/:id/assign
const assignComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedDepartment, assignedOfficer, remark } = req.body;

    if (!id || (typeof id !== 'string') || (!mongoose.Types.ObjectId.isValid(id) && !id.startsWith('CRP-'))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint identifier.'
      });
    }

    const complaint = mongoose.Types.ObjectId.isValid(id)
      ? await Complaint.findById(id)
      : await Complaint.findOne({ referenceId: id });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    // Security: Category Authority cannot assign complaints outside their assigned category
    if (req.user && req.user.role === 'authority_category') {
      if (complaint.category !== req.user.assignedCategory) {
        return res.status(403).json({
          success: false,
          message: `Access denied: You cannot assign complaints outside your assigned category (${req.user.assignedCategory}).`
        });
      }
    }

    if (assignedDepartment && typeof assignedDepartment === 'string') {
      complaint.assignedDepartment = assignedDepartment.trim().slice(0, 150);
    }
    if (assignedOfficer && typeof assignedOfficer === 'string') {
      complaint.assignedOfficer = assignedOfficer.trim().slice(0, 100);
    }

    // Transition status to Assigned if it was Submitted or Under Review
    if (complaint.status === 'Submitted' || complaint.status === 'Under Review') {
      complaint.status = 'Assigned';
    }

    const officerName = req.user ? `${req.user.name} (${req.user.designation || 'Authority'})` : 'Municipal Authority';
    const cleanRemark = (remark && typeof remark === 'string') ? remark.trim().slice(0, 1000) : '';
    const assignRemark = cleanRemark || `Assigned to ${complaint.assignedDepartment} - Officer: ${complaint.assignedOfficer}.`;

    complaint.statusHistory.push({
      status: complaint.status,
      changedBy: officerName,
      remark: assignRemark,
      timestamp: new Date()
    });

    if (cleanRemark) {
      complaint.remarks.push({
        text: cleanRemark,
        author: officerName,
        createdAt: new Date()
      });
    }

    await complaint.save();

    // Notify citizen of department/officer assignment
    if (complaint.citizen && complaint.citizen.userId) {
      try {
        await Notification.create({
          recipient: complaint.citizen.userId,
          title: 'Department Assigned',
          message: `Your grievance ${complaint.referenceId} has been assigned to ${complaint.assignedDepartment} (Officer: ${complaint.assignedOfficer}).`,
          type: 'assignment',
          complaintId: complaint._id,
          referenceId: complaint.referenceId
        });
      } catch (notifErr) {
        console.error('[NOTIFICATION] Failed to create assignment notification:', notifErr);
      }
    }

    res.json({
      success: true,
      message: 'Complaint assignment updated successfully.',
      complaint
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get complaints filed by the logged-in citizen
// @route GET /api/complaints/my
const getMyComplaints = async (req, res, next) => {
  try {
    const { status, search, sort = 'newest' } = req.query;
    const userId = req.user._id;
    const userEmail = (req.user.email || '').toLowerCase();

    const query = {
      $or: [
        { 'citizen.userId': userId },
        { 'citizen.email': userEmail }
      ],
      deletedByCitizen: { $ne: true }
    };

    if (status && status !== 'All' && typeof status === 'string' && status.length <= 50) {
      query.status = status;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const clean = escapeRegex(search.trim().slice(0, 100));
      if (clean) {
        query.$and = [
          {
            $or: [
              { referenceId: { $regex: clean, $options: 'i' } },
              { title: { $regex: clean, $options: 'i' } },
              { category: { $regex: clean, $options: 'i' } },
              { location: { $regex: clean, $options: 'i' } },
              { ward: { $regex: clean, $options: 'i' } },
              { city: { $regex: clean, $options: 'i' } }
            ]
          }
        ];
      }
    }

    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const complaints = await Complaint.find(query).sort(sortOption).limit(200);

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (err) {
    next(err);
  }
};

// @desc Soft delete a complaint by citizen owner
// @route DELETE /api/complaints/:id
const deleteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid complaint identifier.'
      });
    }

    // Role check: Only citizens can delete their complaints. Authorities cannot delete complaints.
    if (!req.user || req.user.role !== 'citizen') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Municipal Authorities cannot delete complaints. Only the citizen who submitted the complaint can delete it.'
      });
    }

    const complaint = mongoose.Types.ObjectId.isValid(id)
      ? await Complaint.findById(id)
      : await Complaint.findOne({ referenceId: id });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    // Ownership check: Only the citizen who created this complaint can delete it
    const ownerId = complaint.citizen?.userId?._id || complaint.citizen?.userId;
    const authUserId = req.user._id || req.user.id;
    const isOwner = Boolean(ownerId && authUserId && (ownerId.toString() === authUserId.toString()));
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only delete complaints submitted by your own account.'
      });
    }

    if (complaint.deletedByCitizen) {
      return res.status(400).json({
        success: false,
        message: 'This complaint has already been deleted.'
      });
    }

    // Soft delete: flag as deleted without removing the database record
    complaint.deletedByCitizen = true;
    complaint.deletedAt = new Date();

    // Preserve status and audit trail
    complaint.statusHistory.push({
      status: complaint.status,
      changedBy: req.user.name || 'Citizen',
      remark: 'Complaint deleted by citizen.',
      timestamp: new Date()
    });

    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint deleted successfully.',
      referenceId: complaint.referenceId
    });
  } catch (err) {
    next(err);
  }
};

// @desc Upvote or downvote on a complaint (Citizens only)
// @route POST /api/complaints/:id/vote
const voteOnComplaint = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'citizen') {
      return res.status(403).json({
        success: false,
        message: 'Only citizens are permitted to vote on complaints. Municipal authorities cannot cast votes.'
      });
    }

    if (req.user.isSuspended) {
      if (req.user.suspendedUntil && new Date(req.user.suspendedUntil) > new Date()) {
        return res.status(403).json({
          success: false,
          message: `Your account is suspended until ${new Date(req.user.suspendedUntil).toLocaleDateString()} due to receiving 3 warnings. You cannot vote while suspended.`
        });
      } else {
        req.user.isSuspended = false;
        req.user.suspendedUntil = null;
        await req.user.save();
      }
    }

    const { id } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid voteType. Must be "upvote" or "downvote".'
      });
    }

    const complaint = mongoose.Types.ObjectId.isValid(id)
      ? await Complaint.findById(id)
      : await Complaint.findOne({ referenceId: id });

    if (!complaint || complaint.deletedByCitizen) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    // Check existing vote
    let existingVote = await Vote.findOne({
      citizen: req.user._id,
      complaint: complaint._id
    });

    let activeUserVote = null;

    if (existingVote && existingVote.voteType === voteType) {
      // Toggle off / remove vote
      await Vote.deleteOne({ _id: existingVote._id });
      activeUserVote = null;
    } else if (existingVote) {
      // Change vote
      existingVote.voteType = voteType;
      await existingVote.save();
      activeUserVote = voteType;
    } else {
      // Create new vote
      existingVote = await Vote.create({
        citizen: req.user._id,
        complaint: complaint._id,
        voteType
      });
      activeUserVote = voteType;
    }

    // Recalculate upvotes, downvotes, netScore from database
    const upvotesCount = await Vote.countDocuments({
      complaint: complaint._id,
      voteType: 'upvote'
    });
    const downvotesCount = await Vote.countDocuments({
      complaint: complaint._id,
      voteType: 'downvote'
    });
    const netScore = upvotesCount - downvotesCount;

    complaint.upvotesCount = upvotesCount;
    complaint.downvotesCount = downvotesCount;
    complaint.netScore = netScore;

    // Change 8B & Change 12: 500 Unique Upvote Auto-Restoration
    let autoRestored = false;
    if (['misinformation', 'duplicate'].includes(complaint.flagStatus) && upvotesCount >= 500) {
      const priorFlag = complaint.flagStatus;
      complaint.flagStatus = 'none';
      complaint.flagHistory.push({
        flagStatus: 'none',
        flagType: null,
        changedBy: 'Citizen Community Consensus',
        changedByName: 'System Auto-Restoration',
        explanation: `Automatically restored after reaching ${upvotesCount} unique Citizen upvotes (threshold: 500). Prior flag: ${priorFlag}.`,
        date: new Date(),
        autoRestored: true
      });
      complaint.flagDetails = {
        flagType: null,
        flaggedBy: null,
        flaggedByName: '',
        flaggedAt: null,
        explanation: ''
      };
      autoRestored = true;
    }

    await complaint.save();

    // Change 13: Recalculate complaint author's karma (totalUpvotesReceived - totalDownvotesReceived)
    if (complaint.citizen?.userId) {
      const authorId = complaint.citizen.userId;
      const karmaAgg = await Complaint.aggregate([
        { $match: { 'citizen.userId': authorId, deletedByCitizen: false } },
        { $group: { _id: null, totalUp: { $sum: '$upvotesCount' }, totalDown: { $sum: '$downvotesCount' } } }
      ]);
      const newKarma = karmaAgg.length > 0 ? (karmaAgg[0].totalUp - karmaAgg[0].totalDown) : 0;
      await User.findByIdAndUpdate(authorId, { karma: newKarma });
    }

    res.json({
      success: true,
      message: activeUserVote ? `Complaint ${voteType}d successfully.` : 'Vote removed successfully.',
      upvotesCount,
      downvotesCount,
      netScore,
      userVote: activeUserVote,
      autoRestored
    });
  } catch (err) {
    next(err);
  }
};

// @desc Flag complaint as Misinformation (Authority only)
// @route POST /api/complaints/:id/flag-misinformation
const flagComplaintAsMisinformation = async (req, res, next) => {
  try {
    const authorityRoles = ['authority', 'authority_admin', 'authority_category'];
    if (!req.user || !authorityRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only municipal authorities can flag complaints.'
      });
    }

    const { id } = req.params;
    const { explanation } = req.body;

    if (!explanation || typeof explanation !== 'string' || !explanation.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A detailed explanation is required when flagging a complaint as Misinformation.'
      });
    }

    const complaint = mongoose.Types.ObjectId.isValid(id)
      ? await Complaint.findById(id)
      : await Complaint.findOne({ referenceId: id });

    if (!complaint || complaint.deletedByCitizen) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    if (req.user.role === 'authority_category' && complaint.category !== req.user.assignedCategory) {
      return res.status(403).json({
        success: false,
        message: `Access denied: You are only authorized to manage complaints in ${req.user.assignedCategory}.`
      });
    }

    complaint.flagStatus = 'misinformation';
    complaint.flagDetails = {
      flagType: 'misinformation',
      flaggedBy: req.user._id,
      flaggedByName: req.user.name,
      flaggedAt: new Date(),
      explanation: explanation.trim()
    };
    complaint.flagHistory.push({
      flagStatus: 'misinformation',
      flagType: 'misinformation',
      changedBy: 'Municipal Authority',
      changedByName: req.user.name,
      explanation: explanation.trim(),
      date: new Date()
    });

    await complaint.save();

    // Change 11 & 12: Accountable Warnings & Suspension for citizen
    if (complaint.citizen?.userId) {
      const author = await User.findById(complaint.citizen.userId);
      if (author) {
        if (!author.flaggedComplaintsTracked) {
          author.flaggedComplaintsTracked = {
            misinformationComplaintIds: [],
            duplicateComplaintIds: []
          };
        }
        const alreadyTracked = author.flaggedComplaintsTracked.misinformationComplaintIds.some(
          cId => cId.toString() === complaint._id.toString()
        );
        if (!alreadyTracked) {
          author.flaggedComplaintsTracked.misinformationComplaintIds.push(complaint._id);
          const misinfoCount = author.flaggedComplaintsTracked.misinformationComplaintIds.length;

          // Milestone: exactly 3 misinformation complaints -> 1 warning
          if (misinfoCount % 3 === 0) {
            const nextWarnNum = (author.warningCount || 0) + 1;
            author.warningCount = nextWarnNum;
            author.warnings.push({
              warningNumber: nextWarnNum,
              type: 'misinformation',
              reason: `Disciplinary warning #${nextWarnNum}: Citizen accumulated ${misinfoCount} complaints verified and flagged as Misinformation by municipal authorities.`,
              triggeringComplaintId: complaint._id,
              createdAt: new Date()
            });

            // Milestone: exactly 3 total warnings -> 30-day suspension
            if (author.warningCount >= 3 && !author.isSuspended) {
              author.isSuspended = true;
              author.suspensionCount = (author.suspensionCount || 0) + 1;
              author.suspendedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              author.suspensionHistory.push({
                startDate: new Date(),
                endDate: author.suspendedUntil,
                reason: 'Account automatically suspended for 30 days due to accumulating 3 disciplinary warnings.',
                triggeringWarningCount: author.warningCount,
                createdAt: new Date()
              });
            }
          }
          await author.save();
        }
      }
    }

    res.json({
      success: true,
      message: 'Complaint successfully flagged as Misinformation.',
      complaint: maskCitizenPii(complaint, req.user)
    });
  } catch (err) {
    next(err);
  }
};

// @desc Flag complaint as Duplicate (Authority only)
// @route POST /api/complaints/:id/flag-duplicate
const flagComplaintAsDuplicate = async (req, res, next) => {
  try {
    const authorityRoles = ['authority', 'authority_admin', 'authority_category'];
    if (!req.user || !authorityRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only municipal authorities can flag complaints.'
      });
    }

    const { id } = req.params;
    const { explanation } = req.body;

    if (!explanation || typeof explanation !== 'string' || !explanation.trim()) {
      return res.status(400).json({
        success: false,
        message: 'An explanation is required when flagging a complaint as Duplicate.'
      });
    }

    const complaint = mongoose.Types.ObjectId.isValid(id)
      ? await Complaint.findById(id)
      : await Complaint.findOne({ referenceId: id });

    if (!complaint || complaint.deletedByCitizen) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    if (req.user.role === 'authority_category' && complaint.category !== req.user.assignedCategory) {
      return res.status(403).json({
        success: false,
        message: `Access denied: You are only authorized to manage complaints in ${req.user.assignedCategory}.`
      });
    }

    complaint.flagStatus = 'duplicate';
    complaint.flagDetails = {
      flagType: 'duplicate',
      flaggedBy: req.user._id,
      flaggedByName: req.user.name,
      flaggedAt: new Date(),
      explanation: explanation.trim()
    };
    complaint.flagHistory.push({
      flagStatus: 'duplicate',
      flagType: 'duplicate',
      changedBy: 'Municipal Authority',
      changedByName: req.user.name,
      explanation: explanation.trim(),
      date: new Date()
    });

    await complaint.save();

    // Change 11 & 12: Accountable Warnings & Suspension for citizen
    if (complaint.citizen?.userId) {
      const author = await User.findById(complaint.citizen.userId);
      if (author) {
        if (!author.flaggedComplaintsTracked) {
          author.flaggedComplaintsTracked = {
            misinformationComplaintIds: [],
            duplicateComplaintIds: []
          };
        }
        const alreadyTracked = author.flaggedComplaintsTracked.duplicateComplaintIds.some(
          cId => cId.toString() === complaint._id.toString()
        );
        if (!alreadyTracked) {
          author.flaggedComplaintsTracked.duplicateComplaintIds.push(complaint._id);
          const duplicateCount = author.flaggedComplaintsTracked.duplicateComplaintIds.length;

          // Milestone: exactly 4 duplicate complaints -> 1 warning
          if (duplicateCount % 4 === 0) {
            const nextWarnNum = (author.warningCount || 0) + 1;
            author.warningCount = nextWarnNum;
            author.warnings.push({
              warningNumber: nextWarnNum,
              type: 'duplicate',
              reason: `Disciplinary warning #${nextWarnNum}: Citizen accumulated ${duplicateCount} complaints verified and flagged as Duplicate by municipal authorities.`,
              triggeringComplaintId: complaint._id,
              createdAt: new Date()
            });

            // Milestone: exactly 3 total warnings -> 30-day suspension
            if (author.warningCount >= 3 && !author.isSuspended) {
              author.isSuspended = true;
              author.suspensionCount = (author.suspensionCount || 0) + 1;
              author.suspendedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              author.suspensionHistory.push({
                startDate: new Date(),
                endDate: author.suspendedUntil,
                reason: 'Account automatically suspended for 30 days due to accumulating 3 disciplinary warnings.',
                triggeringWarningCount: author.warningCount,
                createdAt: new Date()
              });
            }
          }
          await author.save();
        }
      }
    }

    res.json({
      success: true,
      message: 'Complaint successfully flagged as Duplicate.',
      complaint: maskCitizenPii(complaint, req.user)
    });
  } catch (err) {
    next(err);
  }
};

// @desc Remove administrative flag and restore complaint to Active pool (Authority only)
// @route POST /api/complaints/:id/remove-flag
const removeComplaintFlag = async (req, res, next) => {
  try {
    const authorityRoles = ['authority', 'authority_admin', 'authority_category'];
    if (!req.user || !authorityRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only municipal authorities can restore flagged complaints.'
      });
    }

    const { id } = req.params;
    const { explanation } = req.body;

    const complaint = mongoose.Types.ObjectId.isValid(id)
      ? await Complaint.findById(id)
      : await Complaint.findOne({ referenceId: id });

    if (!complaint || complaint.deletedByCitizen) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    const priorFlag = complaint.flagStatus;
    complaint.flagStatus = 'none';
    complaint.flagDetails = {
      flagType: null,
      flaggedBy: null,
      flaggedByName: '',
      flaggedAt: null,
      explanation: ''
    };
    complaint.flagHistory.push({
      flagStatus: 'none',
      flagType: null,
      changedBy: 'Municipal Authority',
      changedByName: req.user.name,
      explanation: explanation || `Administrative flag (${priorFlag}) cleared by municipal authority. Complaint returned to Active pool.`,
      date: new Date()
    });

    await complaint.save();

    res.json({
      success: true,
      message: 'Administrative flag removed. Complaint restored to active pool.',
      complaint: maskCitizenPii(complaint, req.user)
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createComplaint,
  getComplaintByRefId,
  getComplaints,
  getCitizenDashboardStats,
  getMyComplaints,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint,
  voteOnComplaint,
  flagComplaintAsMisinformation,
  flagComplaintAsDuplicate,
  removeComplaintFlag
};