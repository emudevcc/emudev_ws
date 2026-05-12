---
title: "MagicUI Installation"
description: >-
  Install MagicUI free-tier components via shadcn CLI and source Pro components
  (MagicCard, Lens) from magicui.design/pro. Prerequisite for Classic Layout UI plan.
status: pending
priority: P1
effort: 3h
branch: "development"
tags:
  - magic-ui
  - ui
  - dependencies
blockedBy: []
blocks: [260511-2210-classic-layout-ui]
created: "2026-05-12T04:14:32.972Z"
createdBy: "ck:plan"
source: skill
---

# MagicUI Installation

## Overview

Install all MagicUI free-tier components needed by the Classic Layout via `npx shadcn@latest add`, then manually copy the two Pro components (MagicCard, Lens) from magicui.design/pro into `components/ui/`. Finally, extend `globals.css` with the shadcn/ui + MagicUI CSS token baseline that installed components depend on.

**Blocks:** Classic Layout UI plan (`260511-2210-classic-layout-ui`)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Install Free Tier Components](./phase-01-install-free-tier-components.md) | Pending |
| 2 | [Source Pro Components](./phase-02-source-pro-components.md) | Pending |
| 3 | [CSS Token Integration](./phase-03-css-token-integration.md) | Pending |

## Dependencies

Blocks: `260511-2210-classic-layout-ui`
