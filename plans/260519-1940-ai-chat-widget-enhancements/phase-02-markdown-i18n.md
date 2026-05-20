---
phase: 2
title: "Markdown + i18n"
status: complete
priority: P2
effort: "45 min"
dependencies: [phase-01-system-prompt-proxy]
---

# Phase 2: Markdown + i18n

## Overview

Render assistant messages with basic markdown (bold, italic, inline code, line breaks). Add i18n keys for all widget strings so the bubble prompt, placeholder, suggested questions, and error messages are translated when the site switches to Spanish.

## Requirements

- Functional:
  - Assistant bubbles render `**bold**`, `*italic*`, `` `code` ``, and line-break (`\n`) from the AI response
  - All hardcoded strings in `AIChatWidget` moved to `messages/en.json` + `messages/es.json`
  - "Ask me about my work" bubble text is translated to "Pregúntame sobre mi trabajo" in Spanish
  - Widget uses `useTranslations('chat')` from next-intl
- Non-functional:
  - No full markdown library — inline renderer only (bold, italic, code, newlines are sufficient; no headings, lists, tables from the AI given `max_tokens: 300`)
  - Zero new runtime dependencies if possible; use a tiny regex-based renderer

## Architecture

```
useTranslations('chat')   ← messages/{locale}.json  "chat" namespace
       │
       ▼
AIChatWidget (client)
  - bubble: t('bubble')
  - placeholder: t('placeholder')
  - suggested questions: t.raw('suggestions') as string[]
  - error messages: t('errorScope') etc.
       │
       ▼
<MarkdownText> component   ← inline renderer for assistant messages
```

## Related Code Files

- Modify: `components/ui/ai-chat-widget.tsx`
- Modify: `messages/en.json`
- Modify: `messages/es.json`

## Implementation Steps

### 1. Add `chat` namespace to `messages/en.json`

```json
"chat": {
  "bubble": "Ask me about my work",
  "ariaOpen": "Open chat",
  "ariaClose": "Close chat",
  "ariaClear": "Clear conversation",
  "ariaEnableVoice": "Enable voice output",
  "ariaDisableVoice": "Disable voice output",
  "ariaActivateMic": "Activate microphone",
  "ariaStopListening": "Listening, click to stop",
  "ariaSend": "Send message",
  "headerTitle": "Ask Esteban",
  "headerSubtitle": "Portfolio assistant",
  "placeholder": "Ask a question…",
  "welcome": "What would you like to know? Feel free to ask about my projects, skills, experience, or anything on this site.",
  "listening": "Listening…",
  "hint": "Enter sends · Shift+Enter for new line",
  "hintCooldown": "One moment…",
  "errorGeneric": "Something went wrong.",
  "errorRetry": "Try again",
  "errorScope": "That's a bit outside what I know — happy to tell you about my work though!",
  "errorLimit": "We've reached the session limit.",
  "errorLimitCta": "Contact me directly",
  "suggestions": [
    "What's your Adobe Experience Cloud experience?",
    "Tell me about your recent projects",
    "Are you available for consulting?"
  ]
}
```

### 2. Add `chat` namespace to `messages/es.json`

```json
"chat": {
  "bubble": "Pregúntame sobre mi trabajo",
  "ariaOpen": "Abrir chat",
  "ariaClose": "Cerrar chat",
  "ariaClear": "Borrar conversación",
  "ariaEnableVoice": "Activar voz",
  "ariaDisableVoice": "Desactivar voz",
  "ariaActivateMic": "Activar micrófono",
  "ariaStopListening": "Escuchando, haz clic para detener",
  "ariaSend": "Enviar mensaje",
  "headerTitle": "Pregunta a Esteban",
  "headerSubtitle": "Asistente del portafolio",
  "placeholder": "Haz una pregunta…",
  "welcome": "¿Qué te gustaría saber? Puedes preguntarme sobre mis proyectos, habilidades, experiencia o cualquier cosa del sitio.",
  "listening": "Escuchando…",
  "hint": "Enter envía · Shift+Enter para nueva línea",
  "hintCooldown": "Un momento…",
  "errorGeneric": "Algo salió mal.",
  "errorRetry": "Intentar de nuevo",
  "errorScope": "Eso está un poco fuera de lo que sé, ¡pero con gusto te cuento sobre mi trabajo!",
  "errorLimit": "Llegamos al límite de la sesión.",
  "errorLimitCta": "Contáctame directamente",
  "suggestions": [
    "¿Cuál es tu experiencia con Adobe Experience Cloud?",
    "Cuéntame sobre tus proyectos recientes",
    "¿Estás disponible para consultoría?"
  ]
}
```

