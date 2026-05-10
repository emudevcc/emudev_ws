# emudev Codebase Summary

## Directory Structure

```
emudev_ws/
├── app/                          # Next.js App Router pages & actions
│   ├── api/
│   │   ├── revalidate-tag/route.ts    # Sanity webhook endpoint
│   │   └── draft-mode/
│   │       ├── enable/route.ts        # Enable Next.js draft mode
│   │       └── disable/route.ts       # Disable draft mode
│   ├── actions/                  # Server actions (contact, auth)
│   ├── layout.tsx                # Root layout + metadata
│   ├── page.tsx                  # Homepage (hero + featured projects)
│   ├── about/page.tsx            # About page
│   ├── projects/
│   │   ├── page.tsx              # Projects list (ISR)
│   │   └── [slug]/
│   │       ├── page.tsx          # Project detail (SSG per-route)
│   │       └── opengraph-image.tsx # Dynamic OG image (1200×630)
│   ├── blog/
│   │   ├── page.tsx              # Blog list (ISR)
│   │   └── [slug]/
│   │       ├── page.tsx          # Blog post (SSG per-route)
│   │       └── opengraph-image.tsx # Dynamic OG image (1200×630)
│   ├── contact/page.tsx          # Contact page with form
│   ├── robots.ts                 # Robots.txt generator
│   ├── sitemap.ts                # Dynamic XML sitemap
│   └── studio/[[...tool]]/page.tsx # Sanity Studio (embedded)
│
├── components/                   # React components
│   ├── contact-form.tsx          # Contact form (useActionState)
│   ├── portable-text-renderer.tsx # @portabletext/react for rich text
│   ├── project-card.tsx          # Project card in grids
│   ├── post-card.tsx             # Blog post preview card
│   ├── tag-filter.tsx            # Client component for tag filtering
│   ├── site-nav.tsx              # Navigation + auth state
│   └── ui/hero-section.tsx       # Animated hero on homepage
│
├── lib/                          # Utilities & clients
│   ├── sanity-client.ts          # createClient + sanityFetch helper
│   ├── sanity-queries.ts         # GROQ queries with unstable_cache
│   ├── supabase-server.ts        # createSupabaseServerClient
│   └── supabase-browser.ts       # createSupabaseBrowserClient
│
├── types/
│   ├── sanity.types.ts           # Hand-written Sanity type stubs
│   └── supabase.types.ts         # Generated via `supabase gen types`
│
├── sanity/
│   ├── schemas/                  # Sanity document types
│   │   ├── project-type.ts       # Project document schema
│   │   ├── post-type.ts          # Post document schema
│   │   ├── author-type.ts        # Author reference
│   │   ├── tag-type.ts           # Tag reference
│   │   └── site-settings-type.ts # Global settings
│   └── structure.ts              # Sanity Studio desk structure
│
├── supabase/
│   └── migrations/               # SQL migrations
│       ├── 001_create-contact-submissions.sql
│       ├── 002_create-rls-policies.sql
│       └── 003_set-admin-email.sql
│
├── tests/
│   └── smoke/pages.spec.ts       # Playwright smoke tests
│
├── .github/workflows/            # CI/CD pipelines
│   ├── ci.yml                    # PR: lint, typecheck, build
│   ├── deploy.yml                # 3-env deploy w/ CF cache purge (dev=prefix, staging/prod=full)
│   └── hotfix.yml                # Hotfix workflow
│
├── .claude/rules/                # Project development rules
├── docs/                         # This documentation suite
├── next.config.ts                # Security headers, image config
├── tailwind.config.ts            # Tailwind CSS v4 config
├── tsconfig.json                 # TypeScript config
├── prettier.config.js            # Formatter config
├── eslint.config.mjs             # ESLint v10 flat config
├── .husky/                       # Git hooks (Prettier lint-staged)
└── package.json                  # Dependencies & scripts
```

---

## File Purposes & LOC

