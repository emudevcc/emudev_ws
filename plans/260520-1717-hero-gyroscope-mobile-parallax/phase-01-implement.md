---
phase: 1
title: "Implement Gyroscope Parallax"
status: completed
priority: P2
effort: "1h"
dependencies: []
---

# Phase 1: Implement Gyroscope Parallax

## Overview

Add `deviceorientation` event listener to `hero-background.tsx` that drives the same camera lerp used by `mousemove`, gated behind a mobile-device check. Handle iOS 13+ permission requirement transparently.

## Requirements

- Functional:
  - Tilting left/right (gamma) shifts camera X (same range as mouse: ×1.5, lerp 0.04)
  - Tilting forward/back (beta) shifts camera Y (same range: ×1.0, lerp 0.04)
  - Desktop mouse path unchanged
  - `prefers-reduced-motion` still skips both paths
  - iOS 13+ permission requested on first `touchstart` (no UI needed — silent fallback to ambient rotation if denied)
  - Android works without any permission request
- Non-functional:
  - No extra dependencies
  - No extra re-renders (all logic stays inside the single `useEffect`)
  - Cleanup removes all added listeners

## Architecture

```
useEffect (single, []) {
  isMobile = window.matchMedia('(pointer: coarse)').matches

  // Shared lerp targets (already exist):
  let mouseX = 0, mouseY = 0   ← rename to targetX / targetY? No — keep as-is, gyro just writes to them

  if isMobile:
    onOrientation(e) → write mouseX / mouseY from e.gamma / e.beta
    requestGyroPermission() → iOS 13 gate via touchstart
    window.addEventListener('deviceorientation', onOrientation)
  else:
    window.addEventListener('mousemove', onMouseMove)

  animate():
    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.04  ← unchanged
    camera.position.y += (-mouseY * 1.0 - camera.position.y) * 0.04 ← unchanged

  cleanup: remove whichever listener was added
}
```

**Key maths:**
- `gamma`: device left/right tilt, range −90…+90°. Normalise: `mouseX = clamp(gamma, -45, 45) / 45`
- `beta`: device front/back tilt, range −180…+180°. Useful range is ~-45…+45° from neutral. Normalise: `mouseY = clamp(beta - 45, -45, 45) / 45` (subtract 45 because neutral hold angle ≈ 45° not 0°)
- Both → −1…+1, same as `mousemove` path → camera parallax magnitude is identical

**iOS 13+ permission:**
```ts
// Check once, on first touchstart
const requestGyroPermission = () => {
  if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
    const onTouch = () => {
      (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
        .requestPermission()
        .then(state => {
          if (state === 'granted') window.addEventListener('deviceorientation', onOrientation, { passive: true })
        })
        .catch(() => {}) // denied — ambient rotation only
      window.removeEventListener('touchstart', onTouch)
    }
    window.addEventListener('touchstart', onTouch, { once: true, passive: true })
  } else {
    // Android / non-iOS — no permission needed
    window.addEventListener('deviceorientation', onOrientation, { passive: true })
  }
}
```

## Related Code Files

- Modify: `components/ui/hero-background.tsx`

## Implementation Steps

1. Open `components/ui/hero-background.tsx`
2. After the `prefersReducedMotion` check, detect mobile:
   ```ts
   const isMobile = window.matchMedia('(pointer: coarse)').matches
   ```
3. Add `onOrientation` handler below `onMouseMove`:
   ```ts
   const onOrientation = (e: DeviceOrientationEvent) => {
     if (prefersReducedMotion) return
     const gamma = e.gamma ?? 0  // left/right tilt
     const beta  = e.beta  ?? 0  // front/back tilt
     mouseX = Math.max(-1, Math.min(1, gamma / 45))
     mouseY = Math.max(-1, Math.min(1, (beta - 45) / 45))
   }
   ```
4. Add `requestGyroPermission` function (see Architecture above)
5. Replace the unconditional `window.addEventListener('mousemove', ...)` with:
   ```ts
   if (isMobile) {
     requestGyroPermission()
   } else {
     window.addEventListener('mousemove', onMouseMove, { passive: true })
   }
   ```
6. Update cleanup to conditionally remove the right listener:
   ```ts
   if (isMobile) {
     window.removeEventListener('deviceorientation', onOrientation)
   } else {
     window.removeEventListener('mousemove', onMouseMove)
   }
   ```
   Also remove the `touchstart` listener in cleanup (use a ref or closure variable for `onTouch`).

7. Keep animation loop unchanged — it already reads `mouseX` / `mouseY`

## Success Criteria

- [ ] Desktop: `mousemove` parallax unchanged
- [ ] Mobile (Android): tilt left/right → particles shift on X axis
- [ ] Mobile (Android): tilt forward/back → particles shift on Y axis
- [ ] iOS 13+ (physical device or BrowserStack): gyro activates after first touch
- [x] `prefers-reduced-motion`: camera stays locked on both platforms
- [x] No TypeScript errors (`npx tsc --noEmit`)
- [x] No new npm dependencies

## Completion Notes

- Implemented `deviceorientation` support behind `(pointer: coarse)`.
- Reused the existing camera target values and animation loop.
- Added iOS `DeviceOrientationEvent.requestPermission()` handling on first `touchstart`.
- Cleanup removes orientation, mouse, and pending touch listeners.
- Physical device and DevTools sensor checks were not run in this environment.

## Risk Assessment

- **iOS permission UX** — user must touch screen before gyro starts; first-load is ambient-rotation only. Acceptable: the hero is above the fold and users scroll/tap immediately.
- **`beta` neutral angle** — holding a phone vertically ≈ 45° beta. The `-45` offset corrects for this but varies per user grip. ±45° range is intentionally generous to accommodate.
- **DeviceOrientationEvent availability** — some desktop browsers fire this event from mouse movement (Chrome on Mac). The `isMobile` guard (`pointer: coarse`) prevents this.
