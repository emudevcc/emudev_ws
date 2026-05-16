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
│  │           Next.js 15 (App Router + next-intl)          │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │  Middleware (Locale Detection & Routing)      │    │   │
│  │  │  • Route / → /en or /es via Accept-Language   │    │   │
│  │  │  • Explicit prefix routing: /en, /es always   │    │   │
│  │  │  • Pass locale to [locale] segment params      │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │  Design Token System (CSS custom properties)  │    │   │
│  │  │  • Dark-first (:root = dark)                  │    │   │
│  │  │  • Light mode via [data-theme="light"]        │    │   │
│  │  │  • 10 color scales, type scale, spacing scale │    │   │
│  │  │  • Tailwind @theme inline mapping             │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │  Page Generation (SSG / ISR / SSR)             │    │   │
│  │  │  • Homepage: SSG × 2 locales (en, es)          │    │   │
│  │  │  • Project list: ISR × 2 locales (per-tag)    │    │   │
│  │  │  • Project detail: SSG per [locale]/[slug]    │    │   │
│  │  │  • Blog list: ISR × 2 locales (per-tag)       │    │   │
│  │  │  • Blog post: SSG per [locale]/[slug]         │    │   │
│  │  │  • Contact: SSR (locale-aware form)           │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │  API Routes & Webhooks                         │    │   │
│  │  │  • POST /api/revalidate-tag (Sanity webhook)   │    │   │
│  │  │    - Validates x-sanity-webhook-secret header  │    │   │
│  │  │    - Revalidates both en & es cache tags       │    │   │
│  │  │  • GET /api/draft-mode/enable (preview token)  │    │   │
│  │  │  • GET /api/draft-mode/disable                 │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │  Server Actions                                │    │   │
│  │  │  • submitContact: form → Supabase → Resend     │    │   │
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
        │ (bilingual)│   │ (encrypted)│
        └────────────┘   └────────────┘
```

---

## Component Layer Detail

### 0. Middleware & Locale Routing (NEW)

#### Middleware Flow

```
User Request (to /, /about, /projects, etc.)
    ↓
