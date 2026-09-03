const Counter = require('../models/Counter');

/**
 * Generates an atomic sequential reference ID in format: CRP-YYYY-XXXXX
 * e.g. CRP-2026-00101
 */
async function generateReferenceId() {
  const currentYear = new Date().getFullYear();
  const counterId = `complaints_${currentYear}`;

  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const paddedSeq = String(counter.seq).padStart(5, '0');
  return `CRP-${currentYear}-${paddedSeq}`;
}

module.exports = { generateReferenceId };