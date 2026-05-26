---
phase: 1
title: "Performance: Images + Caching"
status: completed
priority: P1
effort: "1h"
dependencies: []
---

# Phase 1: Performance — Images + Caching

## Overview
Fix image delivery issues that Lighthouse flags as 15 KiB savings, and add cache-control headers for non-Next.js-managed static assets to address the 5 KiB cache lifetime warning. Targets LCP and Speed Index improvements.

## Requirements
- Functional: Above-fold images show blur placeholder while loading; all grid images sized correctly
- Non-functional: Lighthouse "Improve image delivery" and "Use efficient cache lifetimes" audits pass

## Architecture

### Image fixes
`next/image` already handles WebP conversion and lazy loading. Missing pieces:
- `sizes` on `ProjectsGrid` — without it, browser downloads full-width image for every viewport
- `placeholder="blur"` + `blurDataURL` on LCP image (hero avatar) — eliminates blank flash during LCP

Sanity CDN can generate a tiny base64 LQIP (Low Quality Image Placeholder) via URL params:
```
https://cdn.sanity.io/images/.../photo.jpg?w=20&blur=50&q=20
```
Use the `@sanity/image-url` builder or a helper in `lib/sanity-image.ts` to generate this at build time.

### Cache headers
Next.js auto-applies `Cache-Control: public, max-age=31536000, immutable` to `/_next/static/*`.
The Lighthouse warning is likely for **Sanity CDN image URLs** served through `next/image` — those pass through `/_next/image` which already adds long-lived cache headers.

If the issue is **Google Fonts or third-party scripts** (Vercel Analytics/SpeedInsights), those are CDN-served and cache headers can't be set from this app. In that case, the only fix is preconnect hints.

Add `preconnect` to Sanity CDN in the root layout:
```tsx
// app/[locale]/layout.tsx — add to <head>
<link rel="preconnect" href="https://cdn.sanity.io" />
<link rel="dns-prefetch" href="https://cdn.sanity.io" />
```

## Related Code Files
- Modify: `components/sections/ProjectsGrid.tsx` — add `sizes` prop to `<Image>`
- Modify: `components/sections/HeroSection.tsx` — add `placeholder="blur"` + `blurDataURL` to avatar
- Modify: `app/[locale]/layout.tsx` — add `<link rel="preconnect">` for Sanity CDN
- Modify: `next.config.ts` — add `Cache-Control` header for `/_next/image` if needed
- Create: `lib/sanity-blur-placeholder.ts` — helper to generate LQIP URL from Sanity image

## Implementation Steps

1. **ProjectsGrid image sizes** (`components/sections/ProjectsGrid.tsx`)
   - Find the `<Image>` component for project images
   - Add `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"` (3-col grid)

2. **Hero avatar blur placeholder** (`components/sections/HeroSection.tsx`)
   - The avatar is a Sanity image URL — generate a tiny LQIP from the Sanity CDN:
     ```tsx
     // Quick inline approach: append ?w=20&blur=50&q=10 to generate micro-image
     const blurUrl = `${avatarUrl}?w=20&blur=50&q=10`
     ```
   - Add `placeholder="blur" blurDataURL={blurUrl}` to the `<Image>` component

3. **Preconnect hints** (`app/[locale]/layout.tsx`)
   ```tsx
   // Inside <head> (Next.js App Router uses metadata or direct <link> in layout)
   <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
   ```
   Use Next.js 15 `<link>` directly in the layout's returned JSX (not metadata API — that doesn't support preconnect).

4. **Verify cache headers** (optional — only if Lighthouse still flags after above)
   - In `next.config.ts`, add a dedicated cache header rule for static image paths:
   ```ts
   { source: '/_next/image(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] }
   ```
   Note: This may conflict with Next.js internals — test in Vercel preview first.

5. Run `npx tsc --noEmit` after changes.

## Success Criteria
- [x] `ProjectsGrid` images have `sizes` prop
- [x] Hero avatar has `placeholder="blur"` with a Sanity LQIP URL
- [x] `<link rel="preconnect">` added for `cdn.sanity.io` in layout
- [ ] Lighthouse "Improve image delivery" saving reduced or eliminated
- [x] `npx tsc --noEmit` passes

## Completion Notes

- Added `sizes="(max-width: 768px) 100vw, 50vw"` to home project card images.
- Added a tiny Sanity CDN blur URL for the priority avatar image.
- Added Sanity CDN preconnect and dns-prefetch hints in the locale layout.
- Did not add a `/_next/image` cache header override because the app is relying on Next/Vercel image caching behavior.

## Risk Assessment
Low. `sizes` and `placeholder` are additive props — no visual regression. Preconnect is purely additive. The `/_next/image` cache header is optional and should be validated against Vercel deployment behavior.
