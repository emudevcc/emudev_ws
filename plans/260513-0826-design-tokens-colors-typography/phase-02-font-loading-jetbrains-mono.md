---
phase: 2
title: "Font loading (JetBrains Mono)"
status: completed
priority: P1
effort: "20m"
dependencies: [1]
completedAt: "2026-05-13"
---

# Phase 2: Font loading (JetBrains Mono)

## Overview

Add JetBrains Mono via `next/font/google` in `app/[locale]/layout.tsx` alongside existing Inter. Wire both font CSS variables into the `<body>` className so the CSS `var(--font-mono)` declaration resolves to the correct `next/font`-generated variable.

## Requirements

- Functional: `font-mono` Tailwind utility and `var(--font-mono)` CSS var render JetBrains Mono on all devices
- Non-functional: fonts are self-hosted by Next.js (no Google CDN request at runtime); Inter sub-setting preserved

## Related Code Files

- Modify: `app/[locale]/layout.tsx`

## Implementation Steps

### Step 1: Update font declarations in `app/[locale]/layout.tsx`

```typescript
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',   // exposes as CSS var
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})
```

### Step 2: Apply CSS variables on `<body>`

```tsx
<body className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}>
```

### Step 3: Update `@theme inline` font references in `globals.css` (done in Phase 1)

Phase 1 already sets:
```css
--font-sans: var(--font-sans);   /* from globals.css :root */
--font-mono: var(--font-mono);   /* from globals.css :root */
```

But `globals.css :root` sets:
```css
--font-sans: 'Inter', system-ui, ...;
--font-mono: 'JetBrains Mono', ui-monospace, ...;
```

These are fallback strings. To use the `next/font` optimised variable, update globals.css `:root` to prefer the CSS variable:

```css
--font-sans: var(--font-inter, 'Inter', system-ui, -apple-system, sans-serif);
--font-mono: var(--font-jetbrains-mono, 'JetBrains Mono', ui-monospace, monospace);
```

This way: when `--font-inter` is injected by `next/font` (via the `body` class), it wins. If somehow missing, the string fallback applies.

## Todo List

- [ ] Replace `Inter` import with named `{ Inter, JetBrains_Mono }` from `next/font/google`
- [ ] Add `variable` option to Inter config (`--font-inter`)
- [ ] Add `JetBrains_Mono` font config with variable `--font-jetbrains-mono`
- [ ] Update `<body>` className to include both `.variable` strings
- [ ] Update `globals.css` `--font-sans`/`--font-mono` to use `var(--font-inter, ...)` / `var(--font-jetbrains-mono, ...)` fallback syntax
- [ ] Verify JetBrains Mono renders in browser on monospaced elements (`code`, `.mono-label`)

## Success Criteria

- [ ] Network tab: no `fonts.googleapis.com` requests; fonts served from `/_next/static/media/`
- [ ] `font-family` on `<code>` elements resolves to JetBrains Mono
- [ ] `font-family` on `<body>` resolves to Inter
- [ ] `npm run build` passes (no missing font errors)
