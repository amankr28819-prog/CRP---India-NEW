require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const { connectDB } = require('./config/db');
const { seedData } = require('./utils/seed');
const errorHandler = require('./middleware/errorHandler');
const { sanitizeMiddleware } = require('./middleware/sanitize');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const authorityRoutes = require('./routes/authorityRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy for accurate IP resolution in rate limiting
app.set('trust proxy', 1);

// Enforce environment validation in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('super_secret_jwt_key') || process.env.JWT_SECRET.includes('your_jwt_secret')) {
    console.error('[SECURITY FATAL] A strong, unique JWT_SECRET (minimum 32 characters) must be configured in production.');
    process.exit(1);
  }
}

// Connect to Database & seed demo data in development only
connectDB().then(async () => {
  if (process.env.NODE_ENV !== 'production') {
    await seedData(false);
  }
});

// 1. HTTP Security Headers (Helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows uploaded images to be requested by the frontend
  crossOriginEmbedderPolicy: false
}));

// 2. Strict / Configurable CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV !== 'production' && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')))
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Body Parsing with payload limits to prevent volumetric DoS
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// 4. NoSQL Operator & Key Injection Sanitizer
app.use(sanitizeMiddleware);

// 5. Global API Rate Limiting
app.use('/api', apiLimiter);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 6. Secure Static Uploads Serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Content-Security-Policy', "default-src 'none'");
    res.set('Cache-Control', 'public, max-age=86400');
  }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'CRP India Civic Reporting Platform API'
  });
});

// Mount Routes with Auth Rate Limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/authority', authorityRoutes);
app.use('/api/notifications', notificationRoutes);

// Fallback 404 for undefined API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' does not exist.`
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`[SERVER] CRP India API running on http://localhost:${PORT}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

module.exports = app;