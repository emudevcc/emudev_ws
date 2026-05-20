---
title: "Chat Voice and Chip UX"
description: "Male TTS voices (EN/ES), STT continuous-mode fix for flicker bug, expanded quick-reply chips after every assistant message"
status: completed
priority: P2
branch: "development"
tags: ["chat", "voice", "ux", "bugfix"]
blockedBy: []
blocks: []
created: "2026-05-20T03:59:18.640Z"
createdBy: "ck:plan"
source: skill
---

# Chat Voice and Chip UX

## Overview

Three improvements to the AI chat widget:
1. **Male TTS voices** — swap `PREFERRED_VOICES` to male names for EN and ES
2. **STT flicker fix** — `continuous: false` causes recognition to auto-end on silence, producing the "Listening" flicker; fix by setting `continuous: true` and updating `onerror` to ignore `no-speech` events
3. **Expanded chips** — show quick-reply chips after EVERY assistant message (not just `?`-ending), with a second chip set for follow-up prompts

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Voice Fixes](./phase-01-voice-fixes.md) | Completed |
| 2 | [Expanded Chip UX](./phase-02-expanded-chip-ux.md) | Completed |

## Files Modified

- `hooks/use-speech-synthesis.ts` — PREFERRED_VOICES update (Phase 1)
- `hooks/use-speech-recognition.ts` — continuous mode + onerror fix (Phase 1)
- `components/ui/ai-chat-widget.tsx` — chip display logic (Phase 2)
- `messages/en.json` — chat.followUps array (Phase 2)
- `messages/es.json` — chat.followUps array (Phase 2)

## Completion Notes

- Completed voice preference update for EN/ES male voice candidates.
- Completed speech recognition continuous mode and non-fatal `no-speech` handling.
- Completed follow-up chip set and always-on assistant-message chip logic.
- Verified with typecheck and lint.
