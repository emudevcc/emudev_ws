---
phase: 3
title: "Accessibility + SEO + bfcache"
status: completed
priority: P1
effort: "1h"
dependencies: []
---

# Phase 3: Accessibility + SEO + bfcache

## Overview
Fix four Lighthouse audit failures: crawlable links (DockNav uses `<button>` not `<a>`), touch target sizes (LangThemeToggle + filter buttons are 32px), color contrast (fg-4 at 40% opacity is borderline), and prohibited ARIA attributes. Investigate the bfcache prevention flag.

## Requirements
- Functional: DockNav hash links indexable by Googlebot; all interactive elements ≥44px touch target; no accessibility violations in Lighthouse
- Non-functional: Lighthouse accessibility score ≥ 90; SEO audit passes

## Architecture

### Links crawlable — DockNav
DockNav renders `<button type="button" onClick={goTo}>` for section navigation. Googlebot can execute JavaScript but `<button>` elements without `href` are not treated as crawlable links.

Fix: Convert DockNav items to `<a href="#section-id">` with JavaScript interception for smooth scroll. Keep the same visual output.

```tsx
// components/ui/dock-nav.tsx
// Before:
<button type="button" onClick={() => goTo(id)}>

// After:
<a
  href={`/${locale}#${id}`}
  onClick={(e) => { e.preventDefault(); goTo(id) }}
  aria-label={label}
>
```

`goTo()` already does smooth scroll + `history.replaceState`. The `preventDefault()` stops hard navigation; the `href` gives Googlebot a crawlable target.

### Touch targets
Two components have 32px interactive elements:

**LangThemeToggle** (`components/ui/lang-theme-toggle.tsx`)
- Current: `size-8` (32px × 32px)
- Fix: `size-10` (40px × 40px) — fits within the header without layout shift
- Alternative if 40px breaks layout: add `p-1 -m-1` to extend hit area without changing visual size

**TagFilter** / filter buttons (`components/ui/tag-filter.tsx`)
- Current: `h-8` (32px height)
- Fix: `h-10` (40px) or `py-2.5` to reach ~44px

### Color contrast
`--fg-4` is defined as `rgba(255, 255, 255, 0.40)` in dark mode. At ~5.1:1 on `#0f0f10` it clears WCAG AA (4.5:1) but only barely. Lighthouse may still flag it if measured against slightly lighter surface backgrounds.

Fix: Raise to `rgba(255, 255, 255, 0.45)` (~5.8:1 on canvas) — barely visible perceptual change.

In light mode, verify `--fg-4: rgba(0, 0, 0, 0.40)` on `#ffffff` (~10:1) — already compliant.

### ARIA prohibited attributes
Scout found comprehensive ARIA coverage. The most likely Lighthouse flag is one of:
- `aria-label` on a non-interactive element (e.g., a `<div>` or `<span>` without a `role`)
- `aria-hidden="true"` on a focusable element (would trap keyboard users)
- `aria-expanded` on an element that isn't a disclosure widget

Run `npx axe-core` or use Chrome DevTools Accessibility panel to identify the exact element Lighthouse flags. The AI chat widget's `aria-modal="true"` is valid only if the container has `role="dialog"` — verify this.

Audit checklist:
- `components/ui/ai-chat-widget.tsx` — confirm `role="dialog"` on the `aria-modal` container
- `components/ui/hero-background.tsx` — confirm `aria-hidden` is on a non-focusable element
- Any `aria-label` on `<div>` without a role

### Back/forward cache (bfcache)
Scout found no obvious blockers (`unload`, `beforeunload`, `Cache-Control: no-store`). The Lighthouse flag may be caused by:

1. **WebGL context** — Three.js holds a `WebGLRenderingContext`. Some browsers block bfcache for pages with active WebGL contexts. Mitigation: add a `visibilitychange` listener in `hero-background.tsx` to pause/resume the animation loop, and a `pagehide` listener to call `renderer.dispose()`.

