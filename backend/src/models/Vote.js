const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true
    },
    voteType: {
      type: String,
      enum: ['upvote', 'downvote'],
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Enforce one vote per (citizen, complaint) at the database level
voteSchema.index({ citizen: 1, complaint: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
