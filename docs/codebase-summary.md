# emudev Codebase Summary

## Directory Structure

```
emudev_ws/
├── app/                          # Next.js App Router pages & actions
│   ├── api/
│   │   ├── revalidate-tag/route.ts    # Sanity webhook endpoint (collection cache tags)
│   │   └── draft-mode/
│   │       ├── enable/route.ts        # Enable Next.js draft mode (validatePreviewUrl)
│   │       └── disable/route.ts       # Disable draft mode, redirect to home
│   ├── actions/                  # Server actions (contact, auth)
│   ├── layout.tsx                # Root layout (stripped shell)
│   ├── page.tsx                  # Root page (redirect to /en)
│   ├── [locale]/                 # Locale-prefixed routes (en, es) [NEW]
│   │   ├── layout.tsx            # Fonts (Inter + JetBrains Mono) + NextIntlClientProvider + ThemeProvider; DotPattern with twinkle animation
│   │   ├── page.tsx              # Homepage (hero + featured projects)
│   │   ├── about/page.tsx        # About page
│   │   ├── projects/
│   │   │   ├── page.tsx          # Projects list (ISR × 2 locales, collection cache tag)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx      # Project detail (SSG per-route × 2 locales)
│   │   │       └── opengraph-image.tsx # Dynamic OG image (1200×630)
│   │   ├── blog/
│   │   │   ├── page.tsx          # Blog list (ISR × 2 locales)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx      # Blog post (SSG per-route × 2 locales)
│   │   │       └── opengraph-image.tsx # Dynamic OG image (1200×630)
│   │   └── contact/page.tsx      # Contact page with form
│   ├── robots.ts                 # Robots.txt generator
│   ├── sitemap.ts                # Dynamic XML sitemap (with locale variants)
│   └── studio/[[...tool]]/page.tsx # Sanity Studio (root, no locale)
│
├── components/                   # React components
│   ├── locale-switcher.tsx       # Client component; EN↔ES toggle
│   ├── contact-form.tsx          # Contact form (useActionState)
│   ├── portable-text-renderer.tsx # @portabletext/react for rich text
│   ├── project-card.tsx          # Project card in grids
│   ├── post-card.tsx             # Blog post preview card
│   ├── tag-filter.tsx            # Client component for tag filtering
│   ├── site-nav.tsx              # Navigation + LocaleSwitcher (async server)
│   ├── sanity-visual-editing.tsx # SanityVisualEditing wrapper for draft mode
│   ├── sections/                 # [NEW] 11-section portfolio layout
│   │   ├── hero-section.tsx           # Hero with name, bio, CTA
│   │   ├── about-section.tsx          # About biography + fun facts
│   │   ├── experience-timeline.tsx    # Vertical timeline with MagicCards
│   │   ├── skills-section.tsx         # 2×2 skill tiles
│   │   ├── projects-grid.tsx          # Project gallery with filter + Lens
│   │   ├── credentials-section.tsx    # Certifications + education + languages
│   │   ├── writing-list.tsx           # Blog posts list
│   │   ├── social-posts-grid.tsx      # Section wrapper for SocialFeedGrid (platform filter + 3-col grid)
│   │   ├── strengths-card.tsx         # CliftonStrengths cards
│   │   ├── contributions-card.tsx     # GitHub contributions heatmap
│   │   ├── footer-section.tsx         # Async server component: brand column, Navigate + Explore nav columns, copyright bar
│   │   └── contact-section.tsx        # Contact form + CTA
│   ├── ui/                       # UI primitives
│       ├── hero-background.tsx           # Three.js particle network (110 nodes, accent connections)
│       ├── hero-background-loader.tsx    # SSR-safe dynamic import shim (ssr: false)
│       ├── hero-section.tsx              # Animated hero on homepage
│       ├── animated-shiny-text.tsx       # MagicUI: shimmer text gradient
│       ├── avatar-circles.tsx            # MagicUI: overlapping avatar stack
│       ├── blur-fade.tsx                 # MagicUI: scroll-in blur + fade animation
│       ├── border-beam.tsx               # MagicUI: animated border on cards
│       ├── dock.tsx                      # MagicUI: macOS-style magnifying dock
│       ├── dot-pattern.tsx               # MagicUI: SVG dot grid background (hydration fix: conditional glow defs)
│       ├── interactive-hover-button.tsx  # MagicUI: hover-reveal CTA button
│       ├── lang-theme-toggle.tsx         # [UPDATED] Lang + theme toggle (useSyncExternalStore hydration fix)
│       ├── lens.tsx                      # MagicUI Pro: zoom-on-hover image lens
│       ├── magic-card.tsx                # MagicUI Pro: mouse-spotlight card
│       ├── marquee.tsx                   # MagicUI: infinite scroll marquee
│       ├── number-ticker.tsx             # MagicUI: animated count-up number
│       ├── page-transition.tsx           # [NEW] Client component: opacity/y/blur animation on route change (keyed by pathname)
│       ├── shimmer-button.tsx            # MagicUI: shimmer-effect submit button
│       └── social-platform-icon.tsx      # Inline SVG brand icons for 9 platforms (github/linkedin/twitter/x/youtube/instagram/reddit/spotify/email)
│
├── hooks/                        # Custom React hooks
│   └── use-active-section.ts     # [NEW] Scroll tracking for active section highlighting in nav
│
├── i18n/                         # Internationalization config [NEW]
│   ├── routing.ts                # defineRouting({ locales: ['en', 'es'], defaultLocale: 'en', localePrefix: 'always' })
│   ├── request.ts                # getRequestConfig; resolves locale + imports messages
│   └── navigation.ts             # locale-aware Link, redirect, useRouter, getPathname
│
├── messages/                     # Translation files [NEW]
│   ├── en.json                   # English: nav, home, about, blog, contact, projects, common strings
│   └── es.json                   # Spanish translations (exact key structure parity)
│
├── middleware.ts                 # next-intl middleware; routes /... → /[locale]/... [NEW]
│
├── lib/                          # Utilities & clients
│   ├── design-tokens.ts          # Typed `as const` design token exports (colors, spacing, radii, typography, shadow, motion)
│   ├── sanity-client.ts          # createClient + sanityFetch helper
│   ├── sanity-queries.ts         # GROQ queries with unstable_cache + locale cache keys
│   ├── supabase-server.ts        # createSupabaseServerClient
│   ├── supabase-browser.ts       # createSupabaseBrowserClient
│   ├── metadata.ts               # [UPDATED] Metadata helpers (localeAlternates now accepts optional locale param)
│   ├── content.ts                # [NEW] Content aggregation for portfolio sections
│   ├── github.ts                 # [NEW] GitHub API client for contributions heatmap
│   └── utils.ts                  # cn() utility (clsx + tailwind-merge)
│
├── types/
│   ├── sanity.types.ts           # Generated Sanity schema types
│   └── supabase.types.ts         # Generated via `supabase gen types`
│
├── sanity/
│   ├── lib/i18n-helpers.ts       # Shared localized schema field factories
│   ├── schemas/                  # 14 Sanity document types with bilingual fields
│   │   ├── project-type.ts       # Project schema with cover, tech refs, metrics
│   │   ├── post-type.ts          # Post schema with cover, status, authorOverride
│   │   ├── site-settings-type.ts # Global identity/contact/settings singleton
│   │   └── *-type.ts             # About, skills, experience, credentials, extras
│   ├── seed/                     # [NEW] Seed data for initial content population
│   │   ├── 01-site-settings.ndjson  # Global settings, identity, social links
│   │   ├── 02-about.ndjson          # About singleton (bilingual bio)
│   │   ├── 03-experience.ndjson     # 4 experience documents
│   │   ├── 04-skills.ndjson         # 17 skill documents
│   │   ├── 05-certifications.ndjson # Certifications
│   │   ├── 05-education.ndjson      # Education
│   │   ├── 05-languages.ndjson      # Languages
│   │   ├── 06-strengths.ndjson      # 5 CliftonStrengths
│   │   ├── 07-projects.ndjson       # 3 portfolio projects
│   │   └── seed.sh                  # Merge + import script
│   └── structure.ts              # Grouped Studio desk structure + singletons
│
├── supabase/
│   └── migrations/               # SQL migrations
│       ├── 001_create-contact-submissions.sql
│       ├── 002_create-rls-policies.sql
│       └── 003_set-admin-email.sql
│
├── tests/
│   └── smoke/
│       ├── pages.spec.ts              # Browser smoke tests for routes
│       ├── i18n-bilingual.spec.ts     # i18n static + integration smoke tests
│       └── content-model.spec.ts      # Sanity schema/query static contracts
│
├── .github/workflows/            # CI/CD pipelines
│   ├── ci.yml                    # PR: lint, typecheck, build
│   ├── deploy.yml                # 3-env deploy w/ CF cache purge (per-locale revalidation)
│   └── hotfix.yml                # Hotfix workflow
│
├── .claude/rules/                # Project development rules
├── docs/                         # This documentation suite
├── next.config.ts                # Security headers, image config, i18n plugin wrapper
├── tailwind.config.ts            # Tailwind CSS v4 config
├── components.json               # shadcn/ui component config (aliases, style, baseColor)
├── tsconfig.json                 # TypeScript config
├── prettier.config.js            # Formatter config
├── eslint.config.mjs             # ESLint v9 flat config
├── .husky/                       # Git hooks (Prettier lint-staged)
└── package.json                  # Dependencies & scripts
```

