# EcoLith Energy — Full-Stack Lithium Battery Manufacturing Web Application & Admin Control Panel

A production-ready full-stack application built for **EcoLith Energy** (Delhi, India) to manage lithium battery products (LFP & NMC), customer inquiries, Google reviews, facility/workshop photography, dynamic site branding, staff roles, and security audit logs.

Preserves the real Delhi manufacturing facility photographs, authentic battery specifications, and dark green industrial visual identity.

---

## ⚡ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (Modern ES6+, Semantic & Accessible, Zero External Bloatware)
- **Backend**: Node.js, Express.js (RESTful Architecture)
- **Database**: MongoDB with Mongoose ODM (MongoDB Atlas in Production, Automated Embedded Fallback for Local Dev)
- **Authentication**: MongoDB-backed sessions, Passport.js Google OAuth, and `bcryptjs` password hashing (12 salt rounds)
- **Security**:
  - Helmet HTTP Security Headers
  - CORS Allowlisting
  - CSRF Double-Submit Token & Header Verification
  - Multi-tiered Rate Limiting (`express-rate-limit`) with Brute-Force Account Lockout
  - Input Sanitization & Deep NoSQL Injection Protection
  - Magic Byte / File Signature Validation on Uploads
  - Role-Based Access Control (RBAC: `SUPER_ADMIN`, `ADMIN`, `EDITOR`)
  - Full Admin Audit Trails

---

## 📁 Project Architecture

```
web/
├── frontend/
│   ├── index.html              # Public homepage served at /
│   ├── style.css               # Homepage styles
│   ├── script.js               # Homepage interactions and API calls
│   ├── images/                 # Homepage images
│   ├── client/                 # Customer authentication, account pages and assets
│   └── admin/                  # Staff admin panel
│
├── backend/                    # Backend Node.js / Express
│   ├── src/
│   │   ├── app.js              # Express app configuration & middleware
│   │   ├── server.js           # Server entry point & graceful shutdown
│   │   ├── config/             # Environment and database configuration
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express API routes
│   │   ├── controllers/        # Business logic controllers
│   │   ├── middleware/         # Security, auth, CSRF, upload & error handlers
│   │   ├── services/           # Upload and messaging services
│   │   ├── utils/              # Logging, sanitization and response helpers
│   │   ├── validators/         # Zod request schemas
│   │   └── scripts/             # Admin, seed and security test commands
│   └── uploads/                # Runtime uploads (not committed)
│
├── .env                        # Private root environment configuration
├── package.json                # Root dependencies and scripts
├── vercel.json                 # Root Vercel SPA routing configuration
└── README.md                   # Project documentation
```

The Express app serves the public homepage from `frontend/`, customer pages from
`frontend/client/`, and the staff dashboard from `frontend/admin/`. Keep root
configuration files, including `.env` and `package.json`, at the project root.

---

## 🚀 Step-by-Step Deployment & Setup Guide

### 1. Install Node.js
Ensure Node.js (version 20.0.0 or higher) is installed:
```bash
node -v
npm -v
```

### 2. Install Dependencies
In the root directory, install all required dependencies:
```bash
npm install
```

### 3. Create MongoDB Atlas Database (Production)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free or dedicated cluster.
2. Under **Database Access**, create a user with read/write permissions.
3. Under **Network Access**, add your server's IP address (or `0.0.0.0/0` with secure password).
4. Under **Clusters > Connect > Drivers**, copy your connection string:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/ecolith_energy?retryWrites=true&w=majority`

*(Note: During local development, if MongoDB is not running locally, the server automatically boots an embedded in-memory MongoDB instance for frictionless development!)*

### 4. Configure `.env`
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update configuration values in `.env`:
- `MONGODB_URI`: Your MongoDB Atlas URI
- `SESSION_SECRET`: A unique random secret of at least 32 characters; the server refuses to start without it
- `PORT`: Preferred port (e.g., 5000)
- `CLIENT_URL` and `FRONTEND_URL`: Exact public frontend origin(s), including scheme but no path (e.g., `https://ecolithenergy.com`). Both are allowed by the API's credentialed CORS policy. For local development with the frontend on port 3000, set both to `http://localhost:3000`.
- `API_URL`: Public backend origin (used to construct the Google OAuth callback URL)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: OAuth credentials from Google Cloud Console
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`: SMTP settings used to deliver password-reset links

The deployed frontend JavaScript sends API requests to `https://api.ecolithenergy.com`. Serve the frontend over HTTPS on the EcoLith domain (for example, `https://ecolithenergy.com`) so the API subdomain session cookie can be sent with credentialed requests. The API exposes its CSRF token in the `X-CSRF-Token` response header; keep the frontend origins above configured exactly to allow the browser to read it.

