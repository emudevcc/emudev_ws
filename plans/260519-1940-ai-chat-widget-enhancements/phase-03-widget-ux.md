---
phase: 3
title: "Widget UX"
status: complete
priority: P2
effort: "1.5h"
dependencies: [phase-02-markdown-i18n]
---

# Phase 3: Widget UX

## Overview

Four UX improvements to the collapsed and open widget: (5) replace the `Bot` icon with the owner's Sanity profile photo, (6) add Magic UI animation to the "Ask me about my work" bubble, (8) show the bubble randomly/periodically instead of once after 5 s, and (9) add three suggested-question chips inside the empty state.

## Requirements

- Functional:
  - Chat button shows a circular profile photo loaded from `siteSettings.avatar` (Sanity CDN URL); falls back to the `Bot` icon if URL is absent
  - "Ask me about my work" bubble uses `AnimatedShinyText` (Magic UI) for an attention-grab shimmer effect
  - Bubble appears randomly: first show at a random delay between 8–20 s, then re-appears every 30–60 s as long as the widget is collapsed and the user hasn't opened it yet
  - Three suggested-question chips appear in the empty state (no messages yet); clicking a chip populates the input and auto-sends
  - Suggested questions come from `t.raw('suggestions')` (Phase 2 i18n)
- Non-functional:
  - `avatarUrl` flows as a prop: `layout.tsx` → `LayoutWidgets` → `AIChatWidget` (no client-side fetch)
  - Magic UI `AnimatedShinyText` already installed — no new packages
  - Bubble random timer cleaned up on unmount
  - `next/image` used for profile photo (optimized)

## Architecture

```
app/[locale]/layout.tsx  (Server Component)
  siteSettings.avatar  →  avatarUrl?: string
       │
       ▼
components/layout-widgets.tsx  (Client Component)
  <AIChatWidget avatarUrl={avatarUrl} />
       │
components/ui/ai-chat-widget.tsx
  props: { avatarUrl?: string }
  ├── collapsed: profile photo button + AnimatedShinyText bubble
  │              random interval timer
  └── open: suggested-question chips in empty state
```

## Related Code Files

- Modify: `app/[locale]/layout.tsx`
- Modify: `components/layout-widgets.tsx`
- Modify: `components/ui/ai-chat-widget.tsx`

## Implementation Steps

### 1. Pass `avatarUrl` from `layout.tsx` to `LayoutWidgets`

In `app/[locale]/layout.tsx`, `siteSettings` is already fetched. Add:

```tsx
<LayoutWidgets
  showVisualEditing={isDraft}
  avatarUrl={settings?.avatar ?? undefined}
/>
```

### 2. Update `LayoutWidgets` prop type and forward to widget

```tsx
// components/layout-widgets.tsx
type LayoutWidgetsProps = {
  showVisualEditing?: boolean
  avatarUrl?: string
}

export function LayoutWidgets({ showVisualEditing, avatarUrl }: LayoutWidgetsProps) {
  // ...
  return (
    <>
      <AIChatWidget avatarUrl={avatarUrl} />
      {/* ... */}
    </>
  )
}
```

`AIChatWidget` is imported via `next/dynamic` with `ssr: false` — the prop flows through fine.

### 3. Update `AIChatWidget` to accept and use `avatarUrl`

```tsx
type AIChatWidgetProps = {
  avatarUrl?: string
}

export function AIChatWidget({ avatarUrl }: AIChatWidgetProps) {
  // ...
}
```

**Chat button (collapsed state):**
```tsx
<button
  type="button"
  onClick={openWidget}
  className="fixed bottom-6 right-4 z-[60] flex size-14 items-center justify-center rounded-full border border-hairline bg-[var(--dock-bg)] shadow-[var(--shadow-dock)] backdrop-blur transition-transform duration-200 hover:scale-105 active:scale-95 sm:right-6"
  aria-label={t('ariaOpen')}
>
  {avatarUrl ? (
    <Image
      src={avatarUrl}
      alt="Esteban"
      width={56}
      height={56}
      className="size-14 rounded-full object-cover"
      priority
    />
  ) : (
    <MessageCircle size={22} className="text-fg-1" />
  )}
</button>
```

**Header avatar (open state):**
```tsx
<span className="flex size-8 items-center justify-center rounded-full bg-accent text-white overflow-hidden">
  {avatarUrl ? (
    <Image src={avatarUrl} alt="Esteban" width={32} height={32} className="size-8 rounded-full object-cover" />
  ) : (
    <Bot size={16} />
  )}
</span>
```

### 4. Replace fixed badge timer with random interval logic

Remove the existing `useEffect` that sets `showBadge` after 5 s. Replace with:

