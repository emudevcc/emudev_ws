# Lighthouse Audit: emudev.cc
Date: 2026-05-18 | Tool: Lighthouse 13.3.0 | URL: https://emudev.cc

## Scores

| Category | Score | Status |
|----------|-------|--------|
| Performance | 35 | ❌ Critical |
| Accessibility | 89 | ⚠️ Needs work |
| Best Practices | 100 | ✅ |
| SEO | 85 | ⚠️ Needs work |

## Core Web Vitals

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| LCP | 8.0s | < 2.5s | ❌ |
| CLS | 0 | < 0.1 | ✅ |
| TBT | 3,110ms | < 200ms | ❌ |
| TTI | 9.5s | < 3.8s | ❌ |
| Speed Index | 9.0s | < 3.4s | ❌ |
| FCP | 2.4s | < 1.8s | ⚠️ |

## Root Causes (Priority Order)

### P0 — 3-hop redirect chain (+1,969ms)
`emudev.cc` → `www.emudev.cc` → `www.emudev.cc/en`
Every page load pays 3 redirects before the first byte. Fix: configure Vercel to serve
canonical domain directly and avoid locale redirect on initial load.

### P1 — Main thread blocked 6,612ms by script evaluation
Script evaluation dominates (6.6s of 8.4s total main-thread work). Cause: large Next.js
chunks loaded eagerly. Fix: code-split heavy components, lazy-load below-fold sections,
use `next/dynamic` with SSR: false for client-only widgets.

Top unused JS chunks (treeshakeable or splittable):
- `5531-*.js` 54kb unused
- `7420-*.js` 46kb unused
- `613c2edf-*.js` 40kb unused

### P2 — Accessibility (score 89)
- **Contrast**: `text-accent` (`#e34d2a`) used as body text at `text-xs` fails 4.5:1. Use
  accent for borders/icons only at small sizes; switch to `text-fg-2` for readable labels.
- **Non-crawlable links**: Social links use `aria-label="Social link"` but no `href` text.
  Add meaningful `href` or visible text so Googlebot can follow them.
- **ARIA**: Prohibited attributes on elements (likely role conflicts in icon buttons).
- **Touch targets**: Some interactive elements < 44×44px.

### P3 — SEO (score 85)
- Non-crawlable anchor links hurting crawlability.
- Cache TTL not set for static assets.

## Recommended Fix Plan

1. **Redirect chain** — Set `VERCEL_FORCE_NO_ACTIVITY_TIMEOUT` + canonical Vercel domain
   config; handle `/en` redirect at edge middleware instead of separate hop.
2. **Bundle size** — `next/dynamic` lazy-load: AI chat widget, social feed, heavy sections.
3. **Contrast** — Replace `text-accent` at `text-xs` with `text-fg-3` (muted but readable).
4. **Social links** — Add `href` text or use `<span className="sr-only">` with platform name.
5. **Cache headers** — Add `Cache-Control: public, max-age=31536000, immutable` for `_next/static`.

## Next Step
Use `vercel:performance-optimizer` agent to implement fixes for P0 + P1 (highest impact).
