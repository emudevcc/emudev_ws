---
title: "Contact Form Spam Protection — Honeypot + Rate Limit"
description: "Add honeypot field + timing check to the contact form (Phase 1, code) and a Cloudflare WAF rate-limit rule (Phase 2, dashboard). Zero new npm dependencies."
status: pending
priority: P2
branch: "development"
tags: []
blockedBy: []
blocks: []
created: "2026-05-17T04:48:43.919Z"
createdBy: "ck:plan"
source: skill
---

# Contact Form Spam Protection — Honeypot + Rate Limit

## Overview

Protect the contact form from spam bots with two complementary layers:

1. **Honeypot + timing** (Phase 1, code-only) — hidden trap field bots fill; client timestamp bots submit too fast; 5 000-char message cap. No new dependencies, works on all Vercel deployments.
2. **Cloudflare WAF rate limit** (Phase 2, dashboard) — 5 POST requests per 10 minutes per IP to `/api/contact`. CF is already proxying `emudev.cc`; this is a one-click dashboard rule.

**Before:** no bot protection on `/api/contact`
**After:** honeypot + timing + message-length guard in Next.js + CF edge rate limit

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Honeypot and API Hardening](./phase-01-honeypot-and-api-hardening.md) | Pending |
| 2 | [Cloudflare Rate Limiting](./phase-02-cloudflare-rate-limiting.md) | Pending |

## Dependencies

None — `ContactSection` and `/api/contact` are standalone; no open plans touch these files.
