# EcoLith Energy Design System

## 1. Brand identity

### Brand names
- EcoLith Energy
- इकोलिथ एनर्जी
- Tagline: Powering a Greener Tomorrow

### Brand intent
The brand should feel premium, industrial, credible, and future-focused. The visual system is designed to communicate trust in high-performance battery manufacturing while remaining practical and authentic to a real Delhi-based energy company.

The design should never feel generic, template-like, or AI-generated. It is intended to preserve and elevate the genuine factory photography, real product imagery, and original battery labeling already present in the codebase.

## 2. Design language

The website is grounded in a dark industrial palette, sharp typography, and confident contrast. The visual system is built to feel like a serious energy and manufacturing brand rather than a consumer startup template.

### Core palette
- Primary green: `#8BD400`
- Deep black: `#050505`
- Charcoal: `#101310`
- White: `#FFFFFF`
- Neutral grey: `#A9ADA9`

### Supporting tokens in the current implementation
- Green dark accent: `#5F9800`
- Dark surface: `#0B0D0C`
- Dark card: `#121513`
- Border: `rgba(255,255,255,0.10)`
- Shadow values: soft, medium, and large depth treatments for cards and hero overlays

## 3. Typography system

### Font families
- Primary UI: `Inter`
- Display / headline: `Barlow Condensed`

### Type hierarchy
- Hero title: large, uppercase, condensed, high-impact headline
- Section headings: uppercase with strong letter spacing
- Body copy: clean sans-serif with comfortable line-height for readability
- Eyebrows: compact uppercase labels with high tracking for classification

### Relationship to the brand
The combination of `Barlow Condensed` and `Inter` gives the project a strong industrial pitch while keeping the interface usable for product information, forms, and admin actions.

## 4. Layout and spacing

The design uses a clear content rhythm based on a centered container and generous section spacing.

### Current spacing principles
- Max content width: approximately 1200px
- Section padding: large vertical rhythm for premium landing-page sections
- Cards and panels: consistent corner radius and soft depth
- Buttons and controls: rounded to feel modern but business-appropriate

### Radius values
- Small radius: `8px`
- Standard radius: `14px`
- Large radius: `22px`
- Pills / CTA buttons: fully rounded pills for major calls to action

## 5. Buttons

### Primary button
- Solid green background
- Deep black text
- Strong hover state with darker green and subtle lift

### Secondary / outline button
- Transparent dark background with white border
- Green hover focus color
- Used for secondary CTA and less urgent interactions

### Ghost button
- Minimal styling for low-emphasis nav or utility actions

### Interaction rules
- Buttons should always have visible hover and focus states
- Buttons need to be readable on dark backgrounds
- Frequently used CTAs should retain the green brand color as the main action accent

## 6. Form inputs

Form elements should follow a dark theme with visible border separation and clear contrast.

### Inputs
- Dark field backgrounds
- Subtle border or transparent border with strong focus ring
- Legible body text
- Clear error states with high contrast

### Labels
- Clear and concise
- Prefer uppercase or compact label treatment only when the layout supports it

### Validation states
- Error states should be unmistakable and align with the industrial dark theme
- Required fields should be visually clear without clutter

## 7. Product cards

Product cards should feel robust and technical rather than decorative.

### Intent
- Highlight product category, technology, voltage, and capacity
- Maintain premium visual weight without becoming too busy
- Use product imagery as the primary visual anchor

### Best practices
- Product cards should support clear CTAs such as “View Details” or “Request Quote”
- Descriptions should remain concise and technical
- Show real battery photographs or product shots where possible

## 8. Navigation

### Top-level navigation
The main navigation uses uppercase labels with subtle green hover states and an animated underline.

### Mobile navigation
The hamburger menu should collapse navigation into a compact mobile panel with an accessible toggle.

### Customer navigation actions
Customer and guest actions should be clearly separated from the main business navigation, especially on the public site.

## 9. Footer

The footer should remain aligned with the industrial brand and include:
- company identity
- contact details
- location
- quick links
- social or WhatsApp link entry points

The footer should remain low-noise and practical, supporting trust and contact conversion rather than excessive decoration.

## 10. Dashboards and admin panels

