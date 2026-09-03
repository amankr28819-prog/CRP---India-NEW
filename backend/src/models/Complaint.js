const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
    required: true
  },
  changedBy: {
    type: String,
    default: 'System / Citizen'
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
      phone: { type: String, trim: true, default: '' },
      email: { type: String, trim: true, default: '' },
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
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    images: [
      {
        type: String
      }
    ],
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
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
    remarks: [
      {
        text: String,
        author: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    statusHistory: [statusHistorySchema],
    agreedToTerms: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);