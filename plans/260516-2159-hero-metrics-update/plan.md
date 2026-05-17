---
title: "Hero Metrics — Replace Projects with Years/Posts"
description: "Replace 4-stat hero grid (Projects/Skills/Credentials/Links) with 5 stats: Years of experience, Skills, Credentials, Posts, Social links. No Sanity schema changes."
status: pending
priority: P2
branch: "development"
tags: []
blockedBy: []
blocks: []
created: "2026-05-17T04:00:40.810Z"
createdBy: "ck:plan"
source: skill
---

# Hero Metrics — Replace Projects with Years/Posts

## Overview

Swap the hero section's 4-stat grid for 5 stats. "Years of experience" derives from the earliest `startDate` in the already-fetched `experiences[]` array — no new fetches, no schema changes. "Posts" uses `posts.length` already in scope.

**Before:** Projects · Skills · Credentials · Links  
**After:** Yrs experience · Skills · Credentials · Posts · Social links

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Update hero stats section](./phase-01-update-hero-stats-section.md) | Pending |

## Dependencies

None.
