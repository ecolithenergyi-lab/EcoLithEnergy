# EcoLith Energy Product Requirements

## 1. Product overview

EcoLith Energy is a public brand and product-information website for a Delhi lithium battery manufacturer. It helps visitors understand the company, view real products and facility imagery, and contact the business or submit an inquiry.

## 2. Business goals

- Present a credible, premium industrial brand.
- Promote battery products using verified product details and real images.
- Make direct contact and inquiry submission easy.
- Keep the website responsive, accessible, and lightweight.

## 3. Target users and problems

Target users are prospective retail and business customers, EV operators, and dealers/distributors seeking battery information. Visitors need trustworthy product information, authentic manufacturing context, and a reliable way to reach the business.

## 4. Scope and roles

The current system is public-only. There are no logged-in user roles, customer accounts, dealer portal, staff/admin dashboard, or in-app content editor. Product/order purchase and checkout are not available. Admin and auth URLs must not expose former login or management screens.

## 5. Functional requirements

### Public website and catalog

- Present EcoLith identity, company overview, facility imagery, products, technology, and contact details.
- Display published product information including chemistry, voltage, capacity, technology, and product images.
- Provide product details and direct phone/WhatsApp inquiry actions.
- Use verified company photography and preserve product labels/logos.

### Contact inquiries

- Collect visitor name, phone, requirement, and optional contact/message details.
- Validate and sanitize input server-side.
- Apply inquiry rate limits and return a clear response.
- Make contact by phone/WhatsApp available if API submission fails.

### Public content

- Serve published reviews, gallery items, and public settings through public APIs.
- Keep SEO metadata, robots, and sitemap behavior aligned with the public site.

## 6. Acceptance criteria

### Public catalog

- Visitor can view product cards and product details without signing in.
- Public product APIs return only published products.
- Product details show available specs and product imagery.
- Product inquiry actions offer phone or WhatsApp contact.

### Inquiry submission

- Visitor can submit a valid inquiry without account creation.
- Invalid required fields receive a clear validation error.
- Valid submissions are stored and return success.
- Rate-limited submissions receive a clear response.

### Login removal

- No login/signup popup or navbar login/signup actions appear.
- Former account/admin pages are absent from the frontend output.
- `/api/auth/*`, `/api/profile`, `/api/orders`, `/api/admin/*`, and upload-management endpoints are not mounted.
- Old page aliases no longer show login/admin screens.
- Tests verify the removed routes remain unavailable.

## 7. Non-functional requirements

- Use vanilla frontend technologies, Node.js/Express, and MongoDB/Mongoose.
- Keep the site responsive, accessible, and lightweight.
- Validate untrusted API input and rate-limit public write endpoints.
- Do not expose private data or rely on UI-only security controls.

## 8. SEO, accessibility, and performance

- Provide semantic page structure, readable contrast, descriptive alt text, and visible focus states.
- Maintain canonical/structured business metadata and sitemap/robots endpoints.
- Use optimized and appropriately lazy-loaded real images.

## 9. Analytics

No analytics service is confirmed in the current application.

## 10. Testing requirements

- Run `npm test` and `npm run test-security`.
- Verify auth/admin routes return unavailable responses and old UI aliases do not display login pages.
- Verify public product, inquiry, review, gallery, and settings routes remain available.
- Validate critical paths against a running database before claiming production readiness.

## 11. Deployment requirements

- Configure `MONGODB_URI` for production.
- Configure the correct public origins in `CLIENT_URL` and `FRONTEND_URL`.
- Verify Vercel output/rewrite behavior and deployed API origins.
- Do not require session, OAuth, SMTP, or admin bootstrap secrets for the public-only app.

## 12. Future enhancements

Any future content management or authenticated capabilities require a separate explicit product decision, threat review, access-control design, and test plan. Do not reintroduce removed account/admin behavior implicitly.
