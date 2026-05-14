---
title: Design Tokens — TypeScript Token Object for MagicUI & Components
description: >-
  Create lib/design-tokens.ts with typed token object and apply to MagicUI
  defaults and component usage sites
status: completed
priority: P1
branch: development
tags:
  - design-system
  - tokens
  - magicui
blockedBy: []
blocks:
  - 260513-1323-claude-design-visual-alignment
created: '2026-05-13T20:15:50.688Z'
createdBy: 'ck:plan'
source: skill
---

# Design Tokens — TypeScript Token Object for MagicUI & Components

## Overview

Create `lib/design-tokens.ts` — a typed `as const` object that mirrors all CSS custom properties from `app/globals.css` into TypeScript. Apply those token values as defaults in MagicUI component wrappers (`border-beam`, `magic-card`, `shimmer-button`) and at specific usage sites (`ContributionsCard` level colors, `DockNav` glass background). This plan must complete before the visual alignment plan phases 10 and 11, which depend on `tokens.colors.contributions` and `tokens.colors.dark.dock`.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Create lib/design-tokens.ts](./phase-01-create-lib-design-tokens-ts.md) | Completed |
| 2 | [Apply tokens to MagicUI component defaults](./phase-02-apply-tokens-to-magicui-component-defaults.md) | Completed |
| 3 | [Apply tokens to component usage sites](./phase-03-apply-tokens-to-component-usage-sites.md) | Completed |

## Dependencies

- **Blocks:** `260513-1323-claude-design-visual-alignment` phases 10 (ContributionsCard) and 11 (DockNav) — those phases should import from `lib/design-tokens.ts` rather than hardcoding rgba strings
