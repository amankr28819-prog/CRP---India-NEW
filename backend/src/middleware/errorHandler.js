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
    message = `Resource not found with ID: ${err.value}`;
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Image size exceeds maximum limit of 5MB.';
    }
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;