---
name: ui-polish
description: Repository-scoped UI polish workflow for frontend app screens. Use when Codex is asked to improve, refine, audit, or finish UI/UX quality, responsive behavior, visual hierarchy, interaction states, accessibility, or product polish without changing the product scope.
---

# UI Polish

Polish the existing product experience with empathy and restraint. Preserve the app's framework, design system, domain tone, and established component patterns before adding anything new.

## Workflow

1. Read the relevant screens, components, styles, and local design guidance before editing.
2. Identify the user's target audience and primary workflow; prioritize the first screen and common tasks.
3. Make scoped UI changes that improve clarity, density, hierarchy, responsiveness, and accessibility.
4. Verify desktop and mobile layouts with real rendering when the app supports it; check for blank states, overlaps, clipping, unreadable text, broken assets, and awkward focus states.
5. Run the repo's relevant formatting, linting, type, test, and build checks.

## Polish Rules

- Build the actual usable experience, not a marketing page, unless the user explicitly asks for one.
- Keep operational tools quiet, structured, and scan-friendly; avoid decorative clutter and oversized hero treatment inside app workflows.
- Use the repo's existing colors, typography, spacing, radii, components, and icon library.
- Use cards only for repeated items, modals, and framed tools; do not nest cards inside cards.
- Prefer familiar icons for compact controls, paired with accessible names or tooltips when meaning is not obvious.
- Match controls to data: segmented controls for modes, toggles or checkboxes for booleans, inputs for text/numbers, tabs for views, and buttons only for clear commands.
- Keep text inside containers at all supported viewport widths; use stable dimensions for fixed-format boards, toolbars, tiles, and counters.
- Do not rely on color alone for status, risk, validation, or progress.
- Avoid one-note palettes, heavy gradients, decorative orbs, dark themes unless already established, and childish gamification.
- Keep copy practical, direct, and non-prescriptive; do not invent unsupported claims.

## Accessibility And Verification

- Preserve semantic HTML, labels, keyboard navigation, visible focus, and route/page titles.
- Respect reduced motion and avoid layout shifts from hover, loading, or dynamic content.
- Test at mobile, tablet, and desktop breakpoints when changing layout.
- If visual verification is not possible, state what was checked and what remains unverified.
