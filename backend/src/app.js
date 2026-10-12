const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const securityHeaders = require('./config/securityHeaders');

const env = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimit');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { sanitizeInput } = require('./utils/sanitize');

// Import route modules
const productRoutes = require('./routes/product.routes');
const reviewRoutes = require('./routes/review.routes');
const inquiryRoutes = require('./routes/inquiry.routes');
const galleryRoutes = require('./routes/gallery.routes');
const settingsRoutes = require('./routes/settings.routes');

function createCorsOptions() {
  const allowedOrigins = new Set(
    [
      env.CLIENT_URL,
      env.FRONTEND_URL,
      'https://ecolithenergy.com',
      'https://www.ecolithenergy.com',
      ...(!env.isProduction
        ? ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5000']
        : [])
    ]
      .filter(Boolean)
      .map((origin) => {
        try {
          return new URL(origin).origin;
        } catch {
          return null;
        }
      })
      .filter(Boolean)
  );

  return {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ['GET', 'HEAD', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  };
}

function createApp() {
  const app = express();

  // Trust proxy for rate-limit and IP detection in production
  app.set('trust proxy', 1);

  app.use(securityHeaders);

  // CORS configuration
  app.use(cors(createCorsOptions()));

  // HTTP Request Logging
  if (!env.isProduction) {
    app.use(morgan('dev'));
  }

  // Request Body Parsers & limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  // Input sanitization against NoSQL injection & XSS
  app.use((req, res, next) => {
    if (req.body) req.body = sanitizeInput(req.body);
    if (req.query) req.query = sanitizeInput(req.query);
    if (req.params) req.params = sanitizeInput(req.params);
    next();
  });

  // Rate Limiting for API routes
  app.use('/api', apiLimiter);

  // Public API Routes; account and staff-management APIs are disabled.
  app.use('/api/products', productRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/inquiries', inquiryRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/settings', settingsRoutes);

  // Continue serving existing uploaded product media; upload management is disabled.
  app.use('/uploads', express.static(env.UPLOAD_DIR, { maxAge: '7d' }));

  // Serve Preserved Images
  app.get('/images/quality.jpeg', (req, res) => {
    res.redirect(308, '/images/quality-testing-blueprint.jpeg');
  });
  app.use('/images', express.static(path.resolve(__dirname, '../../frontend/client/images'), { maxAge: '7d' }));

  // Robots.txt & Sitemap.xml
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${env.CLIENT_URL}/sitemap.xml\n`);
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

  // Public Frontend static files
  app.use(express.static(path.resolve(__dirname, '../../frontend')));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(__dirname, '../../frontend/index.html'));
  });

  // 404 & Central Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
module.exports.createCorsOptions = createCorsOptions;
