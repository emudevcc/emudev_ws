---
phase: 1
title: "CSS tokens in globals.css"
status: completed
priority: P1
effort: "1h"
dependencies: []
completedAt: "2026-05-13"
---

# Phase 1: CSS tokens in globals.css

## Overview

Replace the default shadcn HSL color palette in `app/globals.css` with the custom design token system. Preserve all MagicUI keyframe animations and `@theme inline` mappings; add new token-to-Tailwind mappings for the brand palette.

## Requirements

- Functional: dark mode (default) and light mode both render with new palette
- Non-functional: existing components using `bg-background`, `bg-card`, `text-foreground`, `bg-muted`, `bg-secondary`, `bg-border` continue working (shadcn var names preserved, values updated)

## Architecture

The new globals.css has three layers:
1. **`:root`** — custom design tokens (new) + shadcn compatibility aliases
2. **`[data-theme="light"]`** — light overrides (replaces `.dark`)
3. **`@theme inline`** — Tailwind utility mappings (updated to wire new tokens)

### Token conflict resolution

| Old shadcn var | Old value | New mapping |
|---|---|---|
| `--accent` | neutral grey | → `#e34d2a` (brand orange) |
| `--background` | white/dark | → `var(--canvas)` |
| `--foreground` | dark/white | → `var(--fg-1)` |
| `--card` | white | → `var(--surface-1)` as hsl |
| `--muted` | light grey | → `var(--surface-2)` as hsl |
| `--muted-foreground` | mid grey | → `var(--fg-3)` |
| `--border` | grey | → `var(--hairline)` |
| `--input` | grey | → `var(--surface-input)` |

## Related Code Files

- Modify: `app/globals.css`

## Implementation Steps

### Step 1: Replace `:root` and `.dark` blocks

Full replacement of the color sections — keep all keyframes/animations intact:

```css
@import 'tailwindcss';

/* Dark-first: [data-theme="light"] overrides. ThemeProvider uses attribute="data-theme". */
@custom-variant dark (&:is([data-theme="dark"] *));

:root {
  /* ---------- Brand ---------- */
  --accent:        #e34d2a;
  --accent-soft:   #e34d2a1a;
  --accent-line:   #e34d2a33;
  --status-ok:     #22c55e;
  --spotify:       #1ed760;

  /* ---------- Dark palette (default) ---------- */
  --canvas:        #0f0f10;
  --surface-1:     rgba(255,255,255,0.04);
  --surface-2:     rgba(255,255,255,0.06);
  --surface-input: rgba(255,255,255,0.03);
  --hairline:      rgba(255,255,255,0.08);
  --hairline-mid:  rgba(255,255,255,0.10);

  --fg-1:  #ffffff;
  --fg-2:  rgba(255,255,255,0.75);
  --fg-3:  rgba(255,255,255,0.55);
  --fg-4:  rgba(255,255,255,0.40);

  /* ---------- Type ---------- */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;

  /* ---------- Type scale ---------- */
  --t-display: 56px; --t-h1: 40px; --t-h2: 28px; --t-h3: 20px;
  --t-body: 16px; --t-body-sm: 14px; --t-meta: 13.5px;
  --t-label: 12px; --t-micro: 11px;
  --lh-display: 1.05; --lh-heading: 1.15; --lh-body: 1.5;

  /* ---------- Spacing ---------- */
  --s-1:4px; --s-2:8px; --s-3:12px; --s-4:14px; --s-5:16px;
  --s-6:20px; --s-7:24px; --s-8:32px; --s-9:40px; --s-10:56px;

  /* ---------- Radii ---------- */
  --r-input:8px; --r-btn:10px; --r-image:12px;
  --r-card:14px; --r-dock:18px; --r-pill:99px;
  --radius: 0.875rem; /* shadcn compat */

  /* ---------- Shadow / Motion ---------- */
  --shadow-dock:    0 12px 40px rgba(0,0,0,0.5);
  --shadow-glow-ok: 0 0 8px rgba(34,197,94,0.6);
  --ease: cubic-bezier(0.4,0,0.2,1);
  --dur-fast: 0.15s; --dur: 0.2s;

  /* ---------- shadcn compatibility aliases ---------- */
  --background: var(--canvas);
  --foreground: var(--fg-1);
  --card:            var(--surface-1);
  --card-foreground: var(--fg-1);
  --popover:            var(--surface-1);
  --popover-foreground: var(--fg-1);
  --primary:            var(--fg-1);
  --primary-foreground: var(--canvas);
  --secondary:            var(--surface-2);
  --secondary-foreground: var(--fg-2);
  --muted:            var(--surface-2);
  --muted-foreground: var(--fg-3);
  --border: var(--hairline);
  --input:  var(--surface-input);
  --ring:   var(--accent);
  --magic-card-bg: rgba(255,255,255,0.05);
}

[data-theme="light"] {
  --canvas:        #f0eee9;
  --surface-1:     rgba(0,0,0,0.025);
  --surface-2:     rgba(0,0,0,0.05);
  --surface-input: rgba(0,0,0,0.02);
  --hairline:      rgba(0,0,0,0.08);
  --hairline-mid:  rgba(0,0,0,0.10);
  --fg-1:  #111111;
  --fg-2:  rgba(0,0,0,0.70);
  --fg-3:  rgba(0,0,0,0.55);
  --fg-4:  rgba(0,0,0,0.40);
  --shadow-dock: 0 12px 40px rgba(0,0,0,0.12);
  --magic-card-bg: rgba(0,0,0,0.03);
}
```

