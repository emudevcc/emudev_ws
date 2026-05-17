---
title: "DockNav Auto-Hide on Scroll"
description: "Hide the floating DockNav on page load; show on scroll; auto-hide 3s after last scroll event. One new hook, one modified component, no new deps."
status: pending
priority: P2
branch: "development"
tags: []
blockedBy: []
blocks: []
created: "2026-05-17T04:56:39.245Z"
createdBy: "ck:plan"
source: skill
---

# DockNav Auto-Hide on Scroll

## Overview

The floating dock nav currently renders visible at all times. The desired UX: hidden on page load, slides up when the user starts scrolling, auto-hides after 3 seconds of scroll inactivity.

**Before:** dock always visible, appears immediately on load
**After:** dock hidden on load → fades/slides in on first scroll → fades/slides out 3s after last scroll

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Scroll Visibility Hook and DockNav Integration](./phase-01-scroll-visibility-hook-and-docknav-integration.md) | Pending |

## Dependencies

None.
