import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { buildSystemPrompt } from '@/lib/chat/system-prompt'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS = 30
const MAX_MESSAGES = 6
const MAX_MESSAGE_CHARS = 400
const MODEL = 'claude-haiku-4-5'

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
  const allowed = process.env.CHAT_ALLOWED_ORIGIN ?? ''
  return {
    'Access-Control-Allow-Origin': allowed || origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function isAllowedOrigin(origin: string) {
  if (process.env.NODE_ENV !== 'production') return true
  const allowed = process.env.CHAT_ALLOWED_ORIGIN ?? ''
  if (!allowed) return true
  // Support comma-separated list: "https://emudev.cc,https://www.emudev.cc"
  return allowed.split(',').some((o) => o.trim() === origin)
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

  if (messages.some((message) => !message.content || message.content.length > MAX_MESSAGE_CHARS)) {
    return null
  }

  return messages
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
  const messages = validateMessages((body as { messages?: unknown } | null)?.messages)

  if (!messages) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers })
  }

  const lastUserMessage = messages.filter((message) => message.role === 'user').pop()
  if (lastUserMessage && hasInjection(lastUserMessage.content)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Chat service is not configured' }, { status: 503, headers })
  }

  let systemPrompt: string
  try {
    systemPrompt = buildSystemPrompt()
  } catch {
    return NextResponse.json({ error: 'Chat profile is unavailable' }, { status: 503, headers })
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await client.messages.create({
      model: MODEL,
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
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim()

    return NextResponse.json({ reply }, { headers })
  } catch {
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500, headers })
  }
}