---

## File Purposes & LOC

| File                                               | LOC  | Purpose                                                                           |
| -------------------------------------------------- | ---- | --------------------------------------------------------------------------------- |
| `types/sanity.types.ts`                            | ~900 | Generated Sanity document types for the 14-type content model                     |
| `types/supabase.types.ts`                          | 188  | Generated Supabase table types (contact_submissions, auth.users, etc.)            |
| `lib/sanity-queries.ts`                            | ~550 | 14+ ISR-cached GROQ queries, locale-v3 cache keys, coalesce fallback, collection tags |
| `lib/design-tokens.ts`                              | 125  | Typed `as const` design tokens (colors, spacing, radii, typography, shadow, motion) for programmatic component access |
| `sanity/lib/i18n-helpers.ts`                        | ~80  | 6 shared localized field factories (localizedString, localizedText, localizedSlug, etc.) |
| `components/contact-form.tsx`                      | 83   | React 19 useActionState form with validation feedback                             |
| `app/[locale]/projects/[slug]/page.tsx`            | 82   | Dynamic project detail page (SSG per route per locale)                            |
| `components/project-card.tsx`                      | 56   | Reusable project card for grids                                                   |
| `app/actions/contact.ts`                           | 54   | Server action: validate → Supabase insert → Resend email                          |
| `app/[locale]/blog/[slug]/page.tsx`                | 52   | Dynamic blog post page (SSG per route per locale)                                 |
| `components/portable-text-renderer.tsx`            | 46   | Rich text rendering for Sanity content                                            |
| `app/[locale]/blog/page.tsx`                       | 43   | Blog list page (ISR with locale cache keys)                                       |
| `app/api/revalidate-tag/route.ts`                  | 41   | Sanity webhook handler → revalidateTag (validates x-sanity-webhook-secret header) |
| `components/ui/lang-theme-toggle.tsx`             | ~40  | Language + theme toggle; uses `useSyncExternalStore` for hydration safety          |
| `components/ui/hero-section.tsx`                   | 39   | Animated hero with name + bio                                                     |
| `tests/smoke/pages.spec.ts`                        | 35   | Playwright smoke tests for original routes                                        |
| `tests/smoke/i18n-bilingual.spec.ts`               | ~190 | Playwright smoke tests for i18n routing, message key parity, locale rendering     |
| `tests/smoke/content-model.spec.ts`                | ~95  | Static contracts: 14 schema types, 6 i18n helpers, query exports, cache version   |
| `sanity/schemas/project-type.ts`                   | ~90  | Sanity project schema with bilingual fields, cover, tech, gallery, metrics        |
| `components/site-nav.tsx`                          | 30   | Navigation + LocaleSwitcher (async server)                                        |
| `app/[locale]/page.tsx`                            | 30   | Homepage with hero + featured projects (per-locale)                               |
| `app/layout.tsx`                                   | 28   | Root layout (stripped shell)                                                      |
| `lib/sanity-client.ts`                             | 29   | Sanity client initialization + sanityFetch                                        |
| `sanity/schemas/post-type.ts`                      | 27   | Sanity post schema with bilingual fields                                          |
| `app/[locale]/projects/page.tsx`                   | 27   | Projects list page (ISR with per-locale tags)                                     |
| `app/actions/auth.ts`                              | 27   | sendMagicLink + signOut server actions                                            |
| `components/post-card.tsx`                         | 25   | Blog post preview card (date, title, excerpt, author)                             |
| `components/locale-switcher.tsx`                   | ~22  | Client component for EN↔ES toggle [NEW]                                           |
| `app/[locale]/blog/[slug]/opengraph-image.tsx`     | 20   | Dynamic OG image for blog posts (1200×630, dark gradient)                         |
| `app/[locale]/projects/[slug]/opengraph-image.tsx` | 20   | Dynamic OG image for projects                                                     |
| `components/tag-filter.tsx`                        | 18   | Client component for project filtering by skills/tech                             |
| `components/sections/HeroSection.tsx`              | ~124 | Hero with avatar, name, title, bio, CTA buttons, and 4 stat anchor links (projects/skills/credentials/social) with hover brightening + ArrowRight affordance |
| `components/sections/about-section.tsx`            | ~70  | About biography with fun facts and call-to-action                                 |
| `components/sections/experience-timeline.tsx`      | ~100 | Vertical timeline with MagicCard experience rows                                   |
| `components/sections/skills-section.tsx`           | ~60  | 2×2 skill tiles with categories and level indicators                              |
| `components/sections/projects-grid.tsx`            | ~90  | Project gallery with tag filter, MagicCard, BorderBeam, and Lens                  |
| `components/sections/credentials-section.tsx`      | ~80  | Certifications, education, and language credentials display                       |
| `components/sections/writing-list.tsx`             | ~50  | Blog posts list with date, title, excerpt, and author                             |
| `components/sections/social-posts-grid.tsx`        | 25   | Section wrapper; passes dummy items to SocialFeedGrid                             |
| `components/ui/social-feed-grid.tsx`               | ~135 | Client component: 7 platform filter tabs, 3-col responsive grid, BlurFade animations. Exports `SocialFeedGrid`, `SocialItem`. Pagination implemented: PAGE_SIZE=6, prev/next buttons, page counter; filter tab click resets to page 1; BlurFade key: `${id}-p${page}` forces re-animation on pagination |
| `components/ui/social-feed-card.tsx`               | ~157 | Individual social card: platform config map, MediaPlaceholder (YT/TikTok/IG), engagement metrics (views/likes/comments/shares), `fmt()` helper |
| `components/ui/social-platform-icon.tsx`           | ~108 | Inline SVG brand icons (no external dep): 9 platforms — github/linkedin/twitter/x/youtube/instagram/reddit/spotify filled paths (simple-icons CC0) + email stroke + globe fallback. `SocialPlatformIcon` props: `platform`, `size=16` |
| `components/sections/strengths-card.tsx`           | ~60  | CliftonStrengths cards with descriptions                                          |
| `components/sections/contributions-card.tsx`       | ~70  | GitHub contributions heatmap (calendar visualization)                             |
| `components/sections/FooterSection.tsx`            | ~103 | Async server component: brand column (name/tagline + social icon links via `SocialPlatformIcon`), Navigate col (Home/Blog/Projects/Contact), Explore col (About/Experience/Skills/Credentials), copyright bar. i18n via `getTranslations`/`getLocale`. Props: `settings?: SiteSettings` |
| `components/sections/contact-section.tsx`          | ~80  | Contact form section with MagicCard wrapper                                       |
| `app/api/draft-mode/enable/route.ts`               | 15   | Enable Next.js draft mode with validatePreviewUrl                                 |
| `app/api/draft-mode/disable/route.ts`              | 10   | Disable draft mode and redirect to home                                           |
| `i18n/routing.ts`                                  | ~8   | defineRouting config (locales, defaultLocale, localePrefix) [NEW]                 |
| `i18n/request.ts`                                  | ~10  | getRequestConfig, message importing [NEW]                                         |
| `i18n/navigation.ts`                               | ~12  | locale-aware Link, redirect, useRouter [NEW]                                      |
| `middleware.ts`                                    | 9    | next-intl/middleware setup [NEW]                                                  |
| `app/robots.ts`                                    | 8    | Robots.txt generator                                                              |
| `app/sitemap.ts`                                   | 30   | Dynamic XML sitemap with locale variants                                          |
| `lib/supabase-server.ts`                           | 21   | createSupabaseServerClient (cookie-based)                                         |
| `lib/supabase-browser.ts`                          | 7    | createSupabaseBrowserClient (browser context)                                     |
| `lib/utils.ts`                                     | ~5   | cn() utility (clsx + tailwind-merge) for conditional class merging                |
| `lib/metadata.ts`                                  | ~60  | Metadata helpers: localeAlternates(pathname, locale), dynamic metadata per page    |
| `lib/content.ts`                                   | ~100 | Content aggregation for portfolio sections (projects, posts, experiences, skills)  |
| `lib/github.ts`                                    | ~50  | GitHub API client for contributions heatmap (calendar data)                        |
| `hooks/use-active-section.ts`                      | ~40  | Scroll tracking hook for active section highlighting                              |
| `messages/en.json`                                 | ~80  | English UI strings (namespaced: nav, home, projects, blog, contact, common)       |
| `messages/es.json`                                 | ~80  | Spanish translations (exact key structure parity)                                 |
| `components/ui/hero-background.tsx`                | 149 | Three.js client component: 110-particle network, accent-orange connection lines, mouse parallax, ambient rotation |
| `components/ui/hero-background-loader.tsx`         | 10  | SSR-safe dynamic import wrapper (ssr: false) for Three.js particle background |
| `components/ui/page-transition.tsx`                | 12  | Client component: motion.main keyed by usePathname(), opacity 0→1, y: 8→0, blur 4px→0, 300ms easeOut |
| `app/globals.css`                                  | 279 | Custom design token system (dark-first, [data-theme] attribute) + Tailwind mapping + base element styles + animations + --hero-vignette |
| `components.json`                                  | ~20  | shadcn/ui project config (aliases, style: new-york, baseColor: zinc)              |

