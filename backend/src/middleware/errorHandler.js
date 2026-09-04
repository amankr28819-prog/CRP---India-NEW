const errorHandler = (err, req, res, next) => {
  console.error('[API ERROR]', err.stack || err.message);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered.';
  } else if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Requested resource not found or ID format is invalid.';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Image size exceeds maximum limit of 5MB.';
    } else {
      message = 'File upload error: ' + err.message;
    }
  }

  // In production, mask unhandled 500 errors to avoid leaking implementation details
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'An internal server error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;