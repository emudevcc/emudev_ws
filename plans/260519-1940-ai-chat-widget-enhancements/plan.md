---
title: "AI Chat Widget Enhancements"
description: "12 improvements to the AI portfolio assistant: fix false scope rejections, conversational tone, markdown rendering, locale-aware language, profile photo icon, Magic UI animations, random bubble, suggested questions, friendly placeholder, microphone fix, Spanish native TTS"
status: complete
priority: P2
branch: "development"
tags: [ai, chat, ux, voice, i18n]
blockedBy: []
blocks: []
created: "2026-05-20T01:37:42.732Z"
createdBy: "ck:plan"
source: skill
---

# AI Chat Widget Enhancements

## Overview

Improve the floating AI portfolio assistant across four areas: (1) system prompt quality and proxy locale wiring, (2) markdown rendering and full i18n, (3) widget UX (profile photo, animated bubble, random appearance, suggested questions), and (4) voice input/output fixes for both English and Spanish.

## Outcome

Implemented the chat widget enhancements:

- Rewrote the system prompt to be warmer and less likely to reject professional-background questions
- Added locale-aware system prompt instructions and API request validation for `locale`
- Sent the active site locale from the widget to `/api/chat`
- Moved widget strings into the `chat` i18n namespace in `messages/en.json` and `messages/es.json`
- Added lightweight markdown rendering for assistant messages
- Added localized suggestion chips and click-to-send behavior
- Passed the Sanity avatar URL from layout settings into the widget
- Added avatar rendering in the collapsed button and open header, with icon fallback
- Replaced the fixed 5s bubble timer with random recurring collapsed-state prompts
- Added `AnimatedShinyText` to the prompt bubble
- Stabilized speech recognition so the recognition instance is not recreated on each render
- Made speech recognition and TTS language follow the active site locale
- Improved TTS voice selection for native Spanish and English voices

Verification:

- `npm run typecheck` passed
- `npm run lint` passed
- `npx playwright test tests/smoke/i18n-bilingual.spec.ts --reporter=list` passed
- `npm run build` passed

## Phases

| Phase | Name | Status | Effort | Items |
|-------|------|--------|--------|-------|
| 1 | [System Prompt & Proxy](./phase-01-system-prompt-proxy.md) | Complete | 45 min | #1 #2 #4 #10 |
| 2 | [Markdown + i18n](./phase-02-markdown-i18n.md) | Complete | 45 min | #3 #7 |
| 3 | [Widget UX](./phase-03-widget-ux.md) | Complete | 1.5h | #5 #6 #8 #9 |
| 4 | [Voice Fix](./phase-04-voice-fix.md) | Complete | 45 min | #11 #12 |

## Key Files

- `components/ui/ai-chat-widget.tsx` — Client Component (all UI changes)
- `lib/chat/system-prompt.ts` — PREAMBLE + `buildSystemPrompt()`
- `app/api/chat/route.ts` — Anthropic proxy (add locale support)
- `hooks/use-speech-recognition.ts` — STT (fix mic bug)
- `hooks/use-speech-synthesis.ts` — TTS (fix Spanish voice)
- `components/layout-widgets.tsx` — pass `avatarUrl` prop down
- `app/[locale]/layout.tsx` — pass `siteSettings.avatar` to `LayoutWidgets`
- `messages/en.json` / `messages/es.json` — i18n keys for widget

## Dependencies

No cross-plan blockers.
