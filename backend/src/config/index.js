require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'foodbridge',
    user: process.env.DB_USER || 'foodbridge',
    password: process.env.DB_PASSWORD || 'foodbridge123',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'foodbridge-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '10'),
    length: parseInt(process.env.OTP_LENGTH || '6'),
    demoOtp: process.env.DEMO_OTP || '123456',
  },
  matching: {
    maxServiceRadiusKm: parseFloat(process.env.MAX_SERVICE_RADIUS_KM || '50'),
    weights: {
      distance: parseFloat(process.env.WEIGHT_DISTANCE || '0.35'),
      capacity: parseFloat(process.env.WEIGHT_CAPACITY || '0.25'),
      time: parseFloat(process.env.WEIGHT_TIME || '0.20'),
      need: parseFloat(process.env.WEIGHT_NEED || '0.20'),
    },
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    enabled: process.env.TELEGRAM_ENABLED === 'true',
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT || '',
    accessKey: process.env.S3_ACCESS_KEY || '',
    secretKey: process.env.S3_SECRET_KEY || '',
    bucket: process.env.S3_BUCKET || 'foodbridge-uploads',
    region: process.env.S3_REGION || 'us-east-1',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },
  credits: {
    perKg: parseFloat(process.env.CREDITS_PER_KG || '10'),
    perServing: parseFloat(process.env.CREDITS_PER_SERVING || '5'),
  },
};
