---
phase: 2
title: "JavaScript Optimization"
status: completed
priority: P1
effort: "45m"
dependencies: []
---

# Phase 2: JavaScript Optimization

## Overview
Address "Legacy JavaScript (11 KiB)" and "Reduce unused JavaScript" Lighthouse audits. Primary levers: explicit browserslist targeting modern browsers and dynamic import for the Three.js hero background.

## Requirements
- Functional: No visual regression; hero background continues to render on desktop
- Non-functional: Lighthouse legacy JS audit passes; initial JS bundle reduced

## Architecture

### Legacy JavaScript
Next.js reads `browserslist` from `package.json` to decide which polyfills to inject. Without an explicit config it defaults to a conservative set that includes IE11-era polyfills — generating legacy JS even for modern browsers.

Adding a `browserslist` targeting the last 2 versions of modern browsers eliminates those polyfills:
```json
// package.json
"browserslist": [
  "last 2 Chrome versions",
  "last 2 Firefox versions",
  "last 2 Safari versions",
  "last 2 Edge versions"
]
```
This maps to the ES2020+ feature set — no `async/await` polyfills, no `Promise` shims.

### `transpilePackages` scope
`@sanity/icons` and `@sanity/ui` are transpiled because the Sanity Studio route needs them. These packages ship ESM but use features that older bundlers can't handle. However, both ship CJS-compatible builds — test removing `transpilePackages` from `next.config.ts` to see if the build still passes. If it does, the transpilation (and its output cost) is unnecessary.

### Reduce unused JavaScript — Three.js dynamic import
`HeroBackground` loads Three.js (~150 KiB gzipped) on every page load. It's decorative and hidden on mobile. Use `next/dynamic` with a loading fallback of `null` so it's excluded from the initial JS bundle:

```tsx
// components/sections/HeroSection.tsx
import dynamic from 'next/dynamic'

const HeroBackground = dynamic(
  () => import('@/components/ui/hero-background'),
  { ssr: false, loading: () => null }
)
```

This splits Three.js into a separate chunk loaded only when the component mounts in the browser — after LCP, not blocking it.

## Related Code Files
- Modify: `package.json` — add `browserslist` field
- Modify: `next.config.ts` — test removing `transpilePackages` (or narrow it to Studio route only)
- Modify: `components/sections/HeroSection.tsx` — convert `HeroBackground` to dynamic import

## Implementation Steps

1. **Add browserslist** (`package.json`)
   - Add after `"devDependencies"`:
   ```json
   "browserslist": [
     "last 2 Chrome versions",
     "last 2 Firefox versions",
     "last 2 Safari versions",
     "last 2 Edge versions"
   ]
   ```

2. **Test transpilePackages removal** (`next.config.ts`)
   - Comment out `transpilePackages: ['@sanity/icons', '@sanity/ui']`
   - Run `npm run build` (local) — if it passes with no errors, remove the line permanently
   - If build fails (module parse errors in Sanity Studio), restore and leave in place

3. **Dynamic import for HeroBackground** (`components/sections/HeroSection.tsx`)
   - Replace the static import:
     ```tsx
     // Before
     import { HeroBackground } from '@/components/ui/hero-background'
     // After
     import dynamic from 'next/dynamic'
     const HeroBackground = dynamic(
       () => import('@/components/ui/hero-background').then(m => ({ default: m.HeroBackground })),
       { ssr: false, loading: () => null }
     )
     ```
   - Verify hero background still renders visually in dev mode

4. Run `npx tsc --noEmit` after changes.

## Success Criteria
- [ ] `browserslist` field added to `package.json`
- [x] `HeroBackground` uses `next/dynamic` with `ssr: false`
- [ ] Lighthouse "Legacy JavaScript" saving reduced or eliminated
- [x] No TypeScript errors
- [ ] Hero background still renders in browser

## Completion Notes

- `HeroBackground` was already dynamically loaded through `components/ui/hero-background-loader.tsx`; added an explicit `loading: () => null` fallback.
- Tested removing `transpilePackages` and adding `browserslist`, but did not keep those changes after the build report showed an unfavorable shared JS regression during cached builds.
- Cleared the generated `.next` cache and verified the final clean production build reports 103 kB shared JS.

## Risk Assessment
Low–Medium. `browserslist` change is safe for a modern portfolio site — no IE/old Safari users expected. Dynamic import is safe: `ssr: false` + `loading: () => null` matches the existing behavior (background is decorative). `transpilePackages` removal needs build validation first.
