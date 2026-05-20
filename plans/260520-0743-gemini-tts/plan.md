---
title: "Google Cloud TTS WaveNet: Replace Web Speech API"
description: "Replace browser Web Speech API TTS with a server-side /api/tts endpoint using Google Cloud TTS WaveNet voices (en-US-Wavenet-D, es-ES-Wavenet-B). Requires new GOOGLE_TTS_API_KEY."
status: pending
priority: P2
branch: "development"
tags: ["chat", "tts", "voice", "google-cloud", "wavenet", "audio"]
blockedBy: []
blocks: []
created: "2026-05-20T13:51:03.835Z"
createdBy: "ck:plan"
source: skill
---

# Google Cloud TTS WaveNet: Replace Web Speech API

## Overview

Replace `window.speechSynthesis` (OS voices, device-dependent) with a server-side `/api/tts` endpoint that calls Google Cloud Text-to-Speech REST API with WaveNet voices. Returns base64 MP3 the browser plays directly. Consistent, high-quality male voice on all devices.

**Key constraint:** TTS is optional — only called when the user enables the speaker icon.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [TTS API Route](./phase-01-tts-api-route.md) | Pending |
| 2 | [Replace Speech Hook](./phase-02-replace-speech-hook.md) | Pending |

## Files Modified

- Create: `app/api/tts/route.ts` — POST `{text, lang}` → Cloud TTS WaveNet → `{audioBase64}`
- Modify: `hooks/use-speech-synthesis.ts` — fetch `/api/tts`, play MP3 via `Audio` element
- No changes: `components/ui/ai-chat-widget.tsx` — hook interface unchanged

## New Env Var Required

`GOOGLE_TTS_API_KEY` — Google Cloud Console API key (restricted to Cloud Text-to-Speech API).
Obtain: Google Cloud Console → APIs & Services → Credentials → Create API Key → restrict to "Cloud Text-to-Speech API"

## Architecture

```
[Widget: ttsEnabled=true, new assistant message]
        ↓
useSpeechSynthesis.speak(text, lang)
        ↓
POST /api/tts { text, lang }
        ↓
fetch https://texttospeech.googleapis.com/v1/text:synthesize?key=GOOGLE_TTS_API_KEY
  voice: en-US-Wavenet-D (EN) | es-ES-Wavenet-B (ES)
  audioEncoding: MP3
        ↓
{ audioBase64: string }  ← base64 MP3
        ↓
new Audio('data:audio/mpeg;base64,' + audioBase64).play()
```

## WaveNet Male Voices

| Locale | Voice Name | Quality |
|--------|-----------|---------|
| en-US | `en-US-Wavenet-D` | Male, deep, clear |
| en-US | `en-US-Wavenet-B` | Male, natural (fallback) |
| es-ES | `es-ES-Wavenet-B` | Male |
| es-US | `es-US-Wavenet-B` | Male, Latin American |