### Step 2: Update `@theme inline` Tailwind mappings

Replace the color references to use the new tokens, keep all animation declarations:

```css
@theme inline {
  /* Colors */
  --color-canvas:     var(--canvas);
  --color-surface-1:  var(--surface-1);
  --color-surface-2:  var(--surface-2);
  --color-hairline:   var(--hairline);
  --color-accent:     var(--accent);
  --color-accent-soft: var(--accent-soft);
  --color-status-ok:  var(--status-ok);
  --color-fg-1:       var(--fg-1);
  --color-fg-2:       var(--fg-2);
  --color-fg-3:       var(--fg-3);
  --color-fg-4:       var(--fg-4);

  /* shadcn compat (used by existing components) */
  --color-background:         var(--canvas);
  --color-foreground:         var(--fg-1);
  --color-card:               var(--surface-1);
  --color-card-foreground:    var(--fg-1);
  --color-popover:            var(--surface-1);
  --color-popover-foreground: var(--fg-1);
  --color-primary:            var(--fg-1);
  --color-primary-foreground: var(--canvas);
  --color-secondary:          var(--surface-2);
  --color-secondary-foreground: var(--fg-2);
  --color-muted:              var(--surface-2);
  --color-muted-foreground:   var(--fg-3);
  --color-accent:             var(--accent);
  --color-accent-foreground:  #ffffff;
  --color-destructive:        #ef4444;
  --color-destructive-foreground: #ffffff;
  --color-border:             var(--hairline);
  --color-input:              var(--surface-input);
  --color-ring:               var(--accent);

  /* Radii */
  --radius-sm: var(--r-input);
  --radius-md: var(--r-btn);
  --radius-lg: var(--r-card);

  /* Fonts */
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);

  /* ... keep all existing @keyframes unchanged ... */
}
```

### Step 3: Update `@layer base`

```css
@layer base {
  * { @apply border-border; }

  body {
    background: var(--canvas);
    color: var(--fg-1);
    font-family: var(--font-sans);
    font-size: var(--t-body);
    line-height: var(--lh-body);
    -webkit-font-smoothing: antialiased;
  }

  h1 { font-size: var(--t-display); line-height: var(--lh-display); font-weight: 600; letter-spacing: -0.02em; }
  h2 { font-size: var(--t-h1);      line-height: var(--lh-heading); font-weight: 600; letter-spacing: -0.015em; }
  h3 { font-size: var(--t-h2);      line-height: var(--lh-heading); font-weight: 600; letter-spacing: -0.01em; }
  h4 { font-size: var(--t-h3);      line-height: var(--lh-heading); font-weight: 600; }
  p  { font-size: var(--t-body);    line-height: var(--lh-body);    color: var(--fg-2); text-wrap: pretty; }

  .eyebrow, .mono-label {
    font-family: var(--font-mono);
    font-size: var(--t-micro);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--fg-3);
  }

  code, kbd {
    font-family: var(--font-mono);
    font-size: 0.92em;
    background: var(--surface-2);
    padding: 1px 5px;
    border-radius: 4px;
  }
}
```

## Todo List

- [ ] Replace `:root` color block with new design tokens
- [ ] Replace `.dark` block with `[data-theme="light"]` overrides
- [ ] Update `@custom-variant dark` selector to `[data-theme="dark"]`
- [ ] Update `@theme inline` color mappings
- [ ] Update `@layer base` body/heading/type rules
- [ ] Verify `npm run typecheck` and `npm run build` pass

## Success Criteria

- [ ] `bg-canvas`, `bg-surface-1`, `bg-surface-2`, `text-fg-1/2/3/4`, `text-accent`, `bg-accent` all available as Tailwind utilities
- [ ] Existing `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `bg-border` still work
- [ ] Dark mode (default) shows `#0f0f10` background
- [ ] Light mode shows `#f0eee9` background

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `bg-accent` used as neutral → now orange | High | Medium | Phase 4 audit fixes all callers |
| shadcn `card`/`surface` vars use rgba values (not HSL) | Medium | Low | Tailwind v4 accepts any CSS value in `@theme inline` |
| Existing MagicUI components reference `--magic-card-bg` | Low | Low | Preserved in both dark/light blocks |