```tsx
useEffect(() => {
  if (everOpened) return

  // Random first appearance: 8–20 s
  const firstDelay = 8000 + Math.random() * 12000

  let intervalId: ReturnType<typeof setInterval>
  const timerId = setTimeout(() => {
    setShowBadge(true)
    // Re-appear every 30–60 s while still collapsed and never opened
    intervalId = setInterval(() => {
      if (everOpened) {
        clearInterval(intervalId)
        return
      }
      setShowBadge((prev) => !prev)        // blink: hide then show
    }, 30000 + Math.random() * 30000)
  }, firstDelay)

  return () => {
    clearTimeout(timerId)
    clearInterval(intervalId)
  }
}, [everOpened])
```

The blink toggle (hide → show) creates a brief disappearance that draws the eye on re-appearance. `everOpened` stops all timers once the user opens the widget.

### 5. Add `AnimatedShinyText` to the bubble

`AnimatedShinyText` is already in `components/ui/animated-shiny-text.tsx` (Magic UI).

```tsx
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'

{showBadge && (
  <div className="fixed bottom-24 right-4 z-[60] max-w-[210px] rounded-xl border border-hairline bg-surface-1 px-3 py-2 shadow-[var(--shadow-dock)] sm:right-6">
    <AnimatedShinyText className="text-xs">
      {t('bubble')}
    </AnimatedShinyText>
  </div>
)}
```

If `AnimatedShinyText` requires a shimmer color prop, use `className="text-xs text-fg-2"` as fallback.

### 6. Add suggested-question chips in empty state

```tsx
const suggestions = (t.raw('suggestions') as unknown as string[] | undefined) ?? []

{messages.length === 0 && (
  <div className="space-y-3">
    <div className="rounded-xl border border-hairline bg-surface-1 px-3 py-3 text-sm text-fg-2">
      {t('welcome')}
    </div>
    {suggestions.length > 0 && (
      <div className="flex flex-col gap-2">
        {suggestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              setInput(q)
              void sendMessage(q)  // pass text directly (see Step 7)
            }}
            className="w-full rounded-xl border border-hairline bg-surface-1 px-3 py-2 text-left text-xs text-fg-2 transition-colors hover:border-accent/40 hover:bg-surface-2 hover:text-fg-1"
          >
            {q}
          </button>
        ))}
      </div>
    )}
  </div>
)}
```

### 7. Extract `sendMessage` to accept optional text arg

The current `sendMessage()` reads from `input` state. To allow chips to send directly without waiting for a state update:

```tsx
async function sendMessage(overrideText?: string) {
  const trimmed = (overrideText ?? input).trim()
  // rest unchanged — use `trimmed` instead of `input.trim()`
  // ...
  if (overrideText) setInput('')  // clear if sent via chip
}
```

This avoids an async setState + sendMessage race on chip click.

### 8. Add `next/image` domain for Sanity CDN

In `next.config.ts`, ensure Sanity CDN is in `images.remotePatterns`:

```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'cdn.sanity.io' },
    // ... existing entries
  ],
}
```

Check `next.config.ts` first — it may already be there from project setup.

## Success Criteria

- [x] Chat button shows circular profile photo when `avatarUrl` is set
- [x] Bot/icon fallback shown when `avatarUrl` is absent
- [x] Header shows profile photo (32×32) or Bot icon in the same pattern
- [x] Bubble appears after 8–20 s random delay (not fixed 5 s)
- [x] Bubble blinks/reappears randomly every 30–60 s while widget stays collapsed
- [x] Bubble stops appearing after widget is opened once
- [x] "Ask me about my work" bubble uses `AnimatedShinyText` shimmer
- [x] Three suggestion chips render in empty state
- [x] Clicking a chip sends the question immediately
- [x] Sanity CDN domain is in `next.config.ts` `remotePatterns`
- [x] `npm run typecheck` passes
- [x] `npm run build` passes

## Verification

- Updated `app/[locale]/layout.tsx` and `components/layout-widgets.tsx` to pass `settings.avatar` into `AIChatWidget`.
- Updated `AIChatWidget` with avatar rendering, random collapsed prompt timing, `AnimatedShinyText`, and suggestion chips.
- Confirmed `next.config.ts` already allows `cdn.sanity.io`.
- Ran `npm run typecheck`, `npm run lint`, and `npm run build` successfully.

## Risk Assessment

- **`t.raw('suggestions')` type**: next-intl types `t.raw()` as `unknown`. Cast to `string[] | undefined` and guard with `?? []` — safe.
- **`next/image` with Sanity CDN**: if `cdn.sanity.io` is not already in `remotePatterns`, the image will 500 in production. Check `next.config.ts` before assuming.
- **Random timer drift**: `setInterval` with random delay is non-deterministic. The `everOpened` guard prevents the interval from firing after the widget opens. Cleanup on unmount via return function handles navigation.
- **`sendMessage(overrideText)`**: The override bypasses input state validation. Chip strings come from the i18n file (trusted source) and are capped at `MAX_INPUT` by `MAX_INPUT` guard inside `sendMessage`.
- **`AnimatedShinyText` API**: verify it accepts `className` — it does in all Magic UI installs in this project. No shimmer color override needed.
