# EcoLith Energy Website

Public product and company website for EcoLith Energy, a Delhi-based lithium battery manufacturer. The site uses authentic company imagery and a dark green industrial design system.

## Current scope

- Public marketing pages and battery product catalog
- Public reviews, gallery, and site-settings APIs
- Validated, rate-limited inquiry form
- Phone and WhatsApp contact links

Customer login/signup, Google OAuth, password recovery, customer accounts, cart/wishlist, dealer applications, admin panel, admin APIs, checkout, and upload management have been removed. Former auth/admin API paths are not mounted. Existing MongoDB account/admin records are left untouched.

Existing files under `backend/uploads/` remain readable for old product-image links, but no upload endpoint is available.

## Stack

- Frontend: HTML5, CSS3, vanilla JavaScript
- Backend: Node.js 20+, Express
- Database: MongoDB via Mongoose
- Validation: Zod
- Security: Helmet, CORS allowlisting, rate limits, sanitization, and centralized error handling
- Local development fallback: mongodb-memory-server when enabled

## Project layout

```text
frontend/                 Public website, styles, scripts, and real brand images
backend/src/app.js        Express app and public route configuration
backend/src/server.js     Database startup and HTTP server
backend/src/config/       Environment, database, and security headers
backend/src/controllers/  Public resource handlers
backend/src/models/       Product, inquiry, gallery, review, settings, audit models
backend/src/routes/       Public API route modules
backend/src/validators/   Request schemas
backend/test/             Automated tests
backend/uploads/          Existing runtime image media
```

## Setup

1. Install Node.js 20 or newer.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and configure MongoDB and frontend origins.
4. Start locally with `npm run dev`.

The server serves the website at `http://localhost:5000` by default.

## Environment variables

Current variables are documented in `.env.example`:

- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `USE_MEMORY_DB_FALLBACK`
- `IP_HASH_SALT` (optional)
- `CLIENT_URL`
- `FRONTEND_URL`
- `API_URL`

Session, OAuth, SMTP, and admin-bootstrap credentials are no longer used. Keep any old `.env` values private and do not commit them.

## API overview

- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/reviews`
- `POST /api/inquiries`
- Public gallery and settings retrieval

Removed login/admin/account endpoints return 404.

## Tests

```sh
npm test
npm run test-security
```

## Brand imagery

Use the real EcoLith factory photographs, logos, and original battery images in `frontend/images/`. Do not invent product or factory assets, replace labels, or use generic AI-generated imagery.

See [Architecture.md](./Architecture.md), [design.md](./design.md), [prd.md](./prd.md), and [rules.md](./rules.md) for project details.
