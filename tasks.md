# EcoLith Energy Task Register

## 1. Project status summary

Current project posture: foundational implementation exists and the project has a working architecture baseline, but runtime validation and production-hardening tasks remain before final production readiness is claimed.

## 2. Active workstreams

### 1. Documentation foundation
- Status: Completed
- Scope: Create and maintain the mandatory architecture, design, memory, PRD, rules, and task documents.
- Notes: This document set is required to preserve institutional knowledge and system intent.

### 2. Public website and branding
- Status: Implemented
- Scope: Homepage, global styling, contact layout, and EcoLith branding with industrial dark design system.
- Notes: Real factory imagery is preserved as part of the public brand experience.

### 3. Product catalog and public product access
- Status: Implemented in codebase
- Scope: Product model, public routes, catalog data, SEO metadata, and product publication controls.
- Notes: Requires runtime verification to confirm data flow and UI integration.

### 4. Customer authentication and account flows
- Status: Implemented in codebase
- Scope: Signup, login, email verification, password reset, profile management, wishlist, cart, dealer application.
- Notes: Requires validation of environment configuration and secure runtime behavior.

### 5. Google OAuth integration
- Status: Implemented in codebase
- Scope: OAuth routes, account matching, verified-email checks, callback flow.
- Notes: Requires valid Google project configuration and production URL settings.

### 6. Admin content workflow
- Status: Implemented in codebase
- Scope: Product management, gallery management, review management, settings management, inquiry handling.
- Notes: Security and permission checks should be validated with runtime tests.

### 7. Security and resilience
- Status: Partially implemented and documented
- Scope: CSRF, rate limiting, input sanitization, session handling, file validation, audit logging.
- Notes: This remains a major area for runtime and security validation.

### 8. Deployment readiness
- Status: Pending validation
- Scope: production environment, MongoDB Atlas connectivity, SMTP, OAuth, CORS and secure cookie configuration.
- Notes: The project is not yet confirmed production-ready without runtime verification.

## 3. Task backlog

### High priority
- Validate the runtime environment from `.env.example` against the actual `.env` configuration.
- Confirm MongoDB connectivity and fallback behavior.
- Create and verify the initial admin account using the admin bootstrap flow.
- Validate all core customer auth flows in a live environment.
- Verify product, inquiry, gallery, and settings APIs end-to-end.
- Confirm the admin role and permission boundaries.

### Medium priority
- Test the upload validation pipeline with valid and invalid file inputs.
- Confirm email verification and password reset behavior with SMTP configuration.
- Validate the Google OAuth callback and redirect flow.
- Review and correct any business flows not yet fully wired to the UI.

### Lower priority
- Improve product and gallery search/filtering.
- Expand content and marketing sections as the business grows.
- Evaluate future checkout or order management expansion.
- Add more advanced reporting and analytics if required.

## 4. Validation checklist

A feature should be considered “done” only when:
- the environment and dependencies are correctly configured
- the route or UI flow is functionally tested
- permission checks and validation rules are confirmed
- the change remains consistent with the design and architecture rules

## 5. Notes

This task register should evolve with the project. New tasks should be added only when they are confirmed as necessary by implementation or validated business needs. Avoid adding speculative work items without clear justification.
