---
phase: 4
title: "Wire watch script into dev workflow"
status: pending
priority: P1
effort: "20m"
dependencies: [1, 2, 3]
---

# Phase 4: Wire watch script into dev workflow

## Overview
Install `concurrently` and update `package.json` scripts so that `npm run dev` starts both Turbopack and the token watcher. Saving `lib/design-tokens.ts` triggers `generate-css-tokens.ts`, which updates `app/globals.css`, which Turbopack hot-reloads in the browser — completing the live feedback loop.

## Requirements
- Functional: Single `npm run dev` command starts both processes; token changes reflect in browser without manual steps
- Non-functional: `concurrently` uses `--kill-others-on-fail` so a crash in either process exits cleanly; existing `build` and `start` scripts untouched

## Architecture

```
npm run dev
  ├── next dev --turbopack          (Turbopack: compiles, HMR, serves)
  └── tsx --watch scripts/generate-css-tokens.ts
        ├── watches: lib/design-tokens.ts (imported dep)
        ├── on change: rewrites app/globals.css
        └── Turbopack detects globals.css change → CSS HMR in browser
```

`tsx --watch` uses Node's file watcher on the script and all its `import` dependencies. Since `generate-css-tokens.ts` imports `lib/design-tokens.ts`, any save to the tokens file triggers a rerun.

## Related Code Files
- Modify: `package.json`

## Implementation Steps

### 1. Install `concurrently`

```bash
npm install --save-dev concurrently
```

### 2. Update `package.json` scripts

Current:
```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

Updated:
```json
"scripts": {
  "dev": "concurrently --kill-others-on-fail \"next dev --turbopack\" \"tsx --watch scripts/generate-css-tokens.ts\"",
  "generate:tokens": "tsx scripts/generate-css-tokens.ts",
  "build": "npm run generate:tokens && next build",
  "start": "next start",
  "lint": "next lint"
}
```

Key decisions:
- `--kill-others-on-fail` — if either process crashes, the other is killed. Prevents zombie processes.
- `generate:tokens` standalone — allows one-shot generation without starting the dev server (useful in CI or before committing)
- `build` prepends `generate:tokens` — ensures `globals.css` is always up-to-date before a production build, even if the developer forgot to run it manually
- `tsx --watch` — available from `tsx` package; check if already in devDeps or install via `npm install --save-dev tsx`

### 3. Verify `tsx` is available

```bash
npx tsx --version
```

If not found, install:
```bash
npm install --save-dev tsx
```

### 4. Test the full loop

1. Start dev: `npm run dev`
2. Confirm both processes start (look for Turbopack ready message + `[tokens] globals.css updated`)
3. Change a value in `lib/design-tokens.ts` (e.g. `brand.accent: '#ff0000'`)
4. Save the file
5. Observe: `[tokens] globals.css updated — HH:MM:SS` in terminal
6. Observe: browser hot-reloads with updated color
7. Revert the change and confirm it reverts in browser

### 5. Add a `.gitattributes` note (optional)

If the team uses diffing tools, add a comment in `globals.css` near the markers:
```css
/* ============================================================
   GENERATED SECTION: do not edit between [tokens:*] markers.
   Edit lib/design-tokens.ts instead, then run npm run generate:tokens
   ============================================================ */
```

## Success Criteria
- [ ] `concurrently` added to devDependencies
- [ ] `npm run dev` starts both Turbopack and the token watcher
- [ ] Saving `design-tokens.ts` triggers `[tokens] globals.css updated` in terminal
- [ ] Browser reflects token value changes via CSS HMR (no manual refresh needed)
- [ ] `npm run build` runs `generate:tokens` before `next build`
- [ ] `npm run generate:tokens` works as a standalone one-shot command

## Risk Assessment
- **`tsx --watch` watching globals.css**: After the script writes `globals.css`, `tsx` might detect the write and re-trigger (since `globals.css` is a sibling file). This would NOT happen because `tsx --watch` only watches TypeScript imports of the script, not arbitrary FS paths. The write to `globals.css` will not cause a re-trigger loop.
- **Turbopack CSS HMR**: Turbopack watches `globals.css` via its own FS watcher. The file write from the script triggers Turbopack's CSS pipeline normally — no special configuration needed.
- **`concurrently` output interleaving**: Both processes write to stdout simultaneously. `concurrently` prefixes each line with the process name (`[0]`, `[1]`) for clarity. To use named prefixes: `concurrently --names "next,tokens"`.