### Admin dashboard
- Dark technical UI with green accents for operational states
- Clear separation between metrics, content panels, and actions
- Strong hierarchy for data-heavy tables and approval workflows

### Customer dashboard
- Clear account summary and quick navigation
- Product and account actions should remain readable on dark surfaces
- Forms and details should be easy to scan on mobile and desktop

## 11. Login and signup pages

These pages should feel secure and direct.

### Requirements
- Clear brand framing and hierarchy
- Strong trust cues for user authentication
- Consistent button patterns and field styling
- Error feedback should be easy to understand
- Google Sign-In should be presented as a primary or secondary pathway without visually overpowering the local account flow

## 12. Modals and notifications

### Modals
- Keep a strong border or shadow depth to maintain premium weight
- Use centered or focused modal patterns for account actions and confirmations

### Notifications
- Use color contrast to signal success, error, and attention states
- Avoid noisy or exaggerated animation
- Keep them concise and task-oriented

## 13. Photography and real assets

The site must use the real EcoLith factory photographs and original battery images already present in the project.

### Rules
- Do not replace original battery labels, company branding, or factory photos with generic AI images
- Do not invent company assets that do not exist in the repository
- Use manufacturer and facility imagery to reinforce legitimacy and trust
- Keep image treatments consistent across the homepage, gallery, product pages, and about section

### Aspect ratio guidance
- Hero imagery: wide cinematic format
- Facility gallery: balanced editorial grid with consistent framing
- Product imagery: product-first images, visually clean and clear

## 14. Responsive behavior

### Breakpoints
The current implementation follows a practical mobile-first responsive system.

Recommended approach:
- mobile-first foundations
- stacked content at narrow widths
- two-column layouts for mid and desktop widths
- compact nav interaction on smaller screens

### Mobile navigation
- Hamburger menu is the preferred system
- Keep actions visible and easy to reach on mobile
- Prioritize contact and CTA actions over decorative content

## 15. Loading, empty, and error states

### Loading states
- Use subtle progress or skeleton-like patterns for content that is fetched from the API
- Keep the loading state aligned with the dark industrial design

### Empty states
- Empty product catalogs, galleries, or customer account areas should explain the absence clearly and suggest the next action

### Error states
- Errors should be easy to read, especially on forms and secure flows
- Keep them direct and actionable without excessive jargon

## 16. Accessibility requirements

The system should meet a modern accessibility bar for a real commercial product.

### Requirements
- Color contrast should remain readable at all sizes
- Focus styles must be visible for keyboard users
- Semantic landmarks should be used for navigation, main content, and sections
- Buttons, links, and form fields should have clear labels
- Imagery should include descriptive alt text where relevant

## 17. Hover, focus, and motion rules

### Hover states
- Buttons and interactive links should subtly elevate or shift color
- Navigation should highlight with green accent states

### Focus states
- Focus outlines should be obvious and visible against dark surfaces
- Input states should remain consistent across forms

### Motion
- Keep motion purposeful and brief
- Use subtle animation on section reveals, hover feedback, and loading effects
- Avoid distracting or heavy animation on critical business flows

## 18. Dark/light theme policy

The current design is built around a dark default theme. A light theme is not specified or required by the codebase at this time. Future work should preserve the brand’s dark industrial identity unless a clearly approved design decision introduces an alternate theme system.

## 19. Implementation rules for the real brand

This project must keep the genuine EcoLith brand identity consistent across every public page, admin page, and customer page.

### Do this
- Preserve the EcoLith green, black, and charcoal palette
- Use real factory photography and product images already included in the project
- Maintain a consistent visual rhythm and spacing system
- Keep the homepage, admin pages, and customer pages visually aligned with the same design language

### Do not do this
- Do not replace the brand with a generic battery e-commerce template
- Do not invent unsupported product imagery or fictional manufacturing pictures
- Do not use generic AI-generated assets as the primary brand visuals

## 20. Design governance

This document should be treated as the design source of truth for future UI work. Any new page, workflow, or layout change should remain consistent with:
- the EcoLith palette
- the real photographic assets already present in the project
- the dark industrial visual language
- the accessibility and interaction standards in this document

When changing the UI, designers and developers should preserve the premium industrial identity rather than introducing unrelated visual trends.