| File | LOC | Purpose |
|------|-----|---------|
| `types/sanity.types.ts` | 334 | Generated Sanity document types (Project, Post, Author, Tag, SiteSettings) |
| `types/supabase.types.ts` | 188 | Generated Supabase table types (contact_submissions, auth.users, etc.) |
| `lib/sanity-queries.ts` | 133 | ISR-cached GROQ queries (getProjects, getPosts, getSiteSettings, getProjectBySlug, getPostBySlug) with 1-hour revalidate |
| `components/contact-form.tsx` | 83 | React 19 useActionState form with validation feedback |
| `app/projects/[slug]/page.tsx` | 82 | Dynamic project detail page (SSG per route) |
| `components/project-card.tsx` | 56 | Reusable project card for grids |
| `app/actions/contact.ts` | 54 | Server action: validate → Supabase insert → Resend email |
| `app/blog/[slug]/page.tsx` | 52 | Dynamic blog post page (SSG per route) |
| `components/portable-text-renderer.tsx` | 46 | Rich text rendering for Sanity content |
| `app/blog/page.tsx` | 43 | Blog list page (ISR) |
| `app/api/revalidate-tag/route.ts` | 41 | Sanity webhook handler → revalidateTag (validates x-sanity-webhook-secret header) |
| `components/ui/hero-section.tsx` | 39 | Animated hero with name + bio |
| `tests/smoke/pages.spec.ts` | 35 | Playwright smoke tests for all routes |
| `sanity/schemas/project-type.ts` | 33 | Sanity project schema |
| `components/site-nav.tsx` | 30 | Navigation + auth state display |
| `app/page.tsx` | 30 | Homepage with hero + featured projects |
| `app/layout.tsx` | 28 | Root layout with metadata |
| `lib/sanity-client.ts` | 29 | Sanity client initialization + sanityFetch |
| `sanity/schemas/post-type.ts` | 27 | Sanity post schema |
| `app/projects/page.tsx` | 27 | Projects list page (ISR) |
| `app/actions/auth.ts` | 27 | sendMagicLink + signOut server actions |
| `components/post-card.tsx` | ~25 | Blog post preview card (date, title, excerpt, author) |
| `app/blog/[slug]/opengraph-image.tsx` | ~20 | Dynamic OG image for blog posts (1200×630, dark gradient) |
| `app/projects/[slug]/opengraph-image.tsx` | ~20 | Dynamic OG image for projects (1200×630, title + description) |
| `components/tag-filter.tsx` | ~18 | Client component for project filtering by tags |
| `app/api/draft-mode/enable/route.ts` | ~15 | Enable Next.js draft mode with secret validation |
| `app/api/draft-mode/disable/route.ts` | ~10 | Disable draft mode and redirect to home |
| `app/robots.ts` | ~8 | Robots.txt generator (allow all except /studio, /api, /admin) |
| `app/sitemap.ts` | ~30 | Dynamic XML sitemap with ISR entries + priorities |
| `lib/supabase-server.ts` | 21 | createSupabaseServerClient (cookie-based) |
| `lib/supabase-browser.ts` | 7 | createSupabaseBrowserClient (browser context) |

---

## Data Flow

### Content Publishing (CMS → Cache → Page)

```
Sanity Studio (publish)
    ↓
Sanity Webhook POST /api/revalidate-tag
    ↓ (validate secret in x-sanity-webhook-secret header)
Next.js revalidateTag(tags)
    ↓
unstable_cache cleanup
    ↓
ISR revalidates on next page visit or scheduled
    ↓
User sees fresh content
```

**Key files:** `app/api/revalidate-tag/route.ts`, `lib/sanity-queries.ts`, `app/actions/contact.ts`

### Contact Form Submission (Client → DB → Email)

```
User fills contact form
    ↓
submitContact (server action)
    ↓
Validate: name, email, message
    ↓
Supabase RLS: anon can INSERT
    ↓
await resend.emails.send() (best-effort, wrapped in try/catch)
    ↓
Return success/error state
    ↓
useActionState updates form with message
```

