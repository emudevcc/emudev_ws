---
phase: 3
title: 'CSS Token Integration'
status: completed
priority: P1
effort: '1h'
dependencies: [1, 2]
---

# Phase 3: CSS Token Integration

## Overview

Extend `app/globals.css` with the full shadcn/ui color token system and the MagicUI-specific CSS variables that installed components reference. Current `globals.css` only has two tokens (`--background`, `--foreground`).

## Requirements

- Full shadcn/ui color token set in `:root` and `.dark` (supports light/dark mode)
- MagicUI components render without missing variable warnings
- Tailwind v4 `@theme inline` block maps new tokens to utilities

## Related Code Files

- Modify: `app/globals.css`

## Implementation Steps

### Step 1: Add shadcn/ui base color tokens

Replace the current minimal `:root` block with the full token set. Tailwind v4 uses CSS variables natively — no `tailwind.config.js` needed.

```css
@import 'tailwindcss';

:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 10% 3.9%;
  --radius: 0.5rem;
  /* MagicUI-specific */
  --magic-card-bg: hsl(240 10% 3.9% / 0.05);
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
  /* MagicUI-specific */
  --magic-card-bg: hsl(0 0% 100% / 0.05);
}
```

### Step 2: Add Tailwind v4 @theme inline block

```css
@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

### Step 3: Base layer

```css
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Step 4: Verify

```bash
npm run build
```

All `bg-muted`, `text-muted-foreground`, `border-border`, `bg-card` etc. classes must resolve.

## Todo List

- [x] Replace `:root` block in `globals.css` with full shadcn token set
- [x] Add `.dark` block
- [x] Update `@theme inline` block with all color mappings
- [x] Add `@layer base` body/border reset
- [x] `npm run build` — no missing token warnings

## Success Criteria

- [x] `globals.css` has `:root`, `.dark`, `@theme inline`, `@layer base`
- [x] `npm run build` passes; no CSS variable warnings
- [x] Dark mode toggle (added in Classic Layout Phase 2) switches palette correctly

## Risk Assessment

| Risk                                           | Likelihood | Impact | Mitigation                                                    |
| ---------------------------------------------- | ---------- | ------ | ------------------------------------------------------------- |
| Tailwind v4 hsl() token format differs from v3 | Low        | Low    | v4 supports `hsl(var(--x))` natively — this format is correct |
| Existing minimal globals.css colors conflict   | Very Low   | Low    | Full replace; keep `--font-sans`/`--font-mono`                |
