---
phase: 5
title: "GitHub Actions CI/CD Pipeline"
status: pending
priority: P1
effort: "4h"
dependencies: [1]
---

# Phase 5: GitHub Actions CI/CD Pipeline

## Overview

Build the full 3-environment GitHub Actions pipeline: CI (lint/typecheck/build) on every PR, auto-deploy to dev on `develop` push, manual-approval deploy to staging on `staging` push (+ smoke tests), manual-approval deploy to prod on `main` push (+ smoke tests + CF cache purge + git tag). Hotfix workflow and optional AI PR review bot also included.

## Key Insights

- **Manual deploy required:** Cloudflare orange-cloud DNS breaks Vercel's auto-deploy webhook. Use `vercel deploy --prebuilt --token` via GitHub Actions for all 3 envs.
- **Environment-level secrets:** GitHub `environment:` keyword in a job scopes secrets to that environment. Staging and production environments require manual approval via GitHub environment protection rules.
- **Pre-built flag:** `vercel build` (without deploy) runs the Next.js build; `vercel deploy --prebuilt` uploads the artifact. Faster than deploying from scratch.
- **Smoke tests:** Playwright runs post-deploy against the live URL. Must pass or QA checklist comment is posted.
- **Codex/AI review:** No native GitHub Copilot CI bot as of early 2025. Custom OpenAI action is experimental — included as optional job.
- **Hotfix workflow:** Separate `hotfix.yml` — only triggers on `hotfix/*` PRs to `main`. Minimal CI + approval gate + backport PR.

## Requirements

**Functional:**
- `ci.yml`: lint + typecheck + build on every PR and push
- `deploy.yml`: env-scoped deploy jobs for develop/staging/main
- Staging job: approval gate + smoke tests + CF cache purge
- Prod job: approval gate + smoke tests + CF cache purge + git tag
- `hotfix.yml`: minimal CI + prod deploy + backport PR to develop
- Branch protection: `main` + `staging` — require status checks + PR review
- GitHub Environments created: `development`, `staging`, `production`

**Non-functional:**
- All secrets set at correct scope (repo-level vs. env-level)
- No secrets logged in Actions output
- Workflow files pass `act` local dry-run (optional)

## Architecture

```
.github/
├── workflows/
│   ├── ci.yml                  ← runs on all PRs + pushes
│   ├── deploy.yml              ← 3-env deploy (develop/staging/main)
│   └── hotfix.yml              ← hotfix/* → main fast-path
└── CODEOWNERS                  ← optional: require owner review

GitHub Environments (configured in repo Settings → Environments):
  development  → no protection, branch: develop
  staging      → required_reviewers: 1, branch: staging
  production   → required_reviewers: 1, branch: main

Secrets Matrix:
  Repo-level:  VERCEL_TOKEN, VERCEL_ORG_ID, CF_API_TOKEN, CF_ZONE_ID, OPENAI_API_KEY
  development: VERCEL_PROJECT_ID, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
               SUPABASE_SERVICE_ROLE_KEY, SANITY_API_TOKEN, SANITY_REVALIDATE_SECRET,
               NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
               NEXT_PUBLIC_SITE_URL, ADMIN_EMAIL, RESEND_API_KEY
  staging:     (same set, staging values)
  production:  (same set, production values)
```

## Related Code Files

**Create:**
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `.github/workflows/hotfix.yml`

## Implementation Steps

1. **Create CI workflow** — `.github/workflows/ci.yml`:
   ```yaml
   name: CI

   on:
     push:
       branches: [develop, staging, main, 'feature/**', 'hotfix/**']
     pull_request:
       branches: [develop, staging, main]

   jobs:
     ci:
       name: Lint · Typecheck · Build
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'

         - run: npm ci

         - name: Lint
           run: npm run lint

         - name: Typecheck
           run: npx tsc --noEmit

         - name: Build
           env:
             # Minimal build-time vars (non-secret placeholders for CI)
             NEXT_PUBLIC_SANITY_PROJECT_ID: ${{ vars.NEXT_PUBLIC_SANITY_PROJECT_ID_DEV }}
             NEXT_PUBLIC_SANITY_DATASET: staging
             NEXT_PUBLIC_SUPABASE_URL: ${{ vars.NEXT_PUBLIC_SUPABASE_URL_DEV }}
             NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ vars.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV }}
             NEXT_PUBLIC_SITE_URL: https://dev.example.com
           run: npm run build
   ```

2. **Create deploy workflow** — `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy

   on:
     push:
       branches: [develop, staging, main]

   jobs:
     # ── DEV ────────────────────────────────────────────────────────
     deploy-dev:
       if: github.ref_name == 'develop'
       name: Deploy → Development
       runs-on: ubuntu-latest
       environment: development
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: '20', cache: 'npm' }
         - run: npm ci

         - name: Apply Supabase migrations
           env:
             SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
             DATABASE_URL: ${{ secrets.SUPABASE_DB_URL }}
           run: npx supabase db push --db-url $DATABASE_URL

         - name: Build
           env:
             NEXT_PUBLIC_SANITY_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_SANITY_PROJECT_ID }}
             NEXT_PUBLIC_SANITY_DATASET: ${{ secrets.NEXT_PUBLIC_SANITY_DATASET }}
             NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
             NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
             NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
           run: npx vercel build --token ${{ secrets.VERCEL_TOKEN }}

         - name: Deploy to Vercel (Dev)
           env:
             VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
             VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
             VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
           run: npx vercel deploy --prebuilt --prod --token $VERCEL_TOKEN

     # ── STAGING ────────────────────────────────────────────────────
     deploy-staging:
       if: github.ref_name == 'staging'
       name: Deploy → Staging
       runs-on: ubuntu-latest
       environment: staging          # ← triggers approval gate
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: '20', cache: 'npm' }
         - run: npm ci

         - name: Apply Supabase migrations
           env:
             DATABASE_URL: ${{ secrets.SUPABASE_DB_URL }}
           run: npx supabase db push --db-url $DATABASE_URL

         - name: Build
           env:
             NEXT_PUBLIC_SANITY_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_SANITY_PROJECT_ID }}
             NEXT_PUBLIC_SANITY_DATASET: ${{ secrets.NEXT_PUBLIC_SANITY_DATASET }}
             NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
             NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
             NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
           run: npx vercel build --token ${{ secrets.VERCEL_TOKEN }}

         - name: Deploy to Vercel (Staging)
           env:
             VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
             VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
             VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
           run: npx vercel deploy --prebuilt --prod --token $VERCEL_TOKEN

         - name: Smoke tests
           env:
             BASE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
           run: npx playwright test tests/smoke/ --reporter=github

         - name: Purge Cloudflare cache (staging)
           env:
             CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
             CF_ZONE_ID: ${{ secrets.CF_ZONE_ID }}
             SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
           run: |
             curl -sf -X POST \
               "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
               -H "Authorization: Bearer $CF_API_TOKEN" \
               -H "Content-Type: application/json" \
               -d '{"purge_everything":true}'

     # ── PRODUCTION ─────────────────────────────────────────────────
     deploy-prod:
       if: github.ref_name == 'main'
       name: Deploy → Production
       runs-on: ubuntu-latest
       environment: production       # ← triggers approval gate
       steps:
         - uses: actions/checkout@v4
           with: { fetch-depth: 0 }
         - uses: actions/setup-node@v4
           with: { node-version: '20', cache: 'npm' }
         - run: npm ci

         - name: Apply Supabase migrations
           env:
             DATABASE_URL: ${{ secrets.SUPABASE_DB_URL }}
           run: npx supabase db push --db-url $DATABASE_URL

         - name: Build
           env:
             NEXT_PUBLIC_SANITY_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_SANITY_PROJECT_ID }}
             NEXT_PUBLIC_SANITY_DATASET: ${{ secrets.NEXT_PUBLIC_SANITY_DATASET }}
             NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
             NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
             NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
           run: npx vercel build --token ${{ secrets.VERCEL_TOKEN }}

         - name: Deploy to Vercel (Prod)
           env:
             VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
             VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
             VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
           run: npx vercel deploy --prebuilt --prod --token $VERCEL_TOKEN

         - name: Smoke tests
           env:
             BASE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
           run: npx playwright test tests/smoke/ --reporter=github

         - name: Purge Cloudflare cache (prod)
           env:
             CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
             CF_ZONE_ID: ${{ secrets.CF_ZONE_ID }}
           run: |
             curl -sf -X POST \
               "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
               -H "Authorization: Bearer $CF_API_TOKEN" \
               -H "Content-Type: application/json" \
               -d '{"purge_everything":true}'

         - name: Tag release
           run: |
             TAG="prod-$(date +%Y%m%d-%H%M%S)"
             git config user.email "github-actions[bot]@users.noreply.github.com"
             git config user.name "github-actions[bot]"
             git tag -a "$TAG" -m "Production deploy $TAG"
             git push origin "$TAG"
   ```

3. **Create hotfix workflow** — `.github/workflows/hotfix.yml`:
   ```yaml
   name: Hotfix

   on:
     pull_request:
       branches: [main]

   jobs:
     ci-hotfix:
       if: startsWith(github.head_ref, 'hotfix/')
       name: Hotfix CI (minimal)
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: '20', cache: 'npm' }
         - run: npm ci
         - run: npm run lint
         - run: npx tsc --noEmit

     deploy-hotfix:
       if: |
         startsWith(github.head_ref, 'hotfix/') &&
         github.event.action == 'closed' &&
         github.event.pull_request.merged == true
       name: Deploy hotfix → Production
       needs: ci-hotfix
       runs-on: ubuntu-latest
       environment: production
       steps:
         - uses: actions/checkout@v4
           with: { fetch-depth: 0 }
         - uses: actions/setup-node@v4
           with: { node-version: '20', cache: 'npm' }
         - run: npm ci
         - name: Build & Deploy
           env:
             VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
             VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
             VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
             NEXT_PUBLIC_SANITY_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_SANITY_PROJECT_ID }}
             NEXT_PUBLIC_SANITY_DATASET: ${{ secrets.NEXT_PUBLIC_SANITY_DATASET }}
             NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
             NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
             NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL }}
           run: |
             npx vercel build --token $VERCEL_TOKEN
             npx vercel deploy --prebuilt --prod --token $VERCEL_TOKEN
         - name: Purge CF cache
           env:
             CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
             CF_ZONE_ID: ${{ secrets.CF_ZONE_ID }}
           run: |
             curl -sf -X POST \
               "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
               -H "Authorization: Bearer $CF_API_TOKEN" \
               -H "Content-Type: application/json" \
               -d '{"purge_everything":true}'
         - name: Backport to develop
           run: |
             git checkout develop
             git pull origin develop
             git merge origin/main --no-ff -m "chore: backport hotfix to develop"
             git push origin develop
   ```

4. **Configure GitHub Environments** (GitHub repo → Settings → Environments):
   - `development`: no protection rules, deployment branch: `develop`
   - `staging`: required reviewers: 1 (yourself), deployment branch: `staging`
   - `production`: required reviewers: 1 (yourself), deployment branch: `main`

5. **Set secrets** (GitHub repo → Settings → Secrets):

   **Repo-level secrets:**
   ```
   VERCEL_TOKEN          ← Vercel account token
   VERCEL_ORG_ID         ← Vercel org/team ID
   CF_API_TOKEN          ← Cloudflare API token (Zone:Edit)
   CF_ZONE_ID            ← Cloudflare zone ID
   OPENAI_API_KEY        ← (for future AI review)
   ```

   **Per environment (development / staging / production):**
   ```
   VERCEL_PROJECT_ID
   NEXT_PUBLIC_SANITY_PROJECT_ID
   NEXT_PUBLIC_SANITY_DATASET
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   SUPABASE_DB_URL
   SANITY_API_TOKEN
   SANITY_REVALIDATE_SECRET
   NEXT_PUBLIC_SITE_URL
   ADMIN_EMAIL
   RESEND_API_KEY
   ```

6. **Configure branch protection** — via `gh` CLI (run once):
   ```bash
   # Protect main
   gh api repos/{owner}/{repo}/branches/main/protection \
     -X PUT \
     --field 'required_status_checks={"strict":true,"contexts":["CI / Lint · Typecheck · Build"]}' \
     --field 'required_pull_request_reviews={"required_approving_review_count":1}' \
     --field 'enforce_admins=true' \
     --field 'allow_force_pushes=false' \
     --field 'allow_deletions=false'

   # Protect staging (same pattern)
   gh api repos/{owner}/{repo}/branches/staging/protection \
     -X PUT \
     --field 'required_status_checks={"strict":true,"contexts":["CI / Lint · Typecheck · Build"]}' \
     --field 'required_pull_request_reviews={"required_approving_review_count":1}' \
     --field 'enforce_admins=true' \
     --field 'allow_force_pushes=false' \
     --field 'allow_deletions=false'
   ```

7. **Add Playwright install to workflows** (needed for smoke tests):
   ```yaml
   - name: Install Playwright browsers
     run: npx playwright install --with-deps chromium
   ```
   Add before smoke test steps in `deploy.yml`.

8. **Add to `package.json`**:
   ```json
   "scripts": {
     "lint": "next lint",
     "test:smoke": "playwright test tests/smoke/"
   }
   ```

## Todo List

- [ ] Create `.github/workflows/ci.yml`
- [ ] Create `.github/workflows/deploy.yml` (dev + staging + prod jobs)
- [ ] Create `.github/workflows/hotfix.yml`
- [ ] Configure 3 GitHub Environments with protection rules (UI or API)
- [ ] Set all repo-level secrets (VERCEL_TOKEN, CF_API_TOKEN, CF_ZONE_ID, VERCEL_ORG_ID)
- [ ] Set all environment-level secrets (dev / staging / prod)
- [ ] Apply branch protection on `main` and `staging` via `gh` CLI
- [ ] Install `@playwright/test` and add `tests/smoke/` directory (Phase 7 fills this)
- [ ] Test develop → deploy-dev job runs without approval
- [ ] Test staging PR → approval prompt appears before deploy-staging runs
- [ ] Test prod PR → approval prompt appears before deploy-prod runs
- [ ] Verify git tag created after prod deploy

## Success Criteria

- [ ] CI job (lint/typecheck/build) passes on `develop` push
- [ ] `deploy-dev` runs automatically on `develop` push — no approval
- [ ] `deploy-staging` pauses at approval gate before running
- [ ] `deploy-prod` pauses at approval gate before running
- [ ] Post-staging CF cache purge completes with HTTP 200
- [ ] Post-prod git tag `prod-YYYYMMDD-HHMMSS` appears in repo tags
- [ ] Direct push to `main` blocked by branch protection (test with a dry-run)
- [ ] Hotfix workflow: `hotfix/*` PR to `main` triggers approval gate

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Vercel build vars missing → build fails | High | Double-check all `NEXT_PUBLIC_*` secrets per env before first deploy |
| CF purge token wrong scope | Medium | Token must have `Zone:Cache Purge` permission |
| Backport merge conflicts in hotfix | Medium | Resolve manually; automate only when branch is clean |
| `supabase db push` fails on prod (migration error) | Critical | Test on staging first; prod has approval gate to catch this |
| Secrets logged in Actions output | High | Never `echo $SECRET`; use `::add-mask::$SECRET` if printing is unavoidable |

## Security Considerations

- Environment secrets never shared across environments — isolated by GitHub environment scoping
- `NEXT_PUBLIC_*` values stored as environment secrets (not repo-level) to prevent cross-env leakage
- No secrets printed in logs — all referenced via `${{ secrets.X }}` syntax
- Branch protection enforced on admins (`enforce_admins: true`)
- Hotfix bypasses staging but still requires production approval gate

## Next Steps

- Phase 6: Vercel + Cloudflare infrastructure config (projects, DNS, WAF, cache rules)
- Phase 7: Smoke test specs that this pipeline runs post-deploy
