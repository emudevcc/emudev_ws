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

Provision 3 Vercel projects (dev/staging/prod), configure Cloudflare as CDN + WAF in front of all three, set up DNS (root domain + `dev.` + `qa.` subdomains), define cache rules for Next.js ISR pages, and configure WAF rules for portfolio security. This phase is mostly configuration — no application code changes.

## Branch → Environment → Domain Mapping

| Git Branch | GitHub Environment | Vercel Project | Domain |
|---|---|---|---|
| `develop` | `development` | `portfolio-dev` | `dev.emudev.cc` |
| `staging` | `staging` | `portfolio-staging` | `qa.emudev.cc` |
| `main` | `production` | `portfolio-prod` | `emudev.cc` |

## Key Insights

- **Orange cloud = manual deploy required:** Cloudflare proxy intercepts Vercel's deploy webhook. All deploys MUST go through GitHub Actions `vercel deploy --prebuilt` (Phase 5). Never use Vercel's "Connect Git" auto-deploy when Cloudflare is in proxy mode.
- **3 Vercel projects, 1 repo:** Each project tracks a different branch (`develop`, `staging`, `main`). Disable Vercel auto-deploy on all 3 — GitHub Actions drives deploys.
- **VERCEL_PROJECT_ID is per-environment:** The `VERCEL_PROJECT_ID` secret must be set separately in each GitHub Environment (`development`, `staging`, `production`) with that environment's Vercel project ID.
- **NEXT_PUBLIC_SITE_URL is hardcoded in the workflow:** The deploy.yml hardcodes the URL per job (`https://dev.emudev.cc`, `https://qa.emudev.cc`, `https://emudev.cc`) — do NOT configure this as a per-environment secret.
- **CF cache vs. ISR:** Cloudflare full-page cache can stale Next.js ISR responses. Dev purges by prefix (`dev.emudev.cc`); staging/prod purge by prefix too. Use `purge_everything: true` only as a fallback.
- **SSL:** Cloudflare issues free SSL for proxied (orange-cloud) domains — no cert management needed.
- **WAF rules:** Start in "Challenge" mode (CAPTCHA), not "Block". Escalate after 48h validation.

## Requirements

**Functional:**
- 3 Vercel projects created, auto-deploy disabled
- `vercel.json` in repo root (already committed)
- Cloudflare nameservers managing `emudev.cc`
- DNS: `emudev.cc` → prod Vercel, `dev.emudev.cc` → dev Vercel, `qa.emudev.cc` → staging Vercel (all orange-cloud)
- Cache rules: bypass `/api/*`, `/studio/*`, `/admin/*`; cache static assets 1 year; cache ISR pages 24h edge
- WAF rules: rate limiting, bot score challenge, SQL injection block
- Cloudflare cache purge fires after every deploy (all 3 environments)

**Non-functional:**
- All 3 subdomains resolve with valid SSL
- CF cache purge API call returns `{"success":true}`

## Architecture

```
Internet
  └── Cloudflare (CDN + WAF + DNS) — emudev.cc zone
       ├── emudev.cc          → Vercel portfolio-prod  (proxied ☁️)
       ├── qa.emudev.cc       → Vercel portfolio-staging (proxied ☁️)
       └── dev.emudev.cc      → Vercel portfolio-dev  (proxied ☁️)
              └── Vercel Edge Network
                   └── Next.js App (SSG/ISR pages)

GitHub Actions → vercel deploy --prebuilt → Vercel project
              → CF prefix purge → Cloudflare zone (emudev.cc)
```

## GitHub Environments — Secrets Matrix

Each GitHub Environment needs these secrets configured. Repo-level secrets are shared across all environments.

### Repo-level secrets (Settings → Secrets → Actions)

| Secret | Value |
|--------|-------|
| `VERCEL_ORG_ID` | Your Vercel org/team ID |
| `VERCEL_TOKEN` | Vercel API token (all environments share one) |
| `CF_ZONE_ID` | Cloudflare Zone ID for `emudev.cc` |
| `CF_API_TOKEN` | CF token with Cache Purge permission on `emudev.cc` zone |

### `development` environment secrets (develop → dev.emudev.cc)

| Secret | Value |
|--------|-------|
| `VERCEL_PROJECT_ID` | Vercel project ID for `portfolio-dev` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Dev Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dev Supabase anon key |
| `SUPABASE_DB_URL` | Dev Supabase postgres connection string |
| `SUPABASE_PAT` | Supabase personal access token |
| `SANITY_REVALIDATE_SECRET` | Random string for Sanity webhook |

### `staging` environment secrets (staging → qa.emudev.cc)

| Secret | Value |
|--------|-------|
| `VERCEL_PROJECT_ID` | Vercel project ID for `portfolio-staging` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Staging Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Staging Supabase anon key |
| `SUPABASE_DB_URL` | Staging Supabase postgres connection string |
| `SUPABASE_PAT` | Supabase personal access token |
| `SANITY_REVALIDATE_SECRET` | Same or distinct from dev |

### `production` environment secrets (main → emudev.cc)

| Secret | Value |
|--------|-------|
| `VERCEL_PROJECT_ID` | Vercel project ID for `portfolio-prod` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Prod Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Prod Supabase anon key |
| `SUPABASE_DB_URL` | Prod Supabase postgres connection string |
| `SUPABASE_PAT` | Supabase personal access token |
| `SANITY_REVALIDATE_SECRET` | Prod-specific secret |

> **Note:** `NEXT_PUBLIC_SITE_URL` is NOT a GitHub Environment secret — it's hardcoded per job in `deploy.yml`.

## Related Code Files

**Already committed:**
- `vercel.json` — build config (prevents dashboard drift)
- `.github/workflows/deploy.yml` — 3-environment deploy pipeline with CF purge on all jobs

**No application code changes needed.** All remaining work is external configuration.

## Implementation Steps

1. **Create 3 Vercel projects** — via Vercel dashboard:
   - Framework Preset: Next.js | Root Directory: `.`
   - Git Integration: Connect repo → set correct branch → **DISABLE auto-deploy**
   - Copy each **Project ID** → store in the corresponding GitHub Environment secret `VERCEL_PROJECT_ID`

   | Project Name | Branch | Domain to add |
   |---|---|---|
   | `portfolio-dev` | `develop` | `dev.emudev.cc` |
   | `portfolio-staging` | `staging` | `qa.emudev.cc` |
   | `portfolio-prod` | `main` | `emudev.cc` |

2. **Configure GitHub Environments** (Settings → Environments):
   - `development`: add secrets per matrix above; no protection rules needed
   - `staging`: add secrets per matrix above; add reviewer approval gate
   - `production`: add secrets per matrix above; add reviewer approval gate

3. **Configure Cloudflare DNS** (CF dashboard → DNS):
   - Transfer domain nameservers to Cloudflare (registrar → update NS records)
   - After Vercel projects are deployed once, add:

   | Type | Name | Target | Proxy |
   |------|------|--------|-------|
   | CNAME | `@` (root) | `cname.vercel-dns.com` | ☁️ Proxied |
   | CNAME | `dev` | `cname.vercel-dns.com` | ☁️ Proxied |
   | CNAME | `qa` | `cname.vercel-dns.com` | ☁️ Proxied |

   All 3 point to `cname.vercel-dns.com`. Vercel routes by custom domain configured per project.

4. **Add custom domains in Vercel** (each project → Settings → Domains):
   - `portfolio-prod`: add `emudev.cc`
   - `portfolio-staging`: add `qa.emudev.cc`
   - `portfolio-dev`: add `dev.emudev.cc`

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

   **Rule 1 — Allow verified crawlers (highest priority):**
   ```
   Expression: cf.bot_management.verified_bot
   Action: Skip all remaining rules
   Priority: 1
   ```

   **Rule 2 — Rate limiting:**
   ```
   Expression: (http.request.uri.path eq "/" or contains "/projects" or contains "/blog")
   Action: Challenge (CAPTCHA) | Rate: 100 req / 10 min per IP
   ```

   **Rule 3 — Bot score challenge:**
   ```
   Expression: cf.bot_management.score lt 30 and not cf.bot_management.verified_bot
   Action: Challenge
   ```

   **Rule 4 — Block SQL injection (OWASP):**
   ```
   Expression: cf.waf.score.sqli > 40
   Action: Block
   ```

   Start Rules 2–4 in **Challenge** mode; escalate to **Block** after 48h validation.

7. **Configure Cloudflare SSL/TLS** (CF dashboard → SSL/TLS):
   - Mode: **Full (strict)**
   - Enable **Always Use HTTPS**
   - Enable **HSTS** (1 year, include subdomains) — only after all 3 subdomains resolve

8. **Retrieve CF Zone ID + create API token** for GitHub repo-level secrets:
   - Zone ID: CF dashboard → Overview → right sidebar
   - API Token: CF dashboard → Profile → API Tokens → Create:
     - Permissions: "Zone" → "Cache Purge" → Edit
     - Zone resources: `emudev.cc` only

9. **Test CF cache purge** (validate before CI uses it):
   ```bash
   curl -sf -X POST \
     "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"prefixes":["dev.emudev.cc"]}'
   # Expected: {"success":true,...}
   ```

10. **Disable Vercel auto-deploy** on all 3 projects:
    - Vercel dashboard → each project → Settings → Git → Production Branch → "Don't deploy automatically"

## Todo List

- [ ] Create 3 Vercel projects (`portfolio-dev`, `portfolio-staging`, `portfolio-prod`)
- [ ] Disable auto-deploy on all 3 Vercel projects
- [ ] Add custom domains in each Vercel project (`dev.emudev.cc`, `qa.emudev.cc`, `emudev.cc`)
- [ ] Configure `development` GitHub Environment: add secrets, no approval gate
- [ ] Configure `staging` GitHub Environment: add secrets + approval gate
- [ ] Configure `production` GitHub Environment: add secrets + approval gate
- [ ] Transfer domain to Cloudflare nameservers (registrar NS update)
- [ ] Add 3 CNAME DNS records in Cloudflare — all orange-cloud
- [ ] Verify Vercel domain ownership via Cloudflare DNS
- [ ] Configure 4 Cloudflare cache rules (static assets, ISR pages, API bypass, studio bypass)
- [ ] Configure 4 WAF rules (verified bots allow, rate limit, bot challenge, SQLi block)
- [ ] Set SSL mode to Full (strict) + Always Use HTTPS + HSTS
- [ ] Create CF API token with Cache Purge permission scoped to `emudev.cc` zone
- [ ] Add `CF_ZONE_ID` + `CF_API_TOKEN` as repo-level GitHub Actions secrets
- [ ] Test `purge_everything` API call returns `{"success":true}`
- [ ] Trigger a test deploy on `develop` — verify `https://dev.emudev.cc` resolves
- [ ] Trigger a test deploy on `staging` — verify `https://qa.emudev.cc` resolves
- [ ] Verify `https://emudev.cc` resolves with valid SSL

## Success Criteria

- [ ] `https://dev.emudev.cc` → HTTP 200, valid SSL, built from `develop` branch
- [ ] `https://qa.emudev.cc` → HTTP 200, valid SSL, built from `staging` branch
- [ ] `https://emudev.cc` → HTTP 200, valid SSL, built from `main` branch
- [ ] CF cache purge API call returns `{"success":true}` for each prefix
- [ ] `/api/health` (or any API route) returns 200 with no CF cache hit (bypass rule working)
- [ ] Lighthouse: no mixed-content warnings on any subdomain
- [ ] WAF challenge triggers on curl with bot-like user agent (visible in CF Firewall Events)

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Orange cloud breaks Vercel webhook | High | Auto-deploy disabled; GitHub Actions only |
| DNS propagation delay after NS change | Medium | Allow 24–48h; check with `dig +short NS emudev.cc` |
| CF cache serves stale ISR after deploy | Medium | Prefix purge in all 3 deploy jobs; `Cache-Control: no-store` on API routes |
| WAF false positives (blocks real users) | Medium | Start in Challenge; monitor CF Firewall Events 48h before escalating to Block |
| Wrong `VERCEL_PROJECT_ID` per environment | High | Double-check each GitHub Environment has the correct project's ID |
| Vercel domain verification fails | Low | Ensure DNS fully propagated before adding domain in Vercel |

## Security Considerations

- CF API token scoped to single zone + Cache Purge only — minimal privilege
- `VERCEL_TOKEN` is repo-level (not per-environment) — rotate if compromised
- SSL Full (strict) mode prevents MITM between CF and Vercel edge
- HSTS enforced → no HTTP fallback after first visit
- `/studio` route bypassed from cache AND blocked in `robots.txt`
- WAF rules applied to all 3 environments

## Next Steps

- Phase 7: Smoke tests validate all 3 environment URLs (`dev.emudev.cc`, `qa.emudev.cc`, `emudev.cc`)
