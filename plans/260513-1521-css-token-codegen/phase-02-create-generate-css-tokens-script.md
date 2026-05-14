---
phase: 2
title: "Create generate-css-tokens script"
status: pending
priority: P1
effort: "45m"
dependencies: [1]
---

# Phase 2: Create generate-css-tokens script

## Overview
Create `scripts/generate-css-tokens.ts` — a one-shot Node script that reads `cssVars` from `lib/design-tokens.ts` and rewrites the generated sections of `app/globals.css` in place. When run under `tsx --watch`, it re-fires on every save of `design-tokens.ts`.

## Requirements
- Functional: Script reads `cssVars.root` and `cssVars.light`, finds the marker comments in `globals.css`, replaces only the content between them, writes back to disk
- Non-functional: No new npm deps (uses Node built-ins `fs` and `path`); must be idempotent (running twice produces identical output); preserves indentation of surrounding CSS

## Architecture

```
lib/design-tokens.ts  (cssVars export)
         ↓  (import)
scripts/generate-css-tokens.ts
         ↓  (fs.readFileSync / writeFileSync)
app/globals.css
  :root {
    /* [tokens:start] */     ← script replaces everything here
    --accent: #e34d2a;
    ...
    /* [tokens:end] */
  }
  [data-theme='light'] {
    /* [tokens-light:start] */     ← and here
    --canvas: #f0eee9;
    ...
    /* [tokens-light:end] */
  }
```

The marker pattern uses HTML/CSS comment style so it's invisible to the browser and doesn't affect Tailwind parsing.

## Related Code Files
- Create: `scripts/generate-css-tokens.ts`
- Read: `lib/design-tokens.ts`
- Read/Write: `app/globals.css`

## Implementation Steps

### 1. Create `scripts/generate-css-tokens.ts`

```typescript
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { cssVars } from '../lib/design-tokens'

const CSS_PATH = resolve(__dirname, '../app/globals.css')
const INDENT = '  '

function renderVars(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([prop, value]) => `${INDENT}${prop}: ${value};`)
    .join('\n')
}

function replaceSection(css: string, startMarker: string, endMarker: string, content: string): string {
  const start = css.indexOf(startMarker)
  const end = css.indexOf(endMarker)
  if (start === -1 || end === -1) {
    throw new Error(`Markers not found: ${startMarker}`)
  }
  return (
    css.slice(0, start + startMarker.length) +
    '\n' +
    content +
    '\n' +
    INDENT +
    css.slice(end)
  )
}

const css = readFileSync(CSS_PATH, 'utf-8')

const result = replaceSection(
  replaceSection(
    css,
    '/* [tokens:start] */',
    '/* [tokens:end] */',
    renderVars(cssVars.root)
  ),
  '/* [tokens-light:start] */',
  '/* [tokens-light:end] */',
  renderVars(cssVars.light)
)

writeFileSync(CSS_PATH, result, 'utf-8')
console.log(`[tokens] globals.css updated — ${new Date().toLocaleTimeString()}`)
```

### 2. Verify script can be run standalone

```bash
npx tsx scripts/generate-css-tokens.ts
```

Expected output: `[tokens] globals.css updated — HH:MM:SS`

Verify `globals.css` is unchanged from before (since values match the existing CSS).

## Success Criteria
- [ ] `scripts/generate-css-tokens.ts` exists
- [ ] Script runs without errors: `npx tsx scripts/generate-css-tokens.ts`
- [ ] Running it twice produces identical `globals.css` (idempotent)
- [ ] Script output shows the timestamp line
- [ ] Script throws a clear error if markers are missing (not silent failure)

## Risk Assessment
- **Marker not found**: script throws with message — fail fast, no partial write
- **Encoding**: `utf-8` explicit on both read and write — no BOM issues
- **Watch loop thrash**: `tsx --watch` re-fires when `globals.css` changes. Since the script only writes if tokens changed and the output is idempotent, this won't cause infinite loops (file content identical → no FS event → no re-trigger). Turbopack handles CSS HMR separately.
