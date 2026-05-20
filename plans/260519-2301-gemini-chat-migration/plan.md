---
title: "Migrate AI Chat Widget to Gemini 2.5 Flash-Lite"
description: "Swap @anthropic-ai/sdk + claude-haiku-4-5 for @google/generative-ai + gemini-2.5-flash-lite in the /api/chat serverless route. Frontend and system prompt unchanged."
status: pending
priority: P2
branch: "development"
tags: ["chat", "ai", "gemini", "migration"]
blockedBy: []
blocks: []
created: "2026-05-20T05:02:44.065Z"
createdBy: "ck:plan"
source: skill
---

# Migrate AI Chat Widget to Gemini 2.5 Flash-Lite

## Overview

Replace the Anthropic SDK with Google's Generative AI SDK in the `/api/chat` serverless route. The swap is confined to one file (`app/api/chat/route.ts`) plus package deps and one env var rename. The frontend widget, system prompt builder, and all UX are unchanged.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Dependencies & Env](./phase-01-dependencies-env.md) | Pending |
| 2 | [API Route Migration](./phase-02-api-route-migration.md) | Pending |

## Files Modified

- `package.json` — remove `@anthropic-ai/sdk`, add `@google/generative-ai`
- `app/api/chat/route.ts` — full provider swap (Phase 2)
- `.env.local` — add `GEMINI_API_KEY` (developer action, not committed)
- Vercel dashboard — add `GEMINI_API_KEY`, remove `ANTHROPIC_API_KEY`
