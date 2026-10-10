# EcoLith Energy Product Requirements Document

## 1. Product overview

EcoLith Energy is a lithium battery manufacturing and power solutions business serving electric mobility and related industrial energy uses. The product is a full-stack web application designed to present the company professionally, permit customer account management, support product discovery, capture leads, and provide staff tools for managing products, inquiries, image galleries, and site content.

This project is not a generic marketplace template. It is intended to represent a real Delhi manufacturing business with authentic branding, technical product information, and operational workflows aligned to the organization’s actual business model.

## 2. Business goals

- Create a premium, trustworthy public brand presence for EcoLith Energy.
- Increase customer confidence through factory imagery, product information, and premium industrial design.
- Capture and manage product inquiries and dealer interest.
- Support customer account management, including authenticated access and profile data.
- Give staff a secure internal admin tool to manage content, products, settings, and inquiries.
- Encourage conversion through direct contact, product education, and practical business communication.

## 3. Target users

### Public website users
- prospective customers
- distributors and dealers
- businesses seeking EV or battery solutions
- local and regional buyers evaluating battery products

### Customer portal users
- registered buyers
- customers wanting to manage wishlist, cart, and profile details
- users with interest in battery purchasing or business collaboration

### Admin users
- super administrators
- administrators
- editors

## 4. Customer problems

- Difficulty evaluating battery products from a real manufacturer without a clear digital presence
- Lack of trust when product information is generic or poorly presented
- Limited ability to reach the business via direct contact or inquiry workflows
- Incomplete or inconsistent operational tools for managing product and content updates
- Need for a secure and professional website that reflects an industrial, credible brand

## 5. Business requirements

- Present the EcoLith Energy brand clearly and consistently across all surfaces.
- Maintain a realistic industrial look rooted in the company’s actual visuals and positioning.
- Manage product catalog information in a structured way for public access.
- Allow staff to update public settings and media without needing developer intervention.
- Track leads and business inquiries in a structured and reviewable system.
- Maintain a secure authentication model for both customers and staff.

## 6. Functional requirements

### Public website requirements
- Show a premium homepage with product positioning and factory imagery
- Include sections for about, facility, products, technology, and contact
- Expose the company’s location and direct contact methods
- Provide a way for visitors to ask about product requirements

### Product catalogue requirements
- Store battery product information such as category, voltage, capacity, type, and warranty
- Support product publication toggles
- Allow public retrieval of published products
- Support SEO metadata per product

### Admin panel requirements
- Allow admin users to manage products, gallery items, reviews, and site settings
- Support different roles and permissions across staff users
- Maintain audit logs for key administrative actions
- Support inquiry review and status updates

### Customer account requirements
- Allow signup and login with local credentials
- Allow email verification
- Allow password reset
- Enable profile updates
- Maintain customer preferences such as cart and wishlist

### Google Sign-In requirements
- Allow customers to sign up or log in using Google accounts
- Enforce verified email requirements
- Prevent invalid or duplicate sign-up flows
- Redirect users to the correct customer journey after authentication

### Dealer registration requirements
- Allow customer users to submit dealer application information
- Store relevant business and dealer data on the user record
- Support pending, approved, and rejected states

### Enquiry management requirements
- Collect business inquiries from website visitors
- Store leads with structured status tracking
- Allow staff to update status and export data where required

### Cart and optional checkout requirements
- Support cart operations for logged-in users
- Support quantity updates and item removal
- Keep cart data associated with the customer account
- Allow future extension into order or checkout workflows

## 7. Non-functional requirements

- Use fast and lightweight frontend technology without unnecessary framework overhead.
- Keep API behavior clear and modular.
- Maintain secure handling of user data and privileged routes.
- Use MongoDB-backed persistence and server-side session management.
- Preserve visual consistency across all public and private surfaces.
- Support responsive layouts for desktop and mobile traffic.

## 8. User roles and permissions

### Customer
- Create account
- Log in and manage a profile
- Add products to wishlist/cart
- Submit dealer application
- Receive password-reset and verification emails

### Dealer / distributor
- Same as customer plus extended account state and application approval path

### Editor
- Manage products and gallery items
- Maintain content visibility within allowed scope

### Admin
- Full operational control over products, gallery, reviews, inquiries, and site settings

### Super admin
- Full access, including staff account management and audit oversight

## 9. Acceptance criteria

### Feature: Customer login
- Authenticated customer can log in with a valid email and password.
- Invalid email or password returns a clear error.
- Repeated failed attempts trigger rate limiting and account lockout behavior.
- Successful login creates a secure session and redirects to the customer dashboard.

### Feature: Google Sign-In
- User can initiate Google Sign-In from the customer flow.
- Only verified Google emails are accepted.
- A new Google signup request creates a customer account when no duplicate exists.
- A Google login request matches an existing account and does not permit account takeover.
- Invalid or inactive accounts receive a clear user-facing message.

