---
title: "Lighthouse Score Improvements"
description: "Fix 10 Lighthouse audit failures: image delivery, legacy JS, caching, ARIA, contrast, touch targets, crawlable links, bfcache"
status: completed
priority: P1
branch: "development"
tags: []
blockedBy: []
blocks: []
created: "2026-05-26T17:02:29.491Z"
createdBy: "ck:plan"
source: skill
---

# Lighthouse Score Improvements

## Overview

Address 10 Lighthouse audit failures across Performance, Accessibility, SEO, and Best Practices categories. All phases are independent and can be executed in any order.

| Audit | Est. Savings | Phase |
|-------|-------------|-------|
| Improve image delivery | 15 KiB | 1 |
| Use efficient cache lifetimes | 5 KiB | 1 |
| Largest Contentful Paint | LCP | 1 |
| Legacy JavaScript | 11 KiB | 2 |
| Reduce unused JavaScript | bundle | 2 |
| Links are not crawlable | SEO | 3 |
| Touch targets insufficient | a11y | 3 |
| Color contrast insufficient | a11y | 3 |
| Prohibited ARIA attributes | a11y | 3 |
| bfcache prevented | best practices | 3 |

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Performance: Images + Caching](./phase-01-performance-images-caching.md) | Completed |
| 2 | [JavaScript Optimization](./phase-02-javascript-optimization.md) | Completed |
| 3 | [Accessibility + SEO + bfcache](./phase-03-accessibility-seo-bfcache.md) | Completed |

## Dependencies

<!-- Cross-plan dependencies -->

## Completion Notes

- Added responsive image sizing for project cards and a Sanity LQIP blur URL for the hero avatar.
- Added Sanity CDN preconnect/dns-prefetch hints.
- Kept the existing dynamic HeroBackground client-loader and added an explicit null loading fallback.
- Tested `browserslist` and `transpilePackages` changes, but did not keep them because the build report regressed until the generated `.next` cache was cleared; the clean final build remains at 103 kB shared JS.
- Converted DockNav section controls to crawlable anchor links with smooth-scroll interception.
- Increased small filter and locale/theme controls to 40px touch targets.
- Raised the dark `fg-4` contrast token from 40% to 45%.
- Confirmed the chat modal has `role="dialog"` with `aria-modal`, and fixed the typing indicator by making its ARIA label valid on `role="status"`.
- Added WebGL `pagehide` cleanup and `pageshow` remount behavior for the decorative hero canvas.
