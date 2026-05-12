---
phase: 1
title: 'Install Free Tier Components'
status: completed
priority: P1
effort: '1h'
dependencies: []
---

# Phase 1: Install Free Tier Components

## Overview

Install all 10 MagicUI free-tier components needed by the Classic Layout via `npx shadcn@latest add` from the magicui.design registry. Each component lands in `components/ui/` as a local file.

## Requirements

- Functional: 10 components installed and importable
- Non-functional: Tailwind v4 compatible; `npm run typecheck` and `npm run build` pass

## Related Code Files

- Create (by CLI): `components/ui/dock.tsx`, `dot-pattern.tsx`, `blur-fade.tsx`, `number-ticker.tsx`, `shimmer-button.tsx`, `border-beam.tsx`, `marquee.tsx`, `avatar-circles.tsx`, `animated-shiny-text.tsx`, `interactive-hover-button.tsx`

## Implementation Steps

### Step 1: Initialize shadcn (if not present)

```bash
ls components/ui/button.tsx 2>/dev/null || npx shadcn@latest init
```

If prompting: style = `default`, base color = `slate`, confirm paths (`components/ui`, `lib/utils`).

### Step 2: Install all components

```bash
npx shadcn@latest add "https://magicui.design/r/dock.json"
npx shadcn@latest add "https://magicui.design/r/dot-pattern.json"
npx shadcn@latest add "https://magicui.design/r/blur-fade.json"
npx shadcn@latest add "https://magicui.design/r/number-ticker.json"
npx shadcn@latest add "https://magicui.design/r/shimmer-button.json"
npx shadcn@latest add "https://magicui.design/r/border-beam.json"
npx shadcn@latest add "https://magicui.design/r/marquee.json"
npx shadcn@latest add "https://magicui.design/r/avatar-circles.json"
npx shadcn@latest add "https://magicui.design/r/animated-shiny-text.json"
npx shadcn@latest add "https://magicui.design/r/interactive-hover-button.json"
```

> Use `--overwrite` flag only if re-running and prompted about existing files.

### Step 3: Ensure peer deps

```bash
npm list framer-motion clsx tailwind-merge 2>/dev/null
# If missing:
npm install framer-motion clsx tailwind-merge
```

### Step 4: Tailwind v4 check

Scan installed files for v3-only patterns:

```bash
grep -r "@apply\|ring-offset" components/ui/*.tsx 2>/dev/null
```

`@apply` is fine in v4. `ring-offset-*` classes changed — replace with `outline-offset-*` if found.

### Step 5: TypeScript + build verification

```bash
npm run typecheck && npm run build
```

## Todo List

- [x] shadcn initialized (or already present)
- [x] All 10 `npx shadcn@latest add` commands run
- [x] framer-motion + clsx + tailwind-merge in package.json
- [x] `npm run typecheck` — zero errors
- [x] `npm run build` — zero errors

## Success Criteria

- [x] 10 files in `components/ui/` from MagicUI
- [x] `npm run typecheck` passes
- [x] `npm run build` passes

## Risk Assessment

| Risk                                       | Likelihood | Impact | Mitigation                                                      |
| ------------------------------------------ | ---------- | ------ | --------------------------------------------------------------- |
| Tailwind v4 class incompatibility          | Low        | Medium | Run build check; fix `ring-offset` → `outline-offset` if needed |
| framer-motion version conflict             | Low        | Medium | Pin `framer-motion@^11` if needed                               |
| shadcn init overwrites existing components | Low        | Low    | Use `--overwrite` selectively; check git diff                   |
