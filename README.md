# emudev — Modern Portfolio Platform

A performant, bilingual portfolio website built with Next.js 15, Sanity CMS, and Supabase. Designed for zero-maintenance content publishing with English & Spanish support (en/es) and secure deployment across dev/staging/production.

**Live:** https://emudev.cc | **Admin:** esteban.montero@gmail.com

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm
- Sanity account (free tier ok)
- Supabase account (free tier ok)
- Vercel account (for hosting)

### Development Setup

```bash
# Clone repo
git clone https://github.com/yourusername/emudev-portfolio.git
cd emudev-portfolio

# Install dependencies
npm ci --legacy-peer-deps

# Start development server
npm run dev

# Open http://localhost:3000 (auto-redirects to /en or /es based on locale)
```

### Sanity CMS Setup

```bash
# Start Sanity Studio locally
npm run sanity:dev

# Open http://localhost:3333/studio (creates content locally)

# Generate TypeScript types after schema changes
npm run sanity:types
```

### Supabase Setup

```bash
# Link to Supabase project (interactive)
supabase link --project-ref [project-ref]

# Apply migrations (creates tables + RLS)
supabase db push

# Generate TypeScript types
npm run supabase:types
```

---

## Stack

| Layer | Tech | Version |
|-------|------|---------|
| **Frontend Framework** | Next.js | 15.5 (App Router, Turbopack) |
| **Internationalization** | next-intl | ^4.11.1 (EN/ES bilingual) |
| **Language** | TypeScript | 5.9 |
| **Styling** | Tailwind CSS | 4.0 |
| **CMS** | Sanity | 3 + Visual Editing v4 |
| **Database** | Supabase Postgres | Latest (RLS) |
| **Auth** | Supabase Auth | Magic Link |
| **Email** | Resend | 6.12 |
| **Hosting** | Vercel | Latest |
| **CDN/WAF** | Cloudflare | Latest |
| **Testing** | Playwright | 1.59 |
| **Linting** | ESLint | ^9 (v10 incompatible) |
| **Formatting** | Prettier | 3.8 |

---

## Environment Variables

