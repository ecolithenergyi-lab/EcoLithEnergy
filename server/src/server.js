const { connectDatabase } = require('./config/database');
const env = require('./config/env');
const logger = require('./utils/logger');
const createApp = require('./app');
const { seedDatabase } = require('./scripts/seed');
const { createSuperAdmin } = require('./scripts/createAdmin');
const Admin = require('./models/Admin');

async function startServer() {
  try {
    // 1. Connect to Database (with memory-server fallback if local MongoDB is absent)
    await connectDatabase();

    // 2. Ensure initial data is seeded
    await seedDatabase();

    // 3. Ensure at least one SuperAdmin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      logger.info('No admin accounts detected. Bootstrapping initial SuperAdmin from environment...');
      await createSuperAdmin();
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
