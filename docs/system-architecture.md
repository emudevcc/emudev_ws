# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CDN & WAF (Cloudflare)                  │
│                     Cache Headers, Rate Limiting                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                        Vercel (Hosting)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Next.js 15 (App Router)                       │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │  Page Generation (SSG / ISR / SSR)             │    │   │
│  │  │  • Homepage: SSG with featured projects        │    │   │
│  │  │  • Project list: ISR (1-hour revalidate)       │    │   │
│  │  │  • Project detail: SSG per [slug]              │    │   │
│  │  │  • Blog list: ISR (1-hour revalidate)          │    │   │
│  │  │  • Blog post: SSG per [slug]                   │    │   │
│  │  │  • Contact: SSR (no caching)                   │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │  API Routes & Webhooks                         │    │   │
│  │  │  • POST /api/revalidate-tag (Sanity webhook)   │    │   │
│  │  │    - Validates x-sanity-webhook-secret header  │    │   │
│  │  │    - Calls revalidateTag(tags)                 │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │  Server Actions                                │    │   │
│  │  │  • submitContact: form → Supabase → Resend      │    │   │
│  │  │  • sendMagicLink: email → Supabase auth        │    │   │
│  │  │  • signOut: clear session cookies              │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────┬───────────────┬───────────────┬─────────────────┘
                │               │               │
        ┌───────▼────┐   ┌─────▼──────┐   ┌────▼─────────┐
        │  Sanity    │   │ Supabase   │   │  Resend      │
        │  CMS v3    │   │  Postgres  │   │  (Email API) │
        │            │   │            │   │              │
        │ • Projects │   │ • Auth     │   │ • Contact    │
        │ • Posts    │   │ • RLS      │   │   notification
        │ • Authors  │   │ • Magic    │   │              │
        │ • Tags     │   │   Link     │   └──────────────┘
        │ • Settings │   │ • Sessions │
        └────────────┘   └────────────┘
```

---

## Component Layer Detail

### 1. Frontend Layer (Next.js App Router)

#### Page Routes
| Route | Generation | Cache | Purpose |
|-------|-----------|-------|---------|
| `/` | SSG | 1 hour | Homepage with hero + featured projects |
| `/projects` | ISR | 1 hour | Projects list (gallery with tag filter) |
| `/projects/[slug]` | SSG (per-route) | 1 hour | Project detail page with OG image |
| `/blog` | ISR | 1 hour | Blog post list |
| `/blog/[slug]` | SSG (per-route) | 1 hour | Blog post detail with OG image |
| `/about` | SSR | None | Static about page |
| `/contact` | SSR | None | Contact form (no cache) |
| `/studio` | SSR | None | Embedded Sanity Studio |
| `/api/draft-mode/enable` | Route | None | Enable Sanity draft mode |
| `/api/draft-mode/disable` | Route | None | Disable draft mode |
| `/robots.txt` | Generated | Static | Robots.txt (allow all except /studio, /api, /admin) |
| `/sitemap.xml` | Generated | Static | XML sitemap with dynamic routes + priorities |

#### Dynamic Params (SSG)
```typescript
// For /projects/[slug] and /blog/[slug]
export async function generateStaticParams() {
  const projects = (await getProjects()) ?? []
  return projects.map(p => ({ slug: p.slug.current }))
}
```

- During `next build`: generates all static route params
- Build time grows with content count (e.g., 50 projects = 50 additional routes)
- ISR allows on-demand SSG for new content (post-build publication)

---

### 2. Content Management (Sanity CMS)

#### Data Model
```
Project (document)
├── title (string)
├── slug (slug)
├── description (text)
├── content (portable text)
├── featuredImage (image reference)
├── tags (array of tag references)
├── liveUrl (URL)
├── repoUrl (URL)
└── publishedAt (date)

Post (document)
├── title (string)
├── slug (slug)
├── excerpt (text)
├── content (portable text)
├── author (reference to Author)
├── tags (array of tag references)
└── publishedAt (date)

Author (document)
├── name (string)
├── bio (text)
└── image (image reference)

Tag (document)
├── title (string)
└── slug (slug)

SiteSettings (document)
├── siteName (string)
├── description (text)
├── logo (image reference)
└── socialLinks (array: {platform, url})
```

#### TypeScript Types
- **Real types generated:** `types/sanity.types.ts` (334 LOC) covers all documents
- **Draft mode:** API routes `/api/draft-mode/enable` and `/api/draft-mode/disable` for Sanity Presentation tool
- **OG images:** Dynamic image generation for social sharing (1200×630, dark gradient)

#### Query Execution Flow
```
Page component (SSG/ISR)
    │
    ├─ await getProjects() [unstable_cache + tags]
    │   └─ sanityFetch(GROQ query)
    │       └─ createClient.fetch() with vision preview
    │
    ├─ await getSiteSettings() [unstable_cache + tags]
    │   └─ sanityFetch(GROQ query)
    │
    └─ Render (if data, else show fallback)
