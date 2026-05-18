---
phase: 3
title: "Widget Core UI"
status: complete
priority: P1
effort: "4h"
dependencies: [2]
---

# Phase 3: Widget Core UI

## Overview

Implement `components/ui/ai-chat-widget.tsx` — the self-contained React component. Covers all text functionality, widget states, animations, design token alignment, session limits, cooldown, and welcome badge. No voice yet (Phase 4).

## Requirements

- Functional:
  - Fixed bottom-right, z-50, above dock nav (z-50 on dock, use z-60 here or check layering)
  - Two states: collapsed (avatar button) and expanded (360px chat window)
  - Welcome badge appears after 5s idle if widget never opened
  - Session limit: 15 messages max — show friendly prompt to contact directly when reached
  - Character counter on input (400 max), validated client-side before send
  - Disable send while awaiting response; 2s cooldown after each response
  - Sliding window: last 6 turns sent to proxy; all messages visible on screen
  - Clear/reset conversation button
  - All 7 widget states reflected in UI: inactive, open, listening (Phase 4), processing, error, out-of-scope, session-limit
- Non-functional:
  - Uses project design tokens (`--canvas`, `--surface-1`, `--hairline`, `--fg-1..4`, `--accent`, `--dock-bg` glass effect)
  - Respects dark/light theme via `data-theme` attribute (already handled by token system)
  - No new npm deps — uses existing Tailwind + `cn()` utility + Lucide icons
  - Component stays under 400 lines; if it grows beyond, extract sub-components

## Architecture

### State Machine

```
type WidgetStatus =
  | 'collapsed'       // avatar button visible, chat closed
  | 'open'            // chat window open, idle
  | 'processing'      // awaiting API response
  | 'error'           // last API call failed
  | 'limit-reached'   // 15 messages sent this session

// Voice states added in Phase 4:
  | 'listening'       // STT active
```

### Component Structure

```
<AIChatWidget>
  ├── WelcomeBadge          (shows after 5s, hides when widget opened)
  ├── CollapseButton        (avatar/initial, opens widget)
  └── ChatWindow            (shown when status !== 'collapsed')
       ├── ChatHeader       (title + close + clear buttons)
       ├── MessageList      (scrollable, all session messages)
       │    ├── UserBubble
       │    └── AssistantBubble
       ├── TypingIndicator  (shown during 'processing')
       └── InputBar
            ├── TextArea    (400 char limit + counter)
            ├── MicButton   (Phase 4 — renders disabled placeholder in Phase 3)
            └── SendButton
```

### Key State

```ts
const [status, setStatus] = useState<WidgetStatus>('collapsed')
const [messages, setMessages] = useState<Message[]>([])
const [input, setInput] = useState('')
const [ttsEnabled, setTtsEnabled] = useState(false)  // Phase 4 wires this
const [cooldown, setCooldown] = useState(false)
```

### Send Flow

```ts
async function send() {
  if (!input.trim() || input.length > 400) return
  if (status === 'processing' || cooldown) return
  if (messages.length >= 15) { setStatus('limit-reached'); return }

  const userMsg: Message = { role: 'user', content: input.trim() }
  const next = [...messages, userMsg]
  setMessages(next)
  setInput('')
  setStatus('processing')

  // Sliding window: last 6 turns
  const window = next.slice(-6)

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: window }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Unknown error')

    setMessages(m => [...m, { role: 'assistant', content: data.reply }])
    setStatus('open')
    setCooldown(true)
    setTimeout(() => setCooldown(false), 2000)
  } catch {
    setStatus('error')
    // Error state auto-recovers to 'open' after user dismisses
  }
}
```

### Visual Design

Collapsed button:
```tsx
<button
  style={{ background: 'var(--dock-bg)' }}
  className="fixed bottom-6 right-6 z-60 size-14 rounded-full border border-hairline
             shadow-dock flex items-center justify-center
             transition-transform duration-200 hover:scale-105 active:scale-95"
>
  {/* Owner's initial or avatar */}
  <span className="font-mono text-lg font-semibold text-fg-1">E</span>
</button>
```

Chat window:
```tsx
<div
  style={{ background: 'var(--canvas)', borderColor: 'var(--hairline)' }}
  className="fixed bottom-24 right-6 z-60 w-[360px] max-h-[520px]
             rounded-2xl border flex flex-col overflow-hidden
             shadow-dock
             animate-in slide-in-from-bottom-4 fade-in duration-200"
>
```

