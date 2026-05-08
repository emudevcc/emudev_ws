# emudev — Modern Portfolio Platform

A performant, content-managed portfolio website built with Next.js 15, Sanity CMS, and Supabase. Designed for zero-maintenance content publishing and secure deployment across dev/staging/production.

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

# Open http://localhost:3000
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
| **Frontend Framework** | Next.js | 15.5 |
| **Language** | TypeScript | 5.9 |
| **Styling** | Tailwind CSS | 4.0 |
| **CMS** | Sanity | 3.99 |
| **Database** | Supabase Postgres | Latest |
| **Auth** | Supabase Auth | Magic Link |
| **Email** | Resend | 6.12 |
| **Hosting** | Vercel | Latest |
| **CDN/WAF** | Cloudflare | Latest |
| **Testing** | Playwright | 1.59 |
| **Linting** | ESLint (v10) | Latest |
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
│   ├── api/               # API routes (webhooks, etc.)
│   ├── actions/           # Server actions (forms, auth)
│   ├── projects/          # Project pages (dynamic routes)
│   ├── blog/              # Blog pages (dynamic routes)
│   ├── layout.tsx         # Root layout + metadata
│   └── page.tsx           # Homepage
│
├── components/            # React components
│   ├── contact-form.tsx   # Contact form component
│   ├── project-card.tsx   # Reusable project card
│   ├── site-nav.tsx       # Navigation bar
│   └── ui/                # UI primitives
│
├── lib/                   # Utilities & clients
│   ├── sanity-client.ts   # Sanity setup
│   ├── sanity-queries.ts  # GROQ queries with ISR caching
│   ├── supabase-server.ts # Server-side Supabase client
│   └── supabase-browser.ts # Browser-side Supabase client
│
├── types/                 # TypeScript definitions
│   ├── sanity.types.ts    # Sanity document types
│   └── supabase.types.ts  # Generated from schema
│
├── sanity/                # Sanity CMS config
│   ├── schemas/           # Document type schemas
│   └── structure.ts       # Studio desk structure
│
├── supabase/              # Database setup
│   └── migrations/        # SQL migrations
│
├── tests/                 # Test suites
│   └── smoke/            # Playwright smoke tests
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
│   ├── deploy.yml        # Deploy to 3 environments
│   └── hotfix.yml        # Hotfix workflow
│
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS config
├── tsconfig.json         # TypeScript config
├── eslint.config.mjs     # ESLint v10 flat config
└── package.json          # Dependencies
```

See [`docs/codebase-summary.md`](./docs/codebase-summary.md) for detailed file purposes.

---

## Available Scripts

### Development

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (http://localhost:3000) |
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

### Content Management

- **Sanity CMS** — Headless CMS for projects, blog posts, authors, tags
- **GROQ Queries** — Type-safe content queries with Sanity VISION preview
- **ISR Caching** — `unstable_cache` with 1-hour TTL + tag-based invalidation
- **Webhook Revalidation** — Instant cache clear on publish via Sanity webhook

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
- **Smoke Tests** — Playwright tests run on staging/production deploys
- **Automatic Caching** — Cloudflare purge on every deploy
- **Release Tags** — Automatic git tags on production deploy

### Performance

- **Static Site Generation** — SSG for projects, blog posts (per-route)
- **Incremental Static Regeneration** — ISR for lists (1-hour revalidate)
- **Server-Side Rendering** — Forms & dynamic pages (no caching)
- **Image Optimization** — Sanity CDN handles all images
- **Build Time** — ~2-3 min (includes typecheck, build)

---

## Architecture Overview

```
User Request
    ↓
Cloudflare CDN (cache headers, WAF, rate limiting)
    ↓
Vercel Edge (request routing)
    ↓
Next.js App Router
    ├─ Static Pages (SSG) → HTML cached 1 hour
    ├─ ISR Pages → Revalidate on webhook
    ├─ Dynamic Routes → Per-slug caching
    └─ API Routes → Webhooks, etc.
    ↓
Sanity CMS ← getProjects(), getPosts(), getSiteSettings()
    ↓
