# Deployment Guide

## Developer Workflow

All new work must go through feature branches — never push directly to `develop`, `staging`, or `main`.

**Standard flow (new phase, feature, or fix):**
```bash
# 1. Start from develop
git checkout develop && git pull origin develop

# 2. Create feature branch
git checkout -b feature/phase-6-cloudflare   # or fix/..., chore/...

# 3. Work, commit, push
git push origin feature/phase-6-cloudflare

# 4. Open PR → develop (CI runs: lint + typecheck + build)
# 5. Merge PR → develop auto-deploys to dev.emudev.cc

# 6. When ready for QA: open PR develop → staging
# 7. Merge PR → staging waits for manual approval → deploys to staging.emudev.cc + smoke tests

# 8. When QA passes: open PR staging → main
# 9. Merge PR → prod waits for manual approval → deploys to emudev.cc + smoke tests + git tag
```

**Emergency hotfix:**
```bash
git checkout -b hotfix/fix-name main
# fix, commit, push
# Open PR → main (skips staging, auto-deploys on merge, backports to develop)
```

---

## Workflow Decision Matrix

Choose which workflow triggers based on your branch and intent:

| Branch | Workflow | Env | Deploy Gate | Smoke Tests | Use For |
|--------|----------|-----|-------------|-------------|---------|
| `develop` | deploy.yml | dev | None (auto) | Optional | Dev testing |
| `staging` | deploy.yml | staging | Manual (UI) | Yes | QA testing |
| `main` | deploy.yml | prod | Manual (UI) | Yes | Production release |
| `hotfix/*` → `main` | hotfix.yml | prod | None (auto) | Yes | Emergency fixes |
| Any PR | ci.yml | — | Required to pass | No | Pre-merge checks |

**GitHub Pro Limitation (Free Plan):**
- Branch protection with **required reviewers** not available on private repos
- **Environment approval gates** available, but without required reviewer enforcement
- Manual approval via GitHub Actions UI recommended as workaround

---

## Pre-Deployment Checklist

Before any environment (dev/staging/prod), ensure:

- [ ] All code merged to target branch
- [ ] CI passes (lint, typecheck, build)
- [ ] Smoke tests pass in staging (before prod)
- [ ] GitHub Environments configured (staging/prod gates)
- [ ] Secrets set in GitHub (repo + environment level)
- [ ] Sanity project + webhook configured
- [ ] Supabase projects linked to all environments
- [ ] Cloudflare WAF rules active
- [ ] Domain DNS points to Vercel

---

## Phase 1: GitHub Repository Setup

### Create Environments

1. Go to repo **Settings > Environments**
2. Click **New environment** three times:
   - `development` (no approval gate)
   - `staging` (manual approval required)
   - `production` (manual approval required)

For staging & production:
- Enable **Required reviewers** (add yourself or team)
- Set **Deployment branches** to `staging` and `main` respectively

### Repository Secrets (Shared Across All Environments)

1. **Settings > Secrets and variables > Actions**
2. Click **New repository secret** for each:

| Secret | Source | Value |
|--------|--------|-------|
| `VERCEL_TOKEN` | Vercel account settings | Personal access token |
| `VERCEL_ORG_ID` | Vercel team slug | Team ID or org ID |
| `CF_API_TOKEN` | Cloudflare dashboard > Account settings | API token (scoped to emudev.cc zone) |
| `CF_ZONE_ID` | Cloudflare emudev.cc zone settings | Zone ID (UUID) |

---

## Phase 2: Vercel Project Setup

### Create Three Vercel Projects

1. **Development Project**
   - Name: `emudev-portfolio-dev`
   - Domain: `dev.emudev.cc` (or vercel.app)
   - Git integration: Link to `develop` branch (auto-deploy disabled for now)

2. **Staging Project**
   - Name: `emudev-portfolio-staging`
   - Domain: `staging.emudev.cc`
   - Git integration: Link to `staging` branch (auto-deploy disabled)

3. **Production Project**
   - Name: `emudev-portfolio`
   - Domain: `emudev.cc` (primary)
   - Git integration: Link to `main` branch (auto-deploy disabled)

