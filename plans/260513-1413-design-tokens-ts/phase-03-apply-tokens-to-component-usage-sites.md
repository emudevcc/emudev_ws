---
phase: 3
title: Apply tokens to component usage sites
status: completed
priority: P1
effort: 1h
dependencies:
  - 1
  - 2
---

# Phase 3: Apply tokens to component usage sites

## Overview
Replace hardcoded color values at specific usage sites with imports from `lib/design-tokens`. Three targets: `ContributionsCard` (Tailwind level-class array → inline style from token array), `DockNav` (hardcoded rgba glass bg → CSS var added to globals.css), and a MagicCard usage audit to remove any conflicting explicit `gradientColor` overrides. After this phase no component carries hardcoded design values that belong in the token system.

## Requirements
- Functional: `ContributionsCard` level colors match `tokens.colors.contributions[0..4]`; `DockNav` glass bg resolves correctly in both dark and light themes; no MagicCard call site passes a `gradientColor` that overrides the token default with a stale value
- Non-functional: Theme switching handled by CSS (`[data-theme="light"]`), not JS — the JS token is dark-mode only for cases where a CSS var is unavailable

## Architecture

### ContributionsCard
Switch from Tailwind class array to inline style. `day.level` is already 0–4.

```
tokens.colors.contributions[day.level]  →  style={{ background: value }}
```

### DockNav glass background
The CSS spec has no `--dock-bg` variable. The correct approach:
1. **Add `--dock-bg` to `app/globals.css`** in both `:root` and `[data-theme="light"]` blocks so theme switching works via CSS
2. Use `style={{ background: 'var(--dock-bg)' }}` on the dock wrapper div

Values to add to globals.css:
```css
:root {
  --dock-bg: rgba(20,20,22,0.70);   /* dark glass */
}
[data-theme="light"] {
  --dock-bg: rgba(240,238,233,0.80); /* light glass */
}
```

This is the only globals.css addition needed — all other vars are already defined.

### MagicCard audit
Any call site passing `gradientColor='#262626'` (the old default) should be updated to remove the prop so the Phase 2 token default takes over.

## Related Code Files
- Modify: `components/sections/ContributionsCard.tsx`
- Modify: `app/globals.css` — add `--dock-bg` to `:root` and `[data-theme="light"]`
- Modify: `components/ui/dock-nav.tsx` (verify exact path — may also be `components/sections/DockNav.tsx`)
- Read: `components/sections/ExperienceTimeline.tsx` — check for explicit `gradientColor` override
- Read: `components/contact-form.tsx` — check for explicit `gradientColor` override
- Read: `lib/design-tokens.ts`

## Implementation Steps

### 1. `ContributionsCard.tsx`

Current:
```typescript
const levelClasses = [
  'bg-muted/50',
  'bg-primary/20',
  'bg-primary/40',
  'bg-primary/65',
  'bg-primary',
] as const
```

Replace entirely with:
```typescript
import { tokens } from '@/lib/design-tokens'

const levelColors = tokens.colors.contributions
```

In JSX, change:
```tsx
// before:
<div className={`size-[10px] rounded-[2px] ${levelClasses[day.level]}`} ... />

// after:
<div
  className="size-[10px] rounded-[2px]"
  style={{ background: levelColors[day.level] }}
  title={`${day.date}: ${day.count}`}
/>
```

Delete the `levelClasses` const entirely.

### 2. `app/globals.css` — add `--dock-bg`

In the `:root` block, after `--hairline-mid`, add:
```css
  --dock-bg:       rgba(20,20,22,0.70);
```

In the `[data-theme="light"]` block, after `--hairline-mid` override, add:
```css
  --dock-bg:       rgba(240,238,233,0.80);
```

### 3. `DockNav` — use CSS var for glass bg

Read the dock nav component file first. Find the element that carries the glass background (either `className` with a hardcoded rgba, or an inline `style`). Replace with:

```tsx
style={{ background: 'var(--dock-bg)' }}
```

If the background is set via a MagicUI `Dock` prop rather than a wrapper div, set the CSS var on the wrapper `<div>` that wraps the `<Dock>` component — do not pass it as a MagicUI prop.

### 4. MagicCard usage audit

```bash
grep -r "gradientColor" components/ --include="*.tsx"
```

For each result:
- If value is `'#262626'` or another stale hardcoded string → remove the prop so Phase 2 default applies
- If value is intentionally different from the token (e.g., a specific section needs a unique gradient) → leave it and add a comment explaining why

### 5. Verify compilation and visual check
```bash
npx tsc --noEmit
npm run dev
```

Check in browser:
- Contribution grid: 5 visible accent-tinted level steps (not Tailwind `primary` class)
- Dock: correct glass bg in dark theme; switch to `[data-theme="light"]` and confirm light glass
- MagicCard hover glow: accent orange (not dark grey #262626)

## Success Criteria
- [ ] `ContributionsCard` uses `tokens.colors.contributions[day.level]` via inline style — `levelClasses` const removed
- [ ] `--dock-bg` added to both `:root` and `[data-theme="light"]` in `app/globals.css`
- [ ] `DockNav` glass bg uses `style={{ background: 'var(--dock-bg)' }}` on the wrapper element
- [ ] No MagicCard call site passes stale `gradientColor='#262626'`
- [ ] `npx tsc --noEmit` exits 0
- [ ] Light/dark theme toggle switches dock glass color correctly

## Risk Assessment
- `ContributionsCard`: low — class→style swap, index still 0–4
- `globals.css` addition: low — additive only, no existing var renamed
- `DockNav`: medium — verify the glass bg is on a wrapper `<div>`, not passed as a MagicUI `Dock` prop (those have different APIs). Read component before editing.
- MagicCard audit: low — read-only scan; only touch sites with the exact stale default string
