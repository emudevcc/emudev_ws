---
phase: 6
title: "Vercel + Cloudflare Infrastructure"
status: pending
priority: P1
effort: "3h"
dependencies: [5]
---

# Phase 6: Vercel + Cloudflare Infrastructure

## Overview

Provision the 3 Vercel projects (dev/staging/prod), configure Cloudflare as CDN + WAF in front of all three, set up DNS (root domain + `dev.` + `qa.` subdomains), define cache rules for Next.js ISR pages, and configure WAF rules for portfolio security. This phase is mostly configuration — no application code changes.

## Key Insights

- **Orange cloud = manual deploy required:** Cloudflare proxy intercepts Vercel's deploy webhook. All deploys MUST go through GitHub Actions `vercel deploy --prebuilt` (Phase 5). Never use Vercel's "Connect Git" auto-deploy when Cloudflare is in proxy mode.
- **3 Vercel projects, 1 repo:** Create 3 separate Vercel projects, each tracking a different branch (`develop`, `staging`, `main`). Disable Vercel's auto-deploy on all 3 — GitHub Actions drives deploys.
- **CF cache vs. ISR:** Cloudflare full-page cache can stale Next.js ISR responses. Use `purge_everything: true` post-deploy (simpler than selective purge). Add cache rules that bypass `/api/*` and `/studio/*`.
- **SSL:** Cloudflare issues free SSL for proxied (orange-cloud) domains — no cert management needed.
- **WAF rules:** Start in "Challenge" mode (CAPTCHA), not "Block". Escalate after validating no false positives.
- **Vercel `vercel.json`:** Define build command and output directory for CLI-driven builds to avoid Vercel dashboard config drift.

## Requirements

**Functional:**
- 3 Vercel projects created with CLI/dashboard, auto-deploy disabled
- `vercel.json` in repo root defining build settings
- Cloudflare nameservers managing the domain
- DNS: root → prod Vercel, `dev.` → dev Vercel, `qa.` → staging Vercel (all orange-cloud)
- Cache rules: bypass `/api/*`, `/studio/*`, `/admin/*`; cache static assets 1 year; cache ISR pages 24h edge
- WAF rules: rate limiting, bot score challenge, SQL injection block

**Non-functional:**
- All 3 subdomains resolve with valid SSL (Cloudflare universal cert)
- CF cache purge API call returns 200

## Architecture

```
Internet
  └── Cloudflare (CDN + WAF + DNS)
       ├── example.com         → Vercel prod project (proxied ☁️)
       ├── qa.example.com      → Vercel staging project (proxied ☁️)
       └── dev.example.com     → Vercel dev project (proxied ☁️)
              └── Vercel Edge Network
                   └── Next.js App (SSG/ISR pages)

GitHub Actions → vercel deploy --prebuilt → Vercel project
              → CF cache purge → Cloudflare zone
```

**Vercel project mapping:**

| Project Name | Branch | Environment | Domain |
|---|---|---|---|
| `portfolio-dev` | `develop` | development | `dev.example.com` |
| `portfolio-staging` | `staging` | staging | `qa.example.com` |
| `portfolio-prod` | `main` | production | `example.com` |

## Related Code Files

**Create:**
- `vercel.json` — build config (prevents dashboard drift)

**No application code changes.** All work is external configuration.

## Implementation Steps

1. **Create 3 Vercel projects** — via Vercel dashboard or CLI:
   ```bash
   # Install Vercel CLI globally
   npm install -g vercel

   # Link/create project for each env (run in project dir)
   vercel link   # creates .vercel/project.json locally
   ```
   In Vercel dashboard for each project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `.`
   - **Git Integration:** Connect repo → set correct branch → **DISABLE auto-deploy**
   - Copy **Project ID** → store in GitHub environment secret `VERCEL_PROJECT_ID`