### Public (Build-Time)

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=https://emudev.cc
NEXT_PUBLIC_SITE_DOMAIN=emudev.cc
```

### Private (Runtime)

```bash
SANITY_API_TOKEN=your_sanity_api_token        # Optional: for preview drafts
SANITY_REVALIDATE_SECRET=random_webhook_secret  # For Sanity webhook validation
SANITY_STUDIO_PREVIEW_URL=https://emudev.cc  # For Presentation Tool
SANITY_STUDIO_REVALIDATE_SECRET=random_webhook_secret
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=postgresql://...               # For migrations
SUPABASE_PAT=your_personal_access_token
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=esteban.montero@gmail.com          # Allow-list for Magic Link
```

Copy `.env.example` and populate all variables before deploying.

---

## Project Structure

```
emudev-portfolio/
├── app/                    # Next.js App Router pages & actions
│   ├── api/               # API routes (webhooks, draft mode, etc.)
│   ├── actions/           # Server actions (contact, auth)
│   ├── [locale]/          # Locale-prefixed routes (en, es)
│   │   ├── page.tsx       # Homepage
│   │   ├── projects/      # Project pages (dynamic routes)
│   │   ├── blog/          # Blog pages (dynamic routes)
│   │   ├── about/         # About page
│   │   └── contact/       # Contact page with form
│   ├── layout.tsx         # Root layout (shell)
│   ├── page.tsx           # Root page (redirect to /en)
│   ├── robots.ts          # Robots.txt generator
│   ├── sitemap.ts         # Dynamic XML sitemap
│   └── studio/[[...tool]]/page.tsx # Sanity Studio
│
├── components/            # React components
│   ├── locale-switcher.tsx    # EN↔ES toggle
│   ├── contact-form.tsx       # Contact form
│   ├── project-card.tsx       # Reusable card
│   ├── post-card.tsx          # Blog post preview
│   ├── site-nav.tsx           # Navigation + locale switcher
│   ├── portable-text-renderer.tsx  # Rich text rendering
│   └── ui/                # UI primitives
│
├── i18n/                  # Internationalization config
│   ├── routing.ts         # defineRouting(locales: ['en', 'es'])
│   ├── request.ts         # getRequestConfig for locale resolution
│   └── navigation.ts      # Locale-aware Link, redirect, useRouter
│
├── messages/              # Translation files (NEW: bilingual)
│   ├── en.json            # English UI strings
│   └── es.json            # Spanish translations
│
├── middleware.ts          # next-intl middleware (NEW)
│
├── lib/                   # Utilities & clients
│   ├── sanity-client.ts   # Sanity setup
│   ├── sanity-queries.ts  # GROQ queries with per-locale ISR caching
│   ├── supabase-server.ts # Server-side Supabase client
│   └── supabase-browser.ts # Browser-side Supabase client
│
├── types/                 # TypeScript definitions
│   ├── sanity.types.ts    # Sanity document types
│   └── supabase.types.ts  # Generated from schema
│
├── sanity/                # Sanity CMS config
│   ├── schemas/           # Document type schemas (with {en, es} fields)
│   └── structure.ts       # Studio desk structure
│
├── tests/                 # Test suites
│   └── smoke/
│       ├── pages.spec.ts          # ~11 original tests
│       └── i18n-bilingual.spec.ts # ~36 new i18n tests (routing, messages, rendering)
│
├── docs/                  # Documentation
│   ├── project-overview-pdr.md
│   ├── codebase-summary.md
│   ├── code-standards.md
│   ├── system-architecture.md
│   ├── deployment-guide.md
│   ├── project-roadmap.md
│   └── design-guidelines.md
│
├── .github/workflows/     # CI/CD pipelines
│   ├── ci.yml            # PR: lint, typecheck, build
│   ├── deploy.yml        # Deploy to dev/staging/production
│   └── hotfix.yml        # Hotfix workflow
│
├── next.config.ts        # Next.js + i18n configuration
├── tailwind.config.ts    # Tailwind CSS config
├── tsconfig.json         # TypeScript config
├── eslint.config.mjs     # ESLint v9 flat config
├── middleware.ts         # next-intl locale routing
└── package.json          # Dependencies
```

See [`docs/codebase-summary.md`](./docs/codebase-summary.md) for detailed file purposes.

---

## Available Scripts

### Development

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (http://localhost:3000, auto-locale redirect) |
| `npm run sanity:dev` | Start Sanity Studio (http://localhost:3333) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |

### Code Quality

| Command | Purpose |
|---------|---------|
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checker |

### Database & CMS

| Command | Purpose |
|---------|---------|
| `npm run sanity:types` | Generate Sanity TypeScript types |
| `npm run supabase:types` | Generate Supabase TypeScript types |
| `npm run supabase:push` | Apply SQL migrations to Supabase |

### Testing

| Command | Purpose |
|---------|---------|
| `npm run test:smoke` | Run Playwright smoke tests (requires BASE_URL env var) |
| `npm run test:smoke:local` | Run smoke tests against localhost:3000 |

---

## Key Features

### Bilingual Support (NEW)

- **next-intl v4** — English & Spanish with `/en` & `/es` explicit locale prefixes
- **Middleware routing** — Automatic locale detection, defaults to English
- **Per-locale ISR** — Separate cache keys: `projects-en`, `projects-es`, etc.
- **Message files** — `messages/en.json` & `messages/es.json` for all UI strings
- **LocaleSwitcher component** — Easy EN↔ES toggle in navigation
- **Sanity bilingual content** — Fields stored as `{en: "...", es: "..."}`
- **Locale-aware static generation** — `generateStaticParams()` creates both locale variants

### Content Management

- **Sanity CMS** — Headless CMS for projects, blog posts, authors, tags (now bilingual)
- **GROQ Queries** — Type-safe content queries with locale support: `coalesce(field[$locale], field.en)`
- **ISR Caching** — `unstable_cache` with per-locale tags + 1-hour TTL
- **Webhook Revalidation** — Instant cache clear on publish via Sanity webhook
- **Sanity Presentation Tool** — Live preview with draft mode via `/api/draft-mode/enable`

### Database & Auth

- **Supabase Postgres** — RLS-protected contact submissions & auth
- **Magic Link Auth** — Passwordless admin access (allow-list gated)
- **Row-Level Security** — Anon can INSERT forms, admin can SELECT/DELETE
- **Migrations** — SQL migrations applied automatically on deploy

### Forms & Email

- **Server Actions** — Form validation on server (no client-side bypass)
- **Contact Form** — Captures name, email, message → Supabase + Resend email
- **Email Notifications** — Instant notification on contact submission
- **HTML Escaping** — Sanitized emails (prevents injection attacks)

### Deployment

- **3-Environment Pipeline** — Develop → Staging → Production
- **Approval Gates** — Manual approval required for staging/production
- **Smoke Tests** — Playwright tests run on staging/production deploys (~47 tests: 11 original + 36 i18n)
- **Automatic Caching** — Cloudflare purge on every deploy
- **Release Tags** — Automatic git tags on production deploy

### Performance

- **Static Site Generation** — SSG for projects, blog posts (per-route, per-locale)
- **Incremental Static Regeneration** — ISR for lists (1-hour revalidate, webhook instant)
- **Server-Side Rendering** — Forms & dynamic pages (no caching)
- **Image Optimization** — Sanity CDN handles all images
- **Build Time** — ~2-3 min (includes typecheck, build)

---

## Architecture Overview

```
User Request (to /en/... or /es/...)
    ↓
