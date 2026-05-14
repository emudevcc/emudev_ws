---
phase: 1
title: "Add cssVars export to design-tokens.ts"
status: pending
priority: P1
effort: "30m"
dependencies: []
---

# Phase 1: Add cssVars export to design-tokens.ts

## Overview
Add a `cssVars` export to `lib/design-tokens.ts` that explicitly maps CSS custom property names (kebab-case) to their token values for both dark (`:root`) and light (`[data-theme='light']`) themes. This becomes the input the codegen script reads — no heuristic name-mapping, no inference.

## Requirements
- Functional: `cssVars.root` covers all token-derived vars in `:root`; `cssVars.light` covers all overrides in `[data-theme='light']`
- Non-functional: No new runtime deps; values reference `tokens.*` so changing a token automatically flows through

## Architecture

```
tokens (existing as const)
  ↓
cssVars.root    → :root { --accent: ...; --canvas: ...; ... }
cssVars.light   → [data-theme='light'] { --canvas: ...; ... }
  ↓
generate-css-tokens.ts (Phase 2 reads this)
  ↓
app/globals.css (generated section)
```

### Scope boundary — what goes in `cssVars` vs stays manual

**In `cssVars` (generated):**
- Brand: `--accent`, `--accent-soft`, `--accent-line`, `--status-ok`, `--spotify`
- Dark palette: `--canvas`, `--surface-1`, `--surface-2`, `--surface-input`, `--hairline`, `--hairline-mid`, `--dock-bg`, `--fg-1`…`--fg-4`
- Type scale: `--t-display`…`--t-micro`, `--lh-display`, `--lh-heading`, `--lh-body`
- Spacing: `--s-1`…`--s-10`
- Radii: `--r-input`, `--r-btn`, `--r-image`, `--r-card`, `--r-dock`, `--r-pill`
- Shadow/motion: `--shadow-dock`, `--shadow-glow-ok`, `--ease`, `--dur-fast`, `--dur`

**Stays manual in globals.css (NOT generated):**
- `--font-sans`, `--font-mono` — reference `var(--font-inter)` and `var(--font-jetbrains-mono)` (Next.js font injection, can't be a static string)
- `--radius: 0.875rem` — shadcn compat, not in token schema
- `--magic-card-bg` — not a standard token
- All shadcn compat aliases (`--background`, `--foreground`, etc.) — point to the generated vars via `var()`, no need to regenerate
- `@theme inline { }` block — Tailwind 4 theme, also points to vars via `var()`

## Related Code Files
- Modify: `lib/design-tokens.ts`

## Implementation Steps

1. Add `tokens.shadow.dockLight` for the light-theme dock shadow (currently hardcoded in globals.css as `0 12px 40px rgba(0,0,0,0.12)`):

```typescript
shadow: {
  dock: '0 12px 40px rgba(0,0,0,0.5)',
  dockLight: '0 12px 40px rgba(0,0,0,0.12)',
  glowOk: '0 0 8px rgba(34,197,94,0.6)',
},
```

2. After the `tokens` const, add the `cssVars` export (not `as const` — it references `tokens` which is already const):

```typescript
export const cssVars = {
  root: {
    /* brand */
    '--accent': tokens.colors.brand.accent,
    '--accent-soft': tokens.colors.brand.accentSoft,
    '--accent-line': tokens.colors.brand.accentLine,
    '--status-ok': tokens.colors.brand.statusOk,
    '--spotify': tokens.colors.brand.spotify,
    /* dark palette */
    '--canvas': tokens.colors.dark.canvas,
    '--surface-1': tokens.colors.dark.surface1,
    '--surface-2': tokens.colors.dark.surface2,
    '--surface-input': tokens.colors.dark.surfaceInput,
    '--hairline': tokens.colors.dark.hairline,
    '--hairline-mid': tokens.colors.dark.hairlineMid,
    '--dock-bg': tokens.colors.dark.dockBg,
    '--fg-1': tokens.colors.dark.fg1,
    '--fg-2': tokens.colors.dark.fg2,
    '--fg-3': tokens.colors.dark.fg3,
    '--fg-4': tokens.colors.dark.fg4,
    /* type scale */
    '--t-display': tokens.typography.size.display,
    '--t-h1': tokens.typography.size.h1,
    '--t-h2': tokens.typography.size.h2,
    '--t-h3': tokens.typography.size.h3,
    '--t-body': tokens.typography.size.body,
    '--t-body-sm': tokens.typography.size.bodySm,
    '--t-meta': tokens.typography.size.meta,
    '--t-label': tokens.typography.size.label,
    '--t-micro': tokens.typography.size.micro,
    '--lh-display': String(tokens.typography.lineHeight.display),
    '--lh-heading': String(tokens.typography.lineHeight.heading),
    '--lh-body': String(tokens.typography.lineHeight.body),
    /* spacing */
    '--s-1': tokens.spacing[1],
    '--s-2': tokens.spacing[2],
    '--s-3': tokens.spacing[3],
    '--s-4': tokens.spacing[4],
    '--s-5': tokens.spacing[5],
    '--s-6': tokens.spacing[6],
    '--s-7': tokens.spacing[7],
    '--s-8': tokens.spacing[8],
    '--s-9': tokens.spacing[9],
    '--s-10': tokens.spacing[10],
    /* radii */
    '--r-input': tokens.radii.input,
    '--r-btn': tokens.radii.btn,
    '--r-image': tokens.radii.image,
    '--r-card': tokens.radii.card,
    '--r-dock': tokens.radii.dock,
    '--r-pill': tokens.radii.pill,
    /* shadow / motion */
    '--shadow-dock': tokens.shadow.dock,
    '--shadow-glow-ok': tokens.shadow.glowOk,
    '--ease': tokens.motion.ease,
    '--dur-fast': tokens.motion.fast,
    '--dur': tokens.motion.normal,
  },
  light: {
    '--canvas': tokens.colors.light.canvas,
    '--surface-1': tokens.colors.light.surface1,
    '--surface-2': tokens.colors.light.surface2,
    '--surface-input': tokens.colors.light.surfaceInput,
    '--hairline': tokens.colors.light.hairline,
    '--hairline-mid': tokens.colors.light.hairlineMid,
    '--dock-bg': tokens.colors.light.dockBg,
    '--fg-1': tokens.colors.light.fg1,
    '--fg-2': tokens.colors.light.fg2,
    '--fg-3': tokens.colors.light.fg3,
    '--fg-4': tokens.colors.light.fg4,
    '--shadow-dock': tokens.shadow.dockLight,
  },
} satisfies Record<string, Record<string, string>>
```

3. Run `npx tsc --noEmit` to verify no type errors.

## Success Criteria
- [ ] `cssVars.root` has all brand, palette, type scale, spacing, radii, shadow, motion vars
- [ ] `cssVars.light` covers the 12 light-theme overrides
- [ ] `tokens.shadow.dockLight` added for the light shadow value
- [ ] TypeScript compiles clean
- [ ] `cssVars` values all reference `tokens.*` — no hardcoded strings
