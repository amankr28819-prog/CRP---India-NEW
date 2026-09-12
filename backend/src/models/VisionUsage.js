const mongoose = require('mongoose');

const visionUsageSchema = new mongoose.Schema(
  {
    monthKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('VisionUsage', visionUsageSchema);
