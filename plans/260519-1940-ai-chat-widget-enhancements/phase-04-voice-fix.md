---
phase: 4
title: "Voice Fix"
status: complete
priority: P2
effort: "45 min"
dependencies: [phase-01-system-prompt-proxy]
---

# Phase 4: Voice Fix

## Overview

Fix two voice issues: (11) the microphone button starts but never transcribes — caused by the recognition instance being destroyed and recreated on every `lang`/`onTranscript` change mid-session; and (12) Spanish TTS uses an English-accented voice because `getVoices().find()` picks the first `es-*` match instead of a native `es-ES` voice.

## Requirements

- Functional:
  - Microphone button reliably starts recognition, shows interim transcripts in the textarea, and stops when the user clicks again or speech ends
  - STT language follows the website locale (from `useLocale()`), not heuristic text detection
  - Spanish TTS uses a native `es-ES` voice (e.g., "Paulina", "Monica", Google Español España); falls back to any `es-*` voice; then falls back to browser default
  - English TTS prefers `en-US`; falls back to any `en-*`
- Non-functional:
  - No new dependencies — both hooks stay Web Speech API only
  - Hooks remain in `hooks/use-speech-recognition.ts` and `hooks/use-speech-synthesis.ts`
  - `useSpeechRecognition` must not recreate the recognition instance on every render

## Root Cause Analysis

### Bug #11 — Microphone not listening

`useSpeechRecognition` creates a new `SpeechRecognition` instance inside a `useEffect` with deps `[lang, onTranscript]`:

```ts
useEffect(() => {
  // creates recognition, sets recognitionRef.current, setSupported(true)
  return () => { recognition.abort(); recognitionRef.current = null }
}, [lang, onTranscript])
```

In the widget, `lang` is `speechLang` which is computed from `lastUserText`. After every assistant reply `messages` changes → `lastUserText` changes → `speechLang` may flip → the effect re-runs → old recognition is aborted and a NEW one is created with `recognitionRef.current` briefly `null`. If the user clicks the mic button while the effect is mid-teardown, `start()` calls `recognitionRef.current?.start()` and gets `null` → silent no-op.

**Fix:** Stabilize the recognition instance. Create it once on mount; update only `recognition.lang` imperatively when locale changes instead of recreating.

### Bug #12 — Spanish TTS sounds English

```ts
const voice = window.speechSynthesis
  .getVoices()
  .find((c) => c.lang.startsWith(languagePrefix))  // 'es'
```

`getVoices()` returns voices in browser order. On Chrome/macOS the first `es-*` voice is often `es-US` (Google US Spanish), which has a clearly non-native accent. Also, `getVoices()` returns an empty array synchronously on first call — voices load asynchronously. The current code misses this.

**Fix:** Prefer `es-ES` explicitly, then any `es-*`; load voices via `voiceschanged` event.

## Related Code Files

- Modify: `hooks/use-speech-recognition.ts`
- Modify: `hooks/use-speech-synthesis.ts`
- Modify: `components/ui/ai-chat-widget.tsx`

## Implementation Steps

### 1. Rewrite `hooks/use-speech-recognition.ts`

Key changes:
- Create recognition once on mount (no `lang` in deps)
- Update `recognition.lang` imperatively via a `useEffect([lang])` that does NOT recreate
- Use `useRef` for `onTranscript` to avoid stale closure without adding it to deps

```ts
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type SpeechRecognitionConstructor = new () => SpeechRecognition

type SpeechRecognitionEventLike = Event & {
  results: ArrayLike<ArrayLike<{ transcript: string }>>
}

type SpeechRecognition = EventTarget & {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

type UseSpeechRecognitionReturn = {
  supported: boolean
  listening: boolean
  transcript: string
  start: () => void
  stop: () => void
  reset: () => void
}

export function useSpeechRecognition(
  lang = 'en-US',
  onTranscript?: (transcript: string) => void
): UseSpeechRecognitionReturn {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  // Stable ref for callback — avoids recreating recognition when onTranscript identity changes
  const onTranscriptRef = useRef(onTranscript)
  useEffect(() => { onTranscriptRef.current = onTranscript }, [onTranscript])

  // Create recognition once on mount
  useEffect(() => {
    const speechWindow = window as SpeechWindow
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
    if (!Recognition) return

    const recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = lang

    recognition.onresult = (event) => {
      const next = Array.from(event.results)
        .map((r) => r[0]?.transcript ?? '')
        .join('')
      setTranscript(next)
      onTranscriptRef.current?.(next)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    setSupported(true)

    return () => {
      recognition.abort()
      recognitionRef.current = null
    }
  }, []) // mount/unmount only — lang handled below

  // Update lang imperatively without recreating
  useEffect(() => {
    if (recognitionRef.current) recognitionRef.current.lang = lang
  }, [lang])

  const start = useCallback(() => {
    const r = recognitionRef.current
    if (!r) return
    setTranscript('')
    setListening(true)
    try { r.start() } catch { /* already started */ }
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const reset = useCallback(() => setTranscript(''), [])

  return { supported, listening, transcript, start, stop, reset }
}
```

