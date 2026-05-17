---
phase: 2
title: "Cloudflare Rate Limiting"
status: pending
priority: P2
effort: "20m"
dependencies: [1]
---

# Phase 2: Cloudflare Rate Limiting

## Overview

Configure a Cloudflare WAF rate-limit rule on `POST /api/contact` — blocks IPs that hit the endpoint more than 5 times per 10 minutes. No code changes, no new dependencies. CF is already the DNS/proxy layer for `emudev.cc`.

## Requirements

- Functional:
  - Rate limit: 5 requests per 10 minutes per IP on `POST /api/contact`
  - Action: block (returns CF 429) for the remainder of the 10-minute window
  - All other routes unaffected
- Non-functional:
  - Configured via CF dashboard (or CF API) — no changes to Next.js code
  - Free plan supported (CF rate limiting is available on all plans)

## Architecture

```
Client → Cloudflare Edge → Vercel (Next.js)
              │
              └─ Rate Limit Rule
                   Match: http.request.method == "POST"
                          AND http.request.uri.path == "/api/contact"
                   Rate:  5 requests / 10 minutes
                   Action: Block
                   Counter: by IP
```

CF intercepts at the edge before the request reaches Vercel, so there's zero compute cost for blocked requests.

## Related Code Files

- No code changes — CF dashboard configuration only

## Implementation Steps

### 1. Open Cloudflare Dashboard

1. Go to `dash.cloudflare.com` → select `emudev.cc`
2. Navigate: **Security → WAF → Rate limiting rules**
3. Click **Create rule**

### 2. Configure the Rule

| Field | Value |
|---|---|
| Rule name | `Contact form rate limit` |
| Expression | `(http.request.method eq "POST" and http.request.uri.path eq "/api/contact")` |
| Requests | `5` |
| Period | `10 minutes` |
| Counter dimension | `IP` |
| Action | `Block` |
| Response code | `429` |

Click **Deploy**.

### 3. Verify

Test by sending 6 rapid POST requests to `https://emudev.cc/api/contact` — the 6th should return 429 immediately (CF block page or JSON 429, before reaching Next.js).

### 4. Optional — Secrets-based CF API config

If you prefer infra-as-code, the same rule can be created via the CF API using `secrets.CF_API_TOKEN` and `secrets.CF_ZONE_ID` already present in the GitHub Actions secrets:

```bash
curl -X POST \
  "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/rulesets/phases/http_ratelimit/entrypoint/rules" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Contact form rate limit",
    "expression": "(http.request.method eq \"POST\" and http.request.uri.path eq \"/api/contact\")",
    "action": "block",
    "ratelimit": {
      "characteristics": ["ip.src"],
      "period": 600,
      "requests_per_period": 5,
      "mitigation_timeout": 600
    }
  }'
```

## Success Criteria

- [ ] Rule appears as active in CF dashboard → Security → WAF → Rate limiting rules
- [ ] 6th POST within 10 minutes from same IP returns 429
- [ ] Normal single submission still returns 200 from `/api/contact`
- [ ] Other routes (GET `/en`, POST `/api/github/contributions`) unaffected

## Risk Assessment

- **Very low** — CF edge rule, no code deployed
- 5 req / 10 min is generous for legitimate use (a person won't submit the form 5 times in 10 minutes)
- CF free plan includes rate limiting; no billing impact expected
