const path = require('path');
const dotenv = require('dotenv');

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';

const env = {
  NODE_ENV,
  PORT: parseInt(process.env.PORT, 10) || 5000,
  API_URL: process.env.API_URL || 'http://localhost:5000',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5000',
  FRONTEND_URL: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecolith_energy',
  MONGODB_URI_CONFIGURED: Boolean(process.env.MONGODB_URI),
  USE_MEMORY_DB_FALLBACK: NODE_ENV !== 'production' && process.env.USE_MEMORY_DB_FALLBACK !== 'false',
  UPLOAD_DIR: path.resolve(__dirname, '../../uploads'),
  isProduction: NODE_ENV === 'production',
  isDevelopment: NODE_ENV === 'development',
};

module.exports = env;