### Get Project IDs

For each project:
1. Go to **Settings > General > Project ID**
2. Copy the ID

### Environment-Specific Secrets (GitHub)

For each environment (`development`, `staging`, `production`):

1. Go to **Settings > Secrets and variables > Actions > Environment secrets**
2. Add each secret:

| Secret | Dev Value | Staging Value | Prod Value |
|--------|-----------|---------------|-----------|
| `VERCEL_PROJECT_ID` | [dev-project-id] | [staging-project-id] | [prod-project-id] |
| `NEXT_PUBLIC_SITE_URL` | https://dev.emudev.cc | https://staging.emudev.cc | https://emudev.cc |
| `NEXT_PUBLIC_SITE_DOMAIN` | emudev.cc | emudev.cc | emudev.cc |
| `SANITY_REVALIDATE_SECRET` | [random-string] | [random-string] | [random-string] |

Generate random secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Phase 3: Sanity CMS Setup

### 1. Create Sanity Project (Shared)

```bash
npm run sanity:dev
```

1. Sign up at sanity.io
2. Create project: `emudev-portfolio`
3. Dataset: `production`
4. API access: Create a token with "Editor" or "Admin" permissions
5. Copy project ID and dataset name

### 2. Set Sanity Secrets in GitHub

For all environments:

| Secret | Value |
|--------|-------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | [sanity-project-id] |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` (or `staging` for dev) |
| `SANITY_API_TOKEN` | [sanity-api-token-with-read-permission] |

### 3. Configure Sanity Webhook

In Sanity project settings:

1. Go to **API > Webhooks**
2. Create new webhook:
   - **URL:** `https://emudev.cc/api/revalidate-tag` (prod example)
   - **Events:** All (or just publish/unpublish)
   - **HTTP Headers:** Add custom header
     - Key: `x-sanity-webhook-secret`
     - Value: [same as SANITY_REVALIDATE_SECRET]
3. Save webhook
4. Test webhook → should get 200 response

Repeat for staging (`https://staging.emudev.cc/api/revalidate-tag`) if using separate Sanity dataset.

---

## Phase 4: Supabase Setup

### 1. Create Supabase Projects

Create 3 projects (one per environment):

1. **Development Project**
   - Name: `emudev-dev`
   - Database password: [strong-password]

2. **Staging Project**
   - Name: `emudev-staging`
   - Database password: [strong-password]

3. **Production Project**
   - Name: `emudev-prod`
   - Database password: [strong-password]

### 2. Link Projects in GitHub Secrets

For each environment, add to GitHub environment secrets:

| Secret | Source |
|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings > API > URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings > API > anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings > API > service_role key |
| `SUPABASE_DB_URL` | Supabase project settings > Database > Connection string (Session mode) |
| `SUPABASE_PAT` | Supabase account settings > Access tokens (generate new) |

### 3. Apply Migrations

Migrations run automatically in the deploy workflow, but you can test locally:

```bash
# Link project (interactive)
supabase link --project-ref [project-ref]

# Apply migrations
supabase db push
```

This:
1. Creates `contact_submissions` table
2. Enables RLS
3. Creates policies (public INSERT, admin SELECT/DELETE)
4. Sets `app.admin_email` database variable

### 4. Verify RLS Policies

In Supabase dashboard:

1. Go to **SQL Editor**
2. Run:
```sql
SELECT * FROM information_schema.table_privileges
WHERE table_name = 'contact_submissions';
```

Expected output:
- `anon` role has INSERT privilege
- Authenticated role has SELECT/DELETE (gated by RLS policy)

3. Run:
```sql
SHOW app.admin_email;
```

Should return: `esteban.montero@gmail.com` (or your admin email)

---

## Phase 5: Resend Email Setup

### 1. Create Resend Account

1. Go to resend.com
2. Sign up
3. Create API key with full permissions

### 2. Add Secret to GitHub

For all environments:

| Secret | Value |
|--------|-------|
| `RESEND_API_KEY` | [resend-api-key] |
| `ADMIN_EMAIL` | `esteban.montero@gmail.com` |

