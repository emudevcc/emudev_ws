---
title: "Design tokens — custom color palette + typography"
description: "Implement Esteban's custom design token system (dark-first palette, signal-orange accent, Inter + JetBrains Mono) into the existing Tailwind v4 + shadcn setup. Switch next-themes from class to data-theme attribute."
status: completed
priority: P1
branch: "development"
tags: [ui, design-system, tokens, typography, tailwind]
blockedBy: []
blocks: [260512-2048-magicui-blog-ui]
created: "2026-05-13T14:27:07.563Z"
completedAt: "2026-05-13"
createdBy: "ck:plan"
source: skill
---

# Design tokens — custom color palette + typography

## Problem

The current design system uses default shadcn HSL colors (neutral grey palette) and Geist fonts. The new design spec defines a **dark-first** custom token system:
- Brand accent: `#e34d2a` (signal orange)
- Canvas: `#0f0f10` dark / `#f0eee9` warm white light
- Semantic fg tokens: `--fg-1/2/3/4`
- Surface tokens: `--surface-1/2`, `--hairline`
- Fonts: Inter + JetBrains Mono (not Geist)
- Theme toggle: `[data-theme="light"]` attribute (not `.dark` class)

## Key Design Decisions

### Token naming conflict: `--accent`
Shadcn's `--accent` = neutral hover grey. New spec's `--accent` = `#e34d2a` orange.
**Resolution:** Shadcn's neutral accent becomes `--accent-muted` (internal); `--accent` becomes the brand orange. The `bg-accent` Tailwind utility becomes orange — components using it for neutral hover are caught in Phase 4 and migrated to `bg-secondary` or `bg-surface-2`.

### Theme attribute: `class` → `data-theme`
Current: `ThemeProvider attribute="class"`, `@custom-variant dark (&:is(.dark *))`.
New: `ThemeProvider attribute="data-theme"`, `[data-theme="dark"] &` variant.
**Impact:** Minimal — only `globals.css` dark-mode selectors need updating.

### Fonts: `next/font` not `@import`
The spec shows `@import url(...)` for fonts. Use `next/font/google` instead — faster (no FOUT, self-hosted, preloaded).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [CSS tokens in globals.css](./phase-01-css-tokens-in-globals-css.md) | Completed |
| 2 | [Font loading (JetBrains Mono)](./phase-02-font-loading-jetbrains-mono.md) | Completed |
| 3 | [ThemeProvider data-theme attribute](./phase-03-themeprovider-data-theme-attribute.md) | Completed |
| 4 | [Component audit and Tailwind utility updates](./phase-04-component-audit-and-tailwind-utility-updates.md) | Completed |

## Files Changed

| File | Change |
|------|--------|
| `app/globals.css` | Replace `:root`/`.dark` with new token system; update `@theme inline` |
| `app/[locale]/layout.tsx` | Add JetBrains Mono via `next/font`, update `<body>` className, ThemeProvider `attribute` |
| `components/ui/*.tsx` (selected) | Migrate `bg-accent` neutral hover usages → `bg-secondary`/`bg-surface-2` |

## Execution Order

Phases 1 → 2 → 3 in sequence. Phase 4 runs after all three to audit and fix breakage.
