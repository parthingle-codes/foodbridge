const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  validate: { ip: false, xForwardedForHeader: false },
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FoodBridge API is running',
    data: {
      version: '1.0.0',
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
    },
  });
});

// Routes - Supporting both Frontend contract and backend plural/singular routes
app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/donor', require('./routes/donorRoutes'));
app.use('/api/donors', require('./routes/donorRoutes'));

app.use('/api/food-listings', require('./routes/listingRoutes'));
app.use('/api/matching', require('./routes/matchingRoutes'));

app.use('/api/organization', require('./routes/organizationRoutes'));
app.use('/api/organizations', require('./routes/organizationRoutes'));

app.use('/api/volunteer', require('./routes/volunteerRoutes'));
app.use('/api/volunteers', require('./routes/volunteerRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));

app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/safety', require('./routes/safetyRoutes'));
app.use('/api/otp', require('./routes/otpRoutes'));

app.use('/api/waste-recovery', require('./routes/wasteRecoveryRoutes'));

app.use('/api/biofarm', require('./routes/biofarmRoutes'));
app.use('/api/biofarms', require('./routes/biofarmRoutes'));

app.use('/api/rewards', require('./routes/rewardRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/map', require('./routes/mapRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
