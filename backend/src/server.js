const { connectDatabase } = require('./config/database');
const env = require('./config/env');
const logger = require('./utils/logger');
const createApp = require('./app');
const { seedDatabase } = require('./scripts/seed');

async function startServer() {
  try {
    if (env.isProduction && !env.MONGODB_URI_CONFIGURED) {
      throw new Error('MONGODB_URI must be configured in production.');
    }
    if (env.isProduction) {
      if (new URL(env.FRONTEND_URL).protocol !== 'https:') {
        throw new Error('FRONTEND_URL must use HTTPS in production.');
      }
    }

    // 1. Connect to Database (with memory-server fallback if local MongoDB is absent)
    await connectDatabase();

    // 2. Ensure initial data is seeded
    await seedDatabase();

    // 3. Initialize Express App
    const app = createApp();

    // 4. Start Listening
    const server = app.listen(env.PORT, () => {
      logger.info(`=======================================================`);
      logger.info(`🚀 EcoLith Energy Server running in ${env.NODE_ENV} mode`);
      logger.info(`🌐 Public Website:  http://localhost:${env.PORT}`);
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
