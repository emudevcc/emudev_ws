---
phase: 1
title: "Scroll Visibility Hook and DockNav Integration"
status: pending
priority: P2
effort: "30m"
dependencies: []
---

# Phase 1: Scroll Visibility Hook and DockNav Integration

## Overview

Create a `useScrollVisibility` hook that returns `false` on page load and flips to `true` on the first scroll event, then back to `false` after 3 seconds of scroll inactivity. Wire it into `DockNav` to drive a CSS opacity/translate transition.

## Requirements

- Functional:
  - Dock hidden on page load (no pop-in on first render)
  - Dock appears when user starts scrolling (any direction)
  - Dock hides again 3 seconds after last scroll event
  - Smooth entrance/exit animation (opacity + translate-y)
- Non-functional:
  - Passive scroll listener (no scroll jank)
  - `pointer-events-none` when hidden (no invisible click targets)
  - No new npm dependencies
  - Works with existing `prefers-reduced-motion` CSS media query

## Architecture

```
hooks/use-scroll-visibility.ts   (new)
  └─ window 'scroll' listener (passive)
  └─ visible: boolean state (starts false)
  └─ setTimeout(3000) resets visible → false after inactivity

components/ui/dock-nav.tsx       (modify)
  └─ import useScrollVisibility
  └─ replace static flex classes with transition-driven classes
```

State machine:
```
page load → visible = false
first scroll → visible = true, arm 3s timer
scroll again → reset timer (clearTimeout + new setTimeout)
3s no scroll → visible = false
```

## Related Code Files

- Create: `hooks/use-scroll-visibility.ts`
- Modify: `components/ui/dock-nav.tsx`

## Implementation Steps

### 1. `hooks/use-scroll-visibility.ts` (new file)

```ts
'use client'

import { useEffect, useState } from 'react'

export function useScrollVisibility(hideDelay = 3000): boolean {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    function onScroll() {
      setVisible(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setVisible(false), hideDelay)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(timeout)
    }
  }, [hideDelay])

  return visible
}
```

`passive: true` — never blocks scroll, zero jank.
Starts `false` — no flash of dock on page load.
Timer resets on every scroll event — dock stays visible while scrolling.

### 2. `components/ui/dock-nav.tsx` (modify)

Add import:
```ts
import { useScrollVisibility } from '@/hooks/use-scroll-visibility'
```

Inside `DockNav`:
```ts
const dockVisible = useScrollVisibility()
```

Replace the wrapper `<div>` className:
```tsx
// Before
<div className="fixed inset-x-0 bottom-4 z-50 hidden justify-center px-4 md:flex">

// After
<div
  className={cn(
    'fixed inset-x-0 bottom-4 z-50 hidden justify-center px-4 md:flex',
    'transition-all duration-300 ease-out',
    dockVisible
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-3 pointer-events-none',
  )}
>
```

`translate-y-3` (12px) — subtle slide-up on entrance, slide-down on exit.
`pointer-events-none` when hidden — prevents tabbing to or clicking invisible buttons.
`duration-300` — matches the project's motion pattern (fast enough, not snappy).

## Success Criteria

- [ ] Dock not visible on initial page load
- [ ] Dock appears within one scroll event (no lag)
- [ ] Dock disappears 3 seconds after last scroll
- [ ] Entrance/exit is animated (opacity + translate), not a snap
- [ ] No invisible click targets when dock is hidden (`pointer-events-none`)
- [ ] `npx tsc --noEmit` passes
- [ ] Dock still shows correct active section highlight while visible

## Risk Assessment

- **Low risk** — additive only; `useActiveSection` hook unchanged, all dock items unchanged
- `useState(false)` guarantees no SSR/hydration mismatch — server renders `opacity-0` class, client hydrates with same `false` state
- If the homepage has no scroll (very short content): dock stays hidden — acceptable; the fixed header nav is still available
- Timer leaks: `clearTimeout` in cleanup prevents leaks on unmount
