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

Configure the single Vercel project (`emudev-ws`) to serve 3 stable environments using `vercel alias`, set up Cloudflare as CDN + WAF for production only, and configure DNS so each branch maps to its own subdomain. No new Vercel projects needed.

## Vercel Environment Model (Key Constraint)

Each Vercel project has exactly **2 deployment environment types**:
- **Production** — stable URL, custom domain, triggered by `vercel deploy --prod`
- **Preview** — unique URL per deployment (e.g. `emudev-ws-abc123.vercel.app`), no stable custom domain by default

To get 3 stable URLs from 1 project without creating multiple projects, we use `vercel alias` — it points a custom domain to any specific preview deployment URL. This alias is updated on every CI deploy.

## Branch → Environment → Domain Mapping

| Git Branch | GitHub Environment | Vercel Deploy Type | Domain | Cloudflare |
|---|---|---|---|---|
| `develop` | `development` | Preview + alias | `dev.emudev.cc` | Grey cloud ⬜ (DNS only) |
| `staging` | `staging` | Preview + alias | `qa.emudev.cc` | Grey cloud ⬜ (DNS only) |
| `main` | `production` | Production (`--prod`) | `emudev.cc` | Orange cloud ☁️ (WAF + CDN) |

**Why grey cloud for dev/staging?** Cloudflare proxy intercepts domain ownership verification. Dev/staging don't need WAF — Vercel's SSL handles HTTPS directly. Only production traffic deserves CDN + WAF overhead.

## Architecture

```
Internet
  ├── emudev.cc  ──→  Cloudflare (WAF + CDN + SSL) ──→  Vercel emudev-ws [Production deploy]
  ├── qa.emudev.cc ─→  Cloudflare (DNS only) ──────────→  Vercel emudev-ws [Preview alias, updated per push]
  └── dev.emudev.cc ─→  Cloudflare (DNS only) ──────────→  Vercel emudev-ws [Preview alias, updated per push]

GitHub Actions (develop) → vercel deploy --prebuilt → preview URL → vercel alias dev.emudev.cc
GitHub Actions (staging) → vercel deploy --prebuilt → preview URL → vercel alias qa.emudev.cc
GitHub Actions (main)    → vercel deploy --prebuilt --prod      → emudev.cc (production)
                         → CF purge_everything
```

## GitHub Secrets — Final Matrix

### Repo-level secrets

| Secret | Value | Status |
|--------|-------|--------|
| `VERCEL_ORG_ID` | Vercel team ID | ✅ Set |
| `VERCEL_TOKEN` | Vercel API token | ✅ Set |
| `VERCEL_PROJECT_ID` | `prj_Fef2SHgb8jU3lN5V71b59AhmSiIG` (`emudev-ws`) | ✅ Set |
| `CF_ZONE_ID` | Cloudflare Zone ID for `emudev.cc` | ✅ Set |
| `CF_API_TOKEN` | CF token with Cache Purge permission | ✅ Set |

### Per-environment secrets (same values across all 3 — one Supabase + one Sanity project)

| Secret | `development` | `staging` | `production` |
|--------|--------------|-----------|--------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✅ Set | ✅ Set | ✅ Set |
| `NEXT_PUBLIC_SANITY_DATASET` | ✅ Set | ✅ Set | ✅ Set |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set | ✅ Set | ✅ Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Set | ✅ Set | ✅ Set |
| `SUPABASE_DB_URL` | ✅ Set | ✅ Set | ✅ Set |
| `SUPABASE_PAT` | ✅ Set | ✅ Set | ✅ Set |
| `SANITY_REVALIDATE_SECRET` | ✅ Set | ✅ Set | ✅ Set |

> `NEXT_PUBLIC_SITE_URL` is NOT a secret — hardcoded per job in `deploy.yml`.
> `VERCEL_PROJECT_ID` is repo-level (single project shared across all environments).

## deploy.yml — What Changed

