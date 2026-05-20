---
phase: 2
title: "Verify"
status: completed
priority: P2
effort: "30m"
dependencies: [phase-01-implement]
---

# Phase 2: Verify

## Overview

Type-check and manually verify gyroscope parallax works on mobile (real device or DevTools sensor emulation) without breaking desktop mouse parallax.

## Implementation Steps

1. `npx tsc --noEmit` — must pass with zero errors
2. `npm run dev` → open `http://localhost:3000`
3. **Desktop check**: move mouse across hero → particles/camera shift. Unchanged from before.
4. **Mobile emulation (Chrome DevTools)**:
   - Open DevTools → More tools → Sensors → Orientation
   - Set to custom, change alpha/beta/gamma sliders
   - Hero camera should shift as values change
5. **`prefers-reduced-motion` check**: enable in OS accessibility → camera locked on both paths
6. **Real device** (if available): open on Android phone, tilt device, verify parallax

## Success Criteria

- [x] `npx tsc --noEmit` — zero errors
- [ ] Desktop mouse parallax unchanged
- [ ] DevTools sensor emulation drives camera shift on mobile UA
- [ ] `prefers-reduced-motion` disables animation on both platforms
- [ ] No console errors/warnings related to gyroscope or permissions

## Completion Notes

- Automated checks passed: typecheck, lint, smoke contracts, and production build.
- Manual physical-device gyroscope verification was not run in this environment.