Cloudflare CDN (cache headers, WAF, rate limiting)
    ↓
Vercel Edge (request routing)
    ↓
Next.js App Router + Middleware (locale detection)
    ├─ Static Pages (SSG × 2 locales) → HTML cached 1 hour
    ├─ ISR Pages (per-locale cache tags) → Revalidate on webhook
    ├─ Dynamic Routes (per-slug × per-locale) → Per-route caching
    └─ API Routes → Webhooks, draft mode, etc.
    ↓
Sanity CMS ← getProjects(locale), getPosts(locale), etc. with locale-aware GROQ
    ↓
Supabase Postgres ← Contact submissions, auth sessions (RLS enforced)
    ↓
Resend Email API ← Transactional notifications
```

See [`docs/system-architecture.md`](./docs/system-architecture.md) for detailed architecture and data flows.

---

## Code Standards

### TypeScript

- **Strict mode enabled** — All types checked
- **Hand-written types** — Sanity types are non-codegen (controlled updates)
- **Null guards** — Explicit `?? []` for falsy checks

### Naming Conventions

- **Files:** kebab-case (`contact-form.tsx`, `locale-switcher.tsx`)
- **Components:** PascalCase (`ProjectCard`, `LocaleSwitcher`)
- **Variables:** camelCase (`projectId`, `locale`)
- **Env vars:** UPPER_SNAKE_CASE (`NEXT_PUBLIC_SANITY_PROJECT_ID`)

### Patterns

- **ISR Caching** — `unstable_cache` with per-locale revalidation tags
- **Server Actions** — Form validation on server, structured state response
- **Sanity Queries** — GROQ with parameterized queries, reference expansion, locale fallback
- **Supabase Clients** — Server-side for auth, browser-side for anon operations
- **Error Handling** — Try-catch for external services (email is best-effort)
- **i18n** — `getTranslations()` in server components, `useTranslations()` in client components

See [`docs/code-standards.md`](./docs/code-standards.md) for full standards guide.

---

## Deployment

### Development (Auto-Deploy on `develop` Push)

```bash
git push origin develop
# Deploys to https://dev.emudev.cc (Vercel preview)
```

### Staging (Manual Approval)

```bash
git push origin staging
# GitHub Actions waits for approval → deploys to https://staging.emudev.cc
# Smoke tests run on staging
```

### Production (Manual Approval)

```bash
git push origin main
# GitHub Actions waits for approval → deploys to https://emudev.cc
# Smoke tests run on production (~47 tests)
# Auto-creates release tag: prod-YYYYMMDD-HHMMSS
```

### Hotfix (Auto-Deploy, Emergency Only)

```bash
git checkout -b hotfix/emergency-fix main
# Make changes, commit
git push origin hotfix/emergency-fix
# Create PR → merge → auto-deploys to production (no approval)
```

**Full deployment guide:** [`docs/deployment-guide.md`](./docs/deployment-guide.md)

---

## Documentation

| Document | Purpose |
|----------|---------|
| [`docs/project-overview-pdr.md`](./docs/project-overview-pdr.md) | Project vision, goals, success metrics, risks |
| [`docs/codebase-summary.md`](./docs/codebase-summary.md) | Directory structure, file purposes, key patterns |
| [`docs/code-standards.md`](./docs/code-standards.md) | TypeScript, naming, ISR caching, server actions, i18n patterns |
| [`docs/system-architecture.md`](./docs/system-architecture.md) | Full architecture, data flows, deployment pipeline, middleware |
| [`docs/deployment-guide.md`](./docs/deployment-guide.md) | Step-by-step setup & deployment checklist |
| [`docs/project-roadmap.md`](./docs/project-roadmap.md) | Phase breakdown, timeline, backlog (Phases 1-8.3 complete) |
| [`docs/design-guidelines.md`](./docs/design-guidelines.md) | Colors, typography, spacing, components, accessibility |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| **First Contentful Paint (FCP)** | <1.5s |
| **Largest Contentful Paint (LCP)** | <2.5s |
| **Cumulative Layout Shift (CLS)** | <0.1 |
| **Cache Hit Ratio** | >80% |
| **Build Time** | <3 min |
| **Uptime** | 99.9% |

Monitored via:
- Vercel Analytics (Core Web Vitals)
- Lighthouse CI (in deploy workflow)
- Cloudflare Analytics (traffic, cache, WAF)

---

## Security

- **No credentials in code** — All secrets in GitHub Environments
- **Webhook secret validation** — Header-based (never query params)
- **Draft mode token validation** — `@sanity/preview-url-secret` library
- **Row-Level Security** — Database enforces access control
- **HTML escaping** — Email content sanitized before send
- **Security headers** — X-Frame-Options, HSTS, CSP, etc.
- **RLS policies** — Anon INSERT only, admin SELECT/DELETE gated on email

See [`docs/system-architecture.md`](./docs/system-architecture.md#environment-strategy) for secrets model.

---

## Contributing

### Branch Strategy

| Branch | Purpose | Deploys To | Gate |
|--------|---------|------------|------|
| `main` | Production-only | emudev.cc | Manual approval |
| `staging` | Pre-release QA | staging.emudev.cc | Manual approval |
| `develop` | Integration / dev testing | dev.emudev.cc | Auto |
| `feature/*` | New phases & features | — | PR into `develop` |
| `hotfix/*` | Emergency fixes | prod (direct) | PR into `main` |

**Rules:**
- **Never push directly to `main`, `staging`, or `develop`**
- All new work starts on a `feature/` branch
- Merge path: `feature/*` → `develop` → `staging` → `main`
- Hotfix path: `hotfix/*` → `main` (auto-deploys, backports to `develop`)

**Starting new work:**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/phase-9-feature-name
# ... work ...
git push origin feature/phase-9-feature-name
# Open PR → develop
```

### Pre-Commit

```bash
# Git hooks via Husky (runs Prettier on staged files)
npm run prepare
```

Prettier auto-formats on commit. ESLint runs in CI as a separate step.

### Code Review

- All PRs require CI to pass (lint, typecheck, build)
- Use [`docs/code-standards.md`](./docs/code-standards.md) as review guide
- Check for null guards, type safety, security issues, i18n completeness

---

## Troubleshooting

### Build Fails

1. Check GitHub Actions logs (`npm run build` output)
2. Run locally: `npm run build`
3. Verify env vars set in GitHub Environments
4. Check Sanity project ID (should not fail build if missing)

### Webhook Not Firing

1. Verify webhook URL in Sanity settings
2. Check secret matches `SANITY_REVALIDATE_SECRET`
3. Test webhook via Sanity UI (has test button)
4. Check Vercel logs for webhook delivery errors

### Contact Form Submission Fails

1. Verify Supabase RLS policies (allow anon INSERT)
2. Check `contact_submissions` table exists
3. Run `npm run supabase:push` to apply migrations
4. Check Supabase logs for errors

### Email Not Sending

1. Verify `RESEND_API_KEY` in GitHub secrets
2. Check Resend dashboard for failed deliveries
3. Verify `ADMIN_EMAIL` is correct
4. Check GitHub Actions logs for Resend API errors

### Locale Not Switching

1. Check `i18n/routing.ts` has `localePrefix: 'always'`
2. Verify `middleware.ts` is in root directory
3. Check `messages/en.json` and `messages/es.json` exist
4. Clear browser cache and verify Accept-Language header

See [`docs/deployment-guide.md`](./docs/deployment-guide.md#troubleshooting) for full troubleshooting guide.

---

## License

MIT (if applicable; adjust as needed)

---

## Contact

**Esteban Montero** (esteban.montero@gmail.com)

Questions? Open an issue or reach out via the contact form at https://emudev.cc/contact.

---

## Project Status (May 11, 2026)

- **Phase 1-5:** ✅ Complete (scaffold, Sanity, Supabase, UI, CI/CD)
- **Phase 6:** ✅ Complete (Cloudflare WAF, cache optimization, draft mode)
- **Phase 7:** ✅ Complete (Smoke tests, production readiness, 47 total tests)
- **Phase 8.1:** ✅ Complete (i18n middleware, EN/ES routing, locale switcher, messages)
- **Phase 8.2:** ✅ Complete (UI string extraction via getTranslations/useTranslations)
- **Phase 8.3:** ✅ Complete (Sanity bilingual schemas with {en, es} fields)
- **Phase 8.4:** ⏳ Planned (Sitemap hreflang, locale variants)
- **Phase 9:** ⏳ Future (Post-launch monitoring, Phase 2 features)

See [`docs/project-roadmap.md`](./docs/project-roadmap.md) for detailed timeline.
