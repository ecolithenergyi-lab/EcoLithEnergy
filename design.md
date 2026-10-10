# EcoLith Energy Design System

## Brand

- Name: EcoLith Energy / इकोलिथ एनर्जी
- Tagline: Powering a Greener Tomorrow
- Brand character: premium, credible, industrial, and grounded in the real manufacturing business

## Color palette

- Primary green: `#8BD400`
- Deep black: `#050505`
- Charcoal: `#101310`
- White: `#FFFFFF`
- Neutral grey: `#A9ADA9`

The current CSS also uses dark surfaces, a darker green accent, translucent borders, and restrained shadows. Preserve the existing CSS tokens when extending the system.

## Typography and hierarchy

- Display/headlines: Barlow Condensed, bold, usually uppercase
- Body and interface: Inter with system sans-serif fallbacks
- Hero headings: responsive, large, high-impact
- Section headings: condensed uppercase with clear spacing
- Body text: readable, moderate line length, generous line height
- Eyebrows: small uppercase labels with increased tracking

## Layout and responsive behavior

- Centered content container with a maximum width around 1200px
- Generous vertical spacing between major marketing sections
- Mobile-first stacking for narrow screens, multi-column layouts at wider sizes
- Breakpoints and responsive details follow `frontend/style.css`
- Mobile navigation uses an accessible hamburger control and slide-in menu

## Components and interaction

- Primary action: EcoLith green fill with dark text
- Secondary action: outlined dark-surface button
- Low-emphasis action: ghost button
- Inputs: dark surfaces, readable labels, visible borders and keyboard focus
- Product cards: technical product specs and genuine product image, with product details and inquiry actions
- Product detail modal: focus on description/specifications, WhatsApp, and phone contact
- Notifications: concise success/error messages with accessible live-region behavior
- Loading, empty, and error states should be clear and should not block direct contact options
- Hover and focus states should be visible; animations should be brief and purposeful

## Navigation and footer

The public navigation contains Home, About, Facility, Products, Technology, and Contact. Customer login/signup and account actions are not part of the current product.

The footer prioritizes company identity, public section links, location, phone, email, and social/contact channels. Do not add links to disabled admin or customer-account pages.

## Image guidance

Use only real EcoLith factory photographs, original battery imagery, and verified company logos already in the project. Preserve battery labels and company marks. Never invent company assets or substitute generic AI-generated factory/product imagery.

- Hero: wide facility image with legible overlay text
- Facility gallery: consistent editorial crop while retaining the real scene
- Product cards: clear, product-first framing

## Accessibility

- Use semantic landmarks and descriptive image alt text
- Maintain strong contrast on the dark palette
- Ensure keyboard focus is visible
- Label forms and controls clearly
- Respect reduced-motion preferences when adding motion

## Theme policy

The existing public site uses a dark industrial theme. No light theme is implemented or planned by this document.
