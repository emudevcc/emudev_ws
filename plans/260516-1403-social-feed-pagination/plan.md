# Plan: Social Feed Grid Pagination

## Context

The social feed ("Web Signals") section renders all filtered items in a flat grid. As the list grows to 20–50+ items, the section becomes overwhelming to scroll. A pagination control is needed to cap visible items per page and let users navigate through the full set without scroll fatigue.

## Decision: Discrete Page Pagination

| Option | Verdict | Reason |
|---|---|---|
| Slider/carousel | ✗ | Collapses 3-col grid to a single strip — destroys spatial layout |
| Load more | ✗ | Breaks filter-tab UX (user loads 30 items, switches filter, position unclear) |
| **Pagination** | ✓ | Composes cleanly with filter tabs, preserves grid at all viewports, shows total volume ("2 / 4") |

## File Modified

`components/ui/social-feed-grid.tsx` — only file that changes.

---

## Implementation Steps

### 1. Imports + Constant

```ts
import { ChevronLeft, ChevronRight } from 'lucide-react'   // add to existing import

const PAGE_SIZE = 9  // 3×3 desktop grid; above the component
```

PAGE_SIZE = 9 fills exactly 3 rows on lg (3-col), is reasonable on sm (2-col), and acceptable on mobile (1-col).

### 2. State

```ts
const [page, setPage] = useState(1)   // add alongside existing `active`
```

### 3. Derived Values

```ts
const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

const pageItems = useMemo(
  () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
  [filtered, page]
)
```

### 4. Filter Handler — Reset Page on Tab Switch

```ts
// before
onClick={() => setActive(tab.id)}

// after
onClick={() => { setActive(tab.id); setPage(1) }}
```

React 18 batches both `setState` calls — no intermediate render with stale page.

### 5. Grid — Use `pageItems` + Include `page` in Key

```tsx
// before
{filtered.map((item, i) => (
  <BlurFade key={item.id} delay={0.04 + i * 0.05}>

// after
{pageItems.map((item, i) => (
  <BlurFade key={`${item.id}-p${page}`} delay={0.04 + i * 0.05}>
```

Including `page` in the key forces `BlurFade` to remount on page change, replaying the entrance animation. `BlurFade` with default `inView={false}` always animates on mount (`isInView` is always `true`), so this is safe.

### 6. Pagination Controls (after the grid `<div>`)

```tsx
{totalPages > 1 && (
  <div className="mt-8 flex items-center justify-center gap-3">
    <button
      type="button"
      onClick={() => setPage(p => Math.max(1, p - 1))}
      disabled={page === 1}
      aria-label="Previous page"
      className={cn(
        'shrink-0 rounded-full px-3 py-1.5 font-mono text-xs transition-colors duration-150',
        'border border-hairline bg-surface-1',
        page === 1 ? 'cursor-not-allowed text-fg-4' : 'text-fg-3 hover:text-foreground',
      )}
    >
      <ChevronLeft size={14} />
    </button>

    <span className="font-mono text-xs text-fg-3">{page} / {totalPages}</span>

    <button
      type="button"
      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
      disabled={page === totalPages}
      aria-label="Next page"
      className={cn(
        'shrink-0 rounded-full px-3 py-1.5 font-mono text-xs transition-colors duration-150',
        'border border-hairline bg-surface-1',
        page === totalPages ? 'cursor-not-allowed text-fg-4' : 'text-fg-3 hover:text-foreground',
      )}
    >
      <ChevronRight size={14} />
    </button>
  </div>
)}
```

Styling matches the existing filter tabs exactly: `rounded-full`, `px-3 py-1.5`, `font-mono text-xs`, `border-hairline`, `bg-surface-1`, `text-fg-3 hover:text-foreground`. The three-element flex row fits ~120px — safe on all viewports.

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| `totalPages === 1` | Controls not rendered |
| Filter switch while on page 2+ | `setPage(1)` in handler prevents empty slice |
| 0 items after filter | `Math.ceil(0/9) === 0`, controls hidden, grid renders empty (same as today) |

---

## Verification

1. `npm run dev` → scroll to Web Signals section
2. With 9+ items: pagination controls appear below grid
3. Click Next → page 2 loads, cards animate in, indicator shows "2 / N"
4. Switch filter tab → resets to page 1
5. With ≤9 items: controls not rendered
6. `npx tsc --noEmit` → no errors
