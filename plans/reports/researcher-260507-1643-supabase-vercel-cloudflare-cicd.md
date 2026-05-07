# Supabase + Vercel + Cloudflare + GitHub Actions CI/CD Research Report
**Date:** 2026-05-07 | **Model:** claude-haiku-4.5 | **Sources:** Official docs (Feb 2025 cutoff) + production patterns

---

## Executive Summary

3-environment architecture (dev/staging/prod) is **production-ready** when configured correctly. Key risks:
- **Secrets sprawl:** Repo + environment + runtime scoping gets complex; mitigation = clear matrix
- **Vercel+Cloudflare combo:** Orange cloud DNS can break Vercel's auto-deployment detection; requires manual GitHub Actions deploy
- **RLS policy drift:** Schema migrations must sync across 3 isolated Supabase projects; no built-in sync
- **Cache invalidation:** Cloudflare+ISR conflict (ISR assumes origin caching); requires explicit purge hooks

**Recommendation:** Implement GitHub Actions as orchestrator; avoid Vercel auto-deploy; use environment-level secrets for isolation.

---

## 1. SUPABASE MULTI-PROJECT STRATEGY

### Schema Migrations Across 3 Projects

**Best Practice: CLI-driven migrations**
- Use `supabase/cli` v1.168.5+ (stable as of Feb 2025)
- Each environment has own Supabase project (`dev`, `staging`, `prod`)
- Migrations stored in `supabase/migrations/` + versioned in git

**CI/CD Flow:**
```bash
# Local: Create migration
supabase migration new add_portfolio_table

# Commit + push to feature branch
git add supabase/migrations/
git commit -m "feat: add portfolio table"

# GitHub Actions: Apply to dev
supabase db push --db-url $SUPABASE_DEV_DB_URL

# On merge to staging: Apply to staging
supabase db push --db-url $SUPABASE_STAGING_DB_URL

# On merge to main: Apply to prod with manual approval
supabase db push --db-url $SUPABASE_PROD_DB_URL
```

**Critical:** Each project has its own `SUPABASE_DB_URL` (Postgres connection string). Store in GitHub environment secrets.

**Gotcha:** `supabase db push` requires service_role key, not anon key. Use `SUPABASE_SERVICE_ROLE_KEY` in GitHub Actions.

**Schema Validation:**
- Always run `supabase db pull` before push to detect drift
- Version-lock in `deno.json` or `package.json`: `supabase@1.168.5`
- Consider `supabase db reset` for dev-only resets (loses data)

---

### Row Level Security (RLS) Patterns

**Portfolio Site Public Read / Admin Write:**

```sql
-- Table: portfolio_projects
CREATE TABLE portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT no_null_created_by CHECK (created_by IS NOT NULL)
);

-- RLS: Public can read published projects
CREATE POLICY "Public read published" ON portfolio_projects
  FOR SELECT
  USING (published = true);

-- RLS: Admin (authenticated + verified email) can do CRUD
CREATE POLICY "Admin full access" ON portfolio_projects
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email = 'admin@example.com'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email = 'admin@example.com'
    )
  );

-- RLS: Disable default public access
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
```

**Auth Setup for Admin Dashboard:**
- Use **Magic Link** (OTP) for single-user admin: `supabase.auth.signInWithOtp()`
  - Lower friction than OAuth for 1 user
  - Works offline-first in mobile
- Alternative: **OAuth + GitHub** for easier future multi-user expansion
  - Configure in Supabase UI: Settings → Auth → GitHub Provider
  - Store OAuth provider in auth.users.user_metadata

**Gotcha:** RLS is **allow-by-default** if no policies exist. Always enable RLS + write explicit policies.

---

### Type Generation for TypeScript

**Use Supabase CLI type generation (v1.168.5+):**

```bash
# In package.json
{
  "scripts": {
    "supabase:types": "supabase gen types typescript --db-url $DATABASE_URL > src/types/supabase.ts",
    "postinstall": "npm run supabase:types"
  }
}
```

