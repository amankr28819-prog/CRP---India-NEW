const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Duplicate', 'Misinformation'],
    required: true
  },
  previousStatus: {
    type: String,
    default: ''
  },
  changedBy: {
    type: String,
    default: 'System / Citizen'
  },
  department: {
    type: String,
    default: ''
  },
  remark: {
    type: String,
    default: 'Complaint submitted to civic authority portal.'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const authorityMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true,
    trim: true
  },
  senderRole: {
    type: String,
    required: true,
    trim: true
  },
  senderDesignation: {
    type: String,
    trim: true,
    default: ''
  },
  senderDepartment: {
    type: String,
    trim: true,
    default: ''
  },
  recipientDepartment: {
    type: String,
    trim: true,
    default: ''
  },
  message: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const complaintSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    citizen: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Roads & Potholes',
        'Garbage & Sanitation',
        'Streetlights',
        'Water Supply',
        'Drainage',
        'Public Spaces',
        'Other Issues'
      ]
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location or landmark is required'],
      trim: true
    },
    ward: {
      type: String,
      required: [true, 'Ward number or name is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    latitude: {
      type: Number,
      required: [true, 'Valid GPS Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Valid GPS Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    images: [
      {
        type: String
      }
    ],
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Duplicate', 'Misinformation'],
      default: 'Submitted',
      index: true
    },
    assignedDepartment: {
      type: String,
      trim: true,
      default: 'Public Grievance Cell'
    },
    assignedOfficer: {
      type: String,
      trim: true,
      default: 'Unassigned'
    },
    assignmentInstruction: {
      type: String,
      trim: true,
      default: ''
    },
    remarks: [
      {
        text: String,
        author: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    statusHistory: [statusHistorySchema],
    authorityMessages: [authorityMessageSchema],
    resolutionPhoto: {
      type: String,
      default: ''
    },
    resolutionNote: {
      type: String,
      trim: true,
      default: ''
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolvedBy: {
      type: String,
      trim: true,
      default: ''
    },
    deletedByCitizen: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    },
    agreedToTerms: {
      type: Boolean,
      default: false
    },
    upvotesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    downvotesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    netScore: {
      type: Number,
      default: 0,
      index: true
    },
    flagStatus: {
      type: String,
      enum: ['none', 'misinformation', 'duplicate'],
      default: 'none',
      index: true
    },
    flagDetails: {
      flagType: { type: String, enum: ['misinformation', 'duplicate', null], default: null },
      flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      flaggedByName: { type: String, default: '' },
      flaggedAt: { type: Date, default: null },
      explanation: { type: String, default: '' }
    },
    flagHistory: [
      {
        flagStatus: { type: String, default: 'none' },
        flagType: { type: String, default: null },
        changedBy: { type: String, default: 'System' },
        changedByName: { type: String, default: '' },
        explanation: { type: String, default: '' },
        date: { type: Date, default: Date.now },
        autoRestored: { type: Boolean, default: false }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);