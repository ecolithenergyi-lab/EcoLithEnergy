# EcoLith Energy Task Register

## Current status

The app is a public marketing/catalog website with a public inquiry API. Customer/staff authentication, accounts, admin panel, admin APIs, uploads management, and checkout/order routes have been removed.

## Completed

- Removed login/signup popup and customer login/signup navigation.
- Removed customer account, password recovery, and staff admin frontend pages.
- Removed auth/admin backend route mounts and dedicated auth modules.
- Removed session, OAuth, password-hashing, email-auth, and upload-only dependencies.
- Removed the initial-admin bootstrap requirement and auth-only environment template variables.
- Added tests for unavailable auth/admin paths.
- Kept public catalog, inquiry, gallery, review, and settings routes.
- Kept serving existing uploaded media paths for compatibility.

## Follow-up validation

- Run `npm test`.
- Run `npm run test-security`.
- Start the local server and verify `/`, public catalog, and inquiry behavior.
- Confirm Vercel deployment routes fall back to the public homepage after deployment.
- Confirm MongoDB connectivity and production origin settings.

## Deferred decisions

- Whether content management should be replaced by a separately protected workflow.
- Whether legacy account/admin database collections should be archived or deleted. They are not used or deleted by the current application.
- Whether new media-upload capability is needed; current upload management is disabled.

## Completion rule

Mark a task done only after code changes and relevant behavior are tested. Do not claim production readiness based on local tests alone.