Supabase Postgres ← Contact submissions, auth sessions
    ↓
Resend Email API ← Transactional notifications
```

See [`docs/system-architecture.md`](./docs/system-architecture.md) for detailed architecture, data flows, and deployment pipeline.

---

## Code Standards

### TypeScript

- **Strict mode enabled** — All types checked
- **Hand-written types** — Sanity types are non-codegen (controlled updates)
- **Null guards** — Explicit `?? []` for falsy checks

### Naming Conventions

- **Files:** kebab-case (`contact-form.tsx`)
- **Components:** PascalCase (`ProjectCard`)
- **Variables:** camelCase (`projectId`)
- **Env vars:** UPPER_SNAKE_CASE (`NEXT_PUBLIC_SANITY_PROJECT_ID`)

### Patterns

- **ISR Caching** — `unstable_cache` with revalidation tags
- **Server Actions** — Form validation on server, structured state response
- **Sanity Queries** — GROQ with parameterized queries, reference expansion
- **Supabase Clients** — Server-side for auth, browser-side for anon operations
- **Error Handling** — Try-catch for external services (email is best-effort)

See [`docs/code-standards.md`](./docs/code-standards.md) for full standards guide.

---

## Deployment

### Development (Auto-Deploy on `develop` Push)

```bash
git push origin develop
# Deploys to https://dev.emudev.cc
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
# Smoke tests run on production
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
| [`docs/code-standards.md`](./docs/code-standards.md) | TypeScript, naming, ISR caching, server actions, RLS |
| [`docs/system-architecture.md`](./docs/system-architecture.md) | Full architecture, data flows, deployment pipeline |
| [`docs/deployment-guide.md`](./docs/deployment-guide.md) | Step-by-step setup & deployment checklist |
| [`docs/project-roadmap.md`](./docs/project-roadmap.md) | Phase breakdown, timeline, backlog |
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
- **Row-Level Security** — Database enforces access control
- **HTML escaping** — Email content sanitized before send
- **Security headers** — X-Frame-Options DENY, HSTS, CSP, etc.
- **RLS policies** — Anon INSERT only, admin SELECT/DELETE gated on email

See [`docs/system-architecture.md`](./docs/system-architecture.md#environment-strategy) for secrets model.

---

## Contributing

### Branch Strategy

- **develop** — Development environment (auto-deploy)
- **staging** — Staging environment (manual approval)
- **main** — Production (manual approval, release tags)
- **feature/*** — Feature branches (delete after merge)
- **hotfix/*** — Hotfix branches (auto-deploy on merge to main)

### Pre-Commit

```bash
# Git hooks via Husky (runs Prettier on staged files)
npm run prepare
```

Prettier auto-formats on commit. ESLint runs in CI as a separate step.

### Code Review

- All PRs require CI to pass (lint, typecheck, build)
- Use [`docs/code-standards.md`](./docs/code-standards.md) as review guide
- Check for null guards, type safety, security issues

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

See [`docs/deployment-guide.md`](./docs/deployment-guide.md#troubleshooting) for full troubleshooting guide.

---

## License

MIT (if applicable; adjust as needed)

---

## Contact

**Esteban Montero** (esteban.montero@gmail.com)

Questions? Open an issue or reach out via the contact form at https://emudev.cc/contact.

---

## Project Status

- **Phase 1:** ✅ Complete (scaffold, tooling, CI/CD)
- **Phase 2:** ⏳ Pending (Sanity content population)
- **Phase 3:** ⏳ Pending (Supabase environment linking)
- **Phase 4:** ✅ Complete (UI components & design system)
- **Phase 5:** ✅ Complete (GitHub Actions CI/CD pipeline)
- **Phase 6:** ⏳ Pending (Cloudflare WAF & cache)
- **Phase 7:** ⏳ Pending (Smoke tests & production readiness)
- **Launch:** ⏳ Pending (June 18, 2026 est.)

See [`docs/project-roadmap.md`](./docs/project-roadmap.md) for detailed roadmap and timelines.
