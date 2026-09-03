const Complaint = require('../models/Complaint');
const { generateReferenceId } = require('../utils/referenceGenerator');

const categoryDepartmentMap = {
  'Roads & Potholes': 'Public Works Department (Roads)',
  'Garbage & Sanitation': 'Solid Waste & Sanitation Department',
  'Streetlights': 'Municipal Electrical & Lighting Division',
  'Water Supply': 'Water Supply & Jal Board',
  'Drainage': 'Stormwater Drainage & Sewerage Board',
  'Public Spaces': 'Parks & Public Amenities Directorate',
  'Other Issues': 'Central Civic Redressal Cell'
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

    if (!category || !title || !description || !location || !ward || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields: category, title, description, location, ward, and city.'
      });
    }

    const name = citizenName || req.user.name;
    const phone = citizenPhone || req.user.phone || '';
    const email = citizenEmail || req.user.email || '';
    const userId = req.user._id;

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
      location,
      ward,
      city,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
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
    const cleanRef = referenceId.trim();

    // Query either by human reference ID (e.g., CRP-2026-00101) or Mongo ObjectId
    const query = cleanRef.startsWith('CRP-')
      ? { referenceId: { $regex: new RegExp(`^${cleanRef}$`, 'i') } }
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
      complaint
    });
  } catch (err) {
    next(err);
  }
};

// @desc List complaints with filters, search, pagination
// @route GET /api/complaints
const getComplaints = async (req, res, next) => {
  try {
    const { status, category, ward, search, page = 1, limit = 20, myReports } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (ward && ward !== 'All') {
      query.ward = ward;
    }

    if (search) {
      query.$or = [
        { referenceId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter to user's complaints if requested and authenticated
    if (myReports === 'true' && req.user) {
      query['citizen.userId'] = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: complaints.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      complaints
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
    const { status, remark } = req.body;

    const allowedStatuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    const officerName = req.user ? `${req.user.name} (${req.user.designation || 'Authority'})` : 'Municipal Authority';
    const auditRemark = remark || `Status updated to ${status}.`;

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      changedBy: officerName,
      remark: auditRemark,
      timestamp: new Date()
    });

    if (remark) {
      complaint.remarks.push({
        text: remark,
        author: officerName,
        createdAt: new Date()
      });
    }

    await complaint.save();

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

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    if (assignedDepartment) complaint.assignedDepartment = assignedDepartment;
    if (assignedOfficer) complaint.assignedOfficer = assignedOfficer;

    // Transition status to Assigned if it was Submitted or Under Review
    if (complaint.status === 'Submitted' || complaint.status === 'Under Review') {
      complaint.status = 'Assigned';
    }

    const officerName = req.user ? `${req.user.name} (${req.user.designation || 'Authority'})` : 'Municipal Authority';
    const assignRemark = remark || `Assigned to ${complaint.assignedDepartment} - Officer: ${complaint.assignedOfficer}.`;

    complaint.statusHistory.push({
      status: complaint.status,
      changedBy: officerName,
      remark: assignRemark,
      timestamp: new Date()
    });

    if (remark) {
      complaint.remarks.push({
        text: remark,
        author: officerName,
        createdAt: new Date()
      });
    }

    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint assignment updated successfully.',
      complaint
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createComplaint,
  getComplaintByRefId,
  getComplaints,
  updateComplaintStatus,
  assignComplaint
};