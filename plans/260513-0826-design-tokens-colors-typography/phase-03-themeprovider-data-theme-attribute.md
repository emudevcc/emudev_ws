---
phase: 3
title: "ThemeProvider data-theme attribute"
status: completed
priority: P1
effort: "20m"
dependencies: [1]
completedAt: "2026-05-13"
---

# Phase 3: ThemeProvider data-theme attribute

## Overview

Switch `next-themes` from adding a `.dark` class to setting `data-theme="dark"` / `data-theme="light"` on `<html>`. Update `globals.css` `@custom-variant` selector to match. This is a two-line change with one coordination point in CSS.

## Requirements

- Functional: light/dark toggle continues to work; new `[data-theme="light"]` overrides in Phase 1 activate correctly
- Non-functional: zero hydration mismatch (`suppressHydrationWarning` already on `<html>`)

## Related Code Files

- Modify: `app/[locale]/layout.tsx` — `ThemeProvider attribute` prop
- Already handled in Phase 1: `globals.css` `@custom-variant dark`

## Implementation Steps

### Step 1: Update `ThemeProvider` in `app/[locale]/layout.tsx`

```tsx
<ThemeProvider
  attribute="data-theme"   // was: "class"
  defaultTheme="dark"      // was: "system" — match dark-first spec
  enableSystem={false}     // disable system preference; explicit dark default
  disableTransitionOnChange
>
```

**Note on `defaultTheme`:** The design spec is dark-first (`:root` = dark). Changing to `defaultTheme="dark"` ensures SSR and first paint are always dark. Users can toggle to light. Remove `enableSystem` to prevent system preference overriding the dark default (optional — remove this line if system preference should be respected).

### Step 2: Verify `@custom-variant` in `globals.css` (already done in Phase 1)

Phase 1 sets:
```css
@custom-variant dark (&:is([data-theme="dark"] *));
```

This activates `dark:` Tailwind utilities when `[data-theme="dark"]` is on any ancestor element (including `<html>`).

### Step 3: Verify `LangThemeToggle` still works

`components/ui/lang-theme-toggle.tsx` uses `useTheme()` from `next-themes` — no change needed. `next-themes` handles the attribute change internally.

## Todo List

- [ ] Change `attribute="class"` → `attribute="data-theme"` in ThemeProvider
- [ ] Change `defaultTheme="system"` → `defaultTheme="dark"`
- [ ] Remove or set `enableSystem={false}` (per preference — dark-first by default)
- [ ] Confirm `@custom-variant dark` in globals.css uses `[data-theme="dark"]` (Phase 1 handles this)
- [ ] Test toggle: clicking sun/moon icon switches between `[data-theme="dark"]` and `[data-theme="light"]` on `<html>`
- [ ] Test: hard reload does not flash white (SSR renders dark by default)

## Success Criteria

- [ ] `<html data-theme="dark">` on initial load
- [ ] Theme toggle switches to `<html data-theme="light">` and back
- [ ] Background color changes: `#0f0f10` (dark) ↔ `#f0eee9` (light)
- [ ] `dark:` Tailwind utilities activate/deactivate correctly with toggle
- [ ] No hydration mismatch warnings in console

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `next-themes` cookie/localStorage stores old `"dark"` class theme | Low | Low | Clearing localStorage resolves; next-themes migrates gracefully |
| Components using `class="dark:..."` break | Very Low | None | `dark:` utilities work via `@custom-variant` regardless of attribute vs class |