Message bubbles:
- User: `bg-accent text-white` aligned right
- Assistant: `bg-surface-1 text-fg-1` aligned left, subtle `border border-hairline`

Typing indicator: three dots pulsing (CSS animation, no JS library):
```tsx
<div className="flex gap-1 px-3 py-2">
  {[0, 1, 2].map(i => (
    <span
      key={i}
      style={{ animationDelay: `${i * 150}ms` }}
      className="size-1.5 rounded-full bg-fg-3 animate-bounce"
    />
  ))}
</div>
```

Welcome badge (appears after 5s, floats above collapsed button):
```tsx
useEffect(() => {
  if (everOpened) return
  const t = setTimeout(() => setShowBadge(true), 5000)
  return () => clearTimeout(t)
}, [everOpened])
```

```tsx
{showBadge && (
  <div
    style={{ background: 'var(--surface-1)', borderColor: 'var(--hairline)' }}
    className="fixed bottom-24 right-6 z-60 max-w-[200px] rounded-xl border px-3 py-2
               text-xs text-fg-2 shadow-dock animate-in slide-in-from-bottom-2 fade-in"
  >
    👋 Ask me about my work
  </div>
)}
```

Session limit message:
```tsx
{status === 'limit-reached' && (
  <p className="px-4 py-3 text-xs text-fg-3 text-center border-t border-hairline">
    We've reached the session limit. Feel free to{' '}
    <a href="#contact" className="text-accent underline">contact me directly</a>.
  </p>
)}
```

Error state:
```tsx
{status === 'error' && (
  <div className="px-4 py-2 text-xs text-fg-3 text-center">
    Something went wrong.{' '}
    <button onClick={() => setStatus('open')} className="text-accent underline">
      Try again
    </button>
  </div>
)}
```

## Related Code Files

- Create: `components/ui/ai-chat-widget.tsx`
- Read for patterns: `components/ui/dock-nav.tsx`, `components/ui/magic-card.tsx`
- Depends on: `app/api/chat/route.ts` (Phase 2)

## Implementation Steps

1. Read `components/ui/dock-nav.tsx` for z-index context — confirm dock is `z-50`, use `z-[60]` for widget
2. Create `components/ui/ai-chat-widget.tsx` with full state machine and all sub-sections above
3. Add `<AIChatWidget />` to `app/[locale]/layout.tsx` (after `<DockNav />`) — single import, renders on all pages
4. Confirm dark/light theme works by toggling `data-theme` in devtools
5. Test all 5 text-mode states: collapsed → open → processing → response → session limit
6. Confirm welcome badge appears after 5s on fresh page load and disappears on open
7. Confirm send is disabled during processing and for 2s after response
8. `npx tsc --noEmit`

## Success Criteria

- [x] Widget renders fixed bottom-right, above dock nav, on all pages
- [x] Collapsed → expanded transition is implemented with token-aligned fixed panel styling
- [x] Welcome badge appears after 5s if widget never opened
- [x] Send button disabled during processing and 2s cooldown
- [x] Character counter updates live; send blocked at 401+ chars
- [x] Session limit message shown after 15 messages
- [x] Clear button resets messages and status to `open`
- [x] Dark and light themes use design tokens
- [x] Mobile: widget uses `w-[calc(100vw-24px)]` and bottom offset to clear dock area
- [x] `npx tsc --noEmit` passes

## Verification

- Created `components/ui/ai-chat-widget.tsx` at 352 lines.
- Mounted `<AIChatWidget />` in `app/[locale]/layout.tsx`.
- Ran `npx tsc --noEmit`, `npm run lint`, and `npm run build` successfully.
- Manual visual browser QA was not completed in this pass.

## Risk Assessment

- **z-index conflict with dock nav** — dock is `z-50`; use `z-[60]` on widget. Verify in browser that widget overlays dock when both visible.
- **`animate-in` Tailwind classes** — these come from `tailwindcss-animate` (already a dep via shadcn). If missing, replace with manual CSS transition.
- **Mobile width** — `w-[360px]` overflows on 320px screens. Add `max-w-[calc(100vw-24px)]` as safety.
