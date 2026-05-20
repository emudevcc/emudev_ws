---
phase: 1
title: "Dependencies & Env"
status: pending
priority: P1
effort: "10 min"
dependencies: []
---

# Phase 1: Dependencies & Env

## Overview

Remove `@anthropic-ai/sdk` from `package.json` and install `@google/generative-ai`. Add `GEMINI_API_KEY` to local env and Vercel dashboard.

## Requirements

- Functional:
  - `@google/generative-ai` available at import time in the API route
  - `GEMINI_API_KEY` env var present in local dev and Vercel production
- Non-functional:
  - `@anthropic-ai/sdk` fully removed (no dead dep)
  - No other files affected

## Related Code Files

- Modify: `package.json`
- No-commit: `.env.local` (gitignored)
- External: Vercel dashboard env vars

## Implementation Steps

### 1. Install Gemini SDK + remove Anthropic SDK

```bash
npm install @google/generative-ai
npm uninstall @anthropic-ai/sdk
```

Verify in `package.json`:
- `dependencies` contains `"@google/generative-ai": "^x.x.x"`
- `@anthropic-ai/sdk` is gone

### 2. Add env var locally

In `.env.local` (never commit):
```
GEMINI_API_KEY=your_google_ai_studio_key_here
```

Get key from: https://aistudio.google.com/apikey

### 3. Update Vercel env vars

In Vercel dashboard → Project → Settings → Environment Variables:
- **Add** `GEMINI_API_KEY` (Production + Preview + Development)
- **Remove** `ANTHROPIC_API_KEY` (after Phase 2 is deployed and verified)

> Note: Remove `ANTHROPIC_API_KEY` last — after Phase 2 is live and verified in prod.

## Success Criteria

- [ ] `npm install` succeeds with `@google/generative-ai` in `node_modules`
- [ ] `@anthropic-ai/sdk` absent from `package.json`
- [ ] `GEMINI_API_KEY` set in `.env.local`
- [ ] `npm run typecheck` still passes

## Risk Assessment

- **API key provisioning**: Google AI Studio key is free-tier by default — check rate limits (60 req/min free, 1000 req/day). For production load, upgrade to pay-as-you-go.
- **Gemini 2.5 Flash-Lite model ID**: Verify exact model string at implementation time — use Google AI Studio model list or `@google/generative-ai` SDK docs. Likely `gemini-2.5-flash-lite` or `gemini-2.5-flash-lite-preview`.
