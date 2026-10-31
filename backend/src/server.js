const app = require('./app');
const config = require('./config');
const db = require('./config/database');

const PORT = config.port || 5000;

async function startServer() {
  try {
    const isPgConnected = await db.testConnection();
    if (isPgConnected) {
      console.log('✅ Connected to PostgreSQL with PostGIS capabilities.');
    } else {
      console.log('ℹ️  PostgreSQL server not detected on localhost:5432.');
      console.log('🚀 Running in Zero-Config High-Performance In-Memory PostGIS Mode.');
      console.log('   All models, matching engine, OTP, safety checks & seed data are fully active.');
    }

    const server = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`  FOODBRIDGE Backend API - HACKNOVA 2026`);
      console.log(`======================================================`);
      console.log(`  Base URL:     http://localhost:${PORT}/api`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`  Environment:  ${config.nodeEnv}`);
      console.log(`  Demo Users:   donor@foodbridge.demo / password123`);
      console.log(`                ngo1@foodbridge.demo  / password123`);
      console.log(`                volunteer1@foodbridge.demo / password123`);
      console.log(`                biofarm@foodbridge.demo / password123`);
      console.log(`                admin@foodbridge.demo / password123`);
      console.log(`  Demo OTP:     123456`);
      console.log(`======================================================\n`);
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
