# emudev Portfolio — Project Overview & PDR

## Project Description

**emudev** is a modern portfolio website showcasing Esteban Montero's software engineering work. Built with Next.js 15, it combines a headless CMS (Sanity), real-time database (Supabase), and a secure deployment pipeline to deliver a bilingual, performant, content-managed experience in English & Spanish.

**Domain:** emudev.cc | **Admin:** esteban.montero@gmail.com

### Core Vision

Ship a zero-maintenance portfolio that:
- Authoritatively sources projects, blog posts, and site settings from Sanity CMS (bilingual: {en, es})
- Automatically routes visitors to /en or /es based on browser language preference
- Handles contact inquiries with email notifications and persistent storage
- Revalidates cache on content changes in seconds via webhook integration
- Deploys safely across dev/staging/production with approval gates
- Runs infrastructure on Vercel + Cloudflare with minimal operational overhead

---

## Key User Journeys

### 1. Visitor: Discover Portfolio
**Path:** Home → Projects → Blog → Contact (locale-aware routing)

- Land on `/en` or `/es` homepage with locale-appropriate hero
- Browse projects in English or Spanish; tag filter available
- View full project gallery with bilingual descriptions, tech tags, live links
- Read blog posts with author + publish date (bilingual content)
- Submit contact form → instant success message → admin receives email (locale-aware)
- Switch between EN/ES via LocaleSwitcher in navigation

### 2. Admin: Publish Bilingual Content
**Path:** Sanity Studio → Create/Edit EN & ES versions → Publish → Auto-revalidate

- Edit project: title {en, es}, slug, description {en, es}, featured image, tags, live URL, repo URL
- Edit post: title {en, es}, slug, excerpt {en, es}, content {en, es}, author, tags
- Update site settings: name, description, logo, social links
- Publish → Sanity webhook calls `/api/revalidate-tag` → revalidates both EN and ES caches in seconds
- Preview in Presentation Tool before publish (via `/api/draft-mode/enable`)

### 3. Admin: Manage Contact Form
**Path:** Supabase dashboard → View submissions → Delete spam/archive

- Contact form submissions stored in `contact_submissions` table
- Admin views via Supabase dashboard (RLS policy gates access to admin email only)
- Each submission receives email notification via Resend (localized based on browser locale)
- Admin can delete/archive submissions directly from database

---

## Goals

1. **Content Agility** — Publish bilingual projects and posts without rebuilding via ISR + Sanity webhooks
2. **Professional Presence** — Present clean, performant portfolio across all devices in EN and ES
3. **Bilingual Support** — Automatic locale detection (en/es) with user locale-switcher; separate content per language
4. **Lead Capture** — Collect contact form submissions with email fallback (RLS-protected)
5. **Zero Downtime Deploys** — Automated staging approval + smoke tests before production
6. **Security First** — RLS on database, webhook secret validation, draft mode token validation, no credentials in repo

---

## Non-Goals

- User authentication (portfolio is public; admin access via Supabase Magic Link only)
- Analytics dashboard (use external tools like Vercel Analytics)
- Blog comments (contact form is the feedback channel)
- Client-side image optimization (handled by Sanity CDN)
- Real-time collaboration on draft content (single admin)

---

## Success Metrics

| Metric | Target | Method |
|--------|--------|--------|
| **Page Load (FCP)** | <1.5s | Lighthouse CI in deploy pipeline |
| **ISR Revalidate** | <5s after publish | Manual test: publish in Sanity, check cache |
| **CI Pass Rate** | 100% (PRs require green) | GitHub Actions enforcement |
| **Uptime** | 99.9% | Vercel + Cloudflare monitoring |
| **Contact Form Success** | 100% DB insert | Submission appears in Supabase within 30s |
| **Bilingual Coverage** | 100% UI strings + content | All pages render in both EN and ES correctly |
| **Smoke Tests** | 100% pass (47 total) | Deploy pipeline integration |

---

## Technical Constraints

- **Next.js 15**: App Router only; `unstable_cache` (not `'use cache'`) for ISR with per-locale tags
- **React 19.2.6**: Current stable; check compatibility for future upgrades
- **next-intl ^4.11.1**: Explicit locale prefix routing (/en, /es always); middleware-based detection
- **@sanity/visual-editing ^4.0.3**: v5 requires Next.js 16; v4 uses use-effect-event polyfill
- **Sanity v3**: GROQ queries only; locale fallback pattern `coalesce(field[$locale], field.en)`
- **Supabase**: RLS required for production; migrations applied via `supabase db push`
- **ESLint ^9**: v10 removes getFilename() API required by eslint-plugin-react@7.x
- **GitHub Actions**: 3-branch model (develop → dev, staging → staging, main → production)
- **Cloudflare**: WAF + cache purge on deploys; no Workers functions yet
- **Vercel Git Integration**: Single project, multiple branches; auto preview URLs for feature branches

