---
phase: 1
title: "Install and Wire Analytics"
status: completed
priority: P2
effort: "5m"
dependencies: []
---

# Phase 1: Install and Wire Analytics

## Overview
Install `@vercel/analytics` and add `<Analytics />` to the root layout alongside the existing `<SpeedInsights />` component.

## Requirements
- Functional: Page views and custom events tracked in Vercel dashboard
- Non-functional: Zero bundle impact beyond the analytics script; no changes to existing SpeedInsights setup

## Architecture
`@vercel/analytics/next` exports an `<Analytics />` React component that injects the tracking script. Placed in `app/[locale]/layout.tsx` as a sibling of `<SpeedInsights />` — both are self-contained void components with no props required for default setup.

## Related Code Files
- Modify: `app/[locale]/layout.tsx` — add import + `<Analytics />`
- Modify: `package.json` (via `npm install`)

## Implementation Steps
1. `npm install @vercel/analytics`
2. In `app/[locale]/layout.tsx`:
   - Add import: `import { Analytics } from '@vercel/analytics/next'`
   - Add `<Analytics />` alongside `<SpeedInsights />` (line ~75)
3. `npx tsc --noEmit` — verify no type errors

## Success Criteria
- [x] `@vercel/analytics` present in `package.json` dependencies
- [x] `<Analytics />` rendered in `app/[locale]/layout.tsx`
- [x] `npx tsc --noEmit` passes
- [ ] Vercel dashboard shows Analytics enabled on next deployment

## Completion Notes

- Used `npm install @vercel/analytics --legacy-peer-deps` because the repo has an existing Sanity peer dependency conflict under npm's default resolver.
- Added `Analytics` from `@vercel/analytics/next` to the locale layout.

## Risk Assessment
Trivial. No API keys, no config, no env vars needed. Script loads async from Vercel's CDN — zero SSR impact.
