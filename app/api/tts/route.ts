import { NextRequest, NextResponse } from 'next/server'

const MAX_TEXT_CHARS = 1000
const TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize'

const WAVENET_VOICES: Record<string, { languageCode: string; name: string }> = {
  en: { languageCode: 'en-US', name: 'en-US-Wavenet-J' },
  es: { languageCode: 'es-US', name: 'es-US-Wavenet-C' },
}

const ttsRateMap = new Map<string, { count: number; windowStart: number }>()
const WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS = 30

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ttsRateMap.get(ip)
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // Prune expired entries on window reset to prevent unbounded map growth
    for (const [key, val] of ttsRateMap) {
      if (now - val.windowStart > WINDOW_MS) ttsRateMap.delete(key)
    }
    ttsRateMap.set(ip, { count: 1, windowStart: now })
    return true
  }
  if (entry.count >= MAX_REQUESTS) return false
  entry.count += 1
  return true
}

function allowedOrigins() {
  return (process.env.CHAT_ALLOWED_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
}

function isAllowedOrigin(origin: string) {
  if (process.env.NODE_ENV !== 'production') return true
  const allowed = allowedOrigins()
  if (allowed.length === 0) return true
  return allowed.includes(origin)
}

function corsHeaders(origin: string) {
  const allowOrigin = isAllowedOrigin(origin) ? origin : ''
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin') ?? ''
  if (!isAllowedOrigin(origin)) return new NextResponse(null, { status: 403 })
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin') ?? ''
  const headers = corsHeaders(origin)

  if (!isAllowedOrigin(origin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers })
  }

  if (!checkRateLimit(getIp(req))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers })
  }

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