2. **Open fetch/XHR** — The AI chat widget may have in-flight Gemini API requests. These are transient so likely not the cause.

3. **`window.location.assign()` in `goTo()`** — Not a bfcache blocker. Confirmed by spec.

Fix for Three.js:
```ts
// components/ui/hero-background.tsx — inside useEffect
const handlePageHide = () => renderer.dispose()
window.addEventListener('pagehide', handlePageHide)
return () => {
  window.removeEventListener('pagehide', handlePageHide)
  renderer.dispose()
  // ... existing cleanup
}
```

## Related Code Files
- Modify: `components/ui/dock-nav.tsx` — convert `<button>` to `<a href>` with preventDefault
- Modify: `components/ui/lang-theme-toggle.tsx` — increase button size to `size-10`
- Modify: `components/ui/tag-filter.tsx` — increase filter button height to `h-10` or `py-2.5`
- Modify: `app/globals.css` — raise `--fg-4` opacity from 0.40 to 0.45
- Modify: `components/ui/hero-background.tsx` — add `pagehide` cleanup for bfcache
- Audit: `components/ui/ai-chat-widget.tsx` — verify `role="dialog"` on `aria-modal` container

## Implementation Steps

1. **DockNav crawlable links** (`components/ui/dock-nav.tsx`)
   - Change `<button>` to `<a href={`/${locale}#${id}`}>` with `onClick={(e) => { e.preventDefault(); goTo(id) }}`
   - Keep all existing `aria-label`, className, and visual structure identical
   - Verify no TypeScript errors (anchor vs button event types differ slightly)

2. **LangThemeToggle touch target** (`components/ui/lang-theme-toggle.tsx`)
   - Change `size-8` → `size-10` on both theme and locale toggle buttons

3. **TagFilter touch target** (`components/ui/tag-filter.tsx`)
   - Locate filter pill buttons and increase height: `h-8` → `h-10` (or add `py-2` if using padding-based sizing)

4. **fg-4 contrast** (`app/globals.css`)
   - In `:root` dark mode block: `--fg-4: rgba(255, 255, 255, 0.45)`

5. **ARIA audit** (`components/ui/ai-chat-widget.tsx`)
   - Confirm the modal overlay container has `role="dialog"` alongside `aria-modal="true"`
   - If missing, add `role="dialog"` to the correct container element

6. **bfcache cleanup** (`components/ui/hero-background.tsx`)
   - Add `pagehide` event listener that calls `renderer.dispose()` before existing cleanup
   - Ensure the `useEffect` return already calls `cancelAnimationFrame` and `renderer.dispose()`

7. Run `npx tsc --noEmit` after all changes.

## Success Criteria
- [x] DockNav items render as `<a href="/#section">` in page source
- [x] LangThemeToggle buttons ≥ 40px (visually) or have extended hit area
- [x] Filter buttons height ≥ 40px
- [x] `--fg-4` opacity raised to 0.45 in dark mode
- [x] `role="dialog"` confirmed on `aria-modal` container in chat widget
- [x] `pagehide` cleanup added in `hero-background.tsx`
- [x] `npx tsc --noEmit` passes
- [ ] Lighthouse accessibility audit shows no prohibited ARIA attribute violations

## Completion Notes

- DockNav now uses crawlable anchors with smooth-scroll click handling.
- Lang/theme buttons and project/blog filter pills are now 40px tall.
- The dark contrast token was updated in `lib/design-tokens.ts` and regenerated into `app/globals.css`.
- Chat widget typing indicator now uses `role="status"` with its ARIA label.
- Hero WebGL cleanup now disposes on `pagehide` and remounts on `pageshow` when needed.

## Risk Assessment
Medium. DockNav `<button>` → `<a>` is a semantic change — verify keyboard navigation and visual styles remain identical (anchor resets may require `cursor-pointer`, `text-decoration-none`). Touch target size increases are additive. bfcache fix is additive cleanup. Color change is imperceptible at 40% → 45%.
