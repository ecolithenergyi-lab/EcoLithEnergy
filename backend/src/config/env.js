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
  SESSION_SECRET: process.env.SESSION_SECRET || '',
  SESSION_NAME: process.env.SESSION_NAME || 'ecolith.sid',
  SESSION_MAX_AGE_MS: parseInt(process.env.SESSION_MAX_AGE_MS, 10) || 24 * 60 * 60 * 1000,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  DEFAULT_ADMIN_NAME: process.env.DEFAULT_ADMIN_NAME || '',
  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || '',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || '',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
  UPLOAD_DIR: path.resolve(__dirname, '../../uploads'),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5,
  isProduction: NODE_ENV === 'production',
  isDevelopment: NODE_ENV === 'development',
};

module.exports = env;
