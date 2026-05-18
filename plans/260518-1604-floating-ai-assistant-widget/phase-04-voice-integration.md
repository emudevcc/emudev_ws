---
phase: 4
title: "Voice Integration"
status: complete
priority: P2
effort: "2h"
dependencies: [3]
---

# Phase 4: Voice Integration

## Overview

Add Speech-to-Text (microphone input) and Text-to-Speech (read responses aloud) using the browser-native Web Speech API. Zero cost, zero new dependencies. Both features are progressive enhancements — the widget works fully without them.

## Requirements

- Functional:
  - **STT:** Microphone button starts recognition; transcription populates input field (user can edit before sending); animated indicator while listening
  - **TTS:** Toggle button in chat header; when enabled, each new assistant message is read aloud; voice matches detected language (Spanish/English)
  - STT only available over HTTPS (Web Speech API restriction) — button hidden or disabled on HTTP
  - Both features degrade gracefully when browser doesn't support Web Speech API (hide buttons, no errors)
- Non-functional:
  - Two small hooks (`hooks/use-speech-recognition.ts`, `hooks/use-speech-synthesis.ts`) — keep logic out of the widget component
  - No npm packages — `window.SpeechRecognition` / `window.speechSynthesis` only
  - SSR-safe: all `window.*` access inside `useEffect` or guarded with `typeof window !== 'undefined'`

## Architecture

```
hooks/
  use-speech-recognition.ts   ← STT: start/stop, transcript, listening state
  use-speech-synthesis.ts     ← TTS: speak(text, lang), cancel, isSpeaking state

components/ui/ai-chat-widget.tsx   ← consumes both hooks, wires to UI
```

### `hooks/use-speech-recognition.ts`

```ts
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type UseSpeechRecognitionReturn = {
  supported: boolean
  listening: boolean
  transcript: string
  start: () => void
  stop: () => void
  reset: () => void
}

export function useSpeechRecognition(lang = 'en-US'): UseSpeechRecognitionReturn {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recogRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const SR = window.SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) return
    setSupported(true)

    const recog = new SR()
    recog.continuous = false
    recog.interimResults = true
    recog.lang = lang

    recog.onresult = (e: SpeechRecognitionEvent) => {
      const t = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('')
      setTranscript(t)
    }
    recog.onend = () => setListening(false)
    recog.onerror = () => setListening(false)

    recogRef.current = recog
    return () => recog.abort()
  }, [lang])

  const start = useCallback(() => {
    recogRef.current?.start()
    setListening(true)
    setTranscript('')
  }, [])

  const stop = useCallback(() => {
    recogRef.current?.stop()
  }, [])

  const reset = useCallback(() => setTranscript(''), [])

  return { supported, listening, transcript, start, stop, reset }
}
```

### `hooks/use-speech-synthesis.ts`

```ts
'use client'

import { useCallback, useEffect, useState } from 'react'

type UseSpeechSynthesisReturn = {
  supported: boolean
  speaking: boolean
  speak: (text: string, lang?: string) => void
  cancel: () => void
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true)
    }
  }, [])

  const speak = useCallback((text: string, lang = 'en-US') => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = lang
    utt.rate = 1.0
    utt.pitch = 1.0

    // Pick a natural voice for the language if available
    const voices = window.speechSynthesis.getVoices()
    const match = voices.find(v => v.lang.startsWith(lang.split('-')[0]) && !v.name.includes('Google'))
    if (match) utt.voice = match

    utt.onstart = () => setSpeaking(true)
    utt.onend = () => setSpeaking(false)
    utt.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utt)
  }, [supported])

  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [])

  return { supported, speaking, speak, cancel }
}
```

### Language Detection

Simple heuristic — no library needed:

```ts
function detectLang(text: string): 'es-ES' | 'en-US' {
  // Common Spanish function words
  const spanishSignals = /\b(qué|cómo|cuál|tienes|trabajas|puedes|sobre|tu|tu|hola|gracias)\b/i
  return spanishSignals.test(text) ? 'es-ES' : 'en-US'
}
```

Call `detectLang` on the last user message before TTS and before STT `lang` prop.

### Widget Integration Changes

In `ai-chat-widget.tsx` (Phase 3 base):