---

## Data Flow

### Locale Resolution (Middleware → Page)

```
User requests /projects/my-cool-app
    ↓
Middleware (next-intl)
    ├─ Check Accept-Language header / Accept-Language: es-ES
    ├─ Detect locale: 'es'
    └─ Rewrite to /es/projects/my-cool-app
        ↓
[locale]/projects/[slug]/page.tsx (locale='es')
    ├─ Extract locale from params: 'es'
    ├─ Load getTranslations({ locale: 'es', namespace: 'nav' })
    ├─ Query getProjectBySlug(slug, 'es')
    │  └─ GROQ: coalesce(project.title['es'], project.title.en) → renders Spanish title
    └─ Render with Spanish UI strings + bilingual content
```

**Key files:** `middleware.ts`, `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`, `lib/sanity-queries.ts`

### Content Publishing (CMS → Cache → Page, Per-Locale)

```
Sanity Studio (publish project)
    ↓
Sanity Webhook POST /api/revalidate-tag
    ├─ body._type = 'project'
    └─ Validate x-sanity-webhook-secret header
        ↓
Next.js revalidateTag(['projects'])
    ├─ revalidateTag('projects')
    └─ unstable_cache cleanup (collection tag)
        ↓
ISR revalidates on next /en/projects or /es/projects request
    ↓
User sees fresh bilingual content in their locale (within <5s)
```

