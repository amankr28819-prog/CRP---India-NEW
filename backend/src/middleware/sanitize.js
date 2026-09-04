/**
 * Input sanitization & regex escaping helper
 * Defends against MongoDB NoSQL operator injection and ReDoS attacks.
 */

const escapeRegex = (string = '') => {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const sanitizeValue = (value) => {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (typeof value === 'object') {
    const cleanObj = {};
    for (const key of Object.keys(value)) {
      // Strip any key starting with '$' (Mongo operators) or containing '.' (field path injection)
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      cleanObj[key] = sanitizeValue(value[key]);
    }
    return cleanObj;
  }
  return value;
};

const sanitizeMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params);
  }
  next();
};

module.exports = {
  escapeRegex,
  sanitizeMiddleware,
  sanitizeValue
};
