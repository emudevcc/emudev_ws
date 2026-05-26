---
title: "Vercel Analytics"
description: ""
status: completed
priority: P2
branch: "development"
tags: []
blockedBy: []
blocks: []
created: "2026-05-26T13:21:04.985Z"
createdBy: "ck:plan"
source: skill
---

# Vercel Analytics

## Overview

Install Vercel Web Analytics alongside the existing Speed Insights integration so page views and client events are available in the Vercel dashboard after deployment.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Install and Wire Analytics](./phase-01-install-and-wire-analytics.md) | Completed |

## Dependencies

<!-- Cross-plan dependencies -->

## Completion Notes

- Added `@vercel/analytics` to project dependencies.
- Mounted `<Analytics />` in `app/[locale]/layout.tsx` next to `<SpeedInsights />`.
- Verified with typecheck and production build.