**Key files:** `app/api/revalidate-tag/route.ts`, `lib/sanity-queries.ts`

### Contact Form Submission (Client → DB → Email, Locale-Aware)

```
User fills contact form (on /en/contact or /es/contact)
    ↓
submitContact (server action, locale-aware form labels)
    ├─ Validate: name, email, message
    ├─ Supabase RLS: anon can INSERT
    └─ await resend.emails.send() (best-effort, try/catch)
        ↓
Return success/error state (localized error messages)
    ↓
useActionState updates form with message (in user's locale)
```

**Key files:** `components/contact-form.tsx`, `app/actions/contact.ts`

### Static Site Generation (SSG per Route, Per-Locale)

```
next build
    ↓
generateStaticParams() for each locale × project/post
    ├─ getProjects() → queries Sanity (null-coalesced if no env vars)
    ├─ locales = ['en', 'es']
    └─ Return: [
        { locale: 'en', slug: 'my-project' },
        { locale: 'es', slug: 'my-project' },
        ...
      ]
    ↓
sanityFetch queries (null-guarded if no env vars)
    ├─ Build time: queries with GROQ, expands references
    ├─ GROQ includes: coalesce(field[$locale], field.en) fallback
    └─ HTML pages cached at build time
        ↓
getProjectBySlug(slug, locale) returns null on missing content
    ↓
notFound() renders 404 page
```

**Key files:** `app/[locale]/projects/[slug]/page.tsx`, `app/[locale]/blog/[slug]/page.tsx`, `lib/sanity-queries.ts`

---

## Key Architectural Patterns

### 0. Locale Resolution via Middleware + next-intl

**Setup:**

```typescript
// middleware.ts (top level, excluded for /api/* and /studio/*)
import { createIntlMiddleware } from 'next-intl/server'
import { routing } from './i18n/routing'

export default createIntlMiddleware(routing)

export const config = {
  matcher: ['/((?!api|studio|_next|_vercel|.*\\..*).*)'],
}
```

**How it works:**

- All requests to `/about` → rewritten as `/en/about` (detects locale from Accept-Language, defaults to 'en')
- All requests to `/es/about` → routed directly
- Root `/` → 308 redirect to `/en`
- Locale passed to `[locale]/layout.tsx` and pages via `params`

### 1. ISR with `unstable_cache` + Locale Cache Keys

**Why not `'use cache'`?** Not available in Next.js 15.5 (requires canary).

**Pattern (per-locale caching, cache version 'localized-v3'):**

```typescript
export const getProjects = (locale: string) =>
  unstable_cache(
    async () =>
      sanityFetch<Project[]>({
        query: groq`*[_type == "project"] | order(publishedAt desc) {
          ...,
          title: coalesce(title[$locale], title.en),
          description: coalesce(description[$locale], description.en),
        }`,
        params: { locale },
      }),
    [`localized-v3-projects-${locale}`], // Per-locale cache key, versioned
    { tags: ['projects', `projects:${locale}`], revalidate: 3600 } // Collection tag + locale tag
  )()

// In page: const projects = (await getProjects(locale)) ?? []
```

