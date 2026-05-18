---
title: "Floating AI Assistant Widget"
description: "Fixed bottom-right chat widget that proxies Anthropic Claude Haiku, responds as the portfolio owner in first person, with voice I/O, rate limiting, prompt injection defense, and full a11y."
status: complete
priority: P2
branch: "development"
tags: []
blockedBy: []
blocks: []
created: "2026-05-18T22:04:56.880Z"
createdBy: "ck:plan"
source: skill
---

# Floating AI Assistant Widget

## Overview

A floating chat widget (`AIChatWidget`) fixed to the bottom-right of the portfolio. Visitors ask questions about the owner's experience, skills, and projects; the widget responds in first person via a server-side Anthropic Claude Haiku proxy. Voice input (Web Speech API STT) and voice output (Web Speech API TTS) are supported. Security layers live exclusively in the proxy: strict CORS, 30 req/hr IP rate limit, prompt-injection filtering, and 400-char body cap.

**Before:** no conversational interface
**After:** embeddable `<AIChatWidget />` + `app/api/chat/route.ts` proxy + `data/profile.md` personal data file

## Outcome

Implemented the floating AI assistant widget end to end:

- Added server-only profile prompt loading with `lib/chat/system-prompt.ts`
- Added local editable `data/profile.md` and tracked `data/profile-template.md`
- Added `/api/chat` Anthropic proxy with CORS, in-memory rate limiting, body validation, message length caps, and prompt-injection rejection
- Added `AIChatWidget` and mounted it in `app/[locale]/layout.tsx`
- Added Web Speech API hooks for STT/TTS progressive enhancement
- Added focus trap, Escape-to-close, `aria-live`, dialog semantics, mobile sizing, and icon labels
- Added `ANTHROPIC_API_KEY` and `CHAT_ALLOWED_ORIGIN` to `.env.example`
- Added `data/profile.md` to `.gitignore`
- Installed `@anthropic-ai/sdk`

Verification:

- `npx tsc --noEmit` passed
- `npm run lint` passed
- `npm run build` passed
- Dev server started successfully on port 3002 because port 3000 was already in use
- Local `curl` API smoke tests were blocked by sandbox localhost connection access (`curl` exit 7)
- Live Anthropic success response was not tested because it requires a configured `ANTHROPIC_API_KEY`

## Architecture

```
data/
  profile.md              ← owner's CV/bio — easy to edit, never shipped to client
  system-prompt.ts        ← reads profile.md at build/request time, assembles final prompt

app/api/chat/
  route.ts                ← Next.js Route Handler (serverless), CORS + rate limit + Anthropic call

components/ui/
  ai-chat-widget.tsx      ← single self-contained React component (<400 lines, modularise if needed)

hooks/
  use-speech-recognition.ts   ← Web Speech API STT
  use-speech-synthesis.ts     ← Web Speech API TTS

.env.example                  ← ANTHROPIC_API_KEY + CHAT_ALLOWED_ORIGIN
```

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Profile Data Layer](./phase-01-profile-data-layer.md) | Complete |
| 2 | [API Proxy](./phase-02-api-proxy.md) | Complete |
| 3 | [Widget Core UI](./phase-03-widget-core-ui.md) | Complete |
| 4 | [Voice Integration](./phase-04-voice-integration.md) | Complete |
| 5 | [Accessibility and Polish](./phase-05-accessibility-and-polish.md) | Complete |

## Dependencies

None — phases are sequential. Phase 2 depends on Phase 1 output (`system-prompt.ts`). Phase 3 depends on Phase 2 endpoint. Phase 4 and 5 depend on Phase 3 component.
