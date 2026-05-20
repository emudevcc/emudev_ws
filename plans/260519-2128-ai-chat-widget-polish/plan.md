---
title: "AI Chat Widget Polish"
description: "3 UX polish items: chat icon animation, clickable URLs in responses, quick-reply chips when AI asks a closing question"
status: completed
priority: P2
branch: "development"
tags: ["chat", "ux", "polish"]
blockedBy: []
blocks: []
created: "2026-05-20T03:33:00.231Z"
createdBy: "ck:plan"
source: skill
---

# AI Chat Widget Polish

## Overview

Three targeted polish improvements to the AI chat widget — all confined to `components/ui/ai-chat-widget.tsx` plus i18n message files. No new dependencies required.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Icon Animation + Clickable URLs](./phase-01-icon-animation-clickable-urls.md) | Complete |
| 2 | [Quick-Reply Buttons](./phase-02-quick-reply-buttons.md) | Complete |

## Files Modified

- `components/ui/ai-chat-widget.tsx` — all visual changes
- `messages/en.json` — `chat.quickReplies` array (Phase 2)
- `messages/es.json` — `chat.quickReplies` array (Phase 2)

## Dependencies

None — standalone polish on top of the completed chat enhancement plan.