**Key files:** `components/contact-form.tsx`, `app/actions/contact.ts`, `supabase/migrations/002_create-rls-policies.sql`

### Static Site Generation (SSG per Route)

```
next build
    ↓
generateStaticParams([slug]) for each project/post
    ↓
sanityFetch queries (null-guarded if no env vars)
    ↓
HTML pages cached at build time
    ↓
getProjectBySlug(slug) returns null on missing content
    ↓
notFound() renders 404 page
```

**Key files:** `app/projects/[slug]/page.tsx`, `app/blog/[slug]/page.tsx`, `lib/sanity-queries.ts`

---

## Key Architectural Patterns

### 1. ISR with `unstable_cache` + Tags

**Why not `'use cache'`?** Not available in Next.js 15.5 (requires canary).

**Pattern:**
```typescript
export const getProjects = unstable_cache(
  async () => sanityFetch({ query: GROQ_QUERY }),
  ['projects'], // cache key
  { tags: ['projects'], revalidate: 3600 } // 1 hour TTL + tag
)
```

- Queries cached for 1 hour
- Webhook calls `revalidateTag('projects')` → immediate invalidation on publish
- Fallback to time-based revalidate if webhook fails
- All callers use null-coalescing: `(await getProjects()) ?? []`

### 2. Build-Time Safety: Null Guards

**Problem:** Build runs without Sanity env vars; queries would fail.

**Solution:**
```typescript
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
if (!projectId) return null as T // in sanityFetch
// Callers: const projects = (await getProjects()) ?? []
```

- `sanityFetch` returns `null as T` when `projectId` missing
- All query callers use `?? []` or `?? null` to handle build-time data absence
- Build succeeds with placeholder data; real data loaded at deploy time

### 3. Server Actions with Validation

**Pattern:**
```typescript
export async function submitContact(_prevState, formData) {
  // 1. Validate input
  // 2. Access Supabase (runs on server, private key never exposed)
  // 3. Call external services (Resend)
  // 4. Return state (error | success)
}
// Client: const [state, action] = useActionState(submitContact, null)
```

- Form validation on server (no client-side bypass)
- HTML escaping before email to prevent injection
- Resend wrapped in try/catch (DB insert is authoritative, email is best-effort)

### 4. Supabase RLS for Public/Admin Access

**Policies:**
- **Public (anon role):** `INSERT INTO contact_submissions` allowed, no SELECT
- **Admin (authenticated):** `SELECT` + `DELETE` gated on `auth.jwt()->'email' = app.admin_email`

**Usage:**
- Contact form uses anon client (no auth required)
- Admin dashboard uses service role or authenticated client with admin email

### 5. Sanity Webhook Secret Validation

**Pattern:**
```typescript
const secret = req.headers.get('x-sanity-webhook-secret')
if (secret !== process.env.SANITY_REVALIDATE_SECRET) return 401
```

- Secret passed in **header**, never query params (would leak in logs)
- Validated before any revalidateTag call
- Response includes revalidated tags for audit trail

---

## Environment Variable Model

### Public (Build-Time)
- `NEXT_PUBLIC_SANITY_PROJECT_ID` — Sanity project ID (required for SSG)
- `NEXT_PUBLIC_SANITY_DATASET` — Sanity dataset (defaults to 'production')
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key (safe to expose)
- `NEXT_PUBLIC_SITE_URL` — Canonical site URL (for metadata)
- `NEXT_PUBLIC_SITE_DOMAIN` — Domain for email From: (e.g., emudev.cc)

### Private (Runtime & Build)
- `SANITY_API_READ_TOKEN` — Preview draft content (optional)
- `SANITY_REVALIDATE_SECRET` — Webhook secret (must match in Sanity settings)
- `SUPABASE_DB_URL` — Postgres connection (for migrations only)
- `SUPABASE_PAT` — Supabase personal access token (for `supabase db push`)
- `RESEND_API_KEY` — Resend transactional email API
- `ADMIN_EMAIL` — Allow-list for sendMagicLink (comma-separated)

