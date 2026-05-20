'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { Bot, Loader2, MessageCircle, Mic, Send, Trash2, Volume2, VolumeX, X } from 'lucide-react'
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { useFocusTrap } from '@/hooks/use-focus-trap'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis'
import { cn } from '@/lib/utils'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type WidgetStatus = 'collapsed' | 'open' | 'processing' | 'error' | 'out-of-scope' | 'limit-reached'

type AIChatWidgetProps = {
  avatarUrl?: string
}

const MAX_INPUT = 400
const MAX_SESSION_MESSAGES = 15
const COOLDOWN_MS = 2000
const CHAT_RETRIES = 1
const CHAT_TIMEOUT_MS = 28000

type ChatApiResponse = {
  ok: boolean
  status: number
  data: {
    reply?: string
    error?: string
    code?: string
    model?: string
  } | null
}

function parseInline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|(https?:\/\/[^\s<>"']+))/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    if (match[2]) {
      parts.push(<strong key={match.index}>{match[2]}</strong>)
    } else if (match[3]) {
      parts.push(<em key={match.index}>{match[3]}</em>)
    } else if (match[4]) {
      parts.push(
        <code key={match.index} className="rounded bg-surface-2 px-1 font-mono text-[11px]">
          {match[4]}
        </code>
      )
    } else if (match[5]) {
      // URL comes from the controlled API endpoint, not user input — safe to use as href
      const url = match[5].replace(/[.,;:!?]+$/, '')
      parts.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-accent underline hover:opacity-80"
        >
          {url}
        </a>
      )
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

function MarkdownText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, index) => (
        <span key={`${line}-${index}`}>
          {index > 0 && <br />}
          {parseInline(line)}
        </span>
      ))}
    </>
  )
}

function getSuggestions(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === 'string') : []
}

