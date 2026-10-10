# EcoLith Energy Project Memory

## 1. Project identity

EcoLith Energy / इकोलिथ एनर्जी is a Delhi-based lithium battery manufacturer. Brand tagline: “Powering a Greener Tomorrow.”

## 2. Business information

The site presents real EcoLith products, factory imagery, business contact details, and ways to submit a product inquiry. Company address and contact content are maintained in the site and public settings.

## 3. Confirmed requirements

- Public marketing/catalog site built with HTML, CSS, and vanilla JavaScript.
- Node.js/Express API and MongoDB/Mongoose persistence.
- Use authentic company and factory imagery.
- Keep product inquiries available without requiring an account.
- Login/signup, customer accounts, OAuth, and admin functionality have been permanently removed from the current application.

## 4. Technology stack

- Frontend: HTML5, CSS3, vanilla JavaScript
- Backend: Node.js, Express
- Persistence: MongoDB/Mongoose
- Request validation: Zod
- Security and runtime: Helmet, CORS, rate limiting, input sanitization, centralized errors
- Local database fallback: mongodb-memory-server (development only when configured)

## 5. Important architectural decisions

- The app is public-only: no customer/staff authentication, sessions, or privileged application routes.
- Admin and account endpoints are not mounted; their prior URLs fall through to the public homepage or return API 404s.
- Existing MongoDB account/admin data is not deleted; removed code no longer reads it.
- Public inquiries remain rate-limited and validated.
- Existing image files under `backend/uploads/` remain readable for legacy product references, but new uploads are disabled.

## 6. Current project structure

- `frontend/` – public website and genuine images
- `frontend/images/` – factory, battery, and logo assets
- `backend/src/app.js` – Express app and public route mounting
- `backend/src/config/` – environment, database, and HTTP headers
- `backend/src/controllers/`, `models/`, `routes/`, `validators/` – public content API
- `backend/src/middleware/` – public API security and validation
- `backend/test/` – automated tests

Former `frontend/client` and `frontend/admin` pages and their auth assets have been removed.

## 7. Implemented public features

- EcoLith public homepage and responsive navigation
- Public product catalog and detail modal
- Public reviews, gallery, and settings APIs
- Validated/rate-limited contact inquiry form
- Phone and WhatsApp contact actions
- Vercel static routing and Express static serving

## 8. Removed/disabled features

- Customer login/signup, Google OAuth, email verification, password recovery
- Customer profile, wishlist, cart, dealer application, and account dashboard
- Staff/admin login, dashboard, CRUD APIs, staff management, audit UI, and upload management
- Checkout/order endpoints

Do not describe these as available. Reintroduction requires an explicit product decision and a secure server-side design.

## 9. Current database models

`Product`, `Inquiry`, `Review`, `Gallery`, `SiteSettings`, and `AuditLog`. The old account/admin/order collections may remain in MongoDB but their model code was removed; their documents were not deleted.

## 10. Public API endpoints

- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/reviews`
- `POST /api/inquiries`
- `/api/gallery` public retrieval
- `/api/settings/public` public settings

Removed auth/admin/profile/orders/upload-management paths are not mounted.

## 11. Authentication configuration status

Authentication is removed from the app. `.env.example` no longer requests session, OAuth, SMTP, or admin-bootstrap credentials. The existing private `.env` was not changed.

## 12. Environment variables

See `.env.example`: `NODE_ENV`, `PORT`, `MONGODB_URI`, `USE_MEMORY_DB_FALLBACK`, `IP_HASH_SALT` (optional), `CLIENT_URL`, `FRONTEND_URL`, `API_URL`.

Never record secret values in this file.

## 13. Known limitations

- No in-app content/admin management UI is available.
- New media upload management is unavailable; existing `/uploads` media remains readable.
- Cart, dealer workflows, accounts, and checkout are not available.
- Deployment readiness still depends on verifying the database and deployed origins.

## 14. Last completed milestone

Removed the public login popup and all customer/staff login surfaces, auth routes, and related runtime dependencies. Kept the public marketing, catalog, and inquiry paths.

## 15. Next recommended actions

1. Run the focused auth-disabled and project test suites.
2. Verify local homepage and public APIs.
3. Confirm Vercel deployment behavior after deployment.
4. Decide separately whether content management needs a replacement workflow.

## 16. Important file paths

- `README.md`
- `Architecture.md`
- `design.md`
- `prd.md`
- `rules.md`
- `tasks.md`
- `.env.example`
- `frontend/index.html`
- `frontend/script.js`
- `backend/src/app.js`
- `backend/src/server.js`
- `backend/test/auth-disabled.test.js`

## 17. Testing status

The repository test suite includes checks that removed auth/admin endpoints remain unavailable. Results must be refreshed by running tests after changes; no unrun command should be reported as passing.

## 18. Deployment status

Vercel serves `frontend/` as static output. The Express server serves the same public site and API. Production status is unverified until deployed settings and database connectivity are tested.

## Ongoing memory rule

Record only verified facts. Distinguish implemented behavior from pending validation. Never store passwords, API secrets, database credentials, access tokens, or private keys in this document.
