const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

let memoryServerInstance = null;

async function connectDatabase() {
  try {
    mongoose.set('strictQuery', true);

    // Attempt primary connection with 3s timeout
    logger.info(`Attempting to connect to MongoDB at: ${env.MONGODB_URI}`);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      autoIndex: true
    });
    logger.info('Connected to MongoDB successfully.');
    return mongoose.connection;
  } catch (err) {
    logger.warn(`Could not connect to configured MongoDB URI (${err.message})`);

    if (env.USE_MEMORY_DB_FALLBACK && !env.isProduction) {
      try {
        logger.info('Starting embedded in-memory MongoDB server for local development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServerInstance = await MongoMemoryServer.create();
        const memUri = memoryServerInstance.getUri();
        logger.info(`In-memory MongoDB started at: ${memUri}`);
        await mongoose.connect(memUri, {
          autoIndex: true
        });
        logger.info('Connected to in-memory MongoDB successfully. Full-stack features active.');
        return mongoose.connection;
      } catch (memErr) {
        logger.error(`Failed to start in-memory MongoDB fallback: ${memErr.message}`);
        throw memErr;
      }
    } else {
      throw err;
    }
  }
}

async function closeDatabase() {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
}

module.exports = {
  connectDatabase,
  closeDatabase
};