### 3. Add inline `MarkdownText` component inside `ai-chat-widget.tsx`

No new file — keep it co-located since it's widget-only:

```tsx
function MarkdownText({ text }: { text: string }) {
  // Split on newlines first, then parse inline markdown per segment
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {parseInline(line)}
        </span>
      ))}
    </>
  )
}

function parseInline(text: string): React.ReactNode[] {
  // Matches **bold**, *italic*, `code` — in that priority order
  const parts: React.ReactNode[] = []
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    if (match[2]) parts.push(<strong key={match.index}>{match[2]}</strong>)
    else if (match[3]) parts.push(<em key={match.index}>{match[3]}</em>)
    else if (match[4])
      parts.push(
        <code key={match.index} className="rounded bg-surface-2 px-1 font-mono text-[11px]">
          {match[4]}
        </code>
      )
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
```

### 4. Replace hardcoded strings in `AIChatWidget`

```tsx
import { useTranslations } from 'next-intl'
// at top of component:
const t = useTranslations('chat')

// Bubble (collapsed state):
{t('bubble')}

// aria-labels:
aria-label={t('ariaOpen')}
aria-label={t('ariaClose')}
// etc.

// Header:
<p>{t('headerTitle')}</p>
<p>{t('headerSubtitle')}</p>

// Welcome message (empty state):
{t('welcome')}

// Listening indicator:
{t('listening')}

// Errors:
{status === 'error' && <>{t('errorGeneric')} <button>{t('errorRetry')}</button></>}
{status === 'out-of-scope' && t('errorScope')}
{status === 'limit-reached' && <>{t('errorLimit')} <a>{t('errorLimitCta')}</a></>}

// Hint:
{cooldown ? t('hintCooldown') : t('hint')}

// Textarea placeholder:
placeholder={t('placeholder')}
```

### 5. Use `MarkdownText` for assistant messages

```tsx
// Before:
<p className={cn(...)}>
  {message.content}
</p>

// After (assistant messages only):
{message.role === 'assistant' ? (
  <div className={cn(...)}>
    <MarkdownText text={message.content} />
  </div>
) : (
  <p className={cn(...)}>{message.content}</p>
)}
```

Keep user messages as plain text (no markdown rendering needed — user input is raw).

## Success Criteria

- [x] `messages/en.json` has `chat` namespace with all required keys
- [x] `messages/es.json` has `chat` namespace with Spanish translations
- [x] Widget strings use `useTranslations('chat')` — no hardcoded English strings
- [x] `**bold**` and `*italic*` render correctly in assistant bubbles
- [x] Inline code renders with monospace styling
- [x] Line breaks from AI render as `<br />` elements
- [x] Smoke test `i18n-bilingual.spec.ts` passes (en/es keys match)
- [x] `npm run typecheck` passes

## Verification

- Added `chat` namespaces to `messages/en.json` and `messages/es.json`.
- Added inline `MarkdownText` rendering to `components/ui/ai-chat-widget.tsx`.
- Replaced widget strings with `useTranslations('chat')`.
- Ran `npm run typecheck`, `npm run lint`, and `npx playwright test tests/smoke/i18n-bilingual.spec.ts --reporter=list` successfully.

## Risk Assessment

- **`t.raw('suggestions')`**: next-intl `t.raw()` returns the raw JSON value (a string array). Must be typed with `as string[]` and validated at runtime — if the array is missing, the suggestion chips simply don't render (graceful fallback).
- **Regex edge cases**: The inline `parseInline` function handles the most common patterns. Nested markdown (e.g., `**bold *italic***`) is not supported — acceptable given the AI's constrained output.
- **`useTranslations` in Client Component**: Valid — next-intl supports this pattern. The locale is resolved from the URL by the Provider in `layout.tsx`.