### Environment-Level (GitHub Secrets)
Repo has 3 environments: `development`, `staging`, `production`
Each has isolated copies of the above secrets.

---

## Code Quality Standards

- **TypeScript:** Strict mode; hand-written types for Sanity (not codegen in this phase)
- **Naming:** camelCase for variables/functions, PascalCase for components/types
- **Comments:** Explain "why" for non-obvious logic (ISR revalidate strategy, RLS policies)
- **Null Handling:** Explicit null guards; prefer `?? []` over `||` for falsy checks
- **Error Handling:** Server actions return structured state; client displays user-friendly messages
- **Security:** No credentials in code/comments; secrets in GitHub Environments; HTML escaping in email

---

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 15.5.18 | App Router, SSG/ISR, server actions |
| `react` | 19.2.6 | UI library |
| `next-sanity` | 5.5.11 | Sanity client + next/cache integration |
| `@sanity/visual-editing` | ^4.0.3 | Draft mode / Presentation Tool (v5 requires Next.js 16) |
| `@portabletext/react` | 6.2.0 | Rich text rendering |
| `@supabase/ssr` | 0.10.3 | Cookie-based Supabase client |
| `resend` | 6.12.3 | Transactional email API |
| `sanity` | 3.99.0 | Sanity Studio + schema definitions |
| `tailwindcss` | 4.0 | Utility-first CSS |
| `typescript` | 5.9.3 | Type safety |
| `eslint` | ^9 | Linting (v10 incompatible with eslint-plugin-react@7.x) |
| `@playwright/test` | 1.59.1 | E2E smoke tests |

---

## Build & Runtime Characteristics

- **Build Time:** ~2-3 min (lint, typecheck, generate static params, build)
- **Node Version:** 20.x (see `.github/workflows/ci.yml`)
- **Package Manager:** npm (lock file tracked)
- **Turbopack:** Enabled in dev (`next dev --turbopack`)
- **CSS:** Tailwind v4 (no PostCSS config needed, bundled in `@tailwindcss/postcss`)
- **Linting:** ESLint v9 flat config (v9 + eslint-config-next@16 working combo); Prettier via lint-staged on commit

## Sanity Draft Mode & Presentation Tool

### How It Works

```
Sanity Studio (embedded at /studio or external)
    ↓
Admin clicks "Presentation"
    ↓
Opens Sanity Presentation Tool (preview UI)
    ↓
GET /api/draft-mode/enable?secret=... (validated via @sanity/preview-url-secret)
    ↓
Sets Next.js draft mode cookie
    ↓
GET /api/draft-mode/disable (clears draft mode)
    ↓
Page renders unpublished content in draft mode
```

### Key Files

- `app/api/draft-mode/enable/route.ts` — Validates preview secret via `validatePreviewUrl()` from `@sanity/preview-url-secret`
- `app/api/draft-mode/disable/route.ts` — Clears draft mode cookie
- `components/sanity-visual-editing.tsx` — `SanityVisualEditing` wrapper in root layout
- `next.config.ts` — CSP header changed from `X-Frame-Options: DENY` to `frame-ancestors 'self'` (allows studio iframe)

### Environment Variables (Build-Time Baked into Studio Bundle)

- `SANITY_STUDIO_PREVIEW_URL` — Canonical site URL for preview links (e.g., `https://emudev.cc`)
- `SANITY_STUDIO_REVALIDATE_SECRET` — Secret for validating preview requests (must match webhook secret)
- `SANITY_API_READ_TOKEN` — Viewer token for draft content access (optional, for explicit draft fetches)

**Note:** These `SANITY_STUDIO_*` vars are injected at build time into the Sanity Studio bundle, not accessed by Next.js routes.