2. **Add `vercel.json`** to repo root:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm ci",
     "framework": "nextjs"
   }
   ```
   This ensures `vercel build --token` in GitHub Actions uses consistent settings.

3. **Configure Cloudflare DNS** (Cloudflare dashboard → DNS):
   - Transfer domain nameservers to Cloudflare (registrar → update NS records)
   - Add DNS records after Vercel projects are deployed once:

   | Type | Name | Target | Proxy |
   |------|------|--------|-------|
   | CNAME | `@` (root) | `cname.vercel-dns.com` | ☁️ Proxied |
   | CNAME | `dev` | `cname.vercel-dns.com` | ☁️ Proxied |
   | CNAME | `qa` | `cname.vercel-dns.com` | ☁️ Proxied |

   Note: All 3 point to `cname.vercel-dns.com`. Vercel routes by custom domain configured per project.

4. **Add custom domains in Vercel** (each project → Settings → Domains):
   - `portfolio-prod`: add `example.com`
   - `portfolio-staging`: add `qa.example.com`
   - `portfolio-dev`: add `dev.example.com`
   - Vercel will verify domain via Cloudflare DNS automatically

5. **Configure Cloudflare cache rules** (CF dashboard → Caching → Cache Rules):

   **Rule 1 — Static assets (1 year):**
   ```
   If: URI path matches regex: /_next/static/.*
   Then: Edge TTL = 1 year, Browser TTL = 1 year, Cache status = Cache everything
   ```

   **Rule 2 — ISR pages (24h edge, purge on deploy):**
   ```
   If: URI path does not contain [/api, /studio, /admin, /_next]
       AND request method = GET
   Then: Edge TTL = 24 hours, Browser TTL = 1 hour, Cache status = Cache everything
   ```

   **Rule 3 — API routes (bypass):**
   ```
   If: URI path starts with /api
   Then: Cache status = Bypass
   ```

   **Rule 4 — Studio + admin (bypass):**
   ```
   If: URI path starts with /studio OR starts with /admin
   Then: Cache status = Bypass
   ```

6. **Configure WAF rules** (CF dashboard → Security → WAF → Custom Rules):

   **Rule 1 — Rate limiting:**
   ```
   Name: Rate limit portfolio
   Expression: (http.request.uri.path eq "/" or contains "/projects" or contains "/blog")
   Action: Challenge (CAPTCHA)
   Rate: 100 req / 10 min per IP
   ```

   **Rule 2 — Bot score challenge:**
   ```
   Name: Challenge low-score bots
   Expression: cf.bot_management.score lt 30 and not cf.bot_management.verified_bot
   Action: Challenge
   ```

   **Rule 3 — Block SQL injection (OWASP):**
   ```
   Name: Block SQLi
   Expression: cf.waf.score.sqli > 40
   Action: Block
   ```

   **Rule 4 — Allow verified crawlers:**
   ```
   Name: Allow search engines
   Expression: cf.bot_management.verified_bot
   Action: Skip all remaining rules
   Priority: 1 (highest)
   ```

   Start all rules in **Challenge** mode; escalate to **Block** after 48h of validation.

7. **Configure Cloudflare SSL/TLS** (CF dashboard → SSL/TLS):
   - Mode: **Full (strict)** — encrypts CF ↔ Vercel (Vercel has valid cert)
   - Enable **Always Use HTTPS**
   - Enable **HSTS** (1 year, include subdomains) — only after confirming all 3 subdomains work

8. **Retrieve Zone ID and API token** for GitHub secrets:
   - Zone ID: CF dashboard → Overview → right sidebar → Zone ID
   - API Token: CF dashboard → Profile → API Tokens → Create token:
     - Template: "Edit zone DNS" + add "Cache Purge" permission
     - Zone resources: your domain only

9. **Test CF cache purge** (validate before CI uses it):
   ```bash
   CF_API_TOKEN=xxx
   CF_ZONE_ID=yyy
   curl -sf -X POST \
     "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"purge_everything":true}'
   # Expected: {"success":true,"errors":[],"messages":[],"result":{"id":"..."}}
   ```

10. **Disable Vercel auto-deploy** on all 3 projects (critical):
    - Vercel dashboard → each project → Settings → Git → Production Branch → set "Don't deploy automatically"
    - This prevents Vercel from deploying on push (GitHub Actions handles it)

## Todo List

- [ ] Create 3 Vercel projects in dashboard (portfolio-dev, portfolio-staging, portfolio-prod)
- [ ] Disable auto-deploy on all 3 Vercel projects
- [ ] Add `vercel.json` to repo root with build config
- [ ] Transfer domain to Cloudflare nameservers (registrar change)
- [ ] Add 3 CNAME DNS records in Cloudflare (root, dev., qa.) — all orange-cloud
- [ ] Add custom domains in each Vercel project (verify via Cloudflare)
- [ ] Configure 4 Cloudflare cache rules (static assets, ISR pages, API bypass, studio bypass)
- [ ] Configure 4 WAF rules (rate limit, bot challenge, SQLi block, verified bots allow)
- [ ] Set SSL mode to Full (strict) + Always Use HTTPS
- [ ] Retrieve CF Zone ID + create API token with Cache Purge permission
- [ ] Store Zone ID + API token in GitHub repo-level secrets
- [ ] Test `purge_everything` API call returns `{"success":true}`
- [ ] Verify all 3 subdomains resolve with valid SSL in browser

## Success Criteria

- [ ] `https://dev.example.com` → returns HTTP 200, valid SSL
- [ ] `https://qa.example.com` → returns HTTP 200, valid SSL
- [ ] `https://example.com` → returns HTTP 200, valid SSL
- [ ] CF cache purge API call returns `{"success":true}`
- [ ] `/api/health` returns 200 (cache bypass rule working — no stale response)
- [ ] Lighthouse: no mixed-content warnings
- [ ] WAF challenge triggers on curl with bot-like user agent (validate in CF Firewall Events)

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Orange cloud breaks Vercel webhook | High | Auto-deploy disabled; GitHub Actions only |
| DNS propagation delay (NS change) | Medium | Allow 24-48h; test with `dig +short NS example.com` |
| CF cache serves stale ISR after deploy | Medium | `purge_everything` in deploy job; `Cache-Control: no-store` on API routes |
| WAF false positives (blocks legitimate users) | Medium | Start in Challenge mode; monitor CF Firewall Events for 48h before escalating |
| Vercel custom domain verification fails | Low | Ensure DNS is fully propagated before adding domain in Vercel |

## Security Considerations

- CF API token scoped to single zone + Cache Purge only — minimal privilege
- SSL Full (strict) mode prevents MITM between CF and Vercel edge
- HSTS enforced → no HTTP fallback after first visit
- `/studio` route bypassed from cache AND blocked in `robots.txt` (Phase 4)
- WAF rules applied to all 3 environments (including dev — bots don't care about environment)

## Next Steps

- Phase 7: Smoke tests validate all 3 environment URLs
