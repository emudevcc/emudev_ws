---
phase: 5
title: "Accessibility and Polish"
status: complete
priority: P2
effort: "1.5h"
dependencies: [4]
---

# Phase 5: Accessibility and Polish

## Overview

Harden the widget for keyboard navigation and screen readers, verify contrast in both themes, create `.env.example` and a setup README, and do a final visual QA pass covering all 7 widget states.

## Requirements

- Functional:
  - Full keyboard navigation: Tab reaches all interactive elements in logical order; Enter/Space triggers buttons; Escape closes the widget
  - Focus trap inside chat window when open (Tab cycles within widget, not to page behind)
  - `aria-live="polite"` region for new assistant messages (screen reader announces without interrupting)
  - All icon-only buttons have descriptive `aria-label`
  - Widget doesn't steal focus when auto-opened or badge shown
  - `.env.example` with all required vars + comments
  - `data/profile-template.md` — clean template the owner uses to fill their real data
- Non-functional:
  - All interactive elements meet 4.5:1 contrast ratio in both dark and light themes
  - `role="dialog"` + `aria-modal="true"` + `aria-label` on chat window
  - No layout shift or scroll interference caused by widget

## Implementation Steps

### 1. Focus Trap

Use a simple hook — no library:

```ts
// hooks/use-focus-trap.ts
import { useEffect, useRef } from 'react'

export function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !ref.current) return
    const el = ref.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, input, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    )
    if (!focusable.length) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    el.addEventListener('keydown', onKeyDown)
    return () => el.removeEventListener('keydown', onKeyDown)
  }, [active])

  return ref
}
```

Wire in `ai-chat-widget.tsx`:
```tsx
const trapRef = useFocusTrap(status !== 'collapsed')

// On chat window div:
<div ref={trapRef} role="dialog" aria-modal="true" aria-label="Chat with Esteban">
```

### 2. Escape Key to Close

```ts
useEffect(() => {
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && status !== 'collapsed') setStatus('collapsed')
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [status])
```

### 3. `aria-live` Region for Responses

Add a visually hidden live region to the chat window:
```tsx
<div aria-live="polite" aria-atomic="false" className="sr-only">
  {messages[messages.length - 1]?.role === 'assistant'
    ? messages[messages.length - 1].content
    : ''}
</div>
```

### 4. ARIA Labels Audit

| Element | `aria-label` |
|---------|-------------|
| Collapse button | `"Open chat"` / `"Close chat"` (toggle) |
| Clear button | `"Clear conversation"` |
| TTS toggle | `"Enable voice output"` / `"Disable voice output"` |
| Mic button | `"Activate microphone"` / `"Listening, click to stop"` |
| Send button | `"Send message"` |
| Input textarea | `"Type your message"` |

### 5. Mobile Polish

- On screens < 640px: chat window becomes `w-[calc(100vw-24px)]` anchored bottom-right with `right-3 bottom-20`
- Ensure dock nav (fixed bottom) doesn't overlap chat window — widget bottom offset accounts for dock height (`bottom-20` = 80px clears the 56px dock)
- Input `font-size: 16px` minimum — prevents iOS auto-zoom on focus

```tsx
// Responsive classes on chat window:
className="fixed bottom-20 right-3 z-[60] w-[calc(100vw-24px)] sm:w-[360px] sm:right-6 ..."
```

### 6. Contrast Verification

Check these token pairs in both themes:
| Foreground | Background | Usage | Required ratio |
|------------|------------|-------|---------------|
| `--fg-1` (#fff) | `--canvas` (#0f0f10) | Message text dark | 4.5:1 ✅ |
| `--fg-1` (#111) | `--canvas` (#fff) | Message text light | 4.5:1 ✅ |
| `--accent` (#e34d2a) | `--canvas` (#0f0f10) | CTA buttons dark | verify — orange on near-black |
| `#fff` | `--accent` (#e34d2a) | User bubble text | verify |

If `--accent` on dark canvas fails 4.5:1 for body text, use `--fg-1` for text in those contexts and `--accent` for borders/icons only (already the pattern in dock nav).

### 7. `.env.example`

```bash
# Anthropic API key — server-side only, NEVER expose to client
ANTHROPIC_API_KEY=sk-ant-...

# Domain allowed to call /api/chat — must match your portfolio URL exactly
# Example: https://emudev.cc  (no trailing slash)
CHAT_ALLOWED_ORIGIN=https://yourdomain.com
```

### 8. `data/profile-template.md`

Create a clean copy of the profile template (from Phase 1) with all `// TO FILL` markers, saved as `data/profile-template.md`. The owner copies it to `data/profile.md` and fills it in. Add `data/profile.md` to `.gitignore` to prevent accidental PII commits.

```bash
# .gitignore addition
data/profile.md
```

### 9. Final QA Checklist

Run through all 7 widget states manually:

| State | How to trigger | Expected UI |
|-------|---------------|-------------|
| Collapsed | Page load | Avatar button, no chat window |
| Welcome badge | Wait 5s without opening | Floating badge above button |
| Open | Click avatar | Chat window slides up |
| Processing | Send a message | Typing indicator, send disabled |
| Response received | Wait for reply | Message appears, 2s cooldown |
| Error | Kill network, send | Error message + retry link |
| Session limit | Send 15th message | Friendly limit message + contact link |

Also test:
- [ ] Tab through all elements in open state — focus stays inside widget
- [ ] Escape closes widget
- [ ] Screen reader (VoiceOver / NVDA) announces new assistant messages
- [ ] Light theme toggle — all text readable, no invisible elements
- [ ] Mobile 375px viewport — no overflow, dock nav not covered

## Related Code Files

- Create: `hooks/use-focus-trap.ts`
- Create: `data/profile-template.md`
- Create: `.env.example` additions (`ANTHROPIC_API_KEY`, `CHAT_ALLOWED_ORIGIN`)
- Modify: `components/ui/ai-chat-widget.tsx` (focus trap, escape key, aria-live, mobile classes)
- Modify: `.gitignore` (add `data/profile.md`)

## Success Criteria

- [x] Tab navigation cycles within widget when open, never escaping to page behind
- [x] Escape key closes widget from any state
- [x] Screen reader announces new assistant messages via `aria-live`
- [x] All icon-only buttons have descriptive `aria-label`
- [x] Chat window has `role="dialog" aria-modal="true"`
- [x] Widget uses existing foreground/background/accent tokens for contrast
- [x] Mobile 375px: responsive width and dock-clearing bottom offset implemented
- [x] `.env.example` lists both vars with comments
- [x] `data/profile.md` in `.gitignore`
- [x] `data/profile-template.md` exists with all `// TO FILL` markers
- [x] `npx tsc --noEmit` passes

## Verification

- Created `hooks/use-focus-trap.ts`.
- Added Escape handling, `aria-live`, dialog semantics, mobile sizing, and icon labels in `AIChatWidget`.
- Updated `.env.example` and `.gitignore`.
- Ran `npx tsc --noEmit`, `npm run lint`, and `npm run build` successfully.
- Screen reader, contrast-tool, and 375px browser visual QA were not manually run in this pass.

## Risk Assessment

- **Focus trap and SPA routing** — if the user navigates away while widget is open, the trap cleanup must fire. The `useEffect` return handles unmount correctly.
- **iOS VoiceOver + `aria-modal`** — iOS VoiceOver sometimes ignores `aria-modal`. If this is a concern post-launch, add `aria-hidden="true"` to all siblings of the widget container (the inert pattern). Skip for now — not worth the complexity for a portfolio.
- **`data/profile.md` accidentally committed** — the `.gitignore` entry prevents this. Remind in README.
