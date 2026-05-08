# Project Roadmap

## Current Status: Phase 1 Complete (MVP Scaffold)

**Timeline:** May 8, 2026  
**Overall Progress:** 20% (Phase 1/5 complete)

---

## Phase 1: Project Scaffold & Infrastructure (COMPLETE)

**Status:** ✅ Complete  
**Target:** May 8, 2026  
**Actual:** May 8, 2026

### Deliverables

- [x] Next.js 15.5 App Router scaffold with TypeScript
- [x] Tailwind CSS v4 with semantic color tokens
- [x] Sanity v3 CMS schema (Project, Post, Author, Tag, SiteSettings)
- [x] Supabase Postgres database with RLS policies
- [x] Contact form with server action validation
- [x] ISR caching pattern with Sanity webhook integration
- [x] GitHub Actions 3-env pipeline (CI on PR, deploy to dev/staging/prod)
- [x] Vercel project setup (dev/staging/prod)
- [x] Cloudflare integration (basic DNS, cache rules)
- [x] Resend transactional email setup
- [x] Prettier + lint-staged git hooks
- [x] ESLint v10 flat config
- [x] Security headers (X-Frame-Options, HSTS, CSP)

### Files Created

```
app/
├── api/revalidate-tag/route.ts
├── actions/contact.ts
├── actions/auth.ts
├── layout.tsx
├── page.tsx (homepage)
├── about/page.tsx
├── projects/page.tsx
├── projects/[slug]/page.tsx
├── blog/page.tsx
├── blog/[slug]/page.tsx
├── contact/page.tsx
└── studio/[[...tool]]/page.tsx

components/
├── contact-form.tsx
├── portable-text-renderer.tsx
├── project-card.tsx
├── site-nav.tsx
└── ui/hero-section.tsx

lib/
├── sanity-client.ts
├── sanity-queries.ts
├── supabase-server.ts
└── supabase-browser.ts

types/
├── sanity.types.ts
└── supabase.types.ts

sanity/
├── schemas/ (project, post, author, tag, site-settings)
└── structure.ts

supabase/migrations/ (contact table, RLS, admin email)

tests/
└── smoke/pages.spec.ts

.github/workflows/ (ci.yml, deploy.yml, hotfix.yml)

docs/
├── project-overview-pdr.md
├── codebase-summary.md
├── code-standards.md
├── system-architecture.md
├── deployment-guide.md
├── project-roadmap.md (this file)
├── design-guidelines.md
└── README.md (updated)
```

### Known Limitations

- Hero section is basic (animation placeholder)
- UI components are barebones (no Magic UI Pro yet)
- Sanity schema is minimal (no nested content types)
- No user authentication dashboard (admin access via Supabase Magic Link only)
- No analytics integration
- No form spam protection (rate limiting only)

### Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Build size grows with content | Monitor bundle size; lazy-load heavy components |
| Webhook secret exposure | Use header-based secret, never query params |
| RLS misconfiguration | Test policies in staging; audit in PR review |
| Stale ISR cache | Implement manual purge + time-based fallback |

---

## Phase 2: Sanity Content Population (NEXT)

**Status:** Pending  
**Target:** May 15, 2026 (est.)  
**Duration:** 1 week

### Objectives

- Create 5-10 portfolio projects in Sanity
- Write 3-5 blog posts
- Configure site settings (logo, social links, bio)
- Generate Sanity TypeScript types
- Set up Sanity Studio desk structure for content editors

### Deliverables

- [x] Sanity project created + schema deployed
- [ ] Projects collection populated (5+ high-quality projects)
- [ ] Blog posts written + published (3+ posts)
- [ ] Site settings configured (name, description, logo, links)
- [ ] Sanity TypeScript types generated (`sanity typegen generate`)
- [ ] Desk structure customized for intuitive editing
- [ ] Webhook tested in all environments

### Acceptance Criteria

- [ ] Homepage displays 3 featured projects
- [ ] `/projects` lists all projects with working filters
- [ ] `/blog` shows all posts with pagination
- [ ] Publish a project → cache revalidates within 5 seconds
- [ ] Contact form sends test email
- [ ] No build errors with real Sanity data

### Dependencies

- Phase 1 complete
- Sanity project created

---

## Phase 3: Supabase Environment Linkage (IN PROGRESS)

**Status:** In Progress  
**Target:** May 22, 2026 (est.)  
**Duration:** 1 week

### Objectives

- Link Supabase projects to development, staging, and production
- Apply migrations to all environments
- Test RLS policies in each environment
- Configure Magic Link authentication (admin access)

### Deliverables

- [ ] Development Supabase project created + linked
- [ ] Staging Supabase project created + linked
- [ ] Production Supabase project created + linked
- [ ] Migrations applied to all 3 projects
- [ ] RLS policies tested (public INSERT, admin SELECT/DELETE)
- [ ] Admin email set in each environment's database
- [ ] Contact form tested end-to-end in all environments

### Acceptance Criteria

- [ ] Contact submissions save to all 3 databases
- [ ] Email notifications send from correct admin account
- [ ] Admin dashboard accessible only to admin email (if built)
- [ ] Zero data leaks via RLS misconfiguration
- [ ] Backup strategy documented

### Dependencies

- Phase 1 complete

---

## Phase 4: UI Components & Design System (PENDING)

**Status:** Pending  
**Target:** May 29, 2026 (est.)  
**Duration:** 2 weeks

### Objectives

- Integrate Magic UI Pro (or equivalent design system)
- Build hero section with animations
- Implement project detail page design
- Build blog post layouts
- Optimize typography & spacing
- Create responsive grid layouts

### Deliverables

- [ ] Magic UI Pro or equivalent design system integrated
- [ ] Hero section with animations (title, bio, CTA)
- [ ] Project card redesigned (image, tags, description)
- [ ] Project detail page (content rendering, related projects)
- [ ] Blog post layout (metadata, rich text, author bio)
- [ ] Blog list with search/filtering
- [ ] About page with personal bio + tech stack
- [ ] Footer with social links
- [ ] Responsive design tested on mobile/tablet/desktop

### Acceptance Criteria

- [ ] Lighthouse score >90 on all pages
- [ ] Mobile layout works without horizontal scroll
- [ ] All UI components have dark/light mode support
- [ ] No layout shift (CLS <0.1)
- [ ] Animations perform smoothly (60 FPS)

### Dependencies

- Phase 2 (content available)
- Phase 3 (Supabase linked)

---

## Phase 5: GitHub Actions CI/CD Secrets & Environments (IN PROGRESS)

**Status:** In Progress  
**Target:** May 28, 2026 (est.)  
**Duration:** 3 days

### Objectives

- Configure GitHub repository secrets
- Set up environment-specific secrets (dev/staging/prod)
- Configure approval gates for staging & production
- Test full deployment pipeline

### Deliverables

- [x] GitHub Environments created (development, staging, production)
- [ ] Repository secrets configured (VERCEL_TOKEN, CF_API_TOKEN, etc.)
- [ ] Environment secrets set for all 3 environments
- [ ] Approval gates enabled for staging & production
- [ ] Branch protection rules: require CI to pass
- [ ] Hotfix workflow configured
- [ ] Test deployment from develop → staging → main

### Acceptance Criteria

- [ ] PR to main requires CI to pass (required status check)
- [ ] Staging deploy requires manual approval
- [ ] Production deploy requires manual approval
- [ ] Hotfix deploys auto-approve (for emergencies)
- [ ] Secrets are NOT logged or exposed in Actions output
- [ ] All 3 environments deploy successfully

### Dependencies

- Phase 1 & 3 complete

---

## Phase 6: Cloudflare WAF & Cache Optimization (PENDING)

**Status:** Pending  
**Target:** June 4, 2026 (est.)  
**Duration:** 3-5 days

### Objectives

- Configure Cloudflare security rules
- Optimize cache TTL per content type
- Set up rate limiting for contact form
- Configure bot mitigation
- Test cache purge on deploy

### Deliverables

- [ ] Domain nameservers pointing to Cloudflare
- [ ] SSL/TLS configured (TLS 1.3 minimum)
- [ ] Cache rules created (static: 1 year, HTML: 1 hour, API: bypass)
- [ ] WAF rules enabled (OWASP ModSecurity Core Rule Set)
- [ ] Rate limiting configured (contact form: 10 req/10 sec)
- [ ] Cache purge automated on deploy
- [ ] Performance monitoring enabled

### Acceptance Criteria

- [ ] https://emudev.cc resolves via Cloudflare
- [ ] All security headers present (checked via curl)
- [ ] Cache hit ratio >80% for static assets
- [ ] Bot attacks blocked (WAF logs show 0 allowed attacks)
- [ ] Manual cache purge works
- [ ] Deploy automatically purges cache

### Dependencies

- Phase 1 complete
- Domain registered & DNS configured

---

## Phase 7: Smoke Tests & Production Readiness (PENDING)

**Status:** Pending  
**Target:** June 11, 2026 (est.)  
**Duration:** 1 week

### Objectives

- Write comprehensive smoke tests
- Test all user journeys
- Create QA checklist
- Verify performance baselines
- Document deployment runbook

### Deliverables

- [x] Playwright smoke tests written (basic)
- [ ] Test homepage, projects, blog, contact all load
- [ ] Test contact form submit workflow
- [ ] Test ISR revalidation (publish → cache clear)
- [ ] Test Sanity preview mode (drafts)
- [ ] Performance benchmarks (FCP <1.5s, LCP <2.5s)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] QA checklist documented
- [ ] Deployment runbook completed
- [ ] Emergency rollback procedure documented

### Acceptance Criteria

- [ ] All smoke tests pass in CI
- [ ] Staging deploy requires tests to pass
- [ ] Production deploy requires tests to pass
- [ ] Lighthouse score >90 on all pages
- [ ] No console errors (checked via Playwright)
- [ ] Contact form works end-to-end
- [ ] Team trained on deployment process

### Dependencies

- Phase 4 complete (UI stable)
- Phase 5 complete (CI/CD working)

---

## Phase 8: Launch & Post-Launch (FUTURE)

**Status:** Not Started  
**Target:** June 18, 2026 (est.)  
**Duration:** Ongoing

### Objectives

- Deploy to production
- Monitor analytics & uptime
- Gather feedback
- Fix launch bugs
- Plan Phase 2 features

### Deliverables

- [ ] Production deployment successful
- [ ] Domain live at https://emudev.cc
- [ ] Analytics tracking enabled (Vercel Analytics)
- [ ] Monitoring & alerts configured
- [ ] Feedback collection (contact form, GitHub issues)
- [ ] Post-launch retrospective

### Success Metrics

- [ ] Uptime: 99.9%
- [ ] FCP: <1.5s
- [ ] Error rate: <0.1%
- [ ] Contact form submissions: >0
- [ ] Performance: Lighthouse >90
- [ ] Accessibility: WCAG 2.1 AA

---

## Future Features (Backlog)

### High Priority

- **Admin Dashboard** — View/delete contact submissions, stats
- **Blog Comments** — Allow readers to comment (optional)
- **Search** — Full-text search across projects & blog
- **Tags Filter** — Filter projects by technology
- **Newsletter** — Email subscription (Resend list)
- **Analytics** — Track pageviews, popular pages
- **SEO Optimization** — Open Graph, structured data, sitemap

### Medium Priority

- **Dark Mode Toggle** — User preference with localStorage
- **Project Gallery** — Lightbox for project screenshots
- **Video Embeds** — Demo videos in project detail
- **Code Highlighting** — Syntax highlighting for code blocks
- **Related Posts** — Show similar blog posts
- **Reading Time** — Estimate reading time for posts

### Low Priority

- **Changelog** — Document site updates
- **Sponsors** — Showcase sponsors or affiliates
- **Newsletter Archive** — Browse past newsletters
- **Testimonials** — Client testimonials section
- **Speaking Engagements** — Conference talks & podcasts

---

## Dependencies & Blockers

### Current Blockers

None identified.

### Phase Dependencies

```
Phase 1 (DONE)
├─ Phase 2 (waiting for: nothing)
├─ Phase 3 (waiting for: Phase 1)
├─ Phase 4 (waiting for: Phase 2, Phase 3)
├─ Phase 5 (waiting for: Phase 1, Phase 3)
├─ Phase 6 (waiting for: Phase 1, domain)
└─ Phase 7 (waiting for: Phase 4, Phase 5)
```

### External Dependencies

- [ ] Sanity project creation (user responsibility)
- [ ] Supabase projects creation (user responsibility)
- [ ] Vercel project setup (user responsibility)
- [ ] GitHub Environments configuration (user responsibility)
- [ ] Cloudflare domain setup (user responsibility)

---

## Metrics & Monitoring

### Key Success Indicators

| Metric | Phase | Target | Current |
|--------|-------|--------|---------|
| **Build Time** | 1 | <3 min | ~2 min |
| **Page Load (FCP)** | 4 | <1.5s | TBD |
| **Cache Hit Ratio** | 6 | >80% | N/A |
| **Test Coverage** | 7 | >70% | ~20% |
| **Uptime** | 8 | 99.9% | N/A |
| **Contact Submissions** | 8 | >1/week | N/A |

### Monitoring Tools

- Vercel Analytics (built-in Core Web Vitals)
- Lighthouse CI (in deploy workflow)
- Sanity Activity Log (content changes)
- Supabase Logs (database queries, auth)
- Cloudflare Analytics (traffic, cache, WAF)
- GitHub Actions (CI/CD status)

---

## Release Schedule

| Phase | Start | End | Duration |
|-------|-------|-----|----------|
| Phase 1 | May 1 | May 8 | 1 week |
| Phase 2 | May 9 | May 15 | 1 week |
| Phase 3 | May 16 | May 22 | 1 week |
| Phase 4 | May 23 | Jun 5 | 2 weeks |
| Phase 5 | May 23 | May 28 | 1 week (parallel) |
| Phase 6 | May 29 | Jun 4 | 1 week |
| Phase 7 | Jun 5 | Jun 11 | 1 week |
| Launch | Jun 12 | Jun 18 | 1 week |

**Total:** ~8 weeks from Phase 1 start to production launch.

---

## Version History

| Version | Date | Phase | Changes |
|---------|------|-------|---------|
| 0.1.0 | May 8 | 1 | Initial scaffold + infrastructure |
| 0.2.0 | May 15 | 2 | Content population |
| 0.3.0 | May 22 | 3 | Supabase linkage |
| 0.4.0 | Jun 5 | 4 | UI & design system |
| 0.5.0 | Jun 11 | 7 | Smoke tests & production readiness |
| 1.0.0 | Jun 18 | 8 | Production launch |
