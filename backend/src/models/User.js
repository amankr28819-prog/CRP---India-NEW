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
      minlength: [6, 'Password must be at least 6 characters'],
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