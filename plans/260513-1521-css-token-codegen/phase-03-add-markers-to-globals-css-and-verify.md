---
phase: 3
title: "Add markers to globals.css and verify"
status: pending
priority: P1
effort: "20m"
dependencies: [1, 2]
---

# Phase 3: Add markers to globals.css and verify

## Overview
Insert the four marker comments into `app/globals.css` around the token-derived vars in `:root` and `[data-theme='light']`. Then run the codegen script once to confirm it produces output byte-for-byte identical to the existing file — proving the markers are placed correctly and the token values match.

## Requirements
- Functional: Two pairs of markers added; codegen script runs cleanly; `globals.css` content unchanged after first run
- Non-functional: Markers must be inside the CSS rule braces, indented 2 spaces, so the output indentation matches the rest of the file

## Architecture

### Marker placement in `:root`

```css
:root {
  /* [tokens:start] */
  /* ---------- Brand ---------- */
  --accent: #e34d2a;
  --accent-soft: #e34d2a1a;
  --accent-line: #e34d2a33;
  --status-ok: #22c55e;
  --spotify: #1ed760;

  /* ---------- Dark palette (default) ---------- */
  --canvas: #0f0f10;
  ...
  --dur: 0.2s;
  /* [tokens:end] */

  /* ---------- Type ---------- */         ← stays manual (font vars)
  --font-sans: var(--font-inter, ...);
  --font-mono: var(--font-jetbrains-mono, ...);

  --radius: 0.875rem;                       ← stays manual (shadcn compat)
  --magic-card-bg: rgba(255,255,255,0.05);  ← stays manual

  /* ---------- shadcn compatibility aliases ---------- */
  --background: var(--canvas);
  ...                                        ← stays manual (all aliases)
}
```

### Marker placement in `[data-theme='light']`

```css
[data-theme='light'] {
  /* [tokens-light:start] */
  --canvas: #f0eee9;
  ...
  --shadow-dock: 0 12px 40px rgba(0,0,0,0.12);
  /* [tokens-light:end] */
  --magic-card-bg: rgba(0,0,0,0.03);        ← stays manual
}
```

## Related Code Files
- Modify: `app/globals.css`

## Implementation Steps

### 1. Read the current `app/globals.css` carefully

Identify exact line numbers for:
- Line after `{` opening of `:root` → insert `/* [tokens:start] */` here (before `/* --- Brand ---*/` comment)
- Line after the last token-derived var in `:root` (`--dur: 0.2s;`) → insert `/* [tokens:end] */` here
- Line after `{` opening of `[data-theme='light']` → insert `/* [tokens-light:start] */`
- Line after `--shadow-dock` in the light block → insert `/* [tokens-light:end] */`

### 2. Insert the four marker comments

In `:root`, after the opening `{`:
```css
:root {
  /* [tokens:start] */
  /* ---------- Brand ---------- */
  --accent: #e34d2a;
```

After `--dur: 0.2s;` and before the blank line leading to font vars:
```css
  --dur: 0.2s;
  /* [tokens:end] */

  /* ---------- Type ---------- */
```

In `[data-theme='light']`, after the opening `{`:
```css
[data-theme='light'] {
  /* [tokens-light:start] */
  --canvas: #f0eee9;
```

After `--shadow-dock` and before `--magic-card-bg`:
```css
  --shadow-dock: 0 12px 40px rgba(0,0,0,0.12);
  /* [tokens-light:end] */
  --magic-card-bg: rgba(0,0,0,0.03);
```

### 3. Run codegen script and verify no diff

```bash
# Run the script
npx tsx scripts/generate-css-tokens.ts

# Verify globals.css is unchanged (git should show no diff)
git diff app/globals.css
```

Expected: no output from `git diff` (or only whitespace normalization if Prettier normalizes spacing).

If there IS a diff, it means the token values in `design-tokens.ts` don't exactly match what's currently in `globals.css`. In that case:
- Check which vars differ
- Update the token values in `design-tokens.ts` to match the CSS (or vice versa, intentionally)
- Re-run until diff is clean

## Success Criteria
- [ ] Four markers added: `[tokens:start]`, `[tokens:end]`, `[tokens-light:start]`, `[tokens-light:end]`
- [ ] `npx tsx scripts/generate-css-tokens.ts` runs without errors
- [ ] `git diff app/globals.css` shows no changes after the first run
- [ ] `npx tsc --noEmit` still passes
- [ ] Dev server still starts without CSS errors

## Risk Assessment
- **Prettier reformats on save**: The hook may normalize `rgba(255,255,255,0.04)` spacing. If so, update `renderVars` output format in the script to match Prettier's style (spaces inside rgba parens). Or add `globals.css` to Prettier ignore for the generated section.
- **Marker inside comment block**: If the font-var comment block (`/* --- Type --- */`) appears between tokens section and the end marker, the script must place `[tokens:end]` AFTER the last actual token var, not inside a comment group.