### 3. Test Email

Submit a contact form in dev environment. You should receive an email within 30 seconds at `ADMIN_EMAIL`.

---

## Phase 6: Cloudflare Setup

### 1. Add Domain to Cloudflare

1. Go to cloudflare.com
2. Add domain `emudev.cc`
3. Update domain nameservers to Cloudflare
4. Wait for DNS propagation (~24 hours)

### 2. Create DNS Records

In Cloudflare dashboard for `emudev.cc`:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| CNAME | @ | cname.vercel-dns.com | Proxied (orange) |
| CNAME | dev | cname.vercel-dns.com | Proxied (orange) |
| CNAME | staging | cname.vercel-dns.com | Proxied (orange) |
| TXT | _acme-challenge.emudev.cc | [vercel-acme] | Not proxied (gray) |

### 3. Configure Caching Rules

1. **Caching > Rules**
2. Create rules:
   - **Static assets** (*.js, *.css, *.woff2): Cache Everything, 1 year
   - **HTML pages** (/*): Cache on Use, 1 hour
   - **API routes** (/api/*): Bypass Cache

### 4. Configure WAF

1. **Security > WAF**
2. Enable:
   - OWASP ModSecurity Core Rule Set
   - Rate limiting (10 requests/10 sec per IP for /api/contact)
   - Bot Management (if using Paid plan)

### 5. Enable HTTPS

1. **SSL/TLS > Edge Certificates**
2. Set **Minimum TLS Version** to 1.3
3. **Always Use HTTPS:** On

### 6. Get Zone ID

1. **Overview > Zone ID**
2. Copy Zone ID

This is `CF_ZONE_ID` for GitHub secrets.

---

## Phase 7: First Deploy (Development)

### 1. Push to Develop

```bash
git push origin develop
```

### 2. Monitor GitHub Actions

1. Go to repo **Actions**
2. Watch `CI` workflow (should pass)
3. Watch `Deploy` workflow:
   - Runs Supabase migrations
   - Builds Next.js
   - Deploys to Vercel (dev project)
   - Smoke tests run

### 3. Verify Deployment

```bash
curl https://dev.emudev.cc
# Should return HTML with emudev portfolio
```

Test key pages:
- [ ] Homepage loads (hero + featured projects)
- [ ] `/projects` loads (project list)
- [ ] `/blog` loads (blog list)
- [ ] `/contact` loads (contact form)
- [ ] Contact form submits successfully
- [ ] Check email for contact notification

---

## Phase 8: Deploy to Staging

### 1. Create Staging Branch

```bash
git checkout -b staging develop
git push origin staging
```

### 2. Approve Deploy

GitHub will hold deploy until you manually approve:
1. Go to **Actions > Deploy**
2. Click **Review deployments**
3. Select `staging` environment
4. Click **Approve and deploy**

### 3. Monitor

Same as dev, but tests run against `https://staging.emudev.cc`.

### 4. Manual QA

- [ ] Visual regression (compare to dev)
- [ ] Mobile layout (check responsive breakpoints)
- [ ] Contact form sends email
- [ ] Sanity preview mode (optional)
- [ ] Performance (Lighthouse score >90)

---

## Phase 9: Deploy to Production

### 1. Create PR & Merge to Main

```bash
git checkout main
git pull origin main
git merge staging
git push origin main
```

### 2. Approve Deploy

Same as staging:
1. **Actions > Deploy**
2. **Review deployments**
3. **Approve and deploy** for `production`

### 3. Monitor

Tests run against `https://emudev.cc`.

### 4. Verify

```bash
curl https://emudev.cc
# Check homepage, projects, contact form
```

### 5. Check DNS

```bash
nslookup emudev.cc
# Should resolve to Vercel IP
```

---

## Hotfix Deployment

For emergency fixes to production:

```bash
# Create hotfix branch from main
git checkout -b hotfix/fix-name main

# Make changes
git add .
git commit -m "fix: description"
git push origin hotfix/fix-name

# Create PR hotfix/fix-name -> main
gh pr create --base main --title "Hotfix: description"

# Merge PR (auto-deploys to production via hotfix.yml)
gh pr merge --auto --squash
```

**Hotfix Behavior:**
1. PR triggered minimal CI (lint, typecheck, build only — no smoke tests initially)
2. On merge: hotfix.yml automatically runs with production environment
3. Deploys to production without approval gate (uses production environment for deploy)
4. Smoke tests run against production post-deploy
5. Backports merged commits to develop branch automatically
6. **Note:** This does NOT skip the production environment configuration — it still uses all production secrets and settings

---

## Rollback Procedure

### If Production Deploy Breaks

1. **Revert the commit:**
   ```bash
   git revert HEAD
   git push origin main
   ```
   GitHub Actions auto-deploys the revert.

2. **Or redeploy previous version:**
   ```bash
   git reset --soft HEAD~1  # Undo last commit locally
   git push --force origin main  # Force push previous commit
   ```
   Not recommended unless reverting doesn't work.

3. **Monitor the rollback:**
   - Check Actions logs
   - Test `https://emudev.cc` again

---

## Secrets Rotation

### Resend API Key Rotation

1. Generate new API key in Resend
2. Update `RESEND_API_KEY` in all GitHub environments
3. Delete old key in Resend

### Sanity Webhook Secret Rotation

1. Generate new secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Update `SANITY_REVALIDATE_SECRET` in all GitHub environments
3. Update webhook URL in Sanity project settings
4. Test webhook

### Supabase Token Rotation

1. Generate new SUPABASE_PAT in account settings
2. Update `SUPABASE_PAT` in all GitHub environments
3. Delete old token

---

## Monitoring & Alerts

### Vercel Analytics

In Vercel dashboard:
- **Analytics** tab shows Core Web Vitals, FCP, LCP
- Set up alerts for build failures or deployment errors

### Sanity Activity

In Sanity:
- **API > Activity Log** shows all publishes/unpublishes
- Filter by document type to track content changes

### Supabase Logs

In Supabase dashboard:
- **Logs** tab shows database queries, auth events, API calls
- Filter by time range to debug issues

### GitHub Actions

- **Actions > All workflows** shows CI/CD run history
- Click run to see logs
- Set up branch protection: require CI to pass

---

## Troubleshooting

### Build Fails

1. Check GitHub Actions logs
2. Run locally: `npm run build`
3. Check env vars in GitHub (settings > environments > secrets)
4. If Sanity project ID missing, build should still succeed (with null data)

### Webhook Not Firing

1. Check Sanity webhook URL and secret
2. In Sanity > API > Webhooks, click webhook and check recent deliveries
3. Verify `x-sanity-webhook-secret` header matches `SANITY_REVALIDATE_SECRET`
4. Test webhook manually (Sanity UI has test button)

### Contact Form Submission Fails

1. Check Supabase RLS policies (should allow anon INSERT)
2. Verify `contact_submissions` table exists (`supabase db push` to apply migrations)
3. Check Supabase logs for errors
4. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` in GitHub secrets

### Email Not Sending

1. Verify `RESEND_API_KEY` is set in GitHub
2. Check Resend dashboard > Emails for failed deliveries
3. Verify `ADMIN_EMAIL` is valid
4. Check GitHub Actions logs for Resend API errors

### Stale Cache

1. Manually trigger webhook test in Sanity
2. Or redeploy from Vercel dashboard (Settings > Deploy)
3. Or purge Cloudflare cache manually:
   ```bash
   curl -X POST \
     "https://api.cloudflare.com/client/v4/zones/{CF_ZONE_ID}/purge_cache" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"purge_everything":true}'
   ```

---

## Post-Deployment Checklist

After each production deploy:

- [ ] Visit https://emudev.cc and verify homepage loads
- [ ] Test `/projects`, `/blog`, `/contact` pages
- [ ] Submit contact form and verify email received
- [ ] Check GitHub Actions all green
- [ ] Check Vercel deployment status (all green)
- [ ] Monitor Lighthouse score (aim >90)
- [ ] Check Cloudflare analytics (no errors)
- [ ] Verify Sanity webhook last delivery was successful
