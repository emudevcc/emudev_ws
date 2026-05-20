---
phase: 2
title: "Replace Speech Hook"
status: pending
priority: P1
effort: "20 min"
dependencies: [1]
---

# Phase 2: Replace Speech Hook

## Overview

Rewrite `hooks/use-speech-synthesis.ts` to fetch audio from `/api/tts` (Google Cloud TTS WaveNet) instead of `window.speechSynthesis`. The hook's public interface (`supported`, `speaking`, `speak`, `cancel`) is **identical** — `ai-chat-widget.tsx` needs zero changes.

## Requirements

- Functional:
  - `speak(text, lang)` → POST `/api/tts` → play returned MP3
  - `cancel()` stops any in-flight audio immediately
  - `speaking` true while audio plays; false after `onended` or `cancel()`
  - `supported` always `true` (server-side, no browser capability check)
  - Silent fail on fetch error or empty `audioBase64` — no crash, no error UI
- Non-functional:
  - Remove all Web Speech API code — `window.speechSynthesis`, `SpeechSynthesisUtterance`, `PREFERRED_VOICES`, `FEMALE_VOICE_NAMES`, `pickVoice`, `isKnownFemaleVoice`
  - No new imports beyond React hooks
  - File under 50 lines

## Architecture

### Before (Web Speech API)
```ts
window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))  // OS voice, device-dependent
```

### After (Google Cloud TTS via /api/tts)
```ts
fetch('/api/tts', { method: 'POST', body: JSON.stringify({ text, lang }) })
  .then(res => res.json())
  .then(({ audioBase64 }) => {
    const audio = new Audio('data:audio/mpeg;base64,' + audioBase64)
    audio.onended = () => setSpeaking(false)
    audio.play()
    setSpeaking(true)
  })
```

### Full rewritten hook

```ts
'use client'
import { useCallback, useRef, useState } from 'react'

type UseSpeechSynthesisReturn = {
  supported: boolean
  speaking: boolean
  speak: (text: string, lang?: string) => void
  cancel: () => void
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [speaking, setSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speak = useCallback((text: string, lang = 'en-US') => {
    audioRef.current?.pause()
    audioRef.current = null

    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang }),
    })
      .then((res) => res.json())
      .then(({ audioBase64 }: { audioBase64?: string }) => {
        if (!audioBase64) return
        const audio = new Audio('data:audio/mpeg;base64,' + audioBase64)
        audioRef.current = audio
        setSpeaking(true)
        audio.onended = () => { setSpeaking(false); audioRef.current = null }
        audio.onerror = () => { setSpeaking(false); audioRef.current = null }
        audio.play().catch(() => setSpeaking(false))
      })
      .catch(() => { /* silent fail */ })
  }, [])

  const cancel = useCallback(() => {
    audioRef.current?.pause()
    audioRef.current = null
    setSpeaking(false)
  }, [])

  return { supported: true, speaking, speak, cancel }
}
```

## Related Code Files

- Modify: `hooks/use-speech-synthesis.ts` — full rewrite (~130 lines removed, ~45 lines added)
- No changes: `components/ui/ai-chat-widget.tsx`
- No changes: `app/api/chat/route.ts`

## Implementation Steps

1. Rewrite `hooks/use-speech-synthesis.ts` with the hook shape above
2. Confirm `ai-chat-widget.tsx` still compiles — hook signature unchanged
3. Run `npm run typecheck`
4. Manual test:
   - Enable speaker icon in chat
   - Send message → wait for AI reply → confirm WaveNet male voice plays (not OS voice)
   - Click speaker icon (cancel) mid-playback → audio stops immediately
   - Switch locale to ES → send message → confirm Spanish WaveNet voice plays

## Success Criteria

- [ ] `speak()` fetches `/api/tts` and plays MP3 via `data:audio/mpeg;base64,` data URL
- [ ] `speaking` true during playback, false after `onended`
- [ ] `cancel()` pauses audio and sets `speaking` to false immediately
- [ ] `supported` always `true`
- [ ] `/api/tts` failure → silent (no crash, no visible error)
- [ ] All `window.speechSynthesis`, `PREFERRED_VOICES`, `FEMALE_VOICE_NAMES` code removed
- [ ] `ai-chat-widget.tsx` unchanged (zero diff)
- [ ] `npm run typecheck` passes

## Risk Assessment

- **Autoplay policy**: Browser may block `audio.play()` if not triggered by user gesture. User must have clicked the speaker toggle (user gesture) before TTS fires — this grants autoplay permission for the session. The `.catch(() => setSpeaking(false))` handles the blocked case silently.
- **`supported: true` always**: Speaker button now always shows. If `GOOGLE_TTS_API_KEY` is missing, TTS silently fails. Acceptable — the key is always set in production.
- **Concurrent speak calls**: Second `speak()` call cancels first via `audioRef.current?.pause()`. Correct behavior.
- **MP3 MIME type**: `data:audio/mpeg;base64,` is universally supported. Do not use `audio/mp3` (non-standard MIME).