```

#### Revalidation Trigger
```
Sanity Studio (Admin publishes project)
    │
    └─ Sanity webhook POST /api/revalidate-tag
        │
        └─ Validate x-sanity-webhook-secret header
            │
            └─ Extract _type (project | post | siteSettings)
                │
                └─ TAG_MAP[_type] → ['projects', 'posts', etc.]
                    │
                    └─ revalidateTag(tag) ← clears cache
                        │
                        └─ Next ISR revalidates on next request
```

**Latency:** Typically <5 seconds from publish to cache clear.

---

### 3. Database Layer (Supabase Postgres)

#### Schema
```sql
-- Contact submissions (public + admin RLS)
CREATE TABLE contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Auth users (managed by Supabase Auth)
-- auth.users (email, encrypted_password, etc.)

-- Sessions (managed by Supabase Auth)
-- auth.sessions (user_id, refresh_token, etc.)
```

#### TypeScript Types
- **Real types generated:** `types/supabase.types.ts` (188 LOC) covers all tables + auth tables
- **RLS policies fixed:** Admin policies now correctly reference `app.admin_email` setting

#### RLS Policies
```sql
-- Anon role: can only INSERT (submit form)
CREATE POLICY "public_insert_contact" ON contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

-- Authenticated role: can SELECT + DELETE if admin email
CREATE POLICY "admin_read_contact" ON contact_submissions
  FOR SELECT
  USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

CREATE POLICY "admin_delete_contact" ON contact_submissions
  FOR DELETE
  USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));
```

#### Admin Email Config
```sql
-- Set at deployment time
ALTER DATABASE postgres SET app.admin_email TO 'esteban.montero@gmail.com';
```

Used in RLS to gate admin operations without additional tables.

---

### 4. Authentication (Supabase Auth + Magic Link)

#### Magic Link Flow
```
User requests Magic Link
    │
    └─ sendMagicLink server action
        │
        ├─ Check ADMIN_EMAIL allow-list
        │   └─ Return error if not in list
        │
        └─ supabase.auth.signInWithOtp({ email })
            │
            └─ Supabase sends email with one-time link
                │
                └─ User clicks link
                    │
                    └─ Supabase validates token
                        │
                        └─ Sets session cookie
                            │
                            └─ User is authenticated
