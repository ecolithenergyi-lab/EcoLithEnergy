# EcoLith Energy Development Rules

## RULE 1 — TECHNOLOGY

- Use HTML5, CSS3, and vanilla JavaScript for the frontend.
- Use Node.js and Express for the backend.
- Use MongoDB and Mongoose for persistence.
- Do not introduce a major framework without an explicit project decision.

## RULE 2 — CODE QUALITY

- Keep code modular, readable, and maintainable.
- Separate routes, controllers, services, models, validation, and middleware.
- Avoid unnecessary dependencies and duplicated logic.

## RULE 3 — BRAND AND DESIGN

- Follow `design.md` for UI changes.
- Use the EcoLith palette and real company images.
- Do not replace original battery labels, logos, or factory photography.

## RULE 4 — SECURITY

- Never expose secrets in frontend code.
- Validate and sanitize untrusted input on the server.
- Keep public write endpoints rate-limited.
- Do not add privileged routes without server-side authorization.
- The current app intentionally has no login/session/admin system; do not expose former protected functionality without an explicit decision and a secure replacement.

## RULE 5 — DOCUMENTATION

- Keep `Architecture.md`, `design.md`, `memory.md`, `prd.md`, `rules.md`, and `tasks.md` accurate as the project evolves.
- Record only verified facts and distinguish implemented behavior from pending validation.

## RULE 6 — ENVIRONMENT SAFETY

- Keep private runtime configuration in `.env`.
- Use `.env.example` for current required variable names.
- Never commit secrets, tokens, database credentials, or private keys.

## RULE 7 — FEATURE DISCIPLINE

- Do not describe planned functionality as existing.
- Do not restore customer or admin login flows without explicit approval.
