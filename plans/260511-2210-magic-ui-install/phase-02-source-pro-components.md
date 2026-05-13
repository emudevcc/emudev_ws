---
phase: 2
title: 'Source Pro Components'
status: completed
priority: P1
effort: '1h'
dependencies: [1]
---

# Phase 2: Source Pro Components

## Overview

Manually copy two MagicUI Pro components from magicui.design/pro into `components/ui/`. These are the only Pro components used in the Classic Layout. Files are self-contained local copies — no Pro registry imports at runtime.

## Implementation Note

Magic UI Pro source is not accessible through MCP or the public registry. This phase was completed with local API-compatible implementations of `MagicCard` and `Lens` that match the expected interfaces and avoid runtime registry imports.

## Requirements

- `components/ui/magic-card.tsx` — mouse-spotlight card wrapper
- `components/ui/lens.tsx` — zoom-on-hover image overlay
- Both compile with no TypeScript errors

## Related Code Files

- Create: `components/ui/magic-card.tsx`
- Create: `components/ui/lens.tsx`

## Implementation Steps

### Step 1: Source MagicCard

1. Log into magicui.design/pro
2. Navigate to **MagicCard** component → copy full TSX source
3. Create `components/ui/magic-card.tsx`

Expected API:

```typescript
interface MagicCardProps {
  children: React.ReactNode
  className?: string
  gradientSize?: number // spotlight radius px
  gradientColor?: string // e.g. '#262626'
  gradientOpacity?: number // 0-1
}
export function MagicCard(props: MagicCardProps): JSX.Element
```

### Step 2: Source Lens

1. Navigate to **Lens** component on magicui.design/pro → copy full TSX source
2. Create `components/ui/lens.tsx`

Expected API:

```typescript
interface LensProps {
  children: React.ReactNode
  zoomFactor?: number // default 1.5
  lensSize?: number // px, default 170
  isStatic?: boolean
  duration?: number
}
export function Lens(props: LensProps): JSX.Element
```

### Step 3: Fix external imports

Remove any `import { ... } from '@magicui/...'` or registry URL imports. Replace with:

- framer-motion (already installed)
- `clsx` / `tailwind-merge` via `lib/utils`
- Plain React

### Step 4: Verify

```bash
npm run typecheck
```

## Todo List

- [x] Confirm Pro source is not available through MCP/public registry
- [x] `components/ui/magic-card.tsx` created with expected API
- [x] `components/ui/lens.tsx` created with expected API
- [x] Registry imports replaced with local equivalents
- [x] `npm run typecheck` — zero errors

## Success Criteria

- [x] `MagicCard` importable from `@/components/ui/magic-card`
- [x] `Lens` importable from `@/components/ui/lens`
- [x] No runtime registry fetches in either component

## Risk Assessment

| Risk                                      | Likelihood | Impact | Mitigation                               |
| ----------------------------------------- | ---------- | ------ | ---------------------------------------- |
| Pro source uses internal registry imports | Low        | Medium | Replace with framer-motion + clsx inline |
| framer-motion API mismatch (v10 vs v11)   | Low        | Low    | Both target framer-motion@^11            |
