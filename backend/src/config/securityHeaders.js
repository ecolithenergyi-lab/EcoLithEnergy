const helmet = require('helmet');
const env = require('./env');

const apiOrigins = [...new Set([
  'https://api.ecolithenergy.com',
  new URL(env.API_URL).origin
])];

module.exports = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      frameSrc: ["'self'", 'https://www.google.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", ...apiOrigins],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  frameguard: { action: 'deny' },
  crossOriginEmbedderPolicy: false
});
