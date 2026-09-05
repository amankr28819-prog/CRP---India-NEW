const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    voterId: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    role: {
      type: String,
      enum: ['citizen', 'authority', 'authority_admin', 'authority_category'],
      default: 'citizen'
    },
    assignedCategory: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      trim: true,
      default: ''
    },
    designation: {
      type: String,
      trim: true,
      default: ''
    },
    agreedToTerms: {
      type: Boolean,
      default: false
    },
    avatar: {
      type: String,
      default: ''
    },
    constituency: {
      type: String,
      trim: true,
      default: 'Central Parliamentary Constituency'
    },
    karma: {
      type: Number,
      default: 0
    },
    warningCount: {
      type: Number,
      default: 0
    },
    warnings: [
      {
        warningNumber: { type: Number, required: true },
        type: { type: String, enum: ['misinformation', 'duplicate', 'administrative'], required: true },
        reason: { type: String, required: true },
        triggeringComplaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    flaggedComplaintsTracked: {
      misinformationComplaintIds: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' }
      ],
      duplicateComplaintIds: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' }
      ]
    },
    suspensionCount: {
      type: Number,
      default: 0
    },
    isSuspended: {
      type: Boolean,
      default: false
    },
    suspendedUntil: {
      type: Date,
      default: null
    },
    suspensionHistory: [
      {
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date, required: true },
        reason: { type: String, required: true },
        triggeringWarningCount: { type: Number, default: 3 },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    settings: {
      notifications: {
        emailUpdates: { type: Boolean, default: true },
        complaintStatus: { type: Boolean, default: true }
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'light'
      },
      accessibility: {
        reducedMotion: { type: Boolean, default: false },
        highContrast: { type: Boolean, default: false }
      }
    }
  },
  {
    timestamps: true
  }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // If already a valid bcrypt hash, bypass re-hashing
  if (this.password && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(this.password)) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password helper
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);