const vision = require('@google-cloud/vision');
const VisionUsage = require('../models/VisionUsage');

// SafeSearch Likelihood Ranking (0 to 5)
const LIKELIHOOD_RANKS = {
  UNKNOWN: 0,
  VERY_UNLIKELY: 1,
  UNLIKELY: 2,
  POSSIBLE: 3,
  LIKELY: 4,
  VERY_LIKELY: 5
};

const DEFAULT_MONTHLY_LIMIT = 999;

/**
 * Checks whether Google Cloud Vision SafeSearch moderation is explicitly enabled.
 * Defaults to false if missing, empty, or not 'true'.
 */
const isVisionSafetyEnabled = () => {
  return String(process.env.VISION_SAFETY_ENABLED || '').trim().toLowerCase() === 'true';
};

/**
 * Returns configured monthly hard limit for SafeSearch checks (defaults to 999).
 */
const getMonthlyLimit = () => {
  if (process.env.VISION_MONTHLY_LIMIT !== undefined && process.env.VISION_MONTHLY_LIMIT !== '') {
    const parsed = parseInt(process.env.VISION_MONTHLY_LIMIT, 10);
    if (!isNaN(parsed) && parsed >= 0) return parsed;
  }
  return DEFAULT_MONTHLY_LIMIT;
};

/**
 * Formats a Date object into a UTC calendar month key: YYYY-MM
 */
const getUtcMonthKey = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Retrieves current usage count for the given or current UTC month.
 */
const getCurrentUsage = async (monthKey = getUtcMonthKey()) => {
  const record = await VisionUsage.findOne({ monthKey });
  return record ? record.count : 0;
};

/**
 * Atomically reserves 1 SafeSearch usage check if usage is strictly below the monthly limit.
 * Prevents race conditions among concurrent requests.
 *
 * @param {string} [monthKey] - UTC month key (defaults to current month)
 * @returns {Promise<{ allowed: boolean, currentCount: number, limit: number }>}
 */
const reserveVisionUsage = async (monthKey = getUtcMonthKey()) => {
  const limit = getMonthlyLimit();
  if (limit <= 0) {
    return { allowed: false, currentCount: 0, limit };
  }

  // Ensure record exists for this monthKey
  await VisionUsage.updateOne(
    { monthKey },
    { $setOnInsert: { count: 0 } },
    { upsert: true }
  );

  // Atomically increment count ONLY IF count is strictly below the limit
  const updated = await VisionUsage.findOneAndUpdate(
    { monthKey, count: { $lt: limit } },
    { $inc: { count: 1 } },
    { new: true }
  );

  if (!updated) {
    const currentCount = await getCurrentUsage(monthKey);
    return { allowed: false, currentCount, limit };
  }

  return { allowed: true, currentCount: updated.count, limit };
};

/**
 * Atomically releases (decrements) 1 SafeSearch usage reservation.
 * Called when Google Cloud Vision API fails or errors out, ensuring failed requests are not counted.
 *
 * @param {string} [monthKey] - UTC month key (defaults to current month)
 */
const releaseVisionUsage = async (monthKey = getUtcMonthKey()) => {
  try {
    await VisionUsage.updateOne(
      { monthKey, count: { $gt: 0 } },
      { $inc: { count: -1 } }
    );
  } catch (err) {
    console.error('[IMAGE_SAFETY] Failed to release Vision usage reservation:', err.message);
  }
};

/**
 * Parses threshold string (e.g. 'LIKELY', 'VERY_LIKELY', 'NONE') into rank number.
 */
const parseThreshold = (envVal, defaultRank) => {
  if (!envVal) return defaultRank;
  const upper = String(envVal).trim().toUpperCase();
  if (upper === 'NONE' || upper === 'OFF' || upper === 'DISABLED') return 6; // disabled / never reject
  return LIKELIHOOD_RANKS[upper] !== undefined ? LIKELIHOOD_RANKS[upper] : defaultRank;
};

/**
 * Moderation Thresholds:
 * - adult: LIKELY (4) and VERY_LIKELY (5) are rejected
 * - racy: LIKELY (4) and VERY_LIKELY (5) are rejected
 * - violence: VERY_LIKELY (5) is rejected by default to avoid rejecting legitimate civic infrastructure reports
 * - medical: disabled (6) by default (configurable)
 * - spoof: disabled (6) by default
 */
const getThresholds = () => ({
  adult: parseThreshold(process.env.VISION_MAX_ADULT, LIKELIHOOD_RANKS.LIKELY),
  racy: parseThreshold(process.env.VISION_MAX_RACY, LIKELIHOOD_RANKS.LIKELY),
  violence: parseThreshold(process.env.VISION_MAX_VIOLENCE, LIKELIHOOD_RANKS.VERY_LIKELY),
  medical: parseThreshold(process.env.VISION_MAX_MEDICAL, 6),
  spoof: parseThreshold(process.env.VISION_MAX_SPOOF, 6)
});

let visionClient = null;

function getVisionClient() {
  if (visionClient) return visionClient;

  const clientOptions = {};

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    clientOptions.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  } else if (process.env.GOOGLE_CLOUD_CREDENTIALS_JSON) {
    try {
      clientOptions.credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS_JSON);
    } catch (err) {
      console.error('[IMAGE_SAFETY] Failed to parse GOOGLE_CLOUD_CREDENTIALS_JSON:', err.message);
    }
  } else if (process.env.GOOGLE_CLOUD_VISION_API_KEY) {
    clientOptions.apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  }

  visionClient = new vision.ImageAnnotatorClient(clientOptions);
  return visionClient;
}

function setVisionClientForTesting(mock) {
  visionClient = mock;
}

/**
 * Checks image buffer using Google Cloud Vision SafeSearch detection.
 * @param {Buffer} imageBuffer - In-memory image buffer
 * @returns {Promise<{ isSafe: boolean, reason?: string, category?: string, likelihood?: string }>}
 */
async function checkImageSafety(imageBuffer) {
  if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
    throw new Error('Invalid image buffer provided for content-safety inspection.');
  }

  const client = getVisionClient();

  const [result] = await client.safeSearchDetection({
    image: { content: imageBuffer }
  });

  const annotation = result && result.safeSearchAnnotation;
  if (!annotation) {
    throw new Error('SafeSearch detection returned no annotation.');
  }

  const thresholds = getThresholds();

  const adultRank = LIKELIHOOD_RANKS[annotation.adult] || 0;
  const racyRank = LIKELIHOOD_RANKS[annotation.racy] || 0;
  const violenceRank = LIKELIHOOD_RANKS[annotation.violence] || 0;
  const medicalRank = LIKELIHOOD_RANKS[annotation.medical] || 0;
  const spoofRank = LIKELIHOOD_RANKS[annotation.spoof] || 0;

  if (adultRank >= thresholds.adult) {
    return {
      isSafe: false,
      category: 'adult',
      likelihood: annotation.adult,
      reason: 'Inappropriate adult content detected'
    };
  }

  if (racyRank >= thresholds.racy) {
    return {
      isSafe: false,
      category: 'racy',
      likelihood: annotation.racy,
      reason: 'Inappropriate racy content detected'
    };
  }

  if (violenceRank >= thresholds.violence) {
    return {
      isSafe: false,
      category: 'violence',
      likelihood: annotation.violence,
      reason: 'Extreme violence content detected'
    };
  }

  if (medicalRank >= thresholds.medical) {
    return {
      isSafe: false,
      category: 'medical',
      likelihood: annotation.medical,
      reason: 'Restricted medical content detected'
    };
  }

  if (spoofRank >= thresholds.spoof) {
    return {
      isSafe: false,
      category: 'spoof',
      likelihood: annotation.spoof,
      reason: 'Restricted spoofed content detected'
    };
  }

  return {
    isSafe: true,
    detections: {
      adult: annotation.adult,
      racy: annotation.racy,
      violence: annotation.violence,
      medical: annotation.medical,
      spoof: annotation.spoof
    }
  };
}

module.exports = {
  checkImageSafety,
  getThresholds,
  getVisionClient,
  setVisionClientForTesting,
  getMonthlyLimit,
  getUtcMonthKey,
  getCurrentUsage,
  reserveVisionUsage,
  releaseVisionUsage,
  isVisionSafetyEnabled,
  LIKELIHOOD_RANKS,
  DEFAULT_MONTHLY_LIMIT
};