**In GitHub Actions:**
```yaml
- name: Generate Supabase types
  env:
    DATABASE_URL: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY_DEV }}
  run: npm run supabase:types
```

**Alternative: Supabase Studio UI:**
- Supabase Studio auto-generates TypeScript types for each project
- Download from UI: Docs → SQL Editor → "Copy TypeScript types"
- Store in git for CI reproducibility

**Gotcha:** Types generated from `PUBLIC` schema only. Private tables need manual type definitions.

---

## 2. GITHUB ACTIONS CI/CD PIPELINE

### Workflow Structure: develop → staging → main

**Branch strategy:**
- `develop`: auto-deploy to dev environment (no approval)
- `staging`: manual approval (environment protection rule) before deploy to staging
- `main`: manual approval + required reviewers before deploy to prod

**.github/workflows/deploy.yml structure:**

```yaml
name: Deploy

on:
  push:
    branches: [develop, staging, main]
  pull_request:
    branches: [develop, staging, main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID_DEV: ${{ secrets.VERCEL_PROJECT_ID_DEV }}
  VERCEL_PROJECT_ID_STAGING: ${{ secrets.VERCEL_PROJECT_ID_STAGING }}
  VERCEL_PROJECT_ID_PROD: ${{ secrets.VERCEL_PROJECT_ID_PROD }}

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      # Smoke test (staging + prod only)
      - name: Run smoke tests
        if: github.ref_name == 'staging' || github.ref_name == 'main'
        run: npm run test:smoke

  deploy-dev:
    needs: lint-and-test
    if: github.ref_name == 'develop' && github.event_name == 'push'
    environment: development
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel (Dev)
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_DEV }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL_DEV }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV }}
        run: |
          npm install -g vercel
          vercel deploy --prebuilt --token $VERCEL_TOKEN --prod

  deploy-staging:
    needs: lint-and-test
    if: github.ref_name == 'staging' && github.event_name == 'push'
    environment: staging  # <-- Triggers protection rules
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel (Staging)
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_STAGING }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL_STAGING }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING }}
        run: |
          npm install -g vercel
          vercel deploy --prebuilt --token $VERCEL_TOKEN --prod
      
      - name: Smoke test staging
        env:
          TEST_URL: https://qa.example.com
        run: |
          npx playwright test tests/smoke/ --baseURL $TEST_URL

      - name: Purge Cloudflare cache
        env:
          CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
          CF_ZONE_ID: ${{ secrets.CF_ZONE_ID }}
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
            -H "Authorization: Bearer $CF_API_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"files":["https://qa.example.com/*"]}'

  deploy-prod:
    needs: lint-and-test
    if: github.ref_name == 'main' && github.event_name == 'push'
    environment:
      name: production
      url: https://example.com
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel (Prod)
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_PROD }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL_PROD }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD }}
        run: |
          npm install -g vercel
          vercel deploy --prebuilt --token $VERCEL_TOKEN --prod
      
      - name: Smoke test prod
        env:
          TEST_URL: https://example.com
        run: |
          npx playwright test tests/smoke/ --baseURL $TEST_URL

      - name: Purge Cloudflare cache (prod)
        env:
          CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
          CF_ZONE_ID: ${{ secrets.CF_ZONE_ID }}
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
            -H "Authorization: Bearer $CF_API_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"files":["https://example.com/*"]}'

      - name: Tag release
        run: |
          git tag -a "prod-$(date +%Y%m%d-%H%M%S)" -m "Production release"
          git push origin --tags
```

---

### Environment-Level Secrets Scoping

**GitHub UI Setup (Settings → Environments):**

Create 3 environments with **protection rules**:

| Environment | Protected | Required Reviewers | Deployment Branches |
|-------------|-----------|-------------------|---------------------|
| `development` | ❌ No | — | `develop` |
| `staging` | ✅ Yes | 1 reviewer | `staging` |
| `production` | ✅ Yes | 1+ reviewers | `main` |

**Secrets per environment:**

| Secret | Repo-level | Dev | Staging | Prod |
|--------|-----------|-----|---------|------|
| `VERCEL_TOKEN` | ✅ Yes | — | — | — |
| `VERCEL_ORG_ID` | ✅ Yes | — | — | — |
| `VERCEL_PROJECT_ID_*` | ❌ No | Env | Env | Env |
| `CF_API_TOKEN` | ✅ Yes | — | — | — |
| `CF_ZONE_ID` | ✅ Yes | — | — | — |
| `NEXT_PUBLIC_*` | ❌ No | Env | Env | Env |
| `SUPABASE_*` (service role) | ❌ No | Env | Env | Env |
| `SANITY_API_TOKEN` | ❌ No | Env | Env | Env |
| `OPENAI_API_KEY` | ✅ Yes | — | — | — |

**Rationale:**
- **Repo-level:** Non-sensitive, shared across all envs (VERCEL_TOKEN, CF credentials)
- **Environment-level:** Sensitive, isolated per env (project IDs, Supabase keys, API tokens)

**CRITICAL:** `NEXT_PUBLIC_*` vars appear in built client code → store in environment, never repo-level.

---

### Manual Approval Gates & Branch Protection

**GitHub API to set branch protection (CLI alternative):**

```bash
# Via gh CLI (requires admin token)
gh api repos/{owner}/{repo}/branches/main/protection \
  -X PUT \
  -f required_status_checks='{"strict":true,"contexts":["lint-and-test"]}' \
  -f required_pull_request_reviews='{"dismissal_restrictions":{},"require_code_owner_reviews":true,"required_approving_review_count":1}' \
  -f enforce_admins=true \
  -f allow_force_pushes=false \
  -f allow_deletions=false
```

**Recommended UI config (Settings → Branches → main):**
- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass before merging
  - Select: `lint-and-test` (required)
  - Select: `deploy-prod` (required)
- ✅ Require branches to be up to date before merging
- ✅ Enforce on administrators
- ❌ Allow force pushes (disable)
- ❌ Allow deletions (disable)

---

### Vercel Deployment via GitHub Actions

**Why manual deployment?**
- Vercel's auto-deployment requires git repo on Vercel's domain (vercel.com)
- Cloudflare reverse proxy intercepts; git->Vercel webhook can fail or trigger wrong branch
- Solution: Manual `vercel deploy --prebuilt` in Actions = explicit control

**Key flags:**
- `--prebuilt`: Uses build cache from Vercel (faster second deploys)
- `--prod`: Marks as production deployment (creates new URL if not main branch)
- `--token $VERCEL_TOKEN`: Auth with Vercel API token

**Gotcha:** Vercel auto-detect of build command only works via dashboard. In Actions, explicitly set `vercel` CLI args or use `vercel.json` with `buildCommand` + `outputDirectory`.

---

### Smoke Test Integration

**Post-deploy health checks (Playwright):**

```bash
# tests/smoke/health.spec.ts
import { test, expect } from '@playwright/test';

test('health check: homepage loads', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(await page.title()).toContain('Portfolio');
});

test('health check: API responds', async ({ page }) => {
  const response = await page.request.get('/api/health');
  expect(response.status()).toBe(200);
});

test('health check: portfolio page loads', async ({ page }) => {
  await page.goto('/portfolio');
  const projects = await page.locator('[data-testid="project-card"]').count();
  expect(projects).toBeGreaterThan(0);
});
```

**Run post-staging + post-prod deploy:**
```yaml
- name: Smoke test
  env:
    TEST_URL: ${{ env.DEPLOY_URL }} # From Vercel deploy output
  run: npx playwright test tests/smoke/ --baseURL $TEST_URL
```

---

### Cloudflare Cache Purge

**After each deploy (staging + prod):**
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "files": ["https://example.com/*"]
  }'
```

**Selective purge (per deployment):**
```bash
# Purge only changed pages (requires tracking file changes)
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "files": [
      "https://example.com/portfolio",
      "https://example.com/about",
      "https://example.com/api/projects"
    ]
  }'
```

---

### Git Tagging on Prod Deploy

```bash
git tag -a "prod-$(date +%Y%m%d-%H%M%S)" -m "Production release"
git push origin --tags
```

**Alternative: Semantic versioning**
```bash
# Requires version file tracking or commit parsing
git tag -a "v2.3.4" -m "Production release: new portfolio section"
git push origin --tags
```

---

## 3. SECRETS MODEL IMPLEMENTATION

### Matrix Mapping

```
┌─────────────────────┬───────┬──────────┬─────────┬──────┐
│ Secret              │ Type  │ Repo-lvl │ Dev-lvl │ Prod │
├─────────────────────┼───────┼──────────┼─────────┼──────┤
│ VERCEL_TOKEN        │ Token │ ✅       │ —       │ —    │
│ VERCEL_ORG_ID       │ ID    │ ✅       │ —       │ —    │
│ VERCEL_PROJECT_ID_* │ ID    │ ❌       │ Env     │ Env  │
│ CF_API_TOKEN        │ Token │ ✅       │ —       │ —    │
│ CF_ZONE_ID          │ ID    │ ✅       │ —       │ —    │
│ OPENAI_API_KEY      │ Key   │ ✅       │ —       │ —    │
│ NEXT_PUBLIC_*       │ Var   │ ❌       │ Env     │ Env  │
│ SUPABASE_URL        │ URL   │ ❌       │ Env     │ Env  │
│ SUPABASE_ANON_KEY   │ Key   │ ❌       │ Env     │ Env  │
│ SUPABASE_SERVICE_*  │ Key   │ ❌       │ Env     │ Env  │
│ SANITY_API_TOKEN    │ Token │ ❌       │ Env     │ Env  │
└─────────────────────┴───────┴──────────┴─────────┴──────┘
```

**Naming convention:**
- `VERCEL_*`: Vercel platform identifiers
- `NEXT_PUBLIC_*`: Client-side env vars (appear in build output)
- `SUPABASE_*`: Database + auth credentials
- `CF_*`: Cloudflare platform identifiers
- Service role keys: `*_SERVICE_ROLE_KEY` (never expose to client)

**Never store in git:**
- `.env.local` (add to `.gitignore`)
- Service role keys
- API tokens with write permissions

---

## 4. CLOUDFLARE + VERCEL SETUP

### Reverse Proxy Configuration

**Domain setup:**
1. Buy domain (e.g., `example.com`) on any registrar
2. Transfer nameservers to **Cloudflare** (Cloudflare Nameservers)
3. In Cloudflare UI:
   - Create 3 DNS records (CNAME):
     - `example.com` → `vercel.com` (proxy via Cloudflare = orange cloud)
     - `dev.example.com` → `{dev-vercel-url}` (orange cloud)
     - `qa.example.com` → `{staging-vercel-url}` (orange cloud)

**Critical detail:** Orange cloud = "Proxied" = Cloudflare intercepts. This breaks Vercel auto-deploy webhooks. Use manual GitHub Actions deploy instead.

### WAF Rules for Portfolio Site

```
Rule 1: Block known bots
  Condition: cf.bot_management.score < 30
  Action: Challenge

Rule 2: Rate limit (portfolio sites typically low traffic)
  Condition: cf.threat_score > 50
  Action: Block
  Threshold: 100 requests per 10 min from single IP

Rule 3: Block SQL injection attempts
  Condition: cf.waf.category eq "SQL_Injection"
  Action: Block

Rule 4: Allow legitimate user agents
  Condition: cf.verified_bot_category in ["Search Engine", "Monitoring"]
  Action: Allow
```

**Cloudflare UI:** Security → WAF Rules → Create rules

---

### Cache Rules for Next.js ISR

**Problem:** Vercel Next.js ISR (Incremental Static Regeneration) assumes origin (Vercel) handles caching. Cloudflare full-page cache can stale ISR responses.

**Solution: Cache Rules**

```
Rule 1: Cache static assets (versioned)
  Path: /([^/]+)_[a-f0-9]{8}\.(js|css|woff2)
  Browser cache TTL: 1 year

Rule 2: Cache ISR pages (revalidation via Cloudflare purge)
  Path: /portfolio /blog /projects
  Cache level: Cache Everything
  Browser TTL: 1 hour
  Edge TTL: 24 hours
  Action: Always use cache
  Note: Purge on Vercel deployment

Rule 3: API routes (no cache)
  Path: /api/*
  Cache level: Bypass
  Action: Always bypass cache

Rule 4: Dynamic pages (no cache)
  Path: /admin/* /dashboard/*
  Cache level: Bypass
```

**Vercel deployment trigger:**
- After `vercel deploy --prod`, run Cloudflare purge (see GitHub Actions section)

---

### Custom Domain for 3 Subdomains

**Cloudflare DNS Records:**

| Type | Name | Target | TTL | Proxy |
|------|------|--------|-----|-------|
| CNAME | example.com | cname.vercel-dns.com | Auto | ☁️ Proxied |
| CNAME | dev | {dev-vercel-url} | Auto | ☁️ Proxied |
| CNAME | qa | {staging-vercel-url} | Auto | ☁️ Proxied |

**Verify SSL certificates:** Cloudflare auto-issues for proxied subdomains (free).

---

## 5. HOTFIX WORKFLOW

**Branch strategy:** `hotfix/* → main → backport to develop`

**.github/workflows/hotfix.yml:**

```yaml
name: Hotfix CI/CD

on:
  pull_request:
    branches: [main]
    paths:
      - '.github/workflows/hotfix.yml'
      - '**'

jobs:
  lint-and-test:
    if: startsWith(github.head_ref, 'hotfix/')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run test

  deploy-hotfix:
    needs: lint-and-test
    if: startsWith(github.head_ref, 'hotfix/') && github.event.action == 'closed' && github.event.pull_request.merged == true
    environment: production
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Deploy to Vercel (hotfix)
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_PROD }}
        run: |
          npm install -g vercel
          vercel deploy --prebuilt --token $VERCEL_TOKEN --prod

      - name: Create backport PR to develop
        run: |
          git checkout develop
          git pull origin develop
          git merge main --no-ff -m "chore: backport hotfix to develop"
          git push origin develop
```

**Process:**
1. Create `hotfix/critical-bug` branch from `main`
2. Fix + commit
3. Push → open PR to `main` (bypass staging)
4. Manual approval (production environment protection rule)
5. Merge → auto-deploy prod + backport to develop

---

## 6. CODEX REVIEW INTEGRATION (GitHub Copilot/Codex)

**No native GitHub Copilot CI/CD bot as of Feb 2025.** Alternatives:

### Option 1: GitHub Copilot via VS Code (Local)
- Developers use Copilot locally before pushing
- Not CI/CD integrated

### Option 2: Third-party AI Review Bot
- `reviewdog` + OpenAI API
- `danger` + GPT integration
- Custom Action using `actions/github-script`

**Example: Custom PR comment bot**

```yaml
name: AI Code Review (Experimental)

on: [pull_request]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    if: github.event.pull_request.draft == false
    steps:
      - uses: actions/checkout@v4
      - name: Run AI review
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          npm install -g @openai/cli
          # Custom script: iterate PR diffs, send to GPT, post comments
          node scripts/ai-review.js
```

**Status:** Experimental; use with caution in production CI/CD. Better as optional local workflow.

---

## GOTCHAS & MITIGATIONS

| Gotcha | Impact | Mitigation |
|--------|--------|-----------|
| **Vercel auto-deploy broken by Cloudflare** | Deploys don't trigger | Use manual `vercel deploy --prebuilt` in GitHub Actions |
| **Secrets exposed in PR logs** | Security leak | Enable "Require approval for all outside collaborators" |
| **ISR pages cached stale** | Old portfolio content visible | Cloudflare purge post-deploy |
| **RLS not enabled → public read-write** | Data breach | Always `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` |
| **Schema drift across 3 projects** | Prod bugs | `supabase db pull` before push; version migrations in git |
| **NEXT_PUBLIC_* stored as repo secret** | Exposed in client code | Use only environment-level secrets |
| **Pagination token leak in URL** | Auth bypass | Use secure HTTP-only cookies; never expose in URL params |
| **Cloudflare WAF blocks legitimate traffic** | False positives | Start in Challenge mode; escalate to Block after validation |
| **Git tag collision** | Deploy confusion | Use ISO8601 timestamps or semantic versioning (not both) |
| **Missing CF_ZONE_ID → purge fails silently** | Stale cache, no errors | Validate Cloudflare API calls in GitHub Actions |

---

## IMPLEMENTATION CHECKLIST

- [ ] Create 3 Supabase projects (dev, staging, prod) with isolated databases
- [ ] Set up `supabase/migrations/` in git; run `supabase init` locally
- [ ] Create RLS policies for portfolio (public read, admin write)
- [ ] Store Supabase credentials in GitHub environment secrets
- [ ] Create `.github/workflows/deploy.yml` with 3 jobs (dev/staging/prod)
- [ ] Set environment protection rules (staging: 1 reviewer, prod: 1+ reviewers)
- [ ] Configure Vercel Projects (3 projects, manual deployment in Actions)
- [ ] Transfer domain to Cloudflare; set DNS to orange-cloud proxy
- [ ] Create Cloudflare cache rules for ISR + API bypass
- [ ] Create Cloudflare WAF rules (rate limiting, bot blocking)
- [ ] Store Vercel + Cloudflare tokens in repo-level secrets
- [ ] Implement Cloudflare cache purge in deploy job
- [ ] Add smoke tests (Playwright) post-deploy
- [ ] Create branch protection rules (main: require approval + reviews)
- [ ] Test hotfix workflow: hotfix/* → main → backport to develop
- [ ] Document secrets matrix in team wiki (no keys)

---

## UNRESOLVED QUESTIONS

1. **GitHub Copilot PR bot:** No native solution as of Feb 2025. Is custom OpenAI integration worth the complexity, or defer to local reviews?
2. **Supabase backup strategy:** How to backup 3 isolated projects to S3? Manual pg_dump in Actions, or use Supabase backup service?
3. **Staging→Prod data sync:** Do you want staging data in prod, or always fresh? Affects migration strategy.
4. **Cost optimization:** Vercel + Cloudflare + Supabase × 3 projects adds up. Viable long-term, or consolidate envs?
5. **OAuth provider:** Single-user admin on magic link, or setup OAuth (GitHub) now for multi-user future?

---

## ARCHITECTURE SUMMARY

```
GitHub (source of truth)
  ├── main (prod-ready code)
  │   └── Auto-triggers: GitHub Actions deploy-prod job
  │       └── Vercel deploy --prebuilt → prod.example.com
  │           └── Cloudflare intercepts (orange cloud DNS)
  │               └── Cache rules + WAF
  │
  ├── staging (staging-ready code)
  │   └── Manual approval: deploy-staging job
  │       └── Vercel deploy --prebuilt → qa.example.com
  │           └── Smoke tests + Cloudflare purge
  │
  └── develop (dev builds)
      └── Auto-triggers: deploy-dev job
          └── Vercel deploy --prebuilt → dev.example.com

Supabase (3 isolated projects)
  ├── dev: schema migrations from git
  ├── staging: schema migrations from git
  └── prod: schema migrations + manual approval

Secrets (GitHub)
  ├── Repo-level: VERCEL_TOKEN, VERCEL_ORG_ID, CF_API_TOKEN, CF_ZONE_ID, OPENAI_API_KEY
  ├── Development env: VERCEL_PROJECT_ID_DEV, SUPABASE_* (dev), NEXT_PUBLIC_* (dev)
  ├── Staging env: VERCEL_PROJECT_ID_STAGING, SUPABASE_* (staging), NEXT_PUBLIC_* (staging)
  └── Production env: VERCEL_PROJECT_ID_PROD, SUPABASE_* (prod), NEXT_PUBLIC_* (prod)
```
