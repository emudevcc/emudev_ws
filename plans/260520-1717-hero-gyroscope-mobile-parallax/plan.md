---
title: "Hero Particles Gyroscope Mobile Parallax"
description: "Add DeviceOrientationEvent-based camera parallax to hero-background.tsx so mobile users get the same tilt-parallax effect desktop gets from mouse movement"
status: completed
priority: P2
branch: "development"
tags: ["mobile", "three.js", "gyroscope"]
blockedBy: []
blocks: []
created: "2026-05-20T23:18:10.922Z"
createdBy: "ck:plan"
source: skill
---

# Hero Particles Gyroscope Mobile Parallax

## Overview

`components/ui/hero-background.tsx` drives camera parallax via `mousemove` on desktop. On mobile the mouse never fires, so the scene is static (only ambient rotation). This plan wires the `deviceorientation` event to the same camera lerp, using `gamma` (left/right tilt) → camera X and `beta` (front/back tilt) → camera Y.

**Single file:** `components/ui/hero-background.tsx`

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Implement](./phase-01-implement.md) | Completed |
| 2 | [Verify](./phase-02-verify.md) | Completed |

## Completion Notes

- Added mobile `deviceorientation` parallax in `components/ui/hero-background.tsx`.
- Desktop mouse parallax remains on the existing `mousemove` path.
- iOS permission is requested on first touch; denied/unavailable permission falls back to ambient rotation.
- Verified with typecheck, lint, smoke contracts, and production build.
