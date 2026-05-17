---
phase: 1
title: "Add scroll-behavior to CSS"
status: complete
priority: P3
effort: "5m"
dependencies: []
---

# Phase 1: Add scroll-behavior to CSS

## Overview

Add `scroll-behavior: smooth` to the `html` selector in `globals.css` so every `href="#identifier"` anchor link animates instead of jumping. Disable it for users who prefer reduced motion.

## Requirements

- Functional:
  - All `href="#section-id"` links (nav, hero stat boxes, footer links) scroll smoothly
  - No JS required — pure CSS
- Non-functional:
  - Must respect `prefers-reduced-motion: reduce` — set `scroll-behavior: auto` inside the media query
  - No `scroll-padding-top` needed: the dock nav is fixed to the **bottom**, not the top

## Architecture

Single CSS change in `@layer base` of `app/globals.css`.

```css
/* inside @layer base — add after the * { @apply border-border; } block */
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

Why `html` and not `body`: `scroll-behavior` must be on the scrolling container. In most browsers the root scroll container is `html`. Setting it on `body` only works in some browsers and is unreliable.

## Related Code Files

- Modify: `app/globals.css`

## Implementation Steps

1. Open `app/globals.css`.
2. Inside `@layer base`, after the `* { @apply border-border; }` rule, add:
   ```css
   html {
     scroll-behavior: smooth;
   }
   ```
3. After `body { ... }` block (or anywhere in `@layer base`), add:
   ```css
   @media (prefers-reduced-motion: reduce) {
     html {
       scroll-behavior: auto;
     }
   }
   ```
4. Run `npx tsc --noEmit` (no-op for CSS, but confirms no collateral breakage).
5. Verify in browser: click any `#contact`, `#projects`, `#skills`, `#credentials`, `#about`, `#experience`, `#social` link — page scrolls smoothly.

## Success Criteria

- [x] `scroll-behavior: smooth` present on `html` in `globals.css`
- [x] `@media (prefers-reduced-motion: reduce)` block resets to `auto`
- [ ] Hash-link clicks animate in browser (dev server test)
- [x] No TypeScript errors (`npx tsc --noEmit` clean)

## Verification

- Confirmed `app/globals.css` contains the root `html` smooth-scroll rule and the reduced-motion override.
- Ran `npx tsc --noEmit` successfully.
- Browser click verification was not run in this documentation update.

## Risk Assessment

- **Zero risk** — additive CSS only, no JS, no component changes
- No impact on layout, paint performance, or existing animations
- `prefers-reduced-motion` guard satisfies WCAG 2.1 SC 2.3.3