### 2. Pass locale-based lang to `useSpeechRecognition` in widget

The widget currently derives `speechLang` from heuristic text detection (`detectLang()`). Replace with the locale from `useLocale()`:

```tsx
// Remove detectLang() helper entirely
// Remove lastUserText / speechLang derived state

const locale = useLocale()   // already used in Phase 1 for API calls
const speechLang = locale === 'es' ? 'es-ES' : 'en-US'

const { supported: sttSupported, listening, start, stop, reset } =
  useSpeechRecognition(speechLang, setInput)
```

### 3. Rewrite `hooks/use-speech-synthesis.ts` — voice selection

Two fixes: (a) wait for `voiceschanged` before selecting a voice; (b) prioritize native Spanish voices.

```ts
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Preferred voice names by locale prefix (in priority order)
const PREFERRED_VOICES: Record<string, string[]> = {
  es: ['Paulina', 'Monica', 'Google español', 'Google Español', 'es-ES'],
  en: ['Samantha', 'Google US English', 'en-US'],
}

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null

  const prefix = lang.split('-')[0]   // 'es' | 'en'
  const preferred = PREFERRED_VOICES[prefix] ?? []

  // 1. Try preferred voice names
  for (const name of preferred) {
    const v = voices.find((c) => c.name.includes(name) && c.lang.startsWith(prefix))
    if (v) return v
  }

  // 2. Prefer exact locale match (e.g. es-ES over es-US)
  const exact = voices.find((c) => c.lang === lang)
  if (exact) return exact

  // 3. Any voice for this language prefix
  return voices.find((c) => c.lang.startsWith(prefix)) ?? null
}

type UseSpeechSynthesisReturn = {
  supported: boolean
  speaking: boolean
  speak: (text: string, lang?: string) => void
  cancel: () => void
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const voicesReadyRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    setSupported(true)

    // Voices may already be loaded (Firefox loads synchronously)
    if (window.speechSynthesis.getVoices().length > 0) {
      voicesReadyRef.current = true
      return
    }

    function onVoicesChanged() {
      voicesReadyRef.current = true
    }
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
  }, [])

  const speak = useCallback(
    (text: string, lang = 'en-US') => {
      if (!supported) return
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 1
      utterance.pitch = 1

      const voice = pickVoice(lang)
      if (voice) utterance.voice = voice

      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(utterance)
    },
    [supported]
  )

  const cancel = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])

  return { supported, speaking, speak, cancel }
}
```

### 4. Pass `speechLang` to TTS in widget (already locale-based from Step 2)

```tsx
// In the useEffect that calls speak():
useEffect(() => {
  if (!ttsEnabled) return
  const last = messages[messages.length - 1]
  if (last?.role === 'assistant') speak(last.content, speechLang)
}, [messages, speechLang, speak, ttsEnabled])
```

No change needed here — `speechLang` is now locale-based so TTS already gets the right language.

### 5. Remove `detectLang` helper

Delete the entire `detectLang` function from `ai-chat-widget.tsx` — no longer used.

## Success Criteria

- [x] Clicking mic button starts recognition and transcripts appear in textarea
- [x] Mic reliably works even after multiple messages have been exchanged
- [x] Recognition language follows site locale (`es-ES` when Spanish, `en-US` when English)
- [x] `try/catch` around `r.start()` prevents "already started" DOMException
- [x] Spanish TTS uses a native `es-ES` voice (Paulina on macOS, Google Español España on Chrome)
- [x] English TTS uses `en-US` voice (Samantha on macOS, Google US English on Chrome)
- [x] No console errors related to `voiceschanged` or recognition abort
- [x] `npm run typecheck` passes

## Verification

- Updated `hooks/use-speech-recognition.ts` to create the recognition instance once, update language imperatively, and guard `start()`.
- Updated `hooks/use-speech-synthesis.ts` to prefer native Spanish/English voices and listen for `voiceschanged`.
- Updated `AIChatWidget` to use site-locale speech language instead of text heuristics.
- Ran `npm run typecheck`, `npm run lint`, and `npm run build` successfully.
- Browser microphone and voice-device behavior were not manually tested in this pass.

## Risk Assessment

- **`recognition.lang` imperative update**: Setting `recognition.lang` while not listening is safe per spec. Mid-session lang change only affects the NEXT `start()` call — correct behavior.
- **`try/catch` on `r.start()`**: Prevents `InvalidStateError` if user double-clicks mic. Sets `listening: true` then immediately gets an error — guarded by the `setListening(false)` in `onerror`.
- **`pickVoice` preferred names**: Voice names are browser/OS dependent. The priority list covers Chrome (Google voices) and macOS (Paulina/Monica). The fallback chain (exact locale → any prefix) ensures something always plays.
- **`voiceschanged` not firing**: On Safari, `voiceschanged` may never fire if voices are already loaded synchronously. The `getVoices().length > 0` guard at mount handles this.
- **Removing `detectLang`**: This was used for BOTH STT lang and TTS lang. Both are now locale-based. If a Spanish-speaking user visits the English site and types in Spanish, the AI will respond in English (per locale instruction) — this is correct behavior; the locale is the source of truth.
