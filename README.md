# EcoLith Energy — Full-Stack Lithium Battery Manufacturing Web Application & Admin Control Panel

A production-ready full-stack application built for **EcoLith Energy** (Delhi, India) to manage lithium battery products (LFP & NMC), customer inquiries, Google reviews, facility/workshop photography, dynamic site branding, staff roles, and security audit logs.

Preserves the real Delhi manufacturing facility photographs, authentic battery specifications, and dark green industrial visual identity.

---

## ⚡ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (Modern ES6+, Semantic & Accessible, Zero External Bloatware)
- **Backend**: Node.js, Express.js (RESTful Architecture)
- **Database**: MongoDB with Mongoose ODM (MongoDB Atlas in Production, Automated Embedded Fallback for Local Dev)
- **Authentication**: Stateful Server-Side Sessions with `connect-mongo` session store and `bcryptjs` hashing (12 salt rounds)
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
├── client/                     # Public customer website
│   ├── index.html              # Public homepage with SEO & schema metadata
│   ├── style.css               # EcoLith brand design system
│   ├── script.js               # API-driven dynamic frontend logic
│   └── images/                 # Real preserved photographs (factory & batteries)
│       ├── factory-1.png       # Real battery assembly workstation
│       ├── factory-2.png       # Real testing and production area
│       ├── NMC-60V32AH.jpeg    # Real NMC 60V 32AH battery pack
│       ├── 48-30 battry.jpeg   # Real 48V 30AH LFP battery pack
│       ├── 60-30 lfp.jpeg      # Real 60V 30AH LFP battery pack
│       └── quality.jpeg        # Real quality testing inspection
│
├── admin/                      # Secure Staff Admin Panel
│   ├── index.html              # Admin SPA dashboard & login views
│   ├── admin.css               # Dark theme with EcoLith green accents
│   └── admin.js                # Admin CRUD operations, uploads & analytics
│
├── server/                     # Backend Node.js / Express
│   ├── src/
│   │   ├── app.js              # Express app configuration & middleware
│   │   ├── server.js           # Server entry point & graceful shutdown
│   │   ├── config/
│   │   │   ├── env.js          # Environment variable parser
│   │   │   └── database.js     # MongoDB connection with dev fallback
│   │   ├── models/             # Mongoose Schemas
│   │   │   ├── Admin.js        # Staff users & credentials
│   │   │   ├── Product.js      # LFP & NMC battery catalog
│   │   │   ├── Review.js       # Customer ratings & reviews
│   │   │   ├── Inquiry.js      # Contact form submissions & CRM status
│   │   │   ├── Gallery.js      # Factory workshop photographs
│   │   │   ├── SiteSettings.js # Editable company info & phones
│   │   │   └── AuditLog.js     # Admin security audit records
│   │   ├── routes/             # Express API routes
│   │   ├── controllers/        # Business logic controllers
│   │   ├── middleware/         # Security, auth, CSRF, upload & error handlers
│   │   ├── services/           # WhatsApp generator, upload management
│   │   ├── utils/              # Structured logging, sanitization & responses
│   │   ├── validators/         # Zod schemas for all endpoints
│   │   └── scripts/
│   │       ├── createAdmin.js  # CLI SuperAdmin generation script
│   │       ├── seed.js         # Initial database seeding script
│   │       └── testSecurity.js # Automated 20-point security test suite
│   └── uploads/                # Directory for newly uploaded images
│
├── .env.example                # Environment variables template
├── package.json                # Project dependencies & scripts
└── README.md                   # Full documentation
```

---

## 🚀 Step-by-Step Deployment & Setup Guide

### 1. Install Node.js
Ensure Node.js (version 18.0.0 or higher) is installed:
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
- `SESSION_SECRET`: A strong random 64-character secret
- `PORT`: Preferred port (e.g., 5000)
- `CLIENT_URL`: URL of your site (e.g., `https://ecolithenergy.com`)
- `DEFAULT_ADMIN_EMAIL`: Initial admin email
- `DEFAULT_ADMIN_PASSWORD`: Initial admin password

### 5. Create First SuperAdmin
Run the secure CLI command:
```bash
npm run create-admin
```
Follow the interactive prompts or allow it to bootstrap using credentials defined in `.env`.

### 6. Start the Server
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

### 7. Run Automated Security Test Suite
Verify your installation against all 20 security tests:
```bash
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