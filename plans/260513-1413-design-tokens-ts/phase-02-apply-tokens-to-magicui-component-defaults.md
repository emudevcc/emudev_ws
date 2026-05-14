---
phase: 2
title: Apply tokens to MagicUI component defaults
status: completed
priority: P1
effort: 45m
dependencies:
  - 1
---

# Phase 2: Apply tokens to MagicUI component defaults

## Overview
Update the default prop values in `border-beam.tsx`, `magic-card.tsx`, and `shimmer-button.tsx` to import `tokens` from `@/lib/design-tokens` instead of using hardcoded hex/purple defaults. Any call site that omits these props automatically gets brand-aligned accent colors.

## Requirements
- Functional: `colorFrom`, `colorTo`, `gradientColor`, `shimmerColor` default to token values
- Non-functional: No behavioral change — only defaults shift; explicit prop overrides still win; static import (tree-shakeable)

## Architecture
```
lib/design-tokens.ts
  tokens.colors.borderBeam.from   → border-beam.tsx  colorFrom  default  → '#e34d2a'
  tokens.colors.borderBeam.to     → border-beam.tsx  colorTo    default  → '#e34d2a33'
  tokens.colors.magicCard.gradient → magic-card.tsx  gradientColor default → 'rgba(227,77,42,0.08)'
  tokens.colors.shimmer           → shimmer-button.tsx shimmerColor default → '#e34d2a'
```

## Related Code Files
- Modify: `components/ui/border-beam.tsx`
- Modify: `components/ui/magic-card.tsx`
- Modify: `components/ui/shimmer-button.tsx`
- Read: `lib/design-tokens.ts` (Phase 1 output)

## Implementation Steps

### 1. `components/ui/border-beam.tsx`

Read the file first. Find the default parameter values:
```typescript
// current:
colorFrom = '#ffaa40',
colorTo = '#9c40ff',
```

Replace with:
```typescript
import { tokens } from '@/lib/design-tokens'

// updated defaults:
colorFrom = tokens.colors.borderBeam.from,   // '#e34d2a'
colorTo = tokens.colors.borderBeam.to,       // '#e34d2a33' — hex-alpha fade
```

### 2. `components/ui/magic-card.tsx`

Read the file first. Find:
```typescript
// current:
gradientColor = '#262626',
```

Replace with:
```typescript
import { tokens } from '@/lib/design-tokens'

gradientColor = tokens.colors.magicCard.gradient,  // 'rgba(227,77,42,0.08)'
```

Note: if the component also exposes `gradientOpacity` as a separate prop, leave it unchanged — it's already factored into the token's rgba alpha.

### 3. `components/ui/shimmer-button.tsx`

Read the file first. Find:
```typescript
// current:
shimmerColor = '#ffffff',
```

Replace with:
```typescript
import { tokens } from '@/lib/design-tokens'

shimmerColor = tokens.colors.shimmer,  // '#e34d2a'
```

### 4. Verify compilation
```bash
npx tsc --noEmit
```

## Success Criteria
- [ ] `border-beam.tsx` defaults: `colorFrom = tokens.colors.borderBeam.from`, `colorTo = tokens.colors.borderBeam.to`
- [ ] `magic-card.tsx` default: `gradientColor = tokens.colors.magicCard.gradient`
- [ ] `shimmer-button.tsx` default: `shimmerColor = tokens.colors.shimmer`
- [ ] All three files compile without errors
- [ ] Call sites already passing explicit color props are unaffected

## Risk Assessment
Low. Default prop values only. The new accent-based defaults will replace the old purple/gold coloring on any usage that relied on implicit defaults — that is the intended outcome.
