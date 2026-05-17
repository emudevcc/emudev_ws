---
title: "Smooth Scroll for Hash Anchor Links"
description: "Add scroll-behavior: smooth to html in globals.css so all hash anchor links animate. Respects prefers-reduced-motion."
status: complete
priority: P3
branch: "development"
tags: []
blockedBy: []
blocks: []
created: "2026-05-17T03:29:55.443Z"
createdBy: "ck:plan"
source: skill
---

# Smooth Scroll for Hash Anchor Links

## Overview

Pure CSS smooth scroll for all `href="#identifier"` anchor links — single rule on `html`, zero JS, zero component changes.

## Outcome

Implemented in `app/globals.css` inside `@layer base`:

- `html { scroll-behavior: smooth; }`
- `@media (prefers-reduced-motion: reduce)` resets `html` to `scroll-behavior: auto`

Verification:

- `npx tsc --noEmit` passed

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Add scroll-behavior to CSS](./phase-01-add-scroll-behavior-to-css.md) | Complete |

## Dependencies

None.
