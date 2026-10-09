const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const morgan = require('morgan');

const env = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimit');
const { csrfProtection } = require('./middleware/csrf');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { sanitizeInput } = require('./utils/sanitize');

// Import route modules
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const reviewRoutes = require('./routes/review.routes');
const inquiryRoutes = require('./routes/inquiry.routes');
const galleryRoutes = require('./routes/gallery.routes');
const settingsRoutes = require('./routes/settings.routes');
const uploadRoutes = require('./routes/upload.routes');
const adminRoutes = require('./routes/admin.routes');
const customerAuthRoutes = require('./routes/customerAuth.routes');
const customerProfileRoutes = require('./routes/customerProfile.routes');
const orderRoutes = require('./routes/order.routes');

function createApp() {
  const app = express();

  // Trust proxy for rate-limit and IP detection in production
  app.set('trust proxy', 1);

  // Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          frameSrc: ["'self'", 'https://www.google.com'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
          connectSrc: ["'self'"]
        }
      },
      crossOriginEmbedderPolicy: false
    })
  );

  // CORS configuration
  const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5000', 'http://127.0.0.1:5000'];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true
    })
  );

  // HTTP Request Logging
  if (!env.isProduction) {
    app.use(morgan('dev'));
  }

  // Request Body Parsers & limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // Input sanitization against NoSQL injection & XSS
  app.use((req, res, next) => {
    if (req.body) req.body = sanitizeInput(req.body);
    if (req.query) req.query = sanitizeInput(req.query);
    if (req.params) req.params = sanitizeInput(req.params);
    next();
  });

  // Session configuration backed by MongoDB store
  app.use(
    session({
      name: env.SESSION_NAME,
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: mongoose.connection.getClient(),
        collectionName: 'sessions',
        ttl: 24 * 60 * 60 // 1 day
      }),
      cookie: {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: 'lax',
        maxAge: env.SESSION_MAX_AGE_MS
      }
    })
  );

  // CSRF Protection
  app.use(csrfProtection);

  // Rate Limiting for API routes
  app.use('/api', apiLimiter);

  // API Routes
  app.use('/api/auth', customerAuthRoutes);
  app.use('/api/profile', customerProfileRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/admin/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/inquiries', inquiryRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/admin/upload', uploadRoutes);
  app.use('/api/admin', adminRoutes);

  // Serve Uploaded Files
  app.use('/uploads', express.static(env.UPLOAD_DIR, { maxAge: '7d' }));

  // Serve Preserved Images
  app.use('/images', express.static(path.resolve(__dirname, '../../client/images'), { maxAge: '7d' }));

  // Robots.txt & Sitemap.xml
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: ${env.CLIENT_URL}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    const today = new Date().toISOString().split('T')[0];
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${env.CLIENT_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
  });

  // Admin Dashboard static files
  app.use('/admin', express.static(path.resolve(__dirname, '../../admin')));
  app.get('/admin/login', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../admin/index.html'));
  });
  app.get('/admin/*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../admin/index.html'));
  });

  // Customer auth & dashboard routes
  app.get('/login', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/login.html'));
  });

  app.get('/signup', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/signup.html'));
  });

  app.get('/dashboard', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/dashboard.html'));
  });

  app.get('/profile', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/profile.html'));
  });

  app.get('/forgot-password', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/forgot-password.html'));
  });

  app.get('/reset-password/:token', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/reset-password.html'));
  });

  // Public Frontend static files
  app.use(express.static(path.resolve(__dirname, '../../client')));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(__dirname, '../../client/index.html'));
  });

  // 404 & Central Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
