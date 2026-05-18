---
phase: 2
title: "API Proxy"
status: complete
priority: P1
effort: "2h"
dependencies: [1]
---

# Phase 2: API Proxy

## Overview

Create `app/api/chat/route.ts` — a Next.js Route Handler that acts as the sole bridge between the browser widget and Anthropic. The API key never leaves the server. All security enforcement happens here.

## Requirements

- Functional:
  - POST `/api/chat` accepts `{ messages: Message[] }` (last 6 turns)
  - Calls Anthropic `claude-haiku-4-5` with the system prompt from Phase 1
  - Returns streamed or single-turn response text
  - Validates CORS: `Origin` header must match `CHAT_ALLOWED_ORIGIN` env var
  - Rate limits per IP: 30 req/hr using an in-memory store (sufficient for Vercel serverless — resets on cold start, acceptable for low-traffic portfolio)
  - Validates body shape, rejects messages >400 chars, detects prompt injection
  - Returns generic error messages — no internal details exposed
- Non-functional:
  - No new npm dependencies beyond `@anthropic-ai/sdk` (already a dev dep if not present — check first)
  - Response max_tokens: 300 (hard-coded, not configurable from client)
  - `cache_control: { type: "ephemeral" }` on system prompt block to activate Anthropic prompt caching

## Architecture

```
POST /api/chat
  │
  ├─ CORS check (Origin vs CHAT_ALLOWED_ORIGIN)           → 403 if mismatch
  ├─ Rate limit check (IP from x-forwarded-for)            → 429 if exceeded
  ├─ Body parse + shape validation                         → 400 if malformed
  ├─ Message length check (each ≤ 400 chars)               → 400 if exceeded
  ├─ Prompt injection scan                                 → 400 if detected
  ├─ buildSystemPrompt()                                   → string
  ├─ Anthropic SDK call (model, max_tokens, system, msgs)  → text
  └─ Return { reply: string }                              → 200
```

### Rate Limiter (in-memory, no deps)

```ts
// Simple sliding window: Map<ip, { count, windowStart }>
const rateMap = new Map<string, { count: number; windowStart: number }>()
const WINDOW_MS = 60 * 60 * 1000  // 1 hour
const MAX_REQUESTS = 30

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateMap.set(ip, { count: 1, windowStart: now })
    return true
  }
  if (entry.count >= MAX_REQUESTS) return false
  entry.count++
  return true
}
```

### Prompt Injection Patterns

```ts
const INJECTION_PATTERNS = [
  /ignore\s+(your\s+)?instructions/i,
  /ignore\s+previous/i,
  /\bsystem\s*:/i,
  /new\s+instructions/i,
  /you\s+are\s+now/i,
  /forget\s+(everything|all)/i,
  /act\s+as\s+(a\s+)?different/i,
  /\bDAN\b/,
  /jailbreak/i,
]

function hasInjection(text: string): boolean {
  return INJECTION_PATTERNS.some(p => p.test(text))
}
```

### Full Route Handler

```ts
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from '@/lib/chat/system-prompt'

// ... rateMap + checkRateLimit + hasInjection defined above ...

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type Message = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  // 1. CORS
  const origin = req.headers.get('origin') ?? ''
  const allowed = process.env.CHAT_ALLOWED_ORIGIN ?? ''
  if (allowed && origin !== allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 2. Rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // 3. Parse + validate body
  const body = await req.json().catch(() => null)
  if (!body || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const messages: Message[] = body.messages
  if (messages.length === 0 || messages.length > 6) {
    return NextResponse.json({ error: 'Invalid message count' }, { status: 400 })
  }

  for (const msg of messages) {
    if (typeof msg.content !== 'string' || msg.content.length > 400) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })
    }
    if (!['user', 'assistant'].includes(msg.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
  }

  // 4. Prompt injection check (user messages only)
  const lastUser = messages.filter(m => m.role === 'user').pop()
  if (lastUser && hasInjection(lastUser.content)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // 5. Build system prompt
  let systemPrompt: string
  try {
    systemPrompt = buildSystemPrompt()
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  // 6. Call Anthropic
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages,
    })

    const reply = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')

    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}

// Reject non-POST methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
```

### CORS Preflight

Add OPTIONS handler so browsers don't get blocked on preflight:

```ts
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin') ?? ''
  const allowed = process.env.CHAT_ALLOWED_ORIGIN ?? ''
  if (allowed && origin !== allowed) {
    return new NextResponse(null, { status: 403 })
  }
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
```

## Related Code Files

- Create: `app/api/chat/route.ts`
- Read (for pattern): `app/api/contact/route.ts`
- Depends on: `lib/chat/system-prompt.ts` (Phase 1)

## Implementation Steps

1. Check if `@anthropic-ai/sdk` is already in `package.json` — install if not (`npm install @anthropic-ai/sdk`)
2. Create `app/api/chat/route.ts` with full implementation above
3. Add `ANTHROPIC_API_KEY` and `CHAT_ALLOWED_ORIGIN` to `.env.local` (never commit)
4. Update `.env.example` with both vars + comments
5. Test with `curl`:
   ```bash
   curl -X POST http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -H "Origin: http://localhost:3000" \
     -d '{"messages":[{"role":"user","content":"What is your Adobe stack?"}]}'
   ```
6. Test rejection cases: wrong origin → 403, message >400 chars → 400, injection phrase → 400

## Success Criteria

- [ ] POST `/api/chat` returns `{ reply: string }` for valid request (requires configured `ANTHROPIC_API_KEY`; not tested locally)
- [x] Returns 403 when `Origin` doesn't match `CHAT_ALLOWED_ORIGIN` (implemented in route)
- [x] Returns 400 for message >400 chars (implemented in route)
- [x] Returns 400 for prompt injection phrases (implemented in route)
- [x] Returns 429 after 30 requests from same IP within 1 hour (implemented in route)
- [x] `ANTHROPIC_API_KEY` is server-only and only referenced from `.env.example` and `app/api/chat/route.ts`
- [x] `npx tsc --noEmit` passes

## Verification

- Installed `@anthropic-ai/sdk`.
- Created `app/api/chat/route.ts` with POST, GET, and OPTIONS handlers.
- Ran `npx tsc --noEmit`, `npm run lint`, and `npm run build` successfully.
- Started the dev server successfully on port 3002. Local `curl` requests from a separate sandboxed command could not connect to localhost (`curl` exit 7), so live route responses were not manually verified.

## Risk Assessment

- **In-memory rate limiter resets on cold start** — acceptable for a portfolio. If traffic warrants, upgrade to Upstash Redis + `@upstash/ratelimit` later.
- **`x-forwarded-for` can be spoofed** — acceptable for portfolio-scale rate limiting. Not a financial or auth system.
- **Anthropic SDK not yet installed** — check first, install only if missing.
