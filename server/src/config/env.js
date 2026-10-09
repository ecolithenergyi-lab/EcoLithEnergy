const path = require('path');
const dotenv = require('dotenv');

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecolith_energy',
  USE_MEMORY_DB_FALLBACK: process.env.USE_MEMORY_DB_FALLBACK !== 'false',
  SESSION_SECRET: process.env.SESSION_SECRET || 'ecolith_energy_dev_secret_key_change_in_production_87654321',
  SESSION_NAME: process.env.SESSION_NAME || 'ecolith.sid',
  SESSION_MAX_AGE_MS: parseInt(process.env.SESSION_MAX_AGE_MS, 10) || 24 * 60 * 60 * 1000,
  CSRF_SECRET: process.env.CSRF_SECRET || 'ecolith_csrf_secret_salt_2026',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  DEFAULT_ADMIN_NAME: process.env.DEFAULT_ADMIN_NAME || 'EcoLith SuperAdmin',
  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || 'admin@ecolithenergy.com',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || 'EcoLith@Admin2026!',
  UPLOAD_DIR: path.resolve(__dirname, '../../uploads'),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
};

module.exports = env;