- Queries cached per-locale for 1 hour (separate cache for 'en' vs 'es')
- Coalesce fallback: `coalesce(field[$locale], field.en)` for graceful English fallback
- Webhook calls collection tags: `revalidateTag('projects')` instantly invalidates all locale caches
- Fallback to 1-hour TTL if webhook fails
- All callers use null-coalescing: `(await getProjects(locale)) ?? []`
- Sitemap and robots.txt include both locales

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

### 2b. Defensive Error Handling: Resend Email Integration

**Pattern:** Instantiate external service clients inside try/catch to prevent build-time failures.

**Example (contact form):**

```typescript
const supabase = await createSupabaseServerClient()
const { error: dbError } = await supabase
  .from('contact_submissions')
  .insert({ name, email, message })

// Best-effort email after authoritative DB insert
try {
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({ ... })
} catch (err) {
  console.error('Resend notification failed:', err)
  // Submission already saved — don't fail user response
}
```

**Benefits:**

- `RESEND_API_KEY` absence doesn't throw at module load (instantiated at runtime)
- DB insert is authoritative; email is best-effort notification
- Outer try/catch wraps entire function; errors return graceful response to user

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

### 6. Sanity Draft Mode with Token Validation

**Pattern:**

```typescript
import { validatePreviewUrl } from '@sanity/preview-url-secret'

const isValidSecret = await validatePreviewUrl(req.url, process.env.SANITY_STUDIO_REVALIDATE_SECRET)
if (!isValidSecret) return 401

draftMode().enable()
redirect(`/studio`)
```

