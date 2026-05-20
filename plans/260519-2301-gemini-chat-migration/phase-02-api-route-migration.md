---
phase: 2
title: API Route Migration
status: completed
priority: P1
effort: 20 min
dependencies:
  - 1
---

# Phase 2: API Route Migration

## Overview

Rewrite `app/api/chat/route.ts` to use `@google/generative-ai` instead of `@anthropic-ai/sdk`. All validation, rate-limiting, CORS, injection guards, and system prompt logic are unchanged — only the AI client call is replaced.

## Requirements

- Functional:
  - `POST /api/chat` returns `{ reply: string }` with Gemini-generated text
  - System prompt injected via `systemInstruction` (Gemini's equivalent)
  - Multi-turn history preserved (all prior messages passed as `contents`)
  - `GEMINI_API_KEY` checked; 503 returned if absent (same as current `ANTHROPIC_API_KEY` check)
  - All validation, rate-limiting, CORS, injection guard unchanged
- Non-functional:
  - Max tokens: 350 (unchanged) — Gemini param: `maxOutputTokens`
  - Temperature: default (Gemini 2.5 Flash-Lite default is 1.0, acceptable)
  - No streaming required (single JSON response, same as today)

## Architecture

### Current (Anthropic)

```
POST /api/chat
  → validateMessages()
  → buildSystemPromptForLocale()
  → new Anthropic({ apiKey })
  → client.messages.create({ model: 'claude-haiku-4-5', system, messages })
  → response.content[].text → reply
```

### After (Gemini)

```
POST /api/chat
  → validateMessages()              ← unchanged
  → buildSystemPromptForLocale()    ← unchanged
  → new GoogleGenerativeAI(apiKey)
  → genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite', systemInstruction })
  → model.generateContent({ contents: [...mapped messages] })
  → result.response.text() → reply
```

### Message format conversion

Anthropic → Gemini role mapping:
- `'user'` → `'user'` (same)
- `'assistant'` → `'model'` (Gemini uses 'model' not 'assistant')

Content format:
```ts
// Anthropic: { role: 'user'|'assistant', content: string }
// Gemini:    { role: 'user'|'model', parts: [{ text: string }] }
```

## Related Code Files

- Modify: `app/api/chat/route.ts` — full provider swap

## Implementation Steps

### 1. Update imports

```ts
// Remove:
import Anthropic from '@anthropic-ai/sdk'

// Add:
import { GoogleGenerativeAI } from '@google/generative-ai'
```

### 2. Update constants

```ts
// Remove:
const MODEL = 'claude-haiku-4-5'

// Add:
const MODEL = 'gemini-2.5-flash-lite'
// Note: verify exact model ID at https://ai.google.dev/models — may need '-preview' suffix
```

### 3. Update env var check in POST handler

```ts
// Remove:
if (!process.env.ANTHROPIC_API_KEY) {
  return NextResponse.json({ error: 'Chat service is not configured' }, { status: 503, headers })
}

// Add:
if (!process.env.GEMINI_API_KEY) {
  return NextResponse.json({ error: 'Chat service is not configured' }, { status: 503, headers })
}
```

### 4. Replace AI client call

```ts
// Remove entire Anthropic try block:
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const response = await client.messages.create({
  model: MODEL,
  max_tokens: MAX_TOKENS,
  system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
  messages,
})
const reply = response.content
  .filter((block) => block.type === 'text')
  .map((block) => block.text)
  .join('')
  .trim()

// Add:
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({
  model: MODEL,
  systemInstruction: systemPrompt,
  generationConfig: { maxOutputTokens: MAX_TOKENS },
})
const contents = messages.map((msg) => ({
  role: msg.role === 'assistant' ? 'model' : 'user',
  parts: [{ text: msg.content }],
}))
const result = await model.generateContent({ contents })
const reply = result.response.text().trim()
```

### 5. Keep error catch identical

```ts
} catch {
  return NextResponse.json({ error: 'Failed to generate response' }, { status: 500, headers })
}
```

### Final shape of the try block

```ts
try {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
    generationConfig: { maxOutputTokens: MAX_TOKENS },
  })
  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }))
  const result = await model.generateContent({ contents })
  const reply = result.response.text().trim()
  return NextResponse.json({ reply }, { headers })
} catch {
  return NextResponse.json({ error: 'Failed to generate response' }, { status: 500, headers })
}
```

## Success Criteria

- [ ] `POST /api/chat` returns `{ reply: string }` using Gemini
- [ ] Multi-turn conversation history works (messages array passed correctly)
- [ ] System prompt injected via `systemInstruction`
- [ ] 503 returned when `GEMINI_API_KEY` is missing
- [ ] Rate limiting, CORS, injection guard all still functional
- [ ] `npm run typecheck` passes (no Anthropic types remain)
- [ ] Manual test: EN and ES conversations both produce valid replies

## Risk Assessment

- **Model ID mismatch**: `gemini-2.5-flash-lite` may not be GA yet — if 404/invalid, try `gemini-2.0-flash-lite` as fallback. Check https://ai.google.dev/models at implementation time.
- **`result.response.text()` throws if response blocked**: Gemini can return a blocked response (no `candidates`) — `text()` will throw. The existing `catch` block handles this gracefully (returns 500), but a more specific check could return a scope-error message. Acceptable for now.
- **Safety filters**: Gemini has built-in safety filters that may block some portfolio-related questions differently than Claude. Mitigated by system prompt scope restriction.
- **No prompt caching**: Anthropic's `cache_control: { type: 'ephemeral' }` has no Gemini equivalent in `@google/generative-ai` v0.x — system prompt is re-sent each request. Cost impact is minimal at portfolio scale.
