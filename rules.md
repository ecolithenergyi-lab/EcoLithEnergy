# EcoLith Energy Project Rules

## RULE 1 — TECHNOLOGY

- Use HTML5, CSS3 and vanilla JavaScript for the frontend.
- Use Node.js and Express for the backend.
- Use MongoDB and Mongoose for persistence.
- Do not introduce React, Tailwind or another major framework without an explicit project decision.

## RULE 2 — CODE QUALITY

- Use modular, readable and maintainable code.
- Separate routes, controllers, services, models, validation and middleware.
- Avoid duplicate code and unnecessary dependencies.
- Keep each domain boundary clear and consistent with the current backend structure.

## RULE 3 — DESIGN CONSISTENCY

- Follow `design.md` for all UI changes.
- Use EcoLith brand colors and genuine company images.
- Do not replace original battery labels, logos or factory photographs.
- Maintain consistent design patterns across public, customer, and admin interfaces.

## RULE 4 — SECURITY

- Never expose secrets in frontend code.
- Never store plaintext passwords.
- Never trust client-side authorization or pricing.
- Protect every privileged API endpoint on the server.
- Validate and sanitize untrusted input.
- Use secure sessions, CSRF protection where applicable, rate limiting and appropriate security headers.

## RULE 5 — DOCUMENTATION

- Keep `Architecture.md`, `design.md`, `memory.md`, `prd.md`, `rules.md`, and `tasks.md` updated as the project evolves.
- Treat the architecture and product documents as sources of truth for design and implementation decisions.
- Record only verified project facts in project memory.

## RULE 6 — ENVIRONMENT SAFETY

- Keep private runtime configuration in `.env` and never store vulnerable values in source-controlled documentation.
- Use `.env.example` as the reference for required variables and naming conventions.
- Never commit real secrets, tokens, database credentials, or private keys.

## RULE 7 — FEATURE DISCIPLINE

- Do not describe planned functionality as an existing capability.
- Distinguish clearly between implemented, partially implemented, blocked, and pending work.
- Favor real, tested behavior over speculative assumptions.
