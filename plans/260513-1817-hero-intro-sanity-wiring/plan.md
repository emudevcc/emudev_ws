---
title: "Wire heroIntro Sanity field into HeroSection"
description: ""
status: pending
priority: P2
branch: "development"
tags: []
blockedBy: []
blocks: []
created: "2026-05-14T00:18:55.277Z"
createdBy: "ck:plan"
source: skill
---

# Wire heroIntro Sanity field into HeroSection

## Overview

`siteSettings.heroIntro` is a localized PortableText field fetched by `getSiteSettings()` but never rendered — `HeroSection` uses only the plain `tagline` string. When `tagline` is empty in Sanity Studio the component falls through to the hardcoded i18n string. This plan wires `heroIntro` into the hero intro paragraph using the existing `richTextToParagraphs` helper.

**Root cause:** `HeroSection.tsx` line 69 — `settings?.tagline ?? settings?.description ?? t('fallbackTagline')` — bypasses `settings.heroIntro` entirely.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Wire heroIntro into HeroSection](./phase-01-wire-herointro-into-herosection.md) | Pending |

## Dependencies
None.
