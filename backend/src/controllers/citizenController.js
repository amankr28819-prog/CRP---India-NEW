const User = require('../models/User');
const Complaint = require('../models/Complaint');

// @desc Search citizens by name and/or constituency (Public directory)
// @route GET /api/citizens/search
// @access Public or Authenticated
const searchCitizens = async (req, res, next) => {
  try {
    const { q, constituency } = req.query;

    const query = { role: 'citizen' };

    if (q && typeof q === 'string' && q.trim()) {
      query.name = { $regex: q.trim(), $options: 'i' };
    }

    if (constituency && typeof constituency === 'string' && constituency.trim()) {
      query.constituency = { $regex: constituency.trim(), $options: 'i' };
    }

    // Select strictly non-confidential public fields. Never select voterId, email, phone, password, tokens
    const citizens = await User.find(query)
      .select('_id name constituency avatar karma warningCount suspensionCount createdAt')
      .limit(50)
      .lean();

    // Enrich with complaint metrics
    const results = await Promise.all(
      citizens.map(async (c) => {
        const totalComplaints = await Complaint.countDocuments({
          'citizen.userId': c._id,
          deletedByCitizen: false
        });

        const misinformationCount = await Complaint.countDocuments({
          'citizen.userId': c._id,
          flagStatus: 'misinformation',
          deletedByCitizen: false
        });

        const duplicateCount = await Complaint.countDocuments({
          'citizen.userId': c._id,
          flagStatus: 'duplicate',
          deletedByCitizen: false
        });

        return {
          _id: c._id,
          name: c.name,
          constituency: c.constituency || 'Central Parliamentary Constituency',
          avatar: c.avatar || '',
          karma: c.karma || 0,
          totalComplaints,
          misinformationCount,
          duplicateCount,
          warningCount: c.warningCount || 0,
          suspensionCount: c.suspensionCount || 0,
          joinedAt: c.createdAt
        };
      })
    );

    res.json({
      success: true,
      count: results.length,
      citizens: results
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get public citizen accountability profile
// @route GET /api/citizens/:id/public-profile
// @access Public or Authenticated
const getPublicCitizenProfile = async (req, res, next) => {
  try {
    const citizen = await User.findOne({
      _id: req.params.id,
      role: 'citizen'
    }).select('_id name constituency avatar karma warningCount warnings suspensionCount isSuspended suspendedUntil createdAt');

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: 'Citizen profile not found.'
      });
    }

    // Recalculate accurate complaint statistics
    const totalComplaints = await Complaint.countDocuments({
      'citizen.userId': citizen._id,
      deletedByCitizen: false
    });

    const misinformationCount = await Complaint.countDocuments({
      'citizen.userId': citizen._id,
      flagStatus: 'misinformation',
      deletedByCitizen: false
    });

    const duplicateCount = await Complaint.countDocuments({
      'citizen.userId': citizen._id,
      flagStatus: 'duplicate',
      deletedByCitizen: false
    });

    // Public complaints list (excluding confidential citizen contact info)
    const publicComplaints = await Complaint.find({
      'citizen.userId': citizen._id,
      deletedByCitizen: false
    })
      .select('referenceId title category status createdAt upvotesCount downvotesCount netScore flagStatus flagDetails location ward city')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      profile: {
        _id: citizen._id,
        name: citizen.name, // Official name verified via Voter ID
        constituency: citizen.constituency || 'Central Parliamentary Constituency',
        avatar: citizen.avatar || '',
        karma: citizen.karma || 0,
        totalComplaints,
        misinformationCount,
        duplicateCount,
        warningCount: citizen.warningCount || 0,
        suspensionCount: citizen.suspensionCount || 0,
        isSuspended: citizen.isSuspended && citizen.suspendedUntil && new Date(citizen.suspendedUntil) > new Date(),
        suspendedUntil: citizen.suspendedUntil,
        joinedAt: citizen.createdAt,
        complaints: publicComplaints
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  searchCitizens,
  getPublicCitizenProfile
};
