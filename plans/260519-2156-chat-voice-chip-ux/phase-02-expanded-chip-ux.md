---
phase: 2
title: "Expanded Chip UX"
status: completed
priority: P2
effort: "30 min"
dependencies: []
---

# Phase 2: Expanded Chip UX

## Overview

Extend quick-reply chips to appear after EVERY assistant message, not just when the message ends with `?`. Two chip sets are shown based on message type: **closing chips** (when message ends with `?`) for yes/no answers, and **follow-up chips** (all other assistant messages) for conversation continuation.

## Requirements

- Functional:
  - Chips appear after ANY assistant message when `status === 'open'` and `!cooldown`
  - When last assistant message ends with `?`: show `chat.quickReplies` chips (existing: "Yes!", "No thanks", "Tell me more")
  - When last assistant message does NOT end with `?`: show `chat.followUps` chips (new: "Tell me more", "What else?", "How do I contact you?")
  - Both chip sets use `sendMessage(reply)` directly on click
  - Chips disappear during processing, on cooldown, and on error/limit states (unchanged)
  - Spanish locale gets translated follow-up chips
- Non-functional:
  - Reuses `getSuggestions()` helper and existing chip styling — no new patterns
  - `chat.followUps` i18n key follows exact same structure as `chat.quickReplies`

## Architecture

```
messages/en.json  chat.followUps: ["Tell me more", "What else?", "How do I contact you?"]
messages/es.json  chat.followUps: ["Cuéntame más", "¿Qué más?", "¿Cómo te contacto?"]
        │
        ▼
ai-chat-widget.tsx
  followUps = getSuggestions(t.raw('followUps'))

  // BEFORE: only when message ends with ?
  showQuickReplies = lastMsg?.role === 'assistant' && status === 'open'
                     && !cooldown && lastMsg.content.trimEnd().endsWith('?')
                     && quickReplies.length > 0

  // AFTER: always after assistant message; pick which set
  showChips = lastMsg?.role === 'assistant' && status === 'open' && !cooldown
  activeChips = lastMsg.content.trimEnd().endsWith('?') ? quickReplies : followUps
```

## Related Code Files

- Modify: `components/ui/ai-chat-widget.tsx`
- Modify: `messages/en.json` — add `chat.followUps`
- Modify: `messages/es.json` — add `chat.followUps`

## Implementation Steps

### 1. Add `followUps` to i18n message files

**`messages/en.json`** — inside `"chat"`, after `"quickReplies"`:
```json
"followUps": ["Tell me more", "What else?", "How do I contact you?"]
```

**`messages/es.json`** — inside `"chat"`, after `"quickReplies"`:
```json
"followUps": ["Cuéntame más", "¿Qué más?", "¿Cómo te contacto?"]
```

### 2. Add `followUps` useMemo in widget

Alongside the existing `quickReplies` memo:
```tsx
const followUps = useMemo(() => getSuggestions(t.raw('followUps')), [t])
```

### 3. Replace `showQuickReplies` + derive `activeChips`

Replace the current derived values:
```tsx
// Remove:
const showQuickReplies =
  lastMsg?.role === 'assistant' &&
  status === 'open' &&
  !cooldown &&
  lastMsg.content.trimEnd().endsWith('?') &&
  quickReplies.length > 0

// Add:
const isClosingQuestion = lastMsg?.content.trimEnd().endsWith('?') ?? false
const activeChips = isClosingQuestion ? quickReplies : followUps
const showChips =
  lastMsg?.role === 'assistant' &&
  status === 'open' &&
  !cooldown &&
  activeChips.length > 0
```

### 4. Update JSX — rename `showQuickReplies` to `showChips`, use `activeChips`

```tsx
// Before
{showQuickReplies && (
  <div className="flex flex-wrap gap-2 border-t border-hairline px-4 py-2">
    {quickReplies.map((reply) => (

// After
{showChips && (
  <div className="flex flex-wrap gap-2 border-t border-hairline px-4 py-2">
    {activeChips.map((reply) => (
```

The chip button markup is identical — no style change needed.

## Success Criteria

- [x] Chips appear after every assistant message (not just `?`-ending ones)
- [x] `?`-ending messages show "Yes! / No thanks / Tell me more"
- [x] Non-`?` messages show "Tell me more / What else? / How do I contact you?"
- [x] Chips disappear during `status === 'processing'`
- [x] Chips disappear while `cooldown` is active
- [x] Spanish locale shows correct translated chips for both sets
- [x] Clicking any chip sends the message and hides chips
- [x] `npm run typecheck` passes

## Completion Notes

- Added localized `chat.followUps` entries in English and Spanish.
- Reused the existing suggestion parser and chip styles.
- Assistant messages now choose quick replies for closing questions and follow-up chips for all other responses.

## Risk Assessment

- **Always-visible chips feel noisy**: Chips after every message could feel cluttered. Mitigated by the `cooldown` guard — chips only appear after the 2s cooldown following a sent message, so they don't flash immediately. The follow-up set ("Tell me more / What else?") is intentionally generic enough to be useful after any response.
- **`followUps` missing from i18n**: If `chat.followUps` is absent, `getSuggestions(t.raw('followUps'))` returns `[]`, `activeChips.length > 0` is `false`, and `showChips` is `false` — chips simply don't render. Safe fallback.
- **"How do I contact you?" chip semantics**: This sends a literal question to the AI, which has contact info in the profile. The AI will answer with contact details. This is preferable to hardcoding a `#contact` link since it keeps the chat interaction consistent.