### Feature: Email verification
- A user receives a verification email during signup or account activation.
- The verification flow validates the token and marks the account as verified.
- Unverified accounts cannot complete the full account journey without valid verification.

### Feature: Password reset
- A user can request a reset email from the forgot-password flow.
- The reset email contains a valid tokenized link.
- The reset token is accepted only within the defined time window.
- Updated password is saved securely and login continues with the new value.

### Feature: Product management
- Authorized admin can create a product with required metadata.
- Product is validated on the backend before persistence.
- Product is saved in MongoDB with correct SEO and publication metadata.
- Published products appear in the public catalog.
- Product updates are reflected in public product detail pages.
- Unauthorized users cannot modify or delete products.

### Feature: Image uploads
- Authorized admin can upload accepted image files.
- Uploads are validated for file type and size.
- Invalid or tampered files are rejected.
- Uploaded files are stored in a secure runtime upload path and can be referenced by the app.

### Feature: Inquiries
- A visitor can submit a website inquiry with required contact details.
- Inquiry is stored with meaningful status values and timestamps.
- Admin users can update inquiry status and review historical records.
- Unauthorized users cannot modify inquiry records.

### Feature: Reviews
- Published reviews are displayed in the public UI when available.
- Admin users can create, update, or remove published review entries.
- Review inputs are validated to prevent malformed content.

### Feature: Customer profiles
- Logged-in customer can view and update basic profile information.
- Account information persists to the database.
- Sensitive fields such as password hash or token data are not exposed through the API.

### Feature: Dealer application
- Authenticated customer can submit application information.
- Dealer status is stored as `PENDING`, `APPROVED`, or `REJECTED`.
- Admin review path can later update the status.
- Public and admin flows keep the data isolated from unrelated user records.

### Feature: Admin dashboard
- Staff user can log in with valid admin credentials.
- Authorized users can view dashboard information and protected sections.
- Unauthorized users are denied access.
- Audit log records admin actions for traceability.

## 10. SEO requirements

- The homepage must include structured metadata and canonical URL information.
- Product pages should include appropriate titles and descriptions.
- The backend should provide a `robots.txt` and `sitemap.xml` endpoint.
- Structured data should be included where the public marketing site supports it.
- Real business location and contact details should be present in public metadata and content.

## 11. Security requirements

- Protect every privileged API endpoint on the server.
- Never expose secrets in frontend code or public files.
- Use secure session configuration and HTTP-only cookies.
- Validate and sanitize all untrusted input.
- Enforce CSRF checks for mutation requests.
- Apply rate limits and lockout policies for auth and higher-risk endpoints.
- Validate file uploads to prevent malicious file types.
- Keep all privileged business logic server-side.

## 12. Accessibility requirements

- Ensure sufficient contrast for all text and controls.
- Support keyboard navigation for interactive UI elements.
- Provide meaningful labels for forms and actions.
- Preserve semantic page structure and focus visibility.
- Use descriptive alt text or equivalent handling for important imagery.

## 13. Performance requirements

- Keep the frontend lightweight and fast to load.
- Prefer efficient API usage and minimal unnecessary network traffic.
- Use static assets and caching where appropriate for public media.
- Optimize product and gallery loading for real-world browsing.

## 14. Analytics requirements

No analytics package is confirmed as part of the current codebase. Any analytics implementation must be approved and documented as a business requirement before being added.

## 15. Testing requirements

- Validate environment configuration and startup flows before claiming the app is working.
- Run automated tests and security validation scripts for the project baseline.
- Verify login, reset, and Google auth flows using runtime checks.
- Check admin permission boundaries and protected route behavior.
- Validate upload filtering and malformed file rejection.
- Confirm catalog and inquiry workflows against the actual database.

## 16. Deployment requirements

- Validate `.env` settings for the target environment.
- Confirm database connectivity and runtime origin configuration.
- Ensure OAuth callback URLs match the production backend URL.
- Confirm the frontend and backend origins are aligned with CORS and cookie requirements.
- Verify uploaded media storage, email sending, and protected routes in the target deployment.

## 17. Future enhancements

- Add a deeper order management and checkout flow.
- Expand catalog filtering and search.
- Introduce richer product comparison or specification tables.
- Add additional marketing pages such as service-specific landing pages.
- Add stronger analytics and business reporting if required.
- Extend review management and content moderation workflows as the business grows.

## 18. Summary

This product requirement defines a real-world manufacturer website and admin system for EcoLith Energy. The current codebase already includes the major foundational elements for product discovery, customer auth, dealer applications, inquiry handling, and content management. The project should continue to prioritize trust, operational security, and a premium industrial brand presence before adding further complexity or feature expansion.