| Concern | Old | New |
|---------|-----|-----|
| dev/staging deploy | `vercel deploy --prod` | `vercel deploy` (preview) + `vercel alias` |
| CF purge | All 3 environments | Production only (grey-cloud envs don't go through CF) |
| Supabase migrations | All 3 environments | Staging + production only (dev shares same DB, reduce risk) |
| `VERCEL_PROJECT_ID` | Per-environment secret | Workflow-level env var (repo-level secret) |

## Related Code Files

**Updated:**
- `.github/workflows/deploy.yml` — revised deploy strategy (alias-based for dev/staging)

**No application code changes needed.**

## Implementation Steps

### Already Done ✅
- `vercel.json` committed
- GitHub Environments created (`development`, `staging`, `production`)
- All environment secrets set
- Repo-level secrets set (`VERCEL_ORG_ID`, `VERCEL_TOKEN`, `CF_ZONE_ID`, `CF_API_TOKEN`)
- `deploy.yml` updated with alias-based strategy

### Still Required

1. **Add repo-level `VERCEL_PROJECT_ID` secret** (currently only set per-environment):
   ```bash
   printf '%s' 'prj_Fef2SHgb8jU3lN5V71b59AhmSiIG' | gh secret set VERCEL_PROJECT_ID
   ```

2. **Add custom domains to Vercel project** (Settings → Domains in `emudev-ws`):
   - `emudev.cc` — mark as Production domain
   - `dev.emudev.cc` — add as custom domain (alias target)
   - `qa.emudev.cc` — add as custom domain (alias target)

3. **Configure Cloudflare DNS** (CF dashboard → DNS → `emudev.cc` zone):

   | Type | Name | Target | Proxy |
   |------|------|--------|-------|
   | CNAME | `@` (root) | `cname.vercel-dns.com` | ☁️ Orange (proxied) |
   | CNAME | `dev` | `cname.vercel-dns.com` | ⬜ Grey (DNS only) |
   | CNAME | `qa` | `cname.vercel-dns.com` | ⬜ Grey (DNS only) |

   **Domain nameservers:** Transfer `emudev.cc` to Cloudflare at registrar first if not done.

4. **Configure Cloudflare cache rules** (production only — `emudev.cc`):

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

5. **Configure Cloudflare WAF rules** (production only):

   **Rule 1 — Allow verified crawlers (priority 1):**
   ```
   cf.bot_management.verified_bot → Skip all remaining rules
   ```

   **Rule 2 — Rate limiting:**
   ```
   path in [/, /projects, /blog] → Challenge | 100 req / 10 min per IP
   ```

   **Rule 3 — Bot score challenge:**
   ```
   cf.bot_management.score lt 30 AND NOT verified_bot → Challenge
   ```

   **Rule 4 — Block SQLi:**
   ```
   cf.waf.score.sqli > 40 → Block
   ```

   Start Rules 2–4 in Challenge mode; escalate to Block after 48h.

6. **Configure Cloudflare SSL/TLS** (production only):
   - Mode: **Full (strict)**
   - Always Use HTTPS: on
   - HSTS (1 year, include subdomains): on — only after all 3 domains resolve

7. **Trigger test deploys:**
   - Push to `develop` → verify `https://dev.emudev.cc` resolves (Vercel SSL)
   - Push to `staging` → verify `https://qa.emudev.cc` resolves (Vercel SSL)
   - Push to `main` → verify `https://emudev.cc` resolves (Cloudflare SSL)

## Todo List

- [x] `vercel.json` committed
- [x] GitHub Environments created
- [x] All environment secrets set
- [x] Repo-level CF + Vercel secrets set
- [x] `deploy.yml` updated with alias-based strategy
- [ ] Add `VERCEL_PROJECT_ID` as repo-level secret (currently only per-environment)
- [ ] Add 3 custom domains to `emudev-ws` Vercel project (`emudev.cc`, `dev.emudev.cc`, `qa.emudev.cc`)
- [ ] Transfer `emudev.cc` to Cloudflare nameservers (if not already done)
- [ ] Add 3 CNAME records in Cloudflare (root=orange, dev=grey, qa=grey)
- [ ] Configure 4 Cloudflare cache rules
- [ ] Configure 4 WAF rules (Challenge mode first)
- [ ] Set SSL Full (strict) + Always HTTPS + HSTS
- [ ] Test deploy on `develop` → `dev.emudev.cc` resolves
- [ ] Test deploy on `staging` → `qa.emudev.cc` resolves
- [ ] Test deploy on `main` → `emudev.cc` resolves + CF headers present
- [ ] Validate CF cache purge returns `{"success":true}`

## Success Criteria

- [ ] `https://dev.emudev.cc` → HTTP 200, built from `develop`, Vercel SSL
- [ ] `https://qa.emudev.cc` → HTTP 200, built from `staging`, Vercel SSL
- [ ] `https://emudev.cc` → HTTP 200, built from `main`, `cf-cache-status` header present
- [ ] `vercel alias` step succeeds in CI without manual intervention
- [ ] CF cache purge returns `{"success":true}` after production deploy
- [ ] No mixed-content warnings on any subdomain

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `vercel alias` stale if deploy fails mid-run | Medium | Alias runs after deploy step; if deploy fails, alias is skipped → old alias stays |
| Orange cloud breaks Vercel domain verification | High | Use grey cloud for dev/qa; verify emudev.cc with grey cloud first, then switch to orange |
| Supabase migration on staging breaks shared DB | Medium | Migrations are idempotent; review each migration carefully before merging to staging |
| DNS propagation delay after NS change | Medium | Allow 24–48h; check with `dig +short NS emudev.cc` |
| CF cache serves stale ISR after prod deploy | Medium | `purge_everything` in prod job after each deploy |
| WAF false positives | Medium | Start in Challenge, monitor CF Firewall Events 48h before escalating to Block |

## Security Considerations

- Dev/staging skip Cloudflare WAF by design — they're not public-facing environments
- Only production traffic goes through WAF + CDN; reduces false positive risk on dev/staging
- CF API token scoped to Cache Purge on `emudev.cc` zone only — minimal privilege
- `VERCEL_TOKEN` rotated at Vercel dashboard → Profile → Tokens
- Supabase migrations run on staging (gating check) then production — never on raw develop push

## Next Steps

- Phase 7: Smoke tests validate all 3 environment URLs