```ts
// Add hooks
const { supported: sttSupported, listening, transcript, start: startMic, stop: stopMic } = useSpeechRecognition(detectedLang)
const { supported: ttsSupported, speaking, speak, cancel: cancelSpeech } = useSpeechSynthesis()
const [ttsEnabled, setTtsEnabled] = useState(false)

// Sync transcript → input field
useEffect(() => {
  if (transcript) setInput(transcript)
}, [transcript])

// Auto-speak new assistant messages when TTS enabled
useEffect(() => {
  if (!ttsEnabled) return
  const last = messages[messages.length - 1]
  if (last?.role === 'assistant') speak(last.content, detectedLang)
}, [messages, ttsEnabled])
```

Microphone button (replaces disabled placeholder from Phase 3):
```tsx
{sttSupported && (
  <button
    type="button"
    onClick={listening ? stopMic : startMic}
    aria-label={listening ? 'Stop listening' : 'Activate microphone'}
    className={cn(
      'shrink-0 rounded-full p-2 transition-colors',
      listening
        ? 'bg-accent text-white animate-pulse'
        : 'text-fg-3 hover:text-fg-1'
    )}
  >
    <Mic size={16} />
  </button>
)}
```

TTS toggle (in chat header):
```tsx
{ttsSupported && (
  <button
    type="button"
    onClick={() => { setTtsEnabled(e => !e); if (speaking) cancelSpeech() }}
    aria-label={ttsEnabled ? 'Disable voice output' : 'Enable voice output'}
    className={cn('p-1.5 rounded-md transition-colors', ttsEnabled ? 'text-accent' : 'text-fg-4 hover:text-fg-2')}
  >
    {ttsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
  </button>
)}
```

Listening visual indicator (above input bar):
```tsx
{listening && (
  <div className="flex items-center gap-2 px-4 py-1.5 border-t border-hairline text-xs text-accent">
    <span className="size-1.5 rounded-full bg-accent animate-pulse" />
    Listening...
  </div>
)}
```

## Related Code Files

- Create: `hooks/use-speech-recognition.ts`
- Create: `hooks/use-speech-synthesis.ts`
- Modify: `components/ui/ai-chat-widget.tsx`
- Add Lucide icons: `Mic`, `Volume2`, `VolumeX` to existing import

## Implementation Steps

1. Create `hooks/use-speech-recognition.ts`
2. Create `hooks/use-speech-synthesis.ts`
3. Add `detectLang()` utility inside `ai-chat-widget.tsx` (or `lib/chat/detect-lang.ts` if reused)
4. Wire STT hook: sync `transcript` → `input`, replace mic placeholder button with real handler
5. Wire TTS hook: auto-speak on new assistant message when `ttsEnabled`, add header toggle
6. Test STT on HTTPS (localhost counts if running `next dev --experimental-https` or use Vercel preview)
7. Test TTS: enable toggle → send message → assistant reply is read aloud
8. Test language switching: Spanish question → Spanish voice
9. Test graceful degradation: open in Firefox with `SpeechRecognition` disabled → mic button hidden, no JS error
10. `npx tsc --noEmit`

## Success Criteria

- [x] Mic button appears only when `window.SpeechRecognition` / `webkitSpeechRecognition` is available
- [x] Clicking mic shows "Listening..." indicator + animated dot
- [x] Transcript populates input; user can edit before sending
- [x] TTS toggle in header; active state uses accent styling
- [x] New assistant messages auto-read when TTS enabled
- [x] Language detection selects Spanish or English speech locale
- [x] Voice buttons hidden when browser support is missing
- [x] No SSR errors; browser API access is guarded inside client hooks/effects
- [x] `npx tsc --noEmit` passes

## Verification

- Created `hooks/use-speech-recognition.ts` and `hooks/use-speech-synthesis.ts`.
- Wired STT/TTS into `components/ui/ai-chat-widget.tsx`.
- Ran `npx tsc --noEmit`, `npm run lint`, and `npm run build` successfully.
- Browser microphone/TTS permission flows were not manually tested in this pass.

## Risk Assessment

- **Safari STT support** — `webkitSpeechRecognition` works in Safari but may require explicit user permission prompt. The `onerror` handler covers permission denial.
- **TTS voice availability** — `getVoices()` is async in Chrome (fires after `voiceschanged` event). If no voice found, `SpeechSynthesisUtterance` still speaks with the default system voice.
- **Firefox STT** — not supported as of 2026. Mic button hidden via `supported` flag — no action needed.
- **Continuous listening** — `continuous: false` means recognition auto-stops after a pause. This is intentional; no infinite loop risk.