### 5. Configure Google OAuth
1. In Google Cloud Console, create or select a project and configure the OAuth consent screen.
2. Create an OAuth 2.0 Client ID with application type **Web application**.
3. Add the backend callback URL to **Authorized redirect URIs**:
   - Local: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://api.ecolithenergy.com/api/auth/google/callback`
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the root `.env`, and set `API_URL` to the backend origin and `CLIENT_URL`/`FRONTEND_URL` to the frontend origin. Locally, use `API_URL=http://localhost:5000` and `CLIENT_URL=http://localhost:3000`; if `FRONTEND_URL` is omitted, it now falls back to `CLIENT_URL`.
5. Restart the backend. The customer signup page then offers **Sign up with Google**. Google must return a verified email. The signup flow refuses to link an existing account; existing Google accounts can use **Continue with Google** on the login page.

### 6. Create the First SuperAdmin
The server does not create an administrator automatically. Configure explicit one-time bootstrap credentials in `.env` or enter them in the interactive prompt, then run:
```bash
npm run create-admin
```

### 7. Start the Server
- For local development with live reload:
  ```bash
  npm run dev
  ```
- For production:
  ```bash
  npm start
  ```
Once started:
- **Public Website**: `http://localhost:5000`
- **Staff Admin Dashboard**: `http://localhost:5000/admin`
- **API Base**: `http://localhost:5000/api`

### 8. Run Automated Tests
Verify your installation against all 20 security tests:
```bash
npm test
npm run test-security
```

---

## 🔒 Security Architecture

1. **Session & Cookie Security**:
   - Stored in MongoDB using `connect-mongo`.
   - `HttpOnly: true` (prevents XSS access to session IDs).
   - `SameSite: Lax` with `Secure: true` in production.
   - Session regeneration on login to prevent session fixation.

2. **CSRF Protection**:
   - Double-submit session tokens with `x-csrf-token` header verification on all mutating requests (`POST`, `PUT`, `DELETE`, `PATCH`).

3. **Rate Limiting & Lockout**:
   - API endpoints restricted to 200 requests / 15 minutes per IP.
   - Inquiries form limited to 15 submissions / hour per IP.
   - Staff login limited to 10 attempts / 15 minutes; 5 consecutive failed passwords triggers a 15-minute account lock.

4. **File Upload Security**:
   - Whitelist allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`.
   - Verification of Magic Bytes / file signatures before saving.
   - Rejection of spoofed files containing executable code or scripts.
   - 5MB maximum file limit.
   - Filenames randomized and sanitized (`timestamp-uuid.ext`).

5. **Input Sanitization & NoSQL Injection Protection**:
   - Deep recursive sanitization of `req.body`, `req.query`, and `req.params`.
   - Removal of `$`-prefixed MongoDB operator keys.
   - HTML/script tag neutralization to prevent XSS.
6. **Password Reset & Session Revocation**:
   - Password-reset tokens are SHA-256 hashed in MongoDB and delivered by SMTP, never included in API responses.
   - Password resets and password changes increment an authentication version, invalidating sessions issued before the change.
   - Customer credentials are held in HttpOnly server-side session cookies rather than localStorage bearer tokens.

---

## 🛡️ Role-Based Access Control (RBAC)

| Permission / Section | SUPER_ADMIN | ADMIN | EDITOR |
|---|:---:|:---:|:---:|
| View Dashboard Analytics | ✅ | ✅ | ✅ |
| Products CRUD & Publishing | ✅ | ✅ | ✅ |
| Facility Gallery Management | ✅ | ✅ | ✅ |
| Customer Reviews CRUD | ✅ | ✅ | ✅ |
| Customer Enquiries Management | ✅ | ✅ | ❌ |
| CSV Export of Enquiries | ✅ | ✅ | ❌ |
| Site Branding & Settings | ✅ | ✅ | ❌ |
| View Security Audit Logs | ✅ | ✅ | ❌ |
| Create / Manage Staff Accounts | ✅ | ❌ | ❌ |

---

## 💾 Backup & Data Safety

1. **MongoDB Atlas Automatic Backups**:
   - Enable continuous cloud backups in MongoDB Atlas under the **Backup** tab.
   - Point-in-time recovery is supported for any timestamp within the retention window.

2. **Manual Database Backup**:
   Use `mongodump`:
   ```bash
   mongodump --uri="<MONGODB_URI>" --out=./backups/$(date +%F)
   ```
   To restore:
   ```bash
   mongorestore --uri="<MONGODB_URI>" ./backups/<DATE>/
   ```

3. **Uploaded Images Backup**:
   - Archive the `server/uploads/` directory on a periodic schedule:
   ```bash
   tar -czvf uploads-backup-$(date +%F).tar.gz server/uploads/
   ```

---

## 🏢 Business Profile

- **Company**: EcoLith Energy
- **Tagline**: Powering a Greener Tomorrow
- **Address**: Ground Floor, Khasra Number 15, 24, Gali No. 5, Near Shani Mandir, Samaipur, Swaroop Nagar Extension, Delhi – 110042
- **Phone**: 8595581248 / 9315111248
- **Email**: ecolithenergyi@gmail.com
- **WhatsApp**: +91-8595581248
#   E c o L i t h E n e r g y  
 