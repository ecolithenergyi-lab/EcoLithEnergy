# EcoLith Energy Project Memory

## 1. Project identity

- Project: EcoLith Energy
- Business type: lithium battery manufacturing and sales
- Headquarters / operating context: Delhi, India
- Brand line: Powering a Greener Tomorrow
- Public identity: EcoLith Energy / इकोलिथ एनर्जी

## 2. Business information

- The website is meant to present EcoLith Energy as a real industrial battery manufacturing business.
- The application supports public product discovery, contact leads, dealer interest, customer account management, and internal admin operations.
- Real factory and battery imagery is treated as a core competitive and trust asset.
- The business contact information referenced in the public website includes a Delhi manufacturing address and WhatsApp/contact details already present in the codebase.

## 3. Confirmed requirements

The following are confirmed project requirements based on the repository implementation and documentation:

- Use HTML5, CSS3, and vanilla JavaScript for the frontend.
- Use Node.js and Express for the backend.
- Use MongoDB and Mongoose for persistence.
- Support a public-facing marketing website and a separate admin area.
- Support customer signup, login, email verification, password reset, profile management, and Google Sign-In.
- Support product management, inquiry management, gallery management, reviews, and site settings.
- Use server-side authentication and authorization rather than trusting client-side controls.
- Enforce security measures such as rate limiting, CSRF protection, session security, and input sanitization.
- Keep the visual system rooted in EcoLith green and industrial dark branding.

## 4. Technology stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js, Express
- Database: MongoDB via Mongoose
- Session layer: express-session with connect-mongo
- Auth: Passport.js, Google OAuth 2.0, bcryptjs
- Email: Nodemailer
- Uploads: Multer with file validation
- Security: Helmet, CORS, express-rate-limit, CSRF, sanitization utilities
- Local dev fallback: mongodb-memory-server for in-memory MongoDB when configured database access is not available

## 5. Important architectural decisions

- The application serves the public marketing site and the customer/admin interfaces from the same Node.js backend.
- The frontend deliberately avoids React or Tailwind as part of the project rule set.
- `frontend/` is designed as a light static site while `backend/` owns the application logic and data access.
- API endpoints are mounted under `/api` and protected by middleware based on authentication or role requirements.
- Session tokens are stored server-side in MongoDB and protected by secure cookie configuration.
- Real facility photography is intentionally prioritized over generic stock imagery.
- The app is designed to support both product discovery and operations management with a single, cohesive backend.

## 6. Current project structure

Important directories:

- `frontend/` – public site and UI shell
- `frontend/client/` – customer auth and dashboard pages
- `frontend/admin/` – admin UI shell
- `backend/src/` – backend application code
- `backend/src/config/` – environment and service configuration
- `backend/src/routes/` – route registration
- `backend/src/controllers/` – business logic
- `backend/src/models/` – MongoDB schema models
- `backend/src/middleware/` – security and access middleware
- `backend/src/services/` – email and upload services
- `backend/uploads/` – uploaded runtime assets

## 7. Implemented features

The following are implemented in the current repository and should be treated as confirmed features only when validated by tests or runtime use:

- Public marketing homepage with real EcoLith branding and factory imagery
- Product catalog model and public product retrieval endpoints
- Inquiry capture for website leads
- Customer signup and login flows
- Google OAuth signup/login flow
- Email verification and password reset system
- Customer cart and wishlist support
- Customer profile support and account data persistence
- Dealer application support on customer accounts
- Admin authentication and staff role model
- Product management for admin users
- Gallery management for facility and battery images
- Review management for user feedback
- Site settings management
- Audit logging for admin actions
- CSRF, rate limiting, upload validation, and request sanitization
- MongoDB fallback for local development when no configured database is available

## 8. Features still pending

These are not yet guaranteed to be complete or fully tested unless the code is validated through runtime checks or automated tests:

- Production-style deployment hardening beyond the existing local setup
- Full public checkout or payment flow beyond a cart-oriented pattern
- Full end-to-end validation for every admin workflow
- Completeness of all UI pages beyond the current static templates and API skeleton
- Automated test coverage beyond the security script and Node test harness

## 9. Database models and relationships

Core models in use:

- `User` – customer, dealer, and account record
- `Admin` – staff account and role records
- `Product` – catalog data for battery products
- `Inquiry` – lead and contact form data
- `Review` – review records for the public site
- `Gallery` – facility and battery imagery
- `SiteSettings` – dynamic branding and contact configuration
- `Order` – order lifecycle metadata
- `AuditLog` – admin action logging

Important relationships and patterns:
- `User` stores cart and wishlist data directly on the account record
- `User` documents can include dealer application data such as shop name, GST, and address
- Product records are referenced by `productId` in customer cart data
- `Inquiry` is a lead collection model with status tracking
- `Gallery` and `Product` both support published / unpublished state flags

## 10. API endpoints

Public and operational routes are mounted under `/api`:

- `/api/auth/*` – login, signup, Google auth, password recovery, logout, wishlist, cart, dealer application
- `/api/products` – public product catalog and product detail access
- `/api/reviews` – public reviews endpoint
- `/api/inquiries` – website inquiry endpoints
- `/api/gallery` – gallery data access
- `/api/settings` – settings data access
- `/api/admin/*` – staff-only management APIs
- `/api/admin/upload` – upload management for protected image assets

## 11. Authentication configuration status

Confirmed status:

- Customer local auth is implemented using `bcryptjs` and MongoDB-backed sessions.
- Google OAuth is implemented and guarded by environment-based configuration.
- Admin auth is implemented with role-based middleware.
- Protected admin routes require server-side authentication.
- Session security is configured with secure cookies and CSRF protection.

The exact live status of any specific environment depends on the values set in the local or deployed `.env` file.

## 12. Environment variables required

The runtime depends on the following environment variables defined in `.env` or `.env.example`:

- `PORT`
- `MONGODB_URI`
- `USE_MEMORY_DB_FALLBACK`
- `SESSION_SECRET`
- `SESSION_NAME`
- `SESSION_MAX_AGE_MS`
- `CLIENT_URL`
- `FRONTEND_URL`
- `API_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DEFAULT_ADMIN_NAME`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`

No secret values should be stored in this file.

## 13. Known bugs and limitations

This section should be updated as issues are confirmed.

Known/likely limitations identified from the current codebase:

- The project is highly dependent on correct environment configuration for live operation.
- Some UI flows are statically served and may require integration verification in browser runtime tests.
- Product, gallery, and settings features need runtime validation to confirm they are fully wired to all UI pages.
- Deployment behavior depends on exact origin configuration for CORS and OAuth callbacks.

## 14. Last completed development milestone

The current project state reflects a completed foundational implementation of:

- public site structure and branding
- backend API skeleton and route separation
- MongoDB models and security middleware
- customer and admin auth foundations
- product, gallery, review, and inquiry domains
- upload and email support for real-world operational flows

This milestone is considered a strong functional foundation, but it must still be validated against runtime and integration checks before claiming full production readiness.

## 15. Next recommended actions

1. Validate the current environment setup against `.env.example` and confirm all required values are present.
2. Run the project startup and test scripts to verify that the app boots successfully.
3. Confirm the admin bootstrap flow and create a valid initial admin account when needed.
4. Validate product, gallery, inquiry, and customer auth endpoints with live API testing.
5. Audit the admin dashboard and customer pages against the actual backend data flows.
6. Expand automated coverage for critical business flows once the current foundation is considered stable.

## 16. Important file paths

- `README.md` – project overview and deployment notes
- `.env.example` – environment variable template
- `backend/src/app.js` – Express app configuration
- `backend/src/config/env.js` – environment configuration
- `backend/src/config/passport.js` – Google OAuth setup
- `backend/src/models/` – Mongoose domain models
- `backend/src/routes/` – route configuration
- `backend/src/middleware/` – auth and security middleware
- `frontend/index.html` – public home page
- `frontend/client/` – customer flows
- `frontend/admin/` – admin dashboard

## 17. Testing status

The repository includes scripts for:

- `npm test`
- `npm run test-security`

The system is expected to support automated verification of security and application behavior. However, the current memory status should be treated as "partial validation" until those commands are run in the actual environment and pass.

## 18. Deployment status

Current status: foundation is implemented and ready for environment verification, but not yet confirmed production-ready.

Requirements for deployment readiness:

- secure `.env` values configured
- MongoDB connection validated
- Google OAuth credentials verified
- SMTP credentials verified
- production CORS and callback origins confirmed
- admin bootstrap completed
- application tested in the target runtime environment

## 19. Working rules for the project

- Record only verified facts here.
- Do not claim a feature works unless it has been tested.
- State whether a feature is implemented, partially implemented, blocked, or pending.
- Keep secret values out of this file and use environment variable names instead.
- Update this file at the end of meaningful development sessions.

## 20. Last updated

This file should be refreshed after each meaningful implementation or debugging session to reflect the actual state of the codebase.
