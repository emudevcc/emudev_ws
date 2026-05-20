---
phase: 1
title: "Voice Fixes"
status: completed
priority: P1
effort: "30 min"
dependencies: []
---

# Phase 1: Voice Fixes

## Overview

Two voice fixes: (A) switch TTS to male voices for both English and Spanish; (B) fix the STT "Listening" flicker by switching from `continuous: false` to `continuous: true` and hardening the `onerror` handler so `no-speech` events don't kill the session.

## Root Cause Analysis

### Bug: TTS uses female voices

`PREFERRED_VOICES` in `hooks/use-speech-synthesis.ts` currently lists:
- EN: `Samantha` → female macOS voice
- ES: `Paulina`, `Monica` → both female macOS voices

### Bug: STT "Listening" flickers and stops immediately

`use-speech-recognition.ts` sets `recognition.continuous = false`. With this setting:
- Recognition listens for ONE phrase, then auto-ends
- If the user doesn't speak within the initial silence window (~2–3s on Chrome/macOS), `onend` fires → `setListening(false)` → "Listening" disappears before any speech is captured
- `onerror` has type `() => void` — the actual event's `error` field (e.g. `no-speech`) is ignored, so `setListening(false)` is called even on non-fatal errors

## Requirements

- Functional:
  - TTS uses a male voice in English (Daniel, Tom, or Alex on macOS; Google UK English Male in Chrome)
  - TTS uses a male voice in Spanish (Jorge on macOS es-ES; Diego on macOS es-MX; Carlos as fallback)
  - Mic keeps listening continuously after start until the user explicitly clicks stop
  - `no-speech` errors (normal during pauses in continuous mode) do NOT stop the listening state
  - Real errors (`not-allowed`, `audio-capture`, `network`) correctly stop listening
- Non-functional:
  - No new dependencies
  - Fallback chain (preferred name → exact locale → any prefix) unchanged

## Related Code Files

- Modify: `hooks/use-speech-synthesis.ts`
- Modify: `hooks/use-speech-recognition.ts`

## Implementation Steps

### 1. Update `PREFERRED_VOICES` in `use-speech-synthesis.ts`

Replace the current list with male voice names. Priority order: common macOS males first, Chrome/Google males second, locale fallback last.

```ts
const PREFERRED_VOICES: Record<string, string[]> = {
  en: ['Daniel', 'Tom', 'Alex', 'Google UK English Male', 'Fred'],
  es: ['Jorge', 'Diego', 'Carlos', 'Google español de Estados Unidos'],
}
```

Voice reference:
| Name | Platform | Lang | Gender |
|------|----------|------|--------|
| Daniel | macOS | en-GB | Male |
| Tom | macOS | en-US | Male |
| Alex | macOS (older) | en-US | Male |
| Google UK English Male | Chrome | en-GB | Male |
| Fred | macOS (legacy) | en-US | Male |
| Jorge | macOS | es-ES | Male |
| Diego | macOS | es-MX | Male |
| Carlos | macOS | es-US | Male |

The existing `pickVoice` fallback chain (preferred name → exact locale → any prefix) ensures a voice is always selected even if none of the named voices exist.

### 2. Fix `recognition.continuous` and `onerror` in `use-speech-recognition.ts`

**Change 1** — in the mount `useEffect`, set `continuous: true`:
```ts
recognition.continuous = true     // was: false
recognition.interimResults = true
```

**Change 2** — add `error` field to the local `SpeechRecognition` type:

```ts
// Before
type SpeechRecognition = EventTarget & {
  ...
  onerror: (() => void) | null
}

// After
type SpeechRecognitionErrorEvent = Event & { error: string }

type SpeechRecognition = EventTarget & {
  ...
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
}
```

**Change 3** — update the `onerror` handler to ignore `no-speech`:
```ts
recognition.onerror = (event) => {
  // 'no-speech' is normal during pauses in continuous mode; don't stop listening
  if (event.error !== 'no-speech') {
    setListening(false)
  }
}
```

With `continuous: true`, `onend` only fires when `stop()` / `abort()` is called or on an unrecoverable error, so the existing `recognition.onend = () => setListening(false)` remains correct.

## Success Criteria

- [x] TTS uses a male voice in English (Daniel or Tom on macOS; Google UK English Male in Chrome)
- [x] TTS uses a male voice in Spanish (Jorge on macOS es-ES or Diego on macOS es-MX)
- [x] Clicking mic starts recognition and "Listening" stays visible until explicitly stopped
- [x] Recognition accumulates transcript as user speaks (interim results visible in textarea)
- [x] Clicking mic again (stop) ends recognition and clears "Listening"
- [x] `no-speech` pauses do not close the listening session
- [x] `not-allowed` / `audio-capture` errors correctly stop listening
- [x] `npm run typecheck` passes

## Completion Notes

- Implemented male-first TTS voice candidates for English and Spanish.
- Switched speech recognition to continuous mode.
- Updated recognition error handling so `no-speech` does not end the listening state while real errors still stop it.

## Risk Assessment

- **`continuous: true` on iOS Safari**: Not well supported on iOS — but the hook already uses `try/catch` around `r.start()` and the `onerror` handler. If unsupported, recognition simply doesn't start; existing fallback behavior intact.
- **`onresult` accumulation**: With `continuous: true`, `event.results` grows as the user speaks. The current handler `Array.from(event.results).map(...).join('')` already handles this correctly — it joins all accumulated results.
- **Voice name matching by OS**: Voice names are case-sensitive and OS-specific. The `candidate.name.includes(name)` check is substring-based so "Tom" matches "Tom (Enhanced)". If no male voice is found, the fallback returns any `en-*` or `es-*` voice — may be female but won't break.
