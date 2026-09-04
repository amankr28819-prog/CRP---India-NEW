const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
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

  const isAuthority = reqUser && reqUser.role === 'authority';
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

    res.json({
      success: true,
      complaint: maskCitizenPii(complaint, req.user)
    });
  } catch (err) {
    next(err);
  }
};

// @desc List complaints with filters, search, pagination
// @route GET /api/complaints
const getComplaints = async (req, res, next) => {
  try {
    const { status, category, ward, search, page = 1, limit = 20, myReports, assignedOfficer, assignedOnly } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All' && categoryDepartmentMap[category]) {
      query.category = category;
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

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(cleanLimit);

    res.json({
      success: true,
      count: complaints.length,
      total,
      page: cleanPage,
      pages: Math.ceil(total / cleanLimit),
      complaints: complaints.map(c => maskCitizenPii(c, req.user))
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
      ]
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

module.exports = {
  createComplaint,
  getComplaintByRefId,
  getComplaints,
  getMyComplaints,
  updateComplaintStatus,
  assignComplaint
};