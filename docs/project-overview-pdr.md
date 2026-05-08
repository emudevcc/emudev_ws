# emudev Portfolio — Project Overview & PDR

## Project Description

**emudev** is a modern portfolio website showcasing Esteban Montero's software engineering work. Built with Next.js 15, it combines a headless CMS (Sanity), real-time database (Supabase), and a secure deployment pipeline to deliver a performant, content-managed experience.

**Domain:** emudev.cc | **Admin:** esteban.montero@gmail.com

### Core Vision

Ship a zero-maintenance portfolio that:
- Authoritatively sources projects, blog posts, and site settings from Sanity CMS
- Handles contact inquiries with email notifications and persistent storage
- Revalidates cache on content changes in seconds via webhook integration
- Deploys safely across dev/staging/production with approval gates
- Runs infrastructure on Vercel + Cloudflare with minimal operational overhead

---

## Key User Journeys

### 1. Visitor: Discover Portfolio
**Path:** Home → Projects → Blog → Contact

- Land on animated hero with name & tagline
- Browse 3 featured projects on homepage
- View full project gallery with descriptions, tech tags, live links, and repo links
- Read blog posts with author + publish date
- Submit contact form → instant success message → admin receives email

### 2. Admin: Publish Content
**Path:** Sanity Studio → Create/Edit → Publish → Auto-revalidate

- Edit project: title, slug, description, featured image, tags, live URL, repo URL, publish date
- Edit post: title, slug, excerpt, content (portable text), author, tags, publish date
- Update site settings: name, description, logo, social links
- Publish → Sanity webhook calls `/api/revalidate-tag` → Next.js revalidates cached pages in seconds

### 3. Admin: Manage Contact Form
**Path:** Supabase dashboard → View submissions → Delete spam/archive

- Contact form submissions stored in `contact_submissions` table
- Admin views via Supabase dashboard (RLS policy gates access to admin email only)
- Each submission receives email notification via Resend
- Admin can delete/archive submissions directly from database

---

## Goals

1. **Content Agility** — Publish projects and posts without rebuilding via ISR + Sanity webhooks
2. **Professional Presence** — Present clean, performant portfolio across all devices
3. **Lead Capture** — Collect contact form submissions with email fallback
4. **Zero Downtime Deploys** — Automated staging approval + smoke tests before production
5. **Security First** — RLS on database, webhook secret validation, no credentials in repo

---

## Non-Goals

- User authentication (portfolio is public; admin access via Supabase Magic Link only)
- Analytics dashboard (use external tools like Vercel Analytics)
- Multi-language support
- Blog comments (contact form is the feedback channel)
- Client-side image optimization (handled by Sanity CDN)

---

## Success Metrics

| Metric | Target | Method |
|--------|--------|--------|
| **Page Load (FCP)** | <1.5s | Lighthouse CI in deploy pipeline |
| **ISR Revalidate** | <5s after publish | Manual test: publish in Sanity, check cache |
| **CI Pass Rate** | 100% (PRs require green) | GitHub Actions enforcement |
| **Uptime** | 99.9% | Vercel + Cloudflare monitoring |
| **Contact Form Success** | 100% DB insert | Submission appears in Supabase within 30s |

---

## Technical Constraints

- **Next.js 15**: App Router only; `unstable_cache` (not `'use cache'`) for ISR
- **Sanity v3**: GROQ queries only; no GraphQL (not implemented in this version)
- **Supabase**: RLS required for production; migrations applied via `supabase db push`
- **No Magic UI Pro Yet**: Placeholder Tailwind v4; design system to be integrated later
- **GitHub Actions**: 3-env pipeline with manual approval for staging/production
- **Cloudflare**: WAF + cache purge on deploys; no Workers functions yet

---

## Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15.5 (App Router, SSG/ISR) |
| **Styling** | Tailwind CSS v4 |
| **CMS** | Sanity v3 (GROQ, Presentation preview) |
| **Database** | Supabase Postgres (RLS, Magic Link auth) |
| **Email** | Resend (transactional) |
| **Hosting** | Vercel (dev/staging/prod projects) |
| **CDN/WAF** | Cloudflare |
| **CI/CD** | GitHub Actions (3-env pipeline) |
| **Testing** | Playwright (smoke tests) |

---

## Phase Roadmap

- **Phase 1** ✅ (Complete): Scaffold, tooling, Sanity schema, Supabase migrations, CI/CD
- **Phase 2** ✅ (Complete): Populate Sanity content, generate types
- **Phase 3** ✅ (Complete): Link Supabase projects to all environments
- **Phase 4** ✅ (Complete): UI components, OG images, tag filter, post cards, draft mode
- **Phase 5** ✅ (Complete): GitHub Actions workflows (ci.yml, deploy.yml, hotfix.yml)
- **Phase 6** 🔄 (In Progress): Cloudflare WAF rules + cache configuration (branch: feature/phase-6-cloudflare)
- **Phase 7** (Pending): Smoke tests → green, production readiness

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **Sanity webhook fails** | Low | Medium | Implement retry logic in webhook; fallback to manual revalidate-tag call |
| **Supabase RLS misconfigured** | Medium | High | Test policies in staging before production; audit in PR review |
| **GitHub Actions secret leak** | Low | Critical | Use environment-level secrets, no query params for secrets, audit logs |
| **Cloudflare cache stale** | Medium | Low | Manual purge on deploy; set aggressive revalidation headers |
| **Vercel build timeout** | Low | Medium | Monitor build times in CI; optimize dependencies if needed |

---

## Project Owner

**Esteban Montero** (esteban.montero@gmail.com)
- Decision authority over architectural changes
- Approves deploys to staging/production
- Manages Sanity and Supabase project configurations
