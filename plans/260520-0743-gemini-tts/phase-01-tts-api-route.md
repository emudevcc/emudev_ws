---
phase: 1
title: "TTS API Route"
status: pending
priority: P1
effort: "30 min"
dependencies: []
---

# Phase 1: TTS API Route

## Overview

Create `app/api/tts/route.ts` — a POST endpoint that accepts `{ text, lang }`, calls Google Cloud TTS REST API with a WaveNet male voice, and returns `{ audioBase64: string }` (base64 MP3).

## Requirements

- Functional:
  - POST `/api/tts` accepts `{ text: string, lang: string }`
  - Returns `{ audioBase64: string }` (base64 MP3)
  - Male WaveNet voice selected by locale prefix (`en` → `en-US-Wavenet-D`, `es` → `es-ES-Wavenet-B`)
  - Returns 400 if `text` empty or > 1000 chars
  - Returns 503 if `GOOGLE_TTS_API_KEY` missing
  - Returns 500 on Cloud TTS API error
  - Rate limiting: same IP-based pattern as `/api/chat`
  - CORS: same `CHAT_ALLOWED_ORIGIN` pattern
- Non-functional:
  - No new npm packages — uses plain `fetch` to REST API
  - Single file, under 100 lines

## Architecture

### Google Cloud TTS REST API

```
POST https://texttospeech.googleapis.com/v1/text:synthesize?key={GOOGLE_TTS_API_KEY}
Content-Type: application/json

{
  "input": { "text": "Hello, I am Esteban." },
  "voice": { "languageCode": "en-US", "name": "en-US-Wavenet-D" },
  "audioConfig": { "audioEncoding": "MP3" }
}

→ 200 { "audioContent": "<base64 MP3 string>" }
```

No npm package needed — direct `fetch` call.

### Voice map

```ts
const WAVENET_VOICES: Record<string, { languageCode: string; name: string }> = {
  en: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },  // deep male
  es: { languageCode: 'es-ES', name: 'es-ES-Wavenet-B' },  // male
}
const DEFAULT_VOICE = WAVENET_VOICES.en
```

### Full implementation shape

```ts
import { NextRequest, NextResponse } from 'next/server'

const MAX_TEXT_CHARS = 1000
const TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize'

const WAVENET_VOICES: Record<string, { languageCode: string; name: string }> = {
  en: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
  es: { languageCode: 'es-ES', name: 'es-ES-Wavenet-B' },
}

// CORS + rate-limit helpers (copy pattern from /api/chat)
// ...

export async function POST(req: NextRequest) {
  // CORS + rate limit guards (same as /api/chat)

  const body = await req.json().catch(() => null)
  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  const lang = typeof body?.lang === 'string' ? body.lang : 'en-US'

  if (!text || text.length > MAX_TEXT_CHARS) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers })
  }

  if (!process.env.GOOGLE_TTS_API_KEY) {
    return NextResponse.json({ error: 'TTS service is not configured' }, { status: 503, headers })
  }

  const langPrefix = lang.split('-')[0]
  const voice = WAVENET_VOICES[langPrefix] ?? WAVENET_VOICES.en

  try {
    const res = await fetch(`${TTS_ENDPOINT}?key=${process.env.GOOGLE_TTS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice,
        audioConfig: { audioEncoding: 'MP3' },
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500, headers })
    }

    const data = (await res.json()) as { audioContent?: string }
    if (!data.audioContent) {
      return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500, headers })
    }

    return NextResponse.json({ audioBase64: data.audioContent }, { headers })
  } catch {
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500, headers })
  }
}
```

## Related Code Files

- Create: `app/api/tts/route.ts`

## Implementation Steps

1. Create `app/api/tts/route.ts` with the shape above
2. Copy CORS helpers + `checkRateLimit` + `getIp` from `/api/chat/route.ts` (4 small functions, ~25 lines)
3. Add `GOOGLE_TTS_API_KEY` to `.env.local` and Vercel env vars (see Setup below)
4. Test with curl:
   ```bash
   curl -X POST http://localhost:3000/api/tts \
     -H "Content-Type: application/json" \
     -d '{"text":"Hello, I am Esteban.","lang":"en-US"}'
   ```
   Verify `audioBase64` field present; decode and confirm it plays (MP3 file)

### Setup: Google Cloud TTS API Key

1. Google Cloud Console → select/create project
2. Enable "Cloud Text-to-Speech API"
3. APIs & Services → Credentials → Create API Key
4. Restrict key to "Cloud Text-to-Speech API"
5. Add to `.env.local`: `GOOGLE_TTS_API_KEY=your_key`
6. Add to Vercel: `vercel env add GOOGLE_TTS_API_KEY production`

**Free tier**: 1 million WaveNet characters/month. A 100-word response ≈ 600 chars → ~1,666 free TTS calls/month.

## Success Criteria

- [ ] POST `/api/tts` returns `{ audioBase64: string }` for valid input
- [ ] `audioBase64` decodes to valid MP3 audio using a WaveNet male voice
- [ ] Returns 400 for empty text or text > 1000 chars
- [ ] Returns 503 when `GOOGLE_TTS_API_KEY` absent
- [ ] `en` locale → `en-US-Wavenet-D`, `es` locale → `es-ES-Wavenet-B`
- [ ] `npm run typecheck` passes

## Risk Assessment

- **API key billing**: WaveNet voices are paid after the free 1M chars/month. For a portfolio site the free tier is practically unlimited. Monitor in Google Cloud Console.
- **Key exposure**: `GOOGLE_TTS_API_KEY` is server-side only — never returned to the client. Restrict the key to the TTS API in Cloud Console for defense-in-depth.
- **es-ES-Wavenet-B voice availability**: Verify this voice name at https://cloud.google.com/text-to-speech/docs/voices. If unavailable, fall back to `es-US-Wavenet-B`.
