---
phase: 1
title: "Icon Animation + Clickable URLs"
status: complete
priority: P2
effort: "30 min"
dependencies: []
---

# Phase 1: Icon Animation + Clickable URLs

## Overview

Two independent micro-polish items in `ai-chat-widget.tsx`: (A) animate the collapsed chat button with a ping ring + subtle scale pulse to draw attention before the user opens it; (B) extend `parseInline` to detect `https?://` URLs and render them as `<a>` elements.

## Requirements

- Functional:
  - Collapsed button shows a subtle ping ring emanating from behind it while `!everOpened`
  - Ring and scale pulse both stop permanently once the user opens the widget (`everOpened = true`)
  - URLs in assistant messages are clickable — open in new tab with `rel="noopener noreferrer"`
  - URL links have accessible styling (underline + accent color) and `break-all` to prevent overflow
- Non-functional:
  - No new packages — ping uses Tailwind `animate-ping`, scale uses a Tailwind custom keyframe in `tailwind.config.ts`
  - `parseInline` change must not break existing bold / italic / code rendering

## Related Code Files

- Modify: `components/ui/ai-chat-widget.tsx`
- Modify: `tailwind.config.ts` (add `chat-pulse` keyframe + animation token)

## Implementation Steps

### 1. Add `chat-pulse` keyframe to `tailwind.config.ts`

Open `tailwind.config.ts`. Locate the `theme.extend` block (or create it). Add:

```ts
keyframes: {
  'chat-pulse': {
    '0%, 100%': { transform: 'scale(1)' },
    '50%':       { transform: 'scale(1.05)' },
  },
},
animation: {
  'chat-pulse': 'chat-pulse 3s ease-in-out infinite',
},
```

This adds a gentle 5% scale breath that reads as "alive" without being distracting.

### 2. Add ping ring span (fixed, z-[59])

In `ai-chat-widget.tsx`, inside the collapsed branch (`if (!isOpen) { return ( <> … </> ) }`), add a `<span>` **before** the `{showBadge && …}` block:

```tsx
{!everOpened && (
  <span
    className="fixed bottom-6 right-4 z-[59] size-14 animate-ping rounded-full bg-accent/25 sm:right-6"
    aria-hidden="true"
  />
)}
```

Key points:
- `z-[59]` — one layer below the button (`z-[60]`), so it appears behind
- `size-14` matches the button — ping scales from 1× outward and fades to opacity 0
- `bg-accent/25` — low-opacity accent so it's noticeable but not harsh
- `aria-hidden="true"` — decorative, screen readers skip it
- Positioned identically to the button (`bottom-6 right-4 sm:right-6`) — no wrapper needed

### 3. Add scale pulse to the collapsed button

The button currently has class `transition-transform duration-200 hover:scale-105 active:scale-95`. Add the custom animation when `!everOpened`:

```tsx
className={cn(
  'fixed bottom-6 right-4 z-[60] flex size-14 items-center justify-center rounded-full border border-hairline bg-[var(--dock-bg)] text-fg-1 shadow-[var(--shadow-dock)] backdrop-blur transition-transform duration-200 hover:scale-105 active:scale-95 sm:right-6',
  !everOpened && 'animate-[chat-pulse_3s_ease-in-out_infinite]'
)}
```

The `hover:scale-105` pseudo-class overrides the animation transform on hover (higher CSS specificity), so hover feedback still works correctly.

### 4. Extend `parseInline` to handle URLs

Current regex (line 31):
```ts
const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
```

Replace with (add URL as group 5):
```ts
const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|(https?:\/\/[^\s<>"']+))/g
```

Add the URL case after the `code` case (after the `else if (match[4])` block):

```tsx
} else if (match[5]) {
  parts.push(
    <a
      key={match.index}
      href={match[5]}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-accent underline hover:opacity-80"
    >
      {match[5]}
    </a>
  )
}
```

The URL regex `[^\s<>"']+` stops at whitespace and common HTML boundary chars — safe for plain text chat output.

## Success Criteria

- [x] Ping ring visible behind button on page load (before widget is opened)
- [x] Button has a gentle 3s scale pulse while collapsed and unopened
- [x] Both animations absent after widget is opened once (`everOpened = true`)
- [x] Assistant messages with `https://…` URLs render as clickable `<a>` tags
- [x] URL links open in new tab; no XSS risk (no `javascript:` handling)
- [x] Bold, italic, code rendering unchanged
- [x] `npm run typecheck` passes

## Risk Assessment

- **`hover:scale-105` + keyframe conflict**: CSS animation has lower priority than pseudo-class declarations. Hover correctly overrides the idle pulse — tested pattern. No regression.
- **URL regex too greedy**: `[^\s<>"']+` may include a trailing `.` or `,` from punctuation. Acceptable for chat — AI-generated URLs rarely have trailing punctuation. Could tighten with `(?<![.,!?])` lookbehind if needed.
- **Ping flicker on mount**: `animate-ping` starts immediately. If `!everOpened` evaluation is synchronous (it is — initial state `false`), ring appears on first render. No flicker.