```

#### Session Management
- Cookies stored securely (HttpOnly, SameSite)
- Refresh tokens handled by Supabase SSR lib
- signOut clears cookies via server action

#### Middleware (Optional)
Can add `middleware.ts` to gate `/dashboard` or admin routes:
```typescript
export function middleware(request: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  
  if (!data.user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

---

### 5. Email Delivery (Resend)

#### Contact Form Email Flow
```
User submits form (submitContact action)
    │
    ├─ Supabase INSERT contact_submissions (authoritative)
    │
    └─ try { await resend.emails.send(...) } catch
        │
        └─ Log error, continue (best-effort)
```

**Key Detail:** Database insert is the contract; email is a bonus notification.

#### Email Template
```html
<p><strong>John Doe</strong> &lt;john@example.com&gt;</p>
<p>Hi, I'd love to collaborate...</p>
```

- From: `contact@emudev.cc` (using NEXT_PUBLIC_SITE_DOMAIN)
- To: `ADMIN_EMAIL`
- ReplyTo: user's email (so admin can reply directly)
- HTML-escaped to prevent injection

---

## Deployment Pipeline (GitHub Actions)

### Workflow Decision Matrix

| Workflow | Trigger | Node | Env | Steps | Gate |
|----------|---------|------|-----|-------|------|
| **ci.yml** | PR to any branch | 20 | Placeholder | Lint, typecheck, build | PR required |
| **deploy.yml (develop)** | Push to develop | 20 | dev | Migrations, build, vercel deploy, smoke tests | None |
| **deploy.yml (staging)** | Push to staging | 20 | staging | Migrations, build, vercel deploy, smoke tests, CF purge | Manual (UI) |
| **deploy.yml (main)** | Push to main | 20 | production | Migrations, build, vercel deploy, smoke tests, CF purge, git tag | Manual (UI) |
| **hotfix.yml** | PR hotfix/* → main | 20 | production | Lint, typecheck, build (fast), auto-deploy on merge, backport | Production env |

---

### CI Workflow (`ci.yml`)

Runs on: PR to any branch, push to develop/staging/main/feature/*

```yaml
Steps:
  1. Checkout code
  2. Setup Node 20
  3. npm ci --legacy-peer-deps (clean install from lock file)
  4. npm run lint
  5. npm run typecheck
  6. npm run build
     └─ Env: NEXT_PUBLIC_SANITY_PROJECT_ID=placeholder (dev vars)
        └─ Build succeeds with null-guarded data
```

**Gate:** All PRs require CI to pass before merge.

---

### Deploy Workflow (`deploy.yml`)

Runs on: push to develop, staging, or main

#### Develop Branch → Development Environment

```yaml
Trigger: push to develop
Environment: development

Steps:
  1. Checkout code
  2. npm ci --legacy-peer-deps
  3. supabase db push (apply migrations)
     └─ Uses SUPABASE_DB_URL + SUPABASE_PAT
  4. npm run build
     └─ Env: NEXT_PUBLIC_SITE_URL = https://dev.emudev.cc (hardcoded)
     └─ Real NEXT_PUBLIC_SANITY_PROJECT_ID, etc.
  5. vercel deploy --prebuilt --prod
     └─ Deploys to dev.emudev.cc
  6. npm run test:smoke (optional)
  7. Purge Cloudflare cache by prefix
     └─ curl purge_cache with {"prefixes":["dev.emudev.cc"]}
```

No approval gate; auto-deploys on push. CF cache purge is prefix-only (limited scope).

#### Staging Branch → Staging Environment

```yaml
Trigger: push to staging
Environment: staging (requires manual approval in UI)

Steps:
  1. Checkout code
  2. npm ci --legacy-peer-deps
  3. supabase db push (apply migrations)
  4. npm run build
     └─ Env: NEXT_PUBLIC_SITE_URL = https://qa.emudev.cc (hardcoded)
  5. vercel deploy --prebuilt --prod (deploys to qa.emudev.cc)
  6. npm run test:smoke
     └─ Playwright tests against qa.emudev.cc
  7. Post QA checklist to GitHub Actions summary
  8. Purge Cloudflare cache (entire zone)
     └─ curl purge_cache with {"purge_everything":true}
```

**Gate:** Manual approval via GitHub Environments UI (no required reviewers on Free plan).
**Domain:** `qa.emudev.cc` (NOT staging.emudev.cc)

#### Main Branch → Production Environment

```yaml
Trigger: push to main
Environment: production (requires manual approval in UI)

Steps:
  1. Checkout code (fetch-depth: 0 for git history)
  2. npm ci --legacy-peer-deps
  3. supabase db push (apply migrations)
  4. npm run build
     └─ Env: NEXT_PUBLIC_SITE_URL = https://emudev.cc (hardcoded)
  5. vercel deploy --prebuilt --prod
  6. npm run test:smoke
     └─ Tests against https://emudev.cc
  7. Purge Cloudflare cache (entire zone)
     └─ curl purge_cache with {"purge_everything":true}
  8. Create git tag: prod-YYYYMMDD-HHMMSS
     └─ Pushed to origin (release reference)
```

**Gate:** Manual approval via GitHub Environments UI (no required reviewers on Free plan).
**CF Purge:** Entire zone purge (purge_everything=true)

---

### Hotfix Workflow (`hotfix.yml`)

Runs on: PR hotfix/* → main

```yaml
Trigger: PR created from hotfix/* to main
Steps:
  1. Minimal CI (lint, typecheck, build only — no smoke tests)
  2. On merge: Use production environment for auto-deploy
  3. Deploy to production (no approval gate)
  4. Run smoke tests against production
  5. Backport merged commits to develop branch
```

**Purpose:** Emergency fixes that bypass staging and normal approval gates.  
**Note:** Does NOT skip the production environment or its configuration — uses production environment directly.

---

## Environment Strategy

### Repository Secrets (Shared)
```
VERCEL_TOKEN          # Vercel API token (all environments)
VERCEL_ORG_ID         # Vercel organization ID
CF_API_TOKEN          # Cloudflare API token
CF_ZONE_ID            # emudev.cc zone ID
```

### Environment-Level Secrets (Isolated)

Each of `development`, `staging`, `production` has its own copy:

```
VERCEL_PROJECT_ID                # Project ID in that environment
NEXT_PUBLIC_SANITY_PROJECT_ID    # Sanity project (may be same for all)
NEXT_PUBLIC_SANITY_DATASET       # Sanity dataset (dev/staging/prod)
NEXT_PUBLIC_SUPABASE_URL         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY    # Anon key (safe to expose)
SUPABASE_SERVICE_ROLE_KEY        # Private key (if admin client needed)
SUPABASE_DB_URL                  # Postgres connection (migrations)
SUPABASE_PAT                     # Personal access token (db push)
NEXT_PUBLIC_SITE_DOMAIN          # emudev.cc (same for all environments)
SANITY_API_TOKEN                 # Read token (optional, for drafts)
SANITY_REVALIDATE_SECRET         # Webhook secret (unique per env)
RESEND_API_KEY                   # Resend API key
ADMIN_EMAIL                      # Allow-list for Magic Link
```

**Note:** `NEXT_PUBLIC_SITE_URL` is now hardcoded in `deploy.yml` per job (not a GitHub secret):
- Dev: `https://dev.emudev.cc`
- Staging: `https://qa.emudev.cc`
- Production: `https://emudev.cc`

This prevents accidental mismatches between domain and deployment.

### CI Build-Time Env Vars

In `ci.yml`, overrides for placeholder data:

```yaml
NEXT_PUBLIC_SANITY_PROJECT_ID: ${{ vars.NEXT_PUBLIC_SANITY_PROJECT_ID_DEV || 'placeholder' }}
NEXT_PUBLIC_SUPABASE_URL: ${{ vars.NEXT_PUBLIC_SUPABASE_URL_DEV || 'https://placeholder.supabase.co' }}
```

Allows PR CI to succeed even without real project IDs.

---

## Cloudflare Configuration

### Caching Rules
- **Cache Everything** for static assets (JS, CSS, images)
- **Cache on Use** for HTML (respects Cache-Control headers from Vercel)
- **Bypass Cache** for `/api/*` and `/studio/*` (dynamic)

### Security
- **WAF Rules:** Block common attacks (SQL injection, XSS, bots)
- **Rate Limiting:** Limit contact form submissions if needed
- **HTTPS Only:** Redirect HTTP to HTTPS

### Cache Purge

Automatic purge on all three environments after successful deploy:

**Development:** Purge by prefix (limited to dev domain)
```bash
curl -X POST \
  "https://api.cloudflare.com/client/v4/zones/{CF_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prefixes":["dev.emudev.cc"]}'
```

**Staging & Production:** Purge entire zone
```bash
curl -X POST \
  "https://api.cloudflare.com/client/v4/zones/{CF_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything":true}'
```

Dev uses prefix purge to minimize CDN impact; staging/prod use full zone purge for safety.

---

## Request Flow Example: User Views Project

```
1. User navigates to /projects/my-cool-app
2. Browser requests https://emudev.cc/projects/my-cool-app
3. Cloudflare checks cache
   ├─ Hit: serve cached HTML, done
   └─ Miss: forward to Vercel
4. Vercel Next.js:
   ├─ getProjectBySlug('my-cool-app')
   │  ├─ Check unstable_cache
   │  │  ├─ Hit: return cached data
   │  │  └─ Miss: fetch from Sanity
   │  └─ Returns Project | null
   ├─ renderToString(<ProjectDetail project={...} />)
   └─ Response:
      ├─ Headers: Cache-Control: s-maxage=3600
      └─ Body: <html>...</html>
5. Cloudflare caches HTML (s-maxage=3600)
6. Browser renders
7. User sees project
```

**Total latency (miss):** ~500ms (Sanity query + render)  
**Total latency (hit):** ~100ms (Cloudflare + Vercel cache)

---

## Data Consistency

### Sanity → Vercel Cache → User

- **Source of truth:** Sanity (admin edits here)
- **Cache layer:** Next.js unstable_cache (1 hour)
- **Invalidation:** Sanity webhook → /api/revalidate-tag → revalidateTag
- **Fallback:** Time-based revalidate (if webhook misses)

### Contact Form → Supabase → Email

- **Source of truth:** Supabase DB (INSERT is committed)
- **Notification:** Resend email (best-effort, wrapped in try/catch)
- **Admin access:** Supabase dashboard (RLS gates to admin email)
- **Fallback:** DB insert succeeds even if email fails

---

## Performance & Monitoring

### Key Metrics
- **FCP (First Contentful Paint):** <1.5s (target)
- **LCP (Largest Contentful Paint):** <2.5s (target)
- **Build time:** ~2-3 min (monitor for regression)
- **ISR revalidate time:** <5s after webhook
- **Uptime:** 99.9% (Vercel + Cloudflare SLA)

### Monitoring Tools
- **Vercel Analytics:** Built-in (Core Web Vitals)
- **Lighthouse CI:** Optional (CI/CD integration)
- **Sanity Activity Log:** Track content changes
- **Supabase Logs:** Database query logs, auth events
- **GitHub Actions:** Workflow run history

### Debugging
- **Build failures:** Check GitHub Actions logs (`npm run build` output)
- **Stale cache:** Check ISR revalidate tag logs in Vercel
- **Webhook not firing:** Verify webhook URL and secret in Sanity settings
- **Contact form not saving:** Check Supabase RLS policies + ADMIN_EMAIL config
- **Email not sending:** Check Resend API key + email address validity
