---
title: 'MagicUI Installation'
description: >-
  Install MagicUI free-tier components via shadcn CLI and source Pro components
  (MagicCard, Lens) from magicui.design/pro. Prerequisite for Classic Layout UI plan.
status: completed
priority: P1
effort: 3h
branch: 'development'
tags:
  - magic-ui
  - ui
  - dependencies
blockedBy: []
blocks: [260511-2210-classic-layout-ui]
created: '2026-05-12T04:14:32.972Z'
createdBy: 'ck:plan'
source: skill
---

# MagicUI Installation

## Overview

Install all MagicUI free-tier components needed by the Classic Layout via `npx shadcn@latest add`, then manually copy the two Pro components (MagicCard, Lens) from magicui.design/pro into `components/ui/`. Finally, extend `globals.css` with the shadcn/ui + MagicUI CSS token baseline that installed components depend on.

**Blocks:** Classic Layout UI plan (`260511-2210-classic-layout-ui`)

## Phases

| Phase | Name                                                                       | Status    |
| ----- | -------------------------------------------------------------------------- | --------- |
| 1     | [Install Free Tier Components](./phase-01-install-free-tier-components.md) | Completed |
| 2     | [Source Pro Components](./phase-02-source-pro-components.md)               | Completed |
| 3     | [CSS Token Integration](./phase-03-css-token-integration.md)               | Completed |

## Dependencies

Blocks: `260511-2210-classic-layout-ui`

## Execution Result

Completed on 2026-05-12.

- Installed 10 public Magic UI registry components in `components/ui/`
- Added local `MagicCard` and `Lens` components with the expected APIs and no runtime registry dependency
- Added shadcn config (`components.json`) and `cn()` helper (`lib/utils.ts`)
- Added Magic UI/shadcn dependencies: `motion`, `framer-motion`, `clsx`, `tailwind-merge`, `lucide-react`, `class-variance-authority`
- Replaced `app/globals.css` with full shadcn/Magic UI token baseline and preserved Magic UI animation utilities
- Verification passed: `npm run lint`, `npm run typecheck`, `npm run build`

Note: Pro component source is not available through the Magic UI MCP server or public registry. The `magic-card.tsx` and `lens.tsx` files are local API-compatible implementations matching the plan's expected component interfaces.
