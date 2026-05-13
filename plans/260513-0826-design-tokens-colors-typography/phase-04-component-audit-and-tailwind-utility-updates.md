---
phase: 4
title: "Component audit and Tailwind utility updates"
status: completed
priority: P2
effort: "1h"
dependencies: [1, 2, 3]
completedAt: "2026-05-13"
---

# Phase 4: Component audit and Tailwind utility updates

## Overview

After phases 1–3, `bg-accent` becomes orange (`#e34d2a`) instead of a neutral hover grey. Audit all components using this and related shadcn tokens that may produce visual regressions. Update them to use the correct new token.

## Requirements

- Functional: no component accidentally renders orange where neutral is expected; dark and light mode both look correct
- Non-functional: `npm run build` passes, zero TS errors

## Related Code Files

- Audit + modify: `components/ui/*.tsx`, `components/sections/*.tsx`, `components/*.tsx`
- Verify: `app/[locale]/**/*.tsx`

## Implementation Steps

### Step 1: Find all `bg-accent` / `text-accent` usages

```bash
grep -rn "bg-accent\|text-accent\|border-accent\|ring-accent\|hover:bg-accent\|focus:bg-accent" \
  --include="*.tsx" app/ components/ | grep -v "node_modules"
```

These used `bg-accent` as **neutral hover background** (shadcn pattern). Now `accent` = `#e34d2a`. Replace with:
- `bg-secondary` → neutral surface (same as `--surface-2`)
- `bg-muted` → same
- `hover:bg-secondary` for hover states

### Step 2: Audit `bg-background` usages

`bg-background` now resolves to `var(--canvas)` — this is correct. Verify visually; no code change expected.

### Step 3: Audit hardcoded colours

```bash
grep -rn "#" --include="*.tsx" app/ components/ | grep -v "node_modules" | grep -v "//.*#" | head -20
```

Flag any hardcoded hex colours that conflict with the new palette (e.g., old brand greys).

### Step 4: Update `DotPattern` opacity

The `DotPattern` in layout uses `text-muted-foreground/20`. With the new tokens, `muted-foreground` = `var(--fg-3)` (rgba white/black). Verify the dot pattern still looks correct in both modes; adjust opacity class if needed.

### Step 5: Check `Chip` component

```bash
cat components/ui/chip.tsx
```

`Chip` likely uses `bg-secondary` or `bg-accent` — verify it uses neutral surface, not accent orange.

### Step 6: Run build + visual check

```bash
npm run typecheck && npm run build
```

Then open `localhost:3000` and verify:
- Background dark: `#0f0f10` ✓
- Background light: `#f0eee9` ✓
- Accent elements (buttons, links, ring) show `#e34d2a` ✓
- Neutral hover states (nav links, cards) show neutral surface, not orange ✓
- Monospace elements render JetBrains Mono ✓

## Migration Quick Reference

| Was | Replace with | Semantic meaning |
|-----|-------------|-----------------|
| `bg-accent` (neutral hover) | `bg-secondary` | neutral surface hover |
| `text-accent-foreground` | `text-secondary-foreground` | text on neutral surface |
| `bg-accent` (intentional brand) | `bg-accent` | keep — brand orange is correct |
| `text-muted-foreground` | `text-fg-3` | tertiary text (can use either) |
| `bg-card` | `bg-surface-1` or `bg-card` | card background (both work) |

## Todo List

- [ ] `grep` for all `bg-accent`/`text-accent` usages
- [ ] Replace neutral-hover `bg-accent` → `bg-secondary`
- [ ] Verify `DotPattern` still renders cleanly in both modes
- [ ] Check `Chip` component uses neutral surface
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run build` — passes
- [ ] Visual review: dark mode canvas, light mode canvas, accent orange on interactive elements

## Success Criteria

- [ ] No component accidentally orange where neutral expected
- [ ] `npm run build` passes
- [ ] Dark mode looks correct: near-black bg, white text, orange accent
- [ ] Light mode looks correct: warm off-white bg, dark text, orange accent
- [ ] JetBrains Mono visible on code/mono-label elements