middleware.ts (next-intl/middleware)
    ├─ Check if already locale-prefixed (/en/*, /es/*)
    │   └─ If yes: pass through
    ├─ If not (bare path):
    │   ├─ Check Accept-Language header
    │   ├─ Detect locale (en or es)
    │   └─ Rewrite to /[locale]/...
    └─ Pass locale to [locale] segment params
        ↓
[locale]/layout.tsx receives params.locale
    ├─ Wraps with NextIntlClientProvider
    └─ Renders UI with LocaleSwitcher for manual override
```

#### Key Files

- `middleware.ts` — Route all non-API/studio paths through next-intl middleware
- `i18n/routing.ts` — Configuration: `locales: ['en', 'es']`, `defaultLocale: 'en'`, `localePrefix: 'always'`
- `i18n/request.ts` — Locale resolver, message file importer
- `i18n/navigation.ts` — Locale-aware Link, redirect, useRouter helpers

#### Important Constraints

- Explicit locale prefix is **always required**: `/en/about`, `/es/about` (not bare `/about`)
- Root `/` redirects to `/en` (English default)
- API routes and `/studio` are excluded from middleware rewriting
- LocaleSwitcher in nav allows manual EN↔ES toggle

---

### 1. Frontend Layer (Next.js App Router)

#### Page Routes (with Locale Variants)

| Route                       | Generation          | Cache              | Purpose                                                   |
| --------------------------- | ------------------- | ------------------ | --------------------------------------------------------- |
| `/en`, `/es`                | SSG × 2             | 1 hour             | Homepage (hero + featured projects, locale-specific)      |
| `/[locale]/projects`        | ISR × 2             | Tag: `projects`    | Projects list (gallery, skill filter, per-locale content) |
| `/[locale]/projects/[slug]` | SSG (per-route × 2) | Per-route + locale | Project detail page with OG image                         |
| `/[locale]/blog`            | ISR × 2             | Tag: `posts`       | Blog post list (locale-specific)                          |
| `/[locale]/blog/[slug]`     | SSG (per-route × 2) | Per-route + locale | Blog post detail with OG image                            |
| `/[locale]/about`           | SSR                 | None               | Static about page (locale-aware text)                     |
| `/[locale]/contact`         | SSR                 | None               | Contact form (locale-aware labels, validation)            |
| `/studio`                   | SSR                 | None               | Embedded Sanity Studio (root, no locale)                  |
| `/api/draft-mode/enable`    | Route               | None               | Enable Sanity draft mode (root, validatePreviewUrl)       |
| `/api/draft-mode/disable`   | Route               | None               | Disable draft mode (root)                                 |
| `/robots.txt`               | Generated           | Static             | Robots.txt (allow all except /studio, /api, /admin)       |
| `/sitemap.xml`              | Generated           | Static             | XML sitemap with locale variants + priorities             |

#### Dynamic Params (SSG with Per-Locale Variants)

```typescript
// For /[locale]/projects/[slug] and /[locale]/blog/[slug]
export async function generateStaticParams() {
  const projects = (await getProjects()) ?? []
  const locales = ['en', 'es']

  return locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug.current })))
}
```

- During `next build`: generates all static route params × locale count
- Build time grows with content count × number of locales (e.g., 50 projects × 2 locales = 100 routes)
- Each locale gets its own SSG page with bilingual content
- Middleware routes all requests to `/[locale]/...` before reaching pages
- ISR allows on-demand SSG for new content (post-build publication in both locales)

#### SSR Boundary Pattern (Client-Only Components)

Three.js and other browser-only libraries must live behind an SSR boundary. Use the dynamic import shim pattern:

**Pattern:**

```tsx
// hero-background-loader.tsx (Client Component shim)
'use client'
import dynamic from 'next/dynamic'
export const HeroBackground = dynamic(
  () => import('./hero-background').then(m => m.HeroBackground),
  { ssr: false }  // ✅ Valid in Client Component
)

// HeroSection.tsx (Server Component)
import { HeroBackground } from './hero-background-loader'
export function HeroSection() {
  return <HeroBackground />  // Rendered on client; skipped during SSR
}
```

**Why this is necessary:**

- Next.js requires `'use client'` at the top of files using `next/dynamic` with `ssr: false`
- But parent components may need to be Server Components (for `getTranslations()`, database access, etc.)
- The loader shim bridges this: it's a lightweight Client Component that wraps the dynamic import
- During server-side rendering, the loader is skipped entirely
- On the client, the dynamic import loads the heavy 3D library on-demand

**Current usage:** `HeroBackground` particle network uses this pattern to load Three.js only on client.

---

### 2. Content Management (Sanity CMS + Bilingual Schemas)

#### Data Model (14 Document Types with Bilingual Fields)

Bilingual fields use shared factory helpers from `sanity/lib/i18n-helpers.ts`:
- `localizedString()` — single-line bilingual text
- `localizedText()` — multi-line bilingual text
- `localizedSlug()` — locale-specific slugs
- `localizedContent()` — rich text (PortableText)
- `localizedRichText()` — alias for content
- `localizedArray()` — localized array fields

**14 Document Types:**

```
Singletons:
├── SiteSettings { siteName.en/es, description.en/es, role.en/es, logo, avatar, socials, contact }
└── About { title.en/es, bio.en/es, cta.en/es, image }

Portfolio (content):
├── Project { title.en/es, slug, description.en/es, content.en/es, cover, tech[], metrics, liveUrl, repoUrl, publishedAt }
├── Skill { name, category, level, iconSlug, description.en/es }
├── Experience { role.en/es, company, duration, description.en/es, tech[] }
├── Certification { title.en/es, issuer, date, credential, logo }
└── Project Gallery (future variant)

Blog:
├── Post { title.en/es, slug, excerpt.en/es, content.en/es, cover, author, tags[], publishedAt }
├── Author { name, bio, image }
└── Tag { title, slug }

Skills & Credentials:
├── Education { degree.en/es, school, year, field }
├── Language { name, proficiency }
└── Strength { title.en/es, description.en/es }

About Extras:
└── SocialPost { platform, content.en/es, url, date }
└── Testimonial { author, role, content.en/es, image }
```

#### GROQ Queries with Locale Fallback Pattern

```typescript
// Pattern: coalesce(field[$locale], field.en) for graceful fallback
groq`*[_type == "project" && slug.current == $slug][0] {
  ...,
  title: coalesce(title[$locale], title.en),
  description: coalesce(description[$locale], description.en),
  content: coalesce(content[$locale], content.en),
  "tech": tech[]->{ _id, name, category, level, iconSlug },
  "skillRefs": tech[]->{name}
}`
```

- If Spanish content missing: automatically serves English
- No null/broken content in either locale
- Admin only translates what's necessary; English is the safety net
- Reference expansion via `->` (e.g., `tech[]->{name, category}`)

#### ISR Cache Layer with Locale Differentiation

```typescript
// Cache version 'localized-v3' with per-locale keys
export const getProjects = (locale: string) =>
  unstable_cache(
    async () => sanityFetch({ query: GROQ_QUERY, params: { locale } }),
    [`localized-v3-projects-${locale}`],  // Versioned per-locale key
    { tags: ['projects', `projects:${locale}`], revalidate: 3600 }  // Collection + locale tags
  )()

// Webhook revalidates collection tag; instantly clears all locale caches
// lib/sanity-queries.ts: 14+ query functions, all tagged with 'localized-v3' cache version
revalidateTag('projects')  // Revalidates both en and es in <100ms
```

#### Sanity Presentation Tool & Draft Mode

- **URL:** `/studio` (embedded studio component)
- **Preview:** Admin clicks "Presentation" in Sanity UI
- **Enable draft:** GET `/api/draft-mode/enable?secret=...` (validated via `@sanity/preview-url-secret`)
- **Disable draft:** GET `/api/draft-mode/disable`
- **CSP header:** Changed from `X-Frame-Options: DENY` to `frame-ancestors 'self'` (allows iframe)
- **Unpublished content:** Rendered when draft mode cookie is set
- **Both locales:** Draft mode works for both `/en/...` and `/es/...` routes

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
- **RLS policies fixed:** Admin policies correctly reference `app.admin_email` setting

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
User requests Magic Link (locale-aware form)
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
                            └─ User is authenticated (admin)
```

#### Session Management

- Cookies stored securely (HttpOnly, SameSite)
- Refresh tokens handled by Supabase SSR lib
- signOut clears cookies via server action

#### Middleware (Optional)

Can add `middleware.ts` segment to gate `/dashboard` or admin routes:

```typescript
export function middleware(request: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

---

### 5. Email Delivery (Resend)

#### Contact Form Email Flow

```
User submits form (submitContact action, locale-aware labels)
    │
    ├─ Supabase INSERT contact_submissions (authoritative)
    │
    └─ try {
         const resend = new Resend(process.env.RESEND_API_KEY)
         await resend.emails.send(...)
       } catch (err) {
         log error, continue (best-effort)
       }
```

**Key Details:**

- Database insert is the contract; email is a bonus notification
- `new Resend()` instantiated **inside try/catch** at runtime (not module level)
  - Prevents 500 error if `RESEND_API_KEY` missing from env
- Email addresses, subjects, and bodies can be localized based on user's submitted form locale

---

## Data Flows

### Request Flow (Bilingual)

```
User requests /projects/my-cool-app
    ↓
Cloudflare CDN (check cache)
    ├─ If cache hit: return cached HTML
    └─ If cache miss: forward to Vercel
        ↓
Vercel Edge (route request)
    │
    └─ Next.js middleware (locale detection)
        ├─ Extract locale: 'en' (from Accept-Language: en-US, or default)
        └─ Rewrite to /en/projects/my-cool-app
            ↓
[locale]/projects/[slug]/page.tsx (locale='en')
    ├─ Extract params: locale='en', slug='my-cool-app'
    ├─ getProjectBySlug(slug='my-cool-app', locale='en')
    │   ├─ Check cache: key=`project-my-cool-app-en`
    │   └─ If miss: sanityFetch(GROQ with coalesce fallback)
    │       └─ Sanity returns: { title: 'My Cool App', description: '...', ... }
    ├─ getTranslations({ locale: 'en', namespace: 'projects' })
    │   └─ Load messages/en.json 'projects' namespace
    └─ Render HTML with English content + English UI strings
        ↓
Vercel response (HTML + Cache-Control header)
    │
    └─ Cloudflare CDN (store with 1-hour TTL)
        ↓
Browser renders page
```

### Cache Invalidation Flow

```
Admin publishes new version of 'my-cool-app' project in Sanity
    ↓
Sanity webhook POST /api/revalidate-tag
    ├─ Header: x-sanity-webhook-secret = SANITY_REVALIDATE_SECRET ✓
    ├─ Body: { _type: 'project', slug: { current: 'my-cool-app' } }
    └─ Validate secret (reject 401 if mismatch)
        ↓
Extract _type='project' → TAG_MAP['project'] = ['projects']
    │
    ├─ revalidateTag('projects')
    └─ Response: { success: true, revalidatedTags: [...] }
        ↓
Next.js cache invalidates every projects cache entry
    ├─ Clears: `project-my-cool-app-en` cache entry
    ├─ Clears: `project-my-cool-app-es` cache entry
    └─ Next request rebuilds from fresh Sanity data
        ↓
User visits /en/projects/my-cool-app
    ├─ Cache miss (just invalidated)
    ├─ sanityFetch queries fresh data from Sanity
    ├─ HTML rebuilt (ISR)
    └─ Response sent to browser (<5 seconds from publish)
```

---

## SEO & Metadata Management

### Locale-Aware Metadata

Each page with locale variants generates locale-specific metadata at render time:

```typescript
// All locale pages use generateMetadata with locale param
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: `Page Title (${locale.toUpperCase()})`,
    alternates: {
      canonical: `https://emudev.cc/${locale}/path`, // Self-referential canonical
      languages: localeAlternates('/path', locale),  // Hreflang for en, es, x-default
    },
  }
}
```

**Key Implementation Details:**

- **Self-Referential Canonicals** — `/en/about` has canonical `/en/about` (not `/en`)
- **Per-Route Hreflang** — Homepage, projects, blog posts, etc. each generate locale alternates
- **All pages use `generateMetadata`** — not static `export const metadata` (can't access params)
- **`localeAlternates(pathname, locale)` helper** — generates standard hreflang structure:
  ```json
  {
    "rel": "alternate",
    "hreflang": "en",
    "href": "https://emudev.cc/en/path"
  },
  {
    "rel": "alternate",
    "hreflang": "es",
    "href": "https://emudev.cc/es/path"
  },
  {
    "rel": "alternate",
    "hreflang": "x-default",
    "href": "https://emudev.cc/en/path"
  }
  ```

### Sitemap & Robots

- **Dynamic sitemap.ts** — generates `/sitemap.xml` with both `/en/...` and `/es/...` URLs + priorities
- **Hreflang in sitemap** — included via `localeAlternates` function
- **robots.ts** — allows all paths except `/api`, `/studio`, `/admin`

---

## Security Model

### Authentication & Authorization

1. **Public Access** — Portfolio pages publicly accessible (no auth required)
2. **Admin Access** — Magic Link email + allow-list gating
3. **RLS Enforcement** — Database policies prevent unauthorized data access
4. **Webhook Validation** — Header-based secret prevents unauthorized revalidation
5. **Draft Mode Validation** — Token-based preview URL secret prevents unauthorized preview access

### Secret Management

| Secret                          | Storage              | Usage                     | Risk                                             |
| ------------------------------- | -------------------- | ------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | GitHub (public)      | Build-time Sanity queries | Low (non-sensitive)                              |
| `SANITY_REVALIDATE_SECRET`      | GitHub (environment) | Webhook validation        | High (interceptable in logs) → header-based only |
| `SANITY_API_READ_TOKEN`         | GitHub (environment) | Draft content queries     | Medium (read-only) → optional                    |
| `SUPABASE_DB_URL`               | GitHub (environment) | Migrations only           | High (DB access) → restricted to runner          |
| `RESEND_API_KEY`                | GitHub (environment) | Email sending             | High (billing) → instantiated inside try/catch   |
| `ADMIN_EMAIL`                   | GitHub (environment) | Allow-list gating         | Low (email, public)                              |

### Best Practices

- Secrets in **GitHub Environments**, never in code or `.env` committed
- Webhook secrets in **headers**, never query params (prevents log leakage)
- Draft mode tokens validated via `@sanity/preview-url-secret` library (prevents open redirect)
- RLS policies enforce at database layer (defense in depth)
- HTML escaping in email content (prevents injection)
- CSP headers restrict iframe embedding (`frame-ancestors 'self'`)

---

## Performance Characteristics

### Build Time

| Phase                                 | Duration     |
| ------------------------------------- | ------------ |
| Lint (ESLint)                         | ~20s         |
| Typecheck (TypeScript)                | ~15s         |
| Generate static params (both locales) | ~10s         |
| Next.js build                         | ~80s         |
| **Total**                             | **~2-3 min** |

### Static Rendering (Per-Locale)

| Content Type | Routes            | Locale Variants | Total Pages        |
| ------------ | ----------------- | --------------- | ------------------ |
| Homepage     | 1                 | 2 (en, es)      | 2                  |
| Projects     | 1 list + N detail | 2               | 2 + (2 × projects) |
| Blog         | 1 list + M detail | 2               | 2 + (2 × posts)    |
| About        | 1                 | 2               | 2                  |
| Contact      | 1                 | 2               | 2                  |
| **Typical**  | **~10 routes**    | **2 locales**   | **~50-100 pages**  |

### Cache Strategy

| Content Type            | Strategy                 | TTL    | Revalidation                        |
| ----------------------- | ------------------------ | ------ | ----------------------------------- |
| Static assets (CSS, JS) | Cloudflare cache         | 1 year | Manual purge                        |
| Homepage                | ISR                      | 1 hour | Webhook on publish                  |
| Projects list           | ISR (locale cache key)   | 1 hour | Webhook on project or skill publish |
| Project detail          | SSG (per-route × locale) | 1 hour | Webhook on project publish          |
| Blog list               | ISR (per-locale)         | 1 hour | Webhook on post publish             |
| Blog detail             | SSG (per-route × locale) | 1 hour | Webhook on post publish             |
| API routes              | Bypass                   | —      | N/A                                 |
| Studio                  | Bypass                   | —      | N/A                                 |

### Lighthouse Metrics (Targets)

| Metric                             | Target |
| ---------------------------------- | ------ |
| **FCP** (First Contentful Paint)   | <1.5s  |
| **LCP** (Largest Contentful Paint) | <2.5s  |
| **CLS** (Cumulative Layout Shift)  | <0.1   |
| **Performance Score**              | >90    |
| **Accessibility Score**            | >95    |
| **Best Practices Score**           | >95    |
| **SEO Score**                      | >95    |

---

## Deployment Pipeline

### GitHub Actions Workflow

```
Feature branch push
    ↓
CI workflow (lint, typecheck, build)
    ├─ All checks pass: PR ready
    └─ Any fail: PR blocked
        ↓
Merge PR to develop
    │
    └─ Deploy workflow triggers
        ├─ Supabase migrations (if any)
        ├─ Build Next.js
        ├─ Deploy to Vercel (preview)
        ├─ Wait 15s for Cloudflare propagation
        ├─ Run smoke tests (static + integration suites)
        └─ Purge Cloudflare cache
            ↓
Preview URL generated (emudev-ws-dev.vercel.app)
    ↓
Merge PR to main
    │
    └─ Deploy workflow triggers
        ├─ Supabase migrations (production)
        ├─ Build Next.js
        ├─ Deploy to Vercel (production)
        ├─ Wait 15s for Cloudflare propagation
        ├─ Run smoke tests against emudev.cc
        ├─ Purge Cloudflare cache (full zone)
        └─ Create release tag (prod-YYYYMMDD-HHMMSS)
            ↓
Production live at https://emudev.cc (both /en and /es)
```

### Environments

| Environment | Branch  | Domain            | Deploy Gate     | Approval      |
| ----------- | ------- | ----------------- | --------------- | ------------- |
| Development | develop | Vercel auto       | None            | Auto-deploy   |
| Staging     | staging | staging.emudev.cc | None (optional) | Manual        |
| Production  | main    | emudev.cc         | None (auto)     | Manual via UI |

---

## Monitoring & Alerting

### Key Metrics

- **Uptime** — Vercel + Cloudflare monitoring (99.9% target)
- **Error Rate** — Vercel logs + Sentry (if integrated)
- **Cache Hit Ratio** — Cloudflare analytics (>80% target)
- **Build Time** — GitHub Actions logs (<3 min target)
- **Test Coverage** — Static and browser smoke suites run in CI/deploy gates

### Tools

- **Vercel Analytics** — Core Web Vitals, real user monitoring
- **Lighthouse CI** — Build-time performance checking
- **Cloudflare Analytics** — Traffic, cache, WAF insights
- **Sanity Activity Log** — Content change history
- **Supabase Logs** — Database query analysis, auth events
- **GitHub Actions** — CI/CD status, workflow insights

---

## Disaster Recovery

| Scenario                | RTO    | RPO      | Recovery                                       |
| ----------------------- | ------ | -------- | ---------------------------------------------- |
| **Database corruption** | 1 hour | 24 hours | Supabase automated backups (retained 7 days)   |
| **Cache poisoning**     | 5 min  | 0        | Manual Cloudflare purge + webhook revalidation |
| **Secret exposure**     | 15 min | 0        | Rotate GitHub secret + redeploy                |
| **Vercel outage**       | 30 min | 0        | Fallback to static HTML (cached in Cloudflare) |
| **Sanity CMS down**     | 1 hour | 1 hour   | Serve cached content; display notice to admin  |

### Backup Strategy

- **Sanity:** Built-in versioning; export periodic snapshots (manual)
- **Supabase:** Automated daily backups; 7-day retention
- **Code:** GitHub repo (git history); releases tagged
- **DNS:** Cloudflare nameservers (resilient to registrar issues)
