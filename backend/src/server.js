const { connectDatabase } = require('./config/database');
const env = require('./config/env');
const logger = require('./utils/logger');
const createApp = require('./app');
const { seedDatabase } = require('./scripts/seed');
const Admin = require('./models/Admin');

async function startServer() {
  try {
    if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
      throw new Error('SESSION_SECRET must be set to a random value of at least 32 characters.');
    }
    if (env.isProduction && !env.MONGODB_URI_CONFIGURED) {
      throw new Error('MONGODB_URI must be configured in production.');
    }
    if (env.isProduction) {
      for (const [name, value] of [
        ['API_URL', env.API_URL],
        ['FRONTEND_URL', env.FRONTEND_URL]
      ]) {
        if (new URL(value).protocol !== 'https:') {
          throw new Error(`${name} must use HTTPS in production.`);
        }
      }
    }

    // 1. Connect to Database (with memory-server fallback if local MongoDB is absent)
    await connectDatabase();

    // 2. Ensure initial data is seeded
    await seedDatabase();

    // 3. Require an administrator to be created explicitly before serving requests
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      throw new Error('No administrator exists. Run `npm run create-admin` with explicit credentials before starting the server.');
    }

    // 4. Initialize Express App
    const app = createApp();

    // 5. Start Listening
    const server = app.listen(env.PORT, () => {
      logger.info(`=======================================================`);
      logger.info(`🚀 EcoLith Energy Server running in ${env.NODE_ENV} mode`);
      logger.info(`🌐 Public Website:  http://localhost:${env.PORT}`);
      logger.info(`🔒 Admin Dashboard: http://localhost:${env.PORT}/admin`);
      logger.info(`⚡ API Base URL:    http://localhost:${env.PORT}/api`);
      logger.info(`=======================================================`);
    });

    // Graceful Shutdown
    const handleShutdown = async (signal) => {
      logger.info(`${signal} signal received. Closing server gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        const { closeDatabase } = require('./config/database');
        await closeDatabase();
        logger.info('Database connection closed. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    return { server, app };
  } catch (err) {
    logger.error(`Critical error starting server: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = startServer;
