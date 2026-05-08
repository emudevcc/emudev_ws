---
phase: 6
title: "Vercel + Cloudflare Infrastructure"
status: in-progress
priority: P1
effort: "3h"
dependencies: [5]
---

# Phase 6: Vercel + Cloudflare Infrastructure

## Overview

Configure Vercel git integration to auto-deploy `main` → production and all other branches → preview URLs. Set up Cloudflare as CDN + WAF for `emudev.cc` (production only). GitHub Actions handles post-deploy tasks on `main` only: Supabase migrations, Cloudflare cache purge, release tag.

## Branch Model

| Git Branch | Vercel Deploy Type | URL | Cloudflare |
|---|---|---|---|
| `main` | Production | `emudev.cc` | ☁️ Orange (WAF + CDN) |
| `development` | Preview (auto) | `emudev-ws-*.vercel.app` | None |
| `feature/**`, `hotfix/**` | Preview (auto) | `emudev-ws-*.vercel.app` | None |

**Why Vercel git integration instead of GitHub Actions deploys?**
Vercel's native integration is simpler, faster, and handles preview URLs automatically with no CLI tokens or `vercel deploy` commands in CI. GitHub Actions only runs post-deploy tasks that Vercel can't do (DB migrations, CF purge, git tagging).

## Architecture

```
Internet
  └── emudev.cc  ──→  Cloudflare (WAF + CDN + SSL) ──→  Vercel [Production]

push to main:
  1. Vercel git integration auto-builds + deploys to emudev.cc
  2. GitHub Actions post-deploy job runs:
     - supabase db push (migrations)
     - CF purge_everything
     - git tag prod-YYYYMMDD-HHMMSS

push to development/feature/*:
  - Vercel git integration auto-builds → preview URL (*.vercel.app)
  - No GitHub Actions triggered
```

## GitHub Actions — deploy.yml

Triggered only on push to `main`. Uses `production` GitHub Environment for secret scoping.

```yaml
on:
  push:
    branches: [main]

jobs:
  post-deploy:
    environment: production
    steps:
      - npm ci
      - supabase db push --db-url $SUPABASE_DB_URL
      - curl CF purge_everything
      - git tag prod-<timestamp>
```

**No Vercel CLI in GitHub Actions** — Vercel git integration handles builds and deploys.

## GitHub Secrets — Final Matrix

### Repo-level secrets

| Secret | Status |
|--------|--------|
| `CF_ZONE_ID` | ✅ Set |
| `CF_API_TOKEN` | ✅ Set |

### Production environment secrets

| Secret | Status |
|--------|--------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✅ Set |
| `NEXT_PUBLIC_SANITY_DATASET` | ✅ Set |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Set |
| `SUPABASE_DB_URL` | ✅ Set |
| `SUPABASE_PAT` | ✅ Set |
| `SANITY_REVALIDATE_SECRET` | ✅ Set |

> `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` are NOT needed — Vercel git integration handles deploys.
> `NEXT_PUBLIC_SITE_URL` is hardcoded in build env, not a secret.

## Related Code Files

**Updated:**
- `.github/workflows/deploy.yml` — post-deploy tasks only (migrations, CF purge, tag)
- `.github/workflows/ci.yml` — branch list: `[development, main, 'feature/**', 'hotfix/**']`
- `.github/workflows/hotfix.yml` — removed deploy job; backport targets `development`

**No application code changes needed.**

## Implementation Steps

### Already Done ✅
- `vercel.json` committed
- `deploy.yml` simplified to post-deploy tasks only
- `ci.yml` updated to correct branch list
- `hotfix.yml` simplified (deploy job removed, backport → `development`)
- GitHub Environment `production` created with all secrets set
- Repo-level CF secrets set

### Still Required

1. **Enable Vercel git integration** (Vercel dashboard → `emudev-ws` → Settings → Git):
   - Connect to GitHub repo `emudev-ws`
   - Production branch: `main`
   - Preview deployments: all other branches

2. **Add `emudev.cc` as production domain** (Vercel dashboard → `emudev-ws` → Settings → Domains):
   - Add `emudev.cc` → mark as Production domain
   - Vercel shows DNS instructions → use CNAME pointing to `cname.vercel-dns.com`

3. **Configure Cloudflare DNS** (CF dashboard → `emudev.cc` zone):

   | Type | Name | Target | Proxy |
   |------|------|--------|-------|
   | CNAME | `@` (root) | `cname.vercel-dns.com` | ☁️ Orange (proxied) |

   **Transfer `emudev.cc` to Cloudflare nameservers at registrar first** if not done.

4. **Configure Cloudflare cache rules** (`emudev.cc` only):

   **Rule 1 — Static assets:**
   ```
   URI path matches: /_next/static/.*
   → Edge TTL = 1 year, Cache everything
   ```

   **Rule 2 — ISR pages:**
   ```
   URI path NOT in [/api, /studio, /admin, /_next] AND method = GET
   → Edge TTL = 24h, Browser TTL = 1h, Cache everything
   ```

   **Rule 3 — API bypass:**
   ```
   URI path starts with /api → Bypass
   ```

   **Rule 4 — Studio bypass:**
   ```
   URI path starts with /studio OR /admin → Bypass
   ```

5. **WAF** — Free plan uses Cloudflare Managed Free Ruleset (already active). Custom WAF rules require Pro plan ($20/mo) — skip for personal portfolio. Managed ruleset already covers SQLi, XSS, and common attack patterns.

6. **Configure Cloudflare SSL/TLS**:
   - Mode: **Full (strict)**
   - Always Use HTTPS: on
   - HSTS (1 year): on — only after `emudev.cc` resolves correctly

7. **Trigger test deploys:**
   - Push to `main` → verify `https://emudev.cc` resolves with `cf-cache-status` header
   - Push to `development` → verify preview URL appears in Vercel dashboard
   - Verify CF cache purge returns `{"success":true}` in GitHub Actions logs

## Todo List

- [x] `vercel.json` committed
- [x] `deploy.yml` simplified (post-deploy tasks only)
- [x] `ci.yml` updated (branch list, SITE_URL)
- [x] `hotfix.yml` simplified (deploy job removed, backport → `development`)
- [x] GitHub Environment `production` created with all secrets
- [x] Repo-level CF secrets set (`CF_ZONE_ID`, `CF_API_TOKEN`) — updated to working token
- [x] Root + www CNAMEs → orange-cloud (proxied) via API
- [x] 4 cache rules deployed via API (static 1yr, API bypass, studio bypass, ISR 24h/1h)
- [x] WAF — Managed Free Ruleset already active; custom rules skipped (require Pro plan)
- [ ] Enable Vercel git integration for `emudev-ws` (production branch = `main`)
- [ ] Add `emudev.cc` as production domain in Vercel project
- [ ] Set SSL Full (strict) in CF dashboard (SSL/TLS → Overview)
- [ ] Set Always HTTPS + HSTS in CF dashboard (SSL/TLS → Edge Certificates)
- [ ] Test deploy on `main` → `emudev.cc` resolves + CF headers present
- [ ] Test deploy on `development` → preview URL in Vercel dashboard
- [ ] Validate CF cache purge returns `{"success":true}`

## Success Criteria

- [ ] `https://emudev.cc` → HTTP 200, built from `main`, `cf-cache-status` header present
- [ ] `development` push → preview URL visible in Vercel dashboard (no CI job required)
- [ ] CF cache purge returns `{"success":true}` after production deploy
- [ ] GitHub Actions `post-deploy` job succeeds on `main` push
- [ ] No mixed-content warnings on `emudev.cc`

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Orange cloud breaks Vercel domain verification | High | Verify with grey cloud first, then switch to orange |
| Supabase migration on main breaks production DB | High | Migrations must be idempotent; test on preview first |
| DNS propagation delay after NS change | Medium | Allow 24–48h; check with `dig +short NS emudev.cc` |
| CF cache serves stale ISR after prod deploy | Medium | `purge_everything` in post-deploy job |
| WAF false positives block legit traffic | Medium | Start in Challenge, monitor 48h before escalating to Block |

## Security Considerations

- Only production traffic goes through Cloudflare WAF — preview URLs bypass CF by design
- CF API token scoped to Cache Purge on `emudev.cc` zone only (minimal privilege)
- No Vercel tokens stored in GitHub — git integration uses OAuth, not CLI tokens
- Supabase migrations gated to `production` GitHub Environment (requires environment approval if configured)

## Next Steps

- Phase 7: Smoke tests validate `emudev.cc` and a preview URL
