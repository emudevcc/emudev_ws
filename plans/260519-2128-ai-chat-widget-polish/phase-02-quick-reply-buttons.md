---
phase: 2
title: "Quick-Reply Buttons"
status: complete
priority: P2
effort: "30 min"
dependencies: [phase-01-icon-animation-clickable-urls]
---

# Phase 2: Quick-Reply Buttons

## Overview

When the last assistant message ends with `?`, show a row of quick-reply chips above the input form so the user can respond with one tap instead of typing. Chips come from a new `chat.quickReplies` i18n key and disappear once a reply is sent or while the AI is processing.

## Requirements

- Functional:
  - Quick-reply chips appear when: last message is assistant AND `status === 'open'` AND message ends with `?`
  - Three chips from `t.raw('quickReplies')` i18n array: `["Yes!", "No thanks", "Tell me more"]`
  - Clicking a chip calls `sendMessage(overrideText)` directly — no typing required
  - Chips hidden during `status === 'processing'` and after a chip is clicked
  - Spanish locale gets translated chips via `messages/es.json`
- Non-functional:
  - No new packages — plain Tailwind + existing `cn` utility
  - Reuses `sendMessage(overrideText?)` which already accepts an optional text override

## Architecture

```
messages/en.json  chat.quickReplies: ["Yes!", "No thanks", "Tell me more"]
messages/es.json  chat.quickReplies: ["¡Sí!", "No, gracias", "Cuéntame más"]
        │
        ▼
ai-chat-widget.tsx
  quickReplies = getSuggestions(t.raw('quickReplies'))   // reuse existing helper
  lastMsg = messages[messages.length - 1]
  showQuickReplies = lastMsg?.role === 'assistant'
                     && status === 'open'
                     && lastMsg.content.trimEnd().endsWith('?')
                     && quickReplies.length > 0
        │
        ▼ (rendered between scroll area and form)
  <div> chips row — each calls sendMessage(reply) on click
```

## Related Code Files

- Modify: `components/ui/ai-chat-widget.tsx`
- Modify: `messages/en.json` — add `chat.quickReplies`
- Modify: `messages/es.json` — add `chat.quickReplies`

## Implementation Steps

### 1. Add `quickReplies` to i18n message files

**`messages/en.json`** — inside the `"chat"` object, after `"suggestions"`:
```json
"quickReplies": ["Yes!", "No thanks", "Tell me more"]
```

**`messages/es.json`** — inside the `"chat"` object, after `"suggestions"`:
```json
"quickReplies": ["¡Sí!", "No, gracias", "Cuéntame más"]
```

### 2. Derive `quickReplies` and `showQuickReplies` in the widget

At the top of `AIChatWidget`, alongside `suggestions`:

```tsx
const quickReplies = useMemo(() => getSuggestions(t.raw('quickReplies')), [t])
```

Derived (not state — recalculates on every render, which is correct):

```tsx
const lastMsg = messages[messages.length - 1]
const showQuickReplies =
  lastMsg?.role === 'assistant' &&
  status === 'open' &&
  lastMsg.content.trimEnd().endsWith('?') &&
  quickReplies.length > 0
```

Place the `lastMsg` and `showQuickReplies` derivations just before the `return` statement (or near `canSend`), outside any hooks.

### 3. Render chips between scroll area and form

Insert between the closing `</div>` of `ref={scrollRef}` and the `{listening && …}` block:

```tsx
{showQuickReplies && (
  <div className="flex flex-wrap gap-2 border-t border-hairline px-4 py-2">
    {quickReplies.map((reply) => (
      <button
        key={reply}
        type="button"
        onClick={() => void sendMessage(reply)}
        className="rounded-full border border-hairline bg-surface-1 px-3 py-1 text-xs text-fg-2 transition-colors hover:border-accent/40 hover:bg-surface-2 hover:text-fg-1"
      >
        {reply}
      </button>
    ))}
  </div>
)}
```

Styling mirrors the suggestion chips in the empty state: `rounded-full`, `border-hairline`, `bg-surface-1`, `text-xs`. Using `flex-wrap` allows chips to reflow on narrow screens.

The chips automatically hide when `sendMessage` sets `status = 'processing'` (since `showQuickReplies` requires `status === 'open'`).

## Success Criteria

- [x] Quick-reply chips appear below the last assistant message when it ends with `?`
- [x] Chips do NOT appear when last message is from the user
- [x] Chips do NOT appear when `status === 'processing'`
- [x] Clicking a chip sends the message immediately (no manual submit)
- [x] Chips disappear instantly when a chip is clicked (status flips to processing)
- [x] Spanish locale shows translated chips (`¡Sí!`, `No, gracias`, `Cuéntame más`)
- [x] Chips render correctly on narrow mobile width (flex-wrap)
- [x] `npm run typecheck` passes

## Risk Assessment

- **`?` detection too broad**: A message like "Here are 3 options?" would show chips. This is acceptable — the AI is trained to ask closing questions naturally, and chips add value even for option questions.
- **`sendMessage` called with empty override**: `getSuggestions` filters for `typeof item === 'string'`, so empty strings would pass. The `sendMessage` guard `if (!trimmed …)` exits early on empty strings — safe.
- **Chips visible on error/limit-reached**: `showQuickReplies` requires `status === 'open'` — error/limit-reached statuses correctly hide chips without extra checks.
- **`t.raw('quickReplies')` type**: typed as `unknown`, cast through `getSuggestions()` which already handles this safely with `Array.isArray` + `typeof item === 'string'` guards.