function isTransientChatStatus(status: number) {
  return status === 408 || status === 429 || status >= 500
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function AIChatWidget({ avatarUrl }: AIChatWidgetProps) {
  const locale = useLocale()
  const t = useTranslations('chat')
  const [status, setStatus] = useState<WidgetStatus>('collapsed')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [everOpened, setEverOpened] = useState(false)
  const [showBadge, setShowBadge] = useState(false)
  const [cooldown, setCooldown] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const badgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSpokenContentRef = useRef<string | null>(null)

  const suggestions = useMemo(() => getSuggestions(t.raw('suggestions')), [t])
  const quickReplies = useMemo(() => getSuggestions(t.raw('quickReplies')), [t])
  const followUps = useMemo(() => getSuggestions(t.raw('followUps')), [t])
  const speechLang = locale === 'es' ? 'es-ES' : 'en-US'
  const trapRef = useFocusTrap(status !== 'collapsed')
  const {
    supported: sttSupported,
    listening,
    requesting,
    start,
    stop,
    reset,
  } = useSpeechRecognition(speechLang, setInput)
  const { supported: ttsSupported, speaking, speak, cancel } = useSpeechSynthesis()

  const isOpen = status !== 'collapsed'
  const lastMsg = messages[messages.length - 1]
  const isClosingQuestion = lastMsg?.content.trimEnd().endsWith('?') ?? false
  const activeChips = isClosingQuestion ? quickReplies : followUps
  const showChips =
    lastMsg?.role === 'assistant' && status === 'open' && !cooldown && activeChips.length > 0
  const canSend =
    input.trim().length > 0 &&
    input.length <= MAX_INPUT &&
    status !== 'processing' &&
    status !== 'limit-reached' &&
    !cooldown

  useEffect(() => {
    if (everOpened) return

    function scheduleBadge(minMs: number, maxMs: number) {
      const delay = minMs + Math.random() * (maxMs - minMs)
      badgeTimerRef.current = setTimeout(() => {
        setShowBadge((visible) => !visible)
        scheduleBadge(30000, 60000)
      }, delay)
    }

    scheduleBadge(8000, 20000)

    return () => {
      if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current)
    }
  }, [everOpened])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, status])

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape' && status !== 'collapsed') setStatus('collapsed')
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [status])

  useEffect(() => {
    if (!ttsEnabled) return
    const last = messages[messages.length - 1]
    if (last?.role === 'assistant' && last.content !== lastSpokenContentRef.current) {
      lastSpokenContentRef.current = last.content
      speak(last.content, speechLang)
    }
  }, [messages, speechLang, speak, ttsEnabled])

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current)
      cancel()
    }
  }, [cancel])

  function openWidget() {
    setStatus('open')
    setEverOpened(true)
    setShowBadge(false)
    if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current)
  }

  function resetConversation() {
    setMessages([])
    setInput('')
    setStatus('open')
    setCooldown(false)
    reset()
    cancel()
    if (cooldownRef.current) clearTimeout(cooldownRef.current)
  }

  async function sendMessage(overrideText?: string) {
    const trimmed = (overrideText ?? input).trim()
    if (!trimmed || trimmed.length > MAX_INPUT || status === 'processing' || cooldown) return
    if (messages.length >= MAX_SESSION_MESSAGES) {
      setStatus('limit-reached')
      return
    }

    const userMessage: ChatMessage = { role: 'user', content: trimmed }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setStatus('processing')
    reset()

    try {
      let chatResponse: ChatApiResponse | null = null

      for (let attempt = 0; attempt <= CHAT_RETRIES; attempt += 1) {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS)

        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: nextMessages.slice(-6), locale }),
            signal: controller.signal,
          })
          const data = (await response.json().catch(() => null)) as ChatApiResponse['data']
          chatResponse = { ok: response.ok, status: response.status, data }

          if (response.ok || !isTransientChatStatus(response.status) || attempt === CHAT_RETRIES) {
            break
          }
        } catch {
          if (attempt === CHAT_RETRIES) throw new Error('Chat request failed')
        } finally {
          clearTimeout(timeout)
        }

        await wait(300 * 2 ** attempt)
      }

      if (!chatResponse) throw new Error('Chat request failed')

      if (!chatResponse.ok) {
        console.warn('Chat request failed', {
          status: chatResponse.status,
          code: chatResponse.data?.code,
          error: chatResponse.data?.error,
        })
        setStatus(chatResponse.status === 400 ? 'out-of-scope' : 'error')
        return
      }

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: chatResponse.data?.reply ?? '' },
      ])
      setStatus(nextMessages.length + 1 >= MAX_SESSION_MESSAGES ? 'limit-reached' : 'open')
      setCooldown(true)
      cooldownRef.current = setTimeout(() => setCooldown(false), COOLDOWN_MS)
    } catch {
      setStatus('error')
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage()
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage()
    }
  }

  if (!isOpen) {
    return (
      <>
        {!everOpened && (
          <span
            className="fixed bottom-6 right-4 z-[59] size-14 animate-ping rounded-full bg-accent/25 sm:right-6"
            aria-hidden="true"
          />
        )}
        {showBadge && (
          <div className="fixed bottom-24 right-4 z-[60] max-w-[210px] rounded-xl border border-hairline bg-surface-1 px-3 py-2 shadow-[var(--shadow-dock)] sm:right-6">
            <AnimatedShinyText className="text-xs text-fg-2">{t('bubble')}</AnimatedShinyText>
          </div>
        )}
        <button
          type="button"
          onClick={openWidget}
          className={cn(
            'fixed bottom-6 right-4 z-[60] flex size-14 items-center justify-center rounded-full border border-hairline bg-[var(--dock-bg)] text-fg-1 shadow-[var(--shadow-dock)] backdrop-blur transition-transform duration-200 hover:scale-105 active:scale-95 sm:right-6',
            !everOpened && 'animate-chat-pulse'
          )}
          aria-label={t('ariaOpen')}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Esteban"
              width={56}
              height={56}
              className="size-14 rounded-full object-cover"
              priority
            />
          ) : (
            <MessageCircle size={22} />
          )}
        </button>
      </>
    )
  }

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-label="Chat with Esteban"
      className="fixed bottom-20 right-3 z-[60] flex max-h-[min(620px,calc(100vh-112px))] w-[calc(100vw-24px)] flex-col overflow-hidden rounded-2xl border border-hairline bg-canvas shadow-[var(--shadow-dock)] sm:bottom-24 sm:right-6 sm:w-[360px]"
    >
      <div className="flex items-center justify-between border-b border-hairline bg-surface-1 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-accent text-white">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Esteban"
                width={32}
                height={32}
                className="size-8 rounded-full object-cover"
              />
            ) : (
              <Bot size={16} />
            )}
          </span>
          <div>
            <p className="text-sm font-medium text-fg-1">{t('headerTitle')}</p>
            <p className="text-xs text-fg-3">{t('headerSubtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {ttsSupported && (
            <button
              type="button"
              onClick={() => {
                setTtsEnabled((enabled) => !enabled)
                if (speaking) cancel()
              }}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                ttsEnabled ? 'text-accent' : 'text-fg-4 hover:text-fg-1'
              )}
              aria-label={ttsEnabled ? t('ariaDisableVoice') : t('ariaEnableVoice')}
            >
              {ttsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          )}
          <button
            type="button"
            onClick={resetConversation}
            className="rounded-md p-1.5 text-fg-4 transition-colors hover:text-fg-1"
            aria-label={t('ariaClear')}
          >
            <Trash2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => setStatus('collapsed')}
            className="rounded-md p-1.5 text-fg-4 transition-colors hover:text-fg-1"
            aria-label={t('ariaClose')}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="min-h-[260px] flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <div aria-live="polite" aria-atomic="false" className="sr-only">
          {messages[messages.length - 1]?.role === 'assistant'
            ? messages[messages.length - 1].content
            : ''}
        </div>
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="rounded-xl border border-hairline bg-surface-1 px-3 py-3 text-sm text-fg-2">
              {t('welcome')}
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-col gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void sendMessage(suggestion)}
                    className="w-full rounded-xl border border-hairline bg-surface-1 px-3 py-2 text-left text-xs text-fg-2 transition-colors hover:border-accent/40 hover:bg-surface-2 hover:text-fg-1"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {message.role === 'assistant' ? (
              <div className="max-w-[82%] rounded-2xl border border-hairline bg-surface-1 px-3 py-2 text-sm leading-relaxed text-fg-1">
                <MarkdownText text={message.content} />
              </div>
            ) : (
              <p className="max-w-[82%] rounded-2xl bg-accent px-3 py-2 text-sm leading-relaxed text-white">
                {message.content}
              </p>
            )}
          </div>
        ))}
        {status === 'processing' && (
          <div className="flex items-center gap-1 px-3 py-2" aria-label="Assistant is typing">
            <span className="size-1.5 animate-bounce rounded-full bg-fg-3" />
            <span className="size-1.5 animate-bounce rounded-full bg-fg-3 [animation-delay:150ms]" />
            <span className="size-1.5 animate-bounce rounded-full bg-fg-3 [animation-delay:300ms]" />
          </div>
        )}
      </div>

      {showChips && (
        <div className="flex flex-wrap gap-2 border-t border-hairline px-4 py-2">
          {activeChips.map((reply) => (
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

      {(listening || requesting) && (
        <div className="flex items-center justify-between gap-3 border-t border-hairline px-4 py-2 text-xs text-accent">
          <div className="flex items-center gap-2">
            <span className="size-1.5 animate-pulse rounded-full bg-accent" />
            {requesting ? t('listeningPermission') : t('listening')}
          </div>
          <div className="flex h-5 items-center gap-0.5" aria-hidden="true">
            {[10, 16, 12, 20, 14, 18, 11].map((height, index) => (
              <span
                key={`${height}-${index}`}
                className="w-0.5 animate-pulse rounded-full bg-accent"
                style={{
                  height,
                  animationDelay: `${index * 90}ms`,
                  animationDuration: '700ms',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {(status === 'error' || status === 'out-of-scope' || status === 'limit-reached') && (
        <div className="border-t border-hairline px-4 py-2 text-center text-xs text-fg-3">
          {status === 'error' && (
            <>
              {t('errorGeneric')}{' '}
              <button type="button" onClick={() => setStatus('open')} className="text-accent">
                {t('errorRetry')}
              </button>
            </>
          )}
          {status === 'out-of-scope' && t('errorScope')}
          {status === 'limit-reached' && (
            <>
              {t('errorLimit')}{' '}
              <a href="#contact" className="text-accent underline">
                {t('errorLimitCta')}
              </a>
              .
            </>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} className="border-t border-hairline p-3">
        <div className="flex items-end gap-2 rounded-xl border border-hairline bg-surface-input p-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value.slice(0, MAX_INPUT + 1))}
            onKeyDown={onInputKeyDown}
            rows={2}
            className="min-h-11 flex-1 resize-none bg-transparent text-base text-fg-1 outline-none placeholder:text-fg-4 sm:text-sm"
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
            maxLength={MAX_INPUT + 1}
          />
          {sttSupported && (
            <button
              type="button"
              onClick={listening || requesting ? stop : () => void start()}
              className={cn(
                'rounded-full p-2 transition-colors',
                listening || requesting ? 'bg-accent text-white' : 'text-fg-3 hover:text-fg-1'
              )}
              aria-label={listening || requesting ? t('ariaStopListening') : t('ariaActivateMic')}
            >
              <Mic size={16} />
            </button>
          )}
          <button
            type="submit"
            disabled={!canSend}
            className="rounded-full bg-accent p-2 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t('ariaSend')}
          >
            {status === 'processing' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-fg-4">
          <span>{cooldown ? t('hintCooldown') : t('hint')}</span>
          <span className={cn(input.length > MAX_INPUT && 'text-accent')}>
            {Math.min(input.length, MAX_INPUT + 1)}/{MAX_INPUT}
          </span>
        </div>
      </form>
    </div>
  )
}