- Uses `@sanity/preview-url-secret` for robust token validation
- Prevents open redirects
- Sets Next.js draft mode cookie for unpublished content access
- CSP header allows `frame-ancestors 'self'` for studio iframe

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
- `SANITY_STUDIO_PREVIEW_URL` — Canonical site URL for Presentation Tool (e.g., https://emudev.cc)
- `SANITY_STUDIO_REVALIDATE_SECRET` — Secret for preview URL validation (same as SANITY_REVALIDATE_SECRET)
- `SUPABASE_DB_URL` — Postgres connection (for migrations only)
- `SUPABASE_PAT` — Supabase personal access token (for `supabase db push`)
- `RESEND_API_KEY` — Resend transactional email API (required at runtime for contact emails; instantiated inside try/catch)
- `ADMIN_EMAIL` — Allow-list for sendMagicLink (comma-separated)

### Environment-Level (GitHub Secrets)

Repo has 3 environments: `development`, `staging`, `production`
Each has isolated copies of the above secrets.

---

## Code Quality Standards

- **TypeScript:** Strict mode; Sanity types regenerated after every schema change: `npm run sanity:types`
- **Naming:** camelCase for variables/functions, PascalCase for components/types, kebab-case for files
- **Comments:** Explain "why" for non-obvious logic (ISR revalidate strategy, RLS policies, locale-aware caching)
- **Null Handling:** Explicit null guards; prefer `?? []` over `||` for falsy checks
- **Error Handling:** Server actions return structured state; client displays user-friendly messages
- **Security:** No credentials in code/comments; secrets in GitHub Environments; HTML escaping in email; webhook secret validation in headers
- **i18n:** `getTranslations()` in server components, `useTranslations()` in client components; all UI strings in message files
- **Schema Validation:** `tests/smoke/content-model.spec.ts` validates schema registry, 6 i18n helpers, 14+ query functions, and cache version 'localized-v3' on every deploy

---

## Key Dependencies

| Package                      | Version | Purpose                                                 |
| ---------------------------- | ------- | ------------------------------------------------------- |
| `next`                       | 15.5.18 | App Router, SSG/ISR, server actions                     |
| `react`                      | 19.2.6  | UI library                                              |
| `three`                      | ^0.184.0 | 3D graphics library (particle network in hero background) |
| `next-intl`                  | ^4.11.1 | Bilingual routing & message management (EN/ES)          |
| `next-sanity`                | 5.5.11  | Sanity client + next/cache integration                  |
| `@sanity/visual-editing`     | ^4.0.3  | Draft mode / Presentation Tool (v5 requires Next.js 16) |
| `@sanity/preview-url-secret` | Latest  | Safe preview URL token validation                       |
| `@portabletext/react`        | 6.2.0   | Rich text rendering                                     |
| `@supabase/ssr`              | 0.10.3  | Cookie-based Supabase client                            |
| `resend`                     | 6.12.3  | Transactional email API                                 |
| `sanity`                     | 3.99.0  | Sanity Studio + schema definitions                      |
| `tailwindcss`                | 4.0     | Utility-first CSS                                       |
| `typescript`                 | 5.9.3   | Type safety                                             |
| `eslint`                     | ^9      | Linting (v10 incompatible with eslint-plugin-react@7.x) |
| `@playwright/test`           | 1.59.1  | Static and browser smoke tests                          |
| `framer-motion`              | latest  | Animation engine (required by MagicUI blur-fade, etc.)  |
| `clsx`                       | latest  | Conditional class merging                               |
| `tailwind-merge`             | latest  | Tailwind class deduplication (used in cn() utility)     |
| `next-themes`                | latest  | Dark/light theme provider for Phase 9.2 toggle          |

---

## Design Token System

### Overview

Custom CSS design tokens replace shadcn HSL color system. Dark-first architecture with light mode overrides via `[data-theme="light"]` attribute (not class). Fully compatible with shadcn/ui components via mapped aliases. Tokens are exported programmatically via TypeScript for component defaults.

### Token Files

- **`lib/design-tokens.ts`** (125 LOC) — Typed `as const` TypeScript object exporting all tokens: colors (brand/dark/light/component-specific), spacing, radii, typography, shadow, motion. Used for programmatic component defaults.
- **`app/globals.css`** (279 LOC) — Token definitions (:root + [data-theme="light"]), @theme inline block for Tailwind v4 mapping, base element styles, keyframe animations
- **`app/[locale]/layout.tsx`** (89 LOC) — Font imports (Inter + JetBrains Mono via `next/font/google`) with CSS variable classes, ThemeProvider setup
- **`components/theme-provider.tsx`** — Thin wrapper around `next-themes` ThemeProvider with `attribute="data-theme"` for attribute-based theming

### Token Structure

**Dark mode (`:root`, default):**
- Brand: `--accent: #e34d2a` (signal orange), `--accent-soft: #e34d2a1a`, `--status-ok: #22c55e`
- Canvas: `--canvas: #0f0f10` (near-black)
- Surfaces: `--surface-1` (0.04 opacity white), `--surface-2` (0.06), `--surface-input` (0.03)
- Hairlines: `--hairline` (0.08 opacity), `--hairline-mid` (0.1)
- Foreground scale: `--fg-1` (#fff) → `--fg-4` (0.4 opacity) for text hierarchy
- Type scale: `--t-display` (56px), `--t-h1` (40px), `--t-h2` (28px), `--t-h3` (20px), `--t-body` (16px), `--t-body-sm` (14px), `--t-meta` (13.5px), `--t-label` (12px), `--t-micro` (11px)
- Line heights: `--lh-display` (1.05), `--lh-heading` (1.15), `--lh-body` (1.5)
- Radii: `--r-input` (8px), `--r-btn` (10px), `--r-image` (12px), `--r-card` (14px), `--r-dock` (18px), `--r-pill` (99px)
- Spacing: `--s-1` to `--s-10` (4px to 56px)
- Fonts: `--font-sans` (Inter), `--font-mono` (JetBrains Mono)
- Shadows: `--shadow-dock` (0 12px 40px rgba(0,0,0,0.5))
- Animation: `--ease`, `--dur-fast` (0.15s), `--dur` (0.2s)

**Light mode (`[data-theme="light"]`):**
- Canvas: `--canvas: #f0eee9` (warm beige)
- Surfaces: Dark-based opacity (0.025, 0.05, 0.02)
- Foreground scale: `--fg-1: #111111` (dark) → `--fg-4` (0.4 opacity dark)
- Hairlines: `--hairline` (0.08 dark), `--hairline-mid` (0.1)
- Shadow: `--shadow-dock` (0 12px 40px rgba(0,0,0,0.12))

**Tailwind mapping via `@theme inline`:**
- Semantic color utilities: `bg-canvas`, `text-fg-1`, `border-hairline`, `bg-accent`, `bg-surface-1`, `bg-surface-2`
- shadcn compat aliases: `--color-background`, `--color-foreground`, `--color-muted`, `--color-border`, etc. (mapped to new tokens for backward compatibility)
- Radius utilities: `--radius-sm` (8px), `--radius-md` (10px), `--radius-lg` (14px)
- Font utilities: `--font-sans`, `--font-mono`
- Custom animations: `animate-shimmer-slide`, `animate-spin-around`, `animate-marquee`, `animate-marquee-vertical`, `animate-shiny-text`

**Custom variant for dark mode:**
```css
@custom-variant dark (&:is([data-theme="dark"] *));
```
Allows `dark:` utility classes to work with `[data-theme="dark"]` selector instead of class-based dark mode.

### Programmatic Token Access (TypeScript)

Components access tokens via `lib/design-tokens.ts` for defaults:

```typescript
import { tokens } from '@/lib/design-tokens'

// BorderBeam defaults to accent color
<BorderBeam colorFrom={tokens.colors.borderBeam.from} />

// MagicCard defaults to brand gradient
<MagicCard gradientColor={tokens.colors.magicCard.gradient} />

// ContributionsCard uses level colors array
const levelColors = tokens.colors.contributions
```

See `docs/design-guidelines.md` → "TypeScript Tokens Object" for full API reference.

### Typography System

**Font imports (next/font/google) in `app/[locale]/layout.tsx`:**
```tsx
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter', 
  display: 'swap' 
})
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-jetbrains-mono', 
  display: 'swap',
  weight: ['400', '500', '600', '700']
})
```
Font files loaded server-side, CSS variables inject into `<body>` for use throughout app.

**Applied to body:**
```tsx
<body className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}>
```

**CSS defaults defined in `@layer base` (globals.css):**
- `h1` — 56px (`--t-display`), 600 weight, 1.05 line-height, -0.02em letter-spacing
- `h2` — 40px (`--t-h1`), 600 weight, 1.15 line-height, -0.015em letter-spacing
- `h3` — 28px (`--t-h2`), 600 weight, 1.15 line-height, -0.01em letter-spacing
- `h4` — 20px (`--t-h3`), 600 weight, 1.15 line-height
- `p` — 16px (`--t-body`), 1.5 line-height, `--fg-2` color (secondary opacity), `text-wrap: pretty`
- `.eyebrow`, `.mono-label` — JetBrains Mono, `--t-micro` (11px), uppercase, 0.5px letter-spacing, `--fg-3` color
- `code`, `kbd` — JetBrains Mono, 0.92em, `--surface-2` background, 1px 5px padding, 4px radius

### Theme Provider Setup

**In `app/[locale]/layout.tsx`:**
```tsx
<ThemeProvider
  attribute="data-theme"
  defaultTheme="dark"
  enableSystem={false}
  disableTransitionOnChange
>
```

**Key config:**
- `attribute="data-theme"` — Sets/reads `data-theme` attribute on `<html>` element
- `defaultTheme="dark"` — Dark mode on first load
- `enableSystem={false}` — Ignores OS theme preference
- `disableTransitionOnChange` — Instant theme switch (no fade-in delay)

---

## Build & Runtime Characteristics

- **Build Time:** ~2-3 min (lint, typecheck, generate static params for both locales, build)
- **Node Version:** 20.x (see `.github/workflows/ci.yml`)
- **Package Manager:** npm (lock file tracked)
- **Turbopack:** Enabled in dev (`next dev --turbopack`)
- **CSS:** Tailwind v4 (no PostCSS config needed, bundled in `@tailwindcss/postcss`)
- **Linting:** ESLint v9 flat config; Prettier via lint-staged on commit
- **Static Params:** Doubles at build time due to locale duplication (en × routes + es × routes)

---

## Testing Coverage

### Smoke Tests

- **Route/browser smoke:** health check, pages load, navigation, sitemap, robots.txt, contact form
- **i18n bilingual:** routing contracts (/en /es), message key parity, static rendering per-locale, locale switching, content parity
- **Content model:** static contracts for Sanity helpers, schema registry, query exports, cache version, and localized GROQ fallback

### Message Key Validation

- `tests/smoke/i18n-bilingual.spec.ts` verifies:
  - Routing config has `locales: ['en', 'es']` and `localePrefix: 'always'`
  - Message files have exact key parity
  - Static pages render without missing translation errors
  - LocaleSwitcher component works
  - Content renders correctly per-locale

---

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
Page renders unpublished content in draft mode (for both EN and ES)
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
