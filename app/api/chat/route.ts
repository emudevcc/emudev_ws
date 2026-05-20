import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { buildSystemPromptForLocale } from '@/lib/chat/system-prompt'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export const maxDuration = 30

const WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS = 30
const MAX_MESSAGES = 6
const MAX_MESSAGE_CHARS = 400
const DEFAULT_MODEL = 'gemini-2.5-flash-lite'
const FALLBACK_MODEL = 'gemini-2.5-flash'
const MAX_TOKENS = 350
const MODEL_TIMEOUT_MS = 12000
const LOCALES = ['en', 'es'] as const

const rateMap = new Map<string, { count: number; windowStart: number }>()

const injectionPatterns = [
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

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // Prune expired entries on window reset to prevent unbounded map growth
    for (const [key, val] of rateMap) {
      if (now - val.windowStart > WINDOW_MS) rateMap.delete(key)
    }
    rateMap.set(ip, { count: 1, windowStart: now })
    return true
  }

  if (entry.count >= MAX_REQUESTS) return false
  entry.count += 1
  return true
}

function hasInjection(text: string): boolean {
  return injectionPatterns.some((pattern) => pattern.test(text))
}

function corsHeaders(origin: string) {
  const allowOrigin = isAllowedOrigin(origin) ? origin : ''
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function allowedOrigins() {
  return (process.env.CHAT_ALLOWED_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

function isAllowedOrigin(origin: string) {
  if (process.env.NODE_ENV !== 'production') return true
  const allowed = allowedOrigins()
  if (allowed.length === 0) return true
  return allowed.includes(origin)
}

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ChatMessage>
  return (
    (candidate.role === 'user' || candidate.role === 'assistant') &&
    typeof candidate.content === 'string'
  )
}

function validateMessages(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) return null
  if (!value.every(isChatMessage)) return null

  const messages = value.map((message) => ({
    role: message.role,
    content: message.content.trim(),
  }))

  // Only enforce char limit on user messages — assistant replies can be longer and ride in history
  if (
    messages.some(
      (message) =>
        !message.content || (message.role === 'user' && message.content.length > MAX_MESSAGE_CHARS)
    )
  ) {
    return null
  }

  return messages
}

function validateLocale(value: unknown): (typeof LOCALES)[number] {
  return typeof value === 'string' && LOCALES.includes(value as (typeof LOCALES)[number])
    ? (value as (typeof LOCALES)[number])
    : 'en'
}

function jsonError(error: string, code: string, status: number, headers: Record<string, string>) {
  return NextResponse.json(
    { error, code },
    {
      status,
      headers: {
        ...headers,
        'x-chat-error-code': code,
      },
    }
  )
}

function modelCandidates() {
  const configured = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL
  return Array.from(new Set([configured, DEFAULT_MODEL, FALLBACK_MODEL]))
}

function errorStatus(error: unknown) {
  if (!error || typeof error !== 'object') return null
  const candidate = error as { status?: unknown; statusCode?: unknown; code?: unknown }
  const status = candidate.status ?? candidate.statusCode ?? candidate.code
  return typeof status === 'number' ? status : null
}

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : typeof error === 'string'
      ? error
      : JSON.stringify(error ?? '')
}

function upstreamErrorCode(error: unknown) {
  const status = errorStatus(error)
  const message = errorMessage(error)

  if (status === 400 || /FAILED_PRECONDITION/i.test(message)) {
    return { status: 503, code: 'GEMINI_BILLING_OR_REGION_REQUIRED' }
  }

  if (status === 403 || /PERMISSION_DENIED|API key not valid|API_KEY_INVALID/i.test(message)) {
    return { status: 503, code: 'GEMINI_PERMISSION_DENIED' }
  }

  if (status === 404 || /NOT_FOUND|not found|model.*not.*found/i.test(message)) {
    return { status: 503, code: 'GEMINI_MODEL_UNAVAILABLE' }
  }

  if (status === 429 || /RESOURCE_EXHAUSTED|quota|rate limit/i.test(message)) {
    return { status: 429, code: 'GEMINI_RATE_LIMITED' }
  }

  if (/timed out|timeout|DEADLINE_EXCEEDED/i.test(message)) {
    return { status: 503, code: 'GEMINI_TIMEOUT' }
  }

  if (status && [408, 500, 502, 503, 504].includes(status)) {
    return { status: 503, code: 'GEMINI_UPSTREAM_UNAVAILABLE' }
  }

  if (/overload|unavailable|socket|network|fetch failed/i.test(message)) {
    return { status: 503, code: 'GEMINI_UPSTREAM_UNAVAILABLE' }
  }

  return { status: 500, code: 'CHAT_GENERATION_FAILED' }
}

function isTransientModelError(error: unknown) {
  const { code } = upstreamErrorCode(error)

  return ['GEMINI_RATE_LIMITED', 'GEMINI_TIMEOUT', 'GEMINI_UPSTREAM_UNAVAILABLE'].includes(code)
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Chat model request timed out')), timeoutMs)
      }),
    ])
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}

async function generateWithRetry(
  genAI: GoogleGenerativeAI,
  systemPrompt: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>
) {
  let lastError: unknown

  for (const modelName of modelCandidates()) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      generationConfig: { maxOutputTokens: MAX_TOKENS },
    })

    try {
      const result = await withTimeout(model.generateContent({ contents }), MODEL_TIMEOUT_MS)
      return { result, modelName }
    } catch (error) {
      lastError = error
      if (!isTransientModelError(error)) break
      console.warn('Chat model attempt failed; trying fallback if available', {
        model: modelName,
        status: errorStatus(error),
        code: upstreamErrorCode(error).code,
        message: errorMessage(error),
      })
    }
  }

  throw lastError
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin') ?? ''
  if (!isAllowedOrigin(origin)) return new NextResponse(null, { status: 403 })

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  })
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
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
  const payload = body as { messages?: unknown; locale?: unknown } | null
  const messages = validateMessages(payload?.messages)
  const locale = validateLocale(payload?.locale)

  if (!messages) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers })
  }

  const lastUserMessage = messages.filter((message) => message.role === 'user').pop()
  if (lastUserMessage && hasInjection(lastUserMessage.content)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers })
  }

  if (!process.env.GEMINI_API_KEY) {
    return jsonError('Chat service is not configured', 'GEMINI_API_KEY_MISSING', 503, headers)
  }

  let systemPrompt: string
  try {
    systemPrompt = buildSystemPromptForLocale(locale)
  } catch {
    return jsonError('Chat profile is unavailable', 'CHAT_PROFILE_UNAVAILABLE', 503, headers)
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const contents = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    const { result, modelName } = await generateWithRetry(genAI, systemPrompt, contents)

    // response.text() throws when Gemini blocks the response (safety/recitation filters)
    let reply: string
    try {
      reply = result.response.text().trim()
    } catch {
      return jsonError('Content filtered', 'CONTENT_FILTERED', 400, headers)
    }

    if (!reply) {
      return jsonError('Empty model response', 'EMPTY_MODEL_RESPONSE', 503, headers)
    }

    return NextResponse.json({ reply, model: modelName }, { headers })
  } catch (error) {
    const { status, code } = upstreamErrorCode(error)
    console.error('Chat generation failed', error)

    return jsonError(
      status === 429
        ? 'Chat service is rate limited'
        : status === 503
          ? 'Chat service is temporarily unavailable'
          : 'Failed to generate response',
      code,
      status,
      headers
    )
  }
}
