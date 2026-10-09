const readline = require('readline');
const Admin = require('../models/Admin');
const { connectDatabase, closeDatabase } = require('../config/database');
const env = require('../config/env');
const logger = require('../utils/logger');

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function createSuperAdmin(opts = {}) {
  try {
    let name = opts.name;
    let email = opts.email;
    let password = opts.password;

    // Check if running interactively with TTY
    if (!name && process.stdin.isTTY) {
      console.log('\n=============================================');
      console.log('   EcoLith Energy — SuperAdmin CLI Creator   ');
      console.log('=============================================\n');
      name = await prompt(`Enter Admin Name [${env.DEFAULT_ADMIN_NAME}]: `) || env.DEFAULT_ADMIN_NAME;
      email = await prompt(`Enter Admin Email [${env.DEFAULT_ADMIN_EMAIL}]: `) || env.DEFAULT_ADMIN_EMAIL;
      password = await prompt(`Enter Strong Password: `);
    }

    // Fallbacks
    name = name || env.DEFAULT_ADMIN_NAME;
    email = (email || env.DEFAULT_ADMIN_EMAIL).toLowerCase().trim();
    password = password || env.DEFAULT_ADMIN_PASSWORD;

    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      logger.info(`Admin with email '${email}' already exists. Updating password and ensuring SUPER_ADMIN role...`);
      existing.passwordHash = await Admin.hashPassword(password);
      existing.role = 'SUPER_ADMIN';
      existing.isActive = true;
      existing.failedLoginAttempts = 0;
      existing.lockedUntil = null;
      await existing.save();
      logger.info(`SuperAdmin '${email}' updated successfully.`);
      return existing;
    }

    const passwordHash = await Admin.hashPassword(password);
    const newAdmin = await Admin.create({
      name,
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true
    });

    logger.info(`SuperAdmin '${email}' created successfully with role SUPER_ADMIN.`);
    return newAdmin;
  } catch (err) {
    logger.error(`Failed to create SuperAdmin: ${err.message}`);
    throw err;
  }
}

if (require.main === module) {
  (async () => {
    try {
      await connectDatabase();
      await createSuperAdmin();
      await closeDatabase();
      process.exit(0);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  })();
}

module.exports = {
  createSuperAdmin
};
