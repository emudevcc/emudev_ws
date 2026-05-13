---
phase: 1
title: Create lib/design-tokens.ts
status: completed
priority: P1
effort: 1h
dependencies: []
---

# Phase 1: Create lib/design-tokens.ts

## Overview
Create `lib/design-tokens.ts` — a typed `as const` object that mirrors every CSS custom property defined in `app/globals.css` into TypeScript. Values must match the CSS verbatim, including hex-with-alpha shorthand (`#e34d2a1a`) not rgba expansion. This becomes the single source of truth for MagicUI prop defaults, inline style arrays, and any JS that needs a design value.

## Requirements
- Functional: All CSS vars from `:root` and `[data-theme="light"]` blocks are represented; MagicUI-specific color keys (`magicCard`, `borderBeam`, `shimmer`, `contributions`) are included as extras
- Non-functional: `as const` for literal type inference; zero runtime deps; values identical to globals.css — no reformatting of hex/rgba

## Architecture
Single file, plain `as const` export. Structure mirrors CSS comment sections:

```
tokens.colors
  .brand.*         → --accent, --accent-soft, --accent-line, --status-ok, --spotify
  .dark.*          → dark-mode (:root) surface/fg/hairline vars
  .light.*         → [data-theme="light"] overrides
  .magicCard.*     → MagicUI gradient prop values (accent-tinted)
  .borderBeam.*    → MagicUI colorFrom/colorTo prop values
  .shimmer         → MagicUI shimmerColor prop value
  .contributions[] → 5-level contribution graph color array
tokens.spacing.*   → --s-1 through --s-10
tokens.radii.*     → --r-input through --r-pill
tokens.typography
  .size.*          → --t-display through --t-micro
  .lineHeight.*    → --lh-display, --lh-heading, --lh-body
  .family.*        → --font-sans, --font-mono
tokens.shadow.*    → --shadow-dock, --shadow-glow-ok
tokens.motion.*    → --ease, --dur-fast, --dur
```

## Related Code Files
- Create: `lib/design-tokens.ts`
- Read for reference: `app/globals.css`

## Implementation Steps

1. Read `app/globals.css` to confirm every value before writing

2. Create `lib/design-tokens.ts`:

```typescript
export const tokens = {
  colors: {
    brand: {
      accent: '#e34d2a',
      accentSoft: '#e34d2a1a',   /* 10% — hex-alpha, matches --accent-soft */
      accentLine: '#e34d2a33',   /* 20% — hex-alpha, matches --accent-line */
      statusOk: '#22c55e',
      spotify: '#1ed760',
    },
    dark: {
      canvas: '#0f0f10',
      surface1: 'rgba(255,255,255,0.04)',
      surface2: 'rgba(255,255,255,0.06)',
      surfaceInput: 'rgba(255,255,255,0.03)',
      hairline: 'rgba(255,255,255,0.08)',
      hairlineMid: 'rgba(255,255,255,0.10)',
      fg1: '#ffffff',
      fg2: 'rgba(255,255,255,0.75)',
      fg3: 'rgba(255,255,255,0.55)',
      fg4: 'rgba(255,255,255,0.40)',
    },
    light: {
      canvas: '#f0eee9',
      surface1: 'rgba(0,0,0,0.025)',
      surface2: 'rgba(0,0,0,0.05)',
      surfaceInput: 'rgba(0,0,0,0.02)',
      hairline: 'rgba(0,0,0,0.08)',
      hairlineMid: 'rgba(0,0,0,0.10)',
      fg1: '#111111',
      fg2: 'rgba(0,0,0,0.70)',
      fg3: 'rgba(0,0,0,0.55)',
      fg4: 'rgba(0,0,0,0.40)',
    },
    /* MagicUI prop defaults — not CSS vars, derived from brand accent */
    magicCard: {
      gradient: 'rgba(227,77,42,0.08)',
    },
    borderBeam: {
      from: '#e34d2a',
      to: '#e34d2a33',
    },
    shimmer: '#e34d2a',
    contributions: [
      'rgba(255,255,255,0.05)',
      'rgba(227,77,42,0.20)',
      'rgba(227,77,42,0.40)',
      'rgba(227,77,42,0.70)',
      '#e34d2a',
    ] as readonly string[],
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '14px',
    5: '16px',
    6: '20px',
    7: '24px',
    8: '32px',
    9: '40px',
    10: '56px',
  },
  radii: {
    input: '8px',
    btn: '10px',
    image: '12px',
    card: '14px',
    dock: '18px',
    pill: '99px',
  },
  typography: {
    size: {
      display: '56px',
      h1: '40px',
      h2: '28px',
      h3: '20px',
      body: '16px',
      bodySm: '14px',
      meta: '13.5px',
      label: '12px',
      micro: '11px',
    },
    lineHeight: {
      display: 1.05,
      heading: 1.15,
      body: 1.5,
    },
    family: {
      sans: "'Inter', system-ui, -apple-system, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
    },
  },
  shadow: {
    dock: '0 12px 40px rgba(0,0,0,0.5)',
    glowOk: '0 0 8px rgba(34,197,94,0.6)',
  },
  motion: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '0.15s',
    normal: '0.2s',
  },
} as const
```

Key decisions:
- `accentSoft`/`accentLine` use hex-with-alpha (`#e34d2a1a`, `#e34d2a33`) — matches CSS spec exactly, not expanded rgba
- `radii.pill` is `'99px'` not `'9999px'` — matches `--r-pill: 99px` in globals.css
- `motion.fast`/`normal` are `'0.15s'`/`'0.2s'` — matches `--dur-fast: 0.15s` / `--dur: 0.2s`
- `shadow` has only `dock` and `glowOk` — no card shadow in spec
- `typography` has no `weight` or `letterSpacing` sub-objects — those are element-level rules in CSS, not token vars
- Dark-mode dock glass (`rgba(20,20,22,0.70)`) is NOT in the CSS vars — handled in Phase 3 via `colors.dark.canvas` + manual alpha, or a CSS var added to globals.css

3. Verify: `npx tsc --noEmit`

## Success Criteria
- [ ] `lib/design-tokens.ts` compiles with `as const`
- [ ] `tokens.colors.brand.accentSoft === '#e34d2a1a'` (hex-alpha, not rgba)
- [ ] `tokens.motion.fast === '0.15s'` (not `'150ms'`)
- [ ] `tokens.radii.pill === '99px'` (not `'9999px'`)
- [ ] `tokens.shadow` has exactly 2 keys: `dock`, `glowOk`
- [ ] `tokens.colors.contributions` has exactly 5 entries

## Risk Assessment
Low. Pure data file. Only risk is value drift — mitigated by reading globals.css first and cross-checking all hex/rgba values before writing.
