---
title: "CSS Token Codegen — Sync globals.css from design-tokens.ts on Save"
description: "Add cssVars export, codegen script, marker comments, and concurrently dev watcher so saving design-tokens.ts instantly updates globals.css and hot-reloads in the browser"
status: pending
priority: P1
branch: "development"
tags: [design-system, tokens, codegen, dx]
blockedBy: []
blocks: []
created: "2026-05-13T22:17:47.425Z"
createdBy: "ck:plan"
source: skill
---

# CSS Token Codegen — Sync globals.css from design-tokens.ts on Save

## Overview

Make `lib/design-tokens.ts` the single source of truth for all CSS custom properties. A new `cssVars` export maps token values to CSS var names. A codegen script (`scripts/generate-css-tokens.ts`) rewrites the marked sections of `app/globals.css` in place. Under `tsx --watch`, it re-fires on every save of `design-tokens.ts`, and Turbopack hot-reloads the result in the browser.

**Dev loop:** edit `design-tokens.ts` → save → CSS auto-updates → browser reflects change in <1s.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Add cssVars export to design-tokens.ts](./phase-01-add-cssvars-export-to-design-tokens-ts.md) | Pending |
| 2 | [Create generate-css-tokens script](./phase-02-create-generate-css-tokens-script.md) | Pending |
| 3 | [Add markers to globals.css and verify](./phase-03-add-markers-to-globals-css-and-verify.md) | Pending |
| 4 | [Wire watch script into dev workflow](./phase-04-wire-watch-script-into-dev-workflow.md) | Pending |

## What stays manual in globals.css
- `--font-sans`, `--font-mono` — reference `var(--font-inter)` / `var(--font-jetbrains-mono)` (Next.js font injection)
- `--radius` — shadcn compat, not in token schema
- `--magic-card-bg` — not a standard token
- shadcn compat aliases (`--background`, `--foreground`, etc.)
- `@theme inline { }` block (Tailwind 4)
- Body/heading semantic styles

## Dependencies
None. Standalone plan.