---

## Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15.5 (App Router, Turbopack) |
| **Internationalization** | next-intl v4 (bilingual EN/ES) |
| **Styling** | Tailwind CSS v4 |
| **CMS** | Sanity v3 (GROQ, bilingual schemas, Presentation preview) |
| **Database** | Supabase Postgres (RLS, Magic Link auth) |
| **Email** | Resend (transactional) |
| **Hosting** | Vercel (dev/staging/prod) |
| **CDN/WAF** | Cloudflare |
| **CI/CD** | GitHub Actions (3-env pipeline, smoke tests) |
| **Testing** | Playwright (47 smoke tests: 11 original + 36 i18n) |

---

## Phase Roadmap

### Completed Phases (May 8-10, 2026)

- **Phase 1** ✅: Scaffold, tooling, Sanity schema, Supabase migrations, CI/CD
- **Phase 2** ✅: Populate Sanity content, generate types
- **Phase 3** ✅: Link Supabase projects to all environments
- **Phase 4** ✅: UI components, OG images, tag filter, post cards, draft mode
- **Phase 5** ✅: GitHub Actions workflows (ci.yml, deploy.yml, hotfix.yml)
- **Phase 6** ✅: Production deployment, Sanity Presentation Tool, cache automation, CSP headers, draft mode secure validation
- **Phase 7** ✅: Smoke tests (47 total: 11 original + 36 i18n), production readiness

### In Progress / Completed i18n (May 10, 2026)

- **Phase 8.1** ✅: Middleware & route migration (next-intl setup, /en & /es explicit routing, locale switcher)
- **Phase 8.2** ✅: UI string extraction (getTranslations in pages, useTranslations in client components)
- **Phase 8.3** ✅: Sanity bilingual content ({en, es} field structure, GROQ coalesce pattern)
- **Phase 8.4** ⏳: SEO & sitemap (hreflang, locale variants in sitemap.xml)

### Future

- **Phase 9** ⏳: Post-launch monitoring, analytics, Phase 2 features (admin dashboard, search, etc.)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **Sanity webhook fails** | Low | Medium | Implement retry logic in webhook; fallback to manual revalidate-tag call; ISR 1-hour TTL |
| **Per-locale cache desync** | Low | Medium | Test cache invalidation in staging; webhook calls both `revalidateTag('projects-en')` and `revalidateTag('projects-es')` |
| **Supabase RLS misconfigured** | Medium | High | Test policies in staging before production; audit in PR review; RLS enforces anon INSERT only, admin SELECT/DELETE gated on email |
| **i18n missing translation key** | Medium | Low | Smoke tests verify message keys match between EN and ES; build fails if mismatch detected |
| **GitHub Actions secret leak** | Low | Critical | Use environment-level secrets, no query params for secrets, audit logs; secrets passed as GitHub environment variables |
| **Cloudflare cache stale** | Medium | Low | Manual purge on deploy via CF API; set aggressive revalidation headers; webhook triggers on publish |
| **Locale detection wrong** | Low | Medium | Middleware defaults to EN if not ES; Accept-Language header checked; LocaleSwitcher provides manual override |

---

## Project Owner

**Esteban Montero** (esteban.montero@gmail.com)
- Decision authority over architectural changes
- Approves deploys to staging/production
- Manages Sanity and Supabase project configurations
- Owns GitHub Environments and secrets management

---

## Key Dates

| Event | Date |
|-------|------|
| **Phase 1-5 Complete** | May 8, 2026 |
| **Phase 6 Complete (Cloudflare, Draft Mode)** | May 10, 2026 |
| **Phase 7 Complete (Smoke Tests)** | May 10, 2026 |
| **Phase 8.1 Complete (i18n Routing)** | May 10, 2026 |
| **Phase 8.2 Complete (UI Strings)** | May 10, 2026 |
| **Phase 8.3 Complete (Sanity Bilingual)** | May 10, 2026 |
| **Phase 8.4 Planned (Sitemap hreflang)** | TBD (low priority) |
| **Phase 9 (Post-Launch)** | TBD (future) |
| **Production Launch (Bilingual)** | May 11, 2026 (live) |
