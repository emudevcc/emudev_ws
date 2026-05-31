# Project Roadmap

## Current Status: Phases 1-8.5 + 9.0-9.18 Complete, Bilingual Live

**Timeline:** May 25, 2026
**Overall Progress:** 100% (Phases 1-8.5 + 9.0-9.18 complete; Phase 10+ future work)

---

## Phase 1: Project Scaffold & Infrastructure (COMPLETE)

**Status:** ✅ Complete
**Target:** May 8, 2026
**Actual:** May 8, 2026

### Deliverables

- [x] Next.js 15.5 App Router scaffold with TypeScript
- [x] Tailwind CSS v4 with semantic color tokens
- [x] Initial Sanity v3 CMS schema (later expanded to 14 document types in Phase 8.5)
- [x] Supabase Postgres database with RLS policies
- [x] Contact form with server action validation
- [x] ISR caching pattern with Sanity webhook integration
- [x] GitHub Actions 3-env pipeline (CI on PR, deploy to dev/staging/prod)
- [x] Vercel project setup (dev/staging/prod)
- [x] Cloudflare integration (basic DNS, cache rules)
- [x] Resend transactional email setup
- [x] Prettier + lint-staged git hooks
- [x] ESLint v9 flat config
- [x] Security headers (X-Frame-Options, HSTS, CSP)

---

## Phase 2-5: Content, Database, UI, CI/CD (COMPLETE)

**Status:** ✅ Complete
**Actual:** May 8, 2026

### Phase 2: Content Population

- [x] Sanity project created + schema deployed
- [x] Sample projects & blog posts

### Phase 3: Supabase Setup

- [x] Development, staging, production Supabase projects linked
- [x] Migrations applied to all 3 environments
- [x] RLS policies tested

### Phase 4: UI Components & Design

- [x] Tag filter component
- [x] Post card component
- [x] Dynamic OG images (blog + projects)
- [x] Sanity Draft Mode API routes
- [x] Sitemap generation
- [x] Responsive design verified

### Phase 5: GitHub Actions Pipelines

- [x] CI workflow (lint, typecheck, build)
- [x] Deploy workflow (3-env: dev, staging, prod)
- [x] Hotfix workflow (emergency PRs)
- [x] Supabase migrations automated
- [x] Vercel git integration active

---

## Phase 6: Cloudflare WAF & Draft Mode (COMPLETE)

**Status:** ✅ Complete
**Target:** June 4, 2026 (est.)
**Actual:** May 10, 2026

### Deliverables

- [x] Domain nameservers pointing to Cloudflare (emudev.cc live)
- [x] SSL/TLS configured (Full Strict, TLS 1.3+)
- [x] Cache rules created (static: 1 year, HTML: 1 hour, API: bypass)
- [x] WAF rules enabled (Cloudflare Managed Ruleset)
- [x] Production deployment to emudev.cc working
- [x] Cache purge automated on deploy
- [x] Sanity Presentation Tool configured with draft mode
- [x] CSP header allows `frame-ancestors 'self'` for studio iframe
- [x] Draft mode API routes secure (validatePreviewUrl)
- [x] SSL Full Strict + HSTS headers active

---

## Phase 7: Smoke Tests & Production Readiness (COMPLETE)

**Status:** ✅ Complete
**Target:** June 11, 2026 (est.)
**Actual:** May 10, 2026

### Deliverables

- [x] Playwright CI-optimized config (chromium only, retries in CI)
- [x] Health check tests (GET /api/health → 200)
- [x] Public pages tests (/, /about, /projects, /blog, /contact → 200)
- [x] Sitemap validation (sitemap.xml valid XML)
- [x] Robots.txt check (returns 200)
- [x] Navigation tests (links <400ms, h1 visible)
- [x] Contact form render tests (form renders with required fields)
- [x] GitHub Actions deploy integration (smoke tests run post-deploy)

### Test Results

- **11 original tests**, all passing
- **Duration:** 7.1s against production
- **Success Rate:** 100% in CI

---

## Phase 8: Bilingual i18n and CMS Platform (COMPLETE)

**Status:** ✅ Complete through Phase 8.5
**Branch:** `feature/phase-6-cloudflare` + `plans/260510-i18n-bilingual`
**Target:** May 15, 2026 (est.)
**Actual:** May 10-11, 2026

### Phase 8.1: Middleware & Route Migration (COMPLETE)

**Status:** ✅ Complete (May 10, 2026)

**Deliverables:**

- [x] `middleware.ts` — next-intl middleware (routes all non-API/studio paths through locale detection)
- [x] `i18n/routing.ts` — defineRouting config (locales: ['en', 'es'], defaultLocale: 'en', localePrefix: 'always')
- [x] `i18n/request.ts` — getRequestConfig; resolves locale, imports messages
- [x] `i18n/navigation.ts` — locale-aware Link, redirect, useRouter, getPathname
- [x] `messages/en.json` & `messages/es.json` — Complete UI string translations (nav, home, projects, blog, contact, etc.)
- [x] `components/locale-switcher.tsx` — Client component; EN↔ES toggle
- [x] Route migration: all pages routed via `[locale]` segment
- [x] `next.config.ts` — Wrapped with createNextIntlPlugin
- [x] `components/site-nav.tsx` — Async server component with LocaleSwitcher
- [x] `app/layout.tsx` — Stripped to bare shell
- [x] `app/[locale]/layout.tsx` — Full layout with NextIntlClientProvider

**Success Metrics:**

- [x] Both /en and /es routes load and render correctly
- [x] Middleware auto-detects locale from Accept-Language header
- [x] Root `/` redirects to `/en` (default locale)
- [x] LocaleSwitcher toggles between EN and ES
- [x] No TypeScript errors

### Phase 8.2: UI String Extraction (COMPLETE)

**Status:** ✅ Complete (May 10, 2026)

**Objectives:** Extract hardcoded strings from components/pages to use getTranslations() / useTranslations()

**Deliverables:**

- [x] Page components: getTranslations({ locale, namespace }) usage
- [x] Client components: useTranslations() hook usage
- [x] No hardcoded UI strings in JSX (all via messages/{locale}.json)
- [x] Smoke tests validate message key parity between EN and ES

**Success Metrics:**

- [x] All UI strings display in correct locale
- [x] No missing translation keys
- [x] Smoke tests confirm message structure parity

### Phase 8.3: Sanity Bilingual Content (COMPLETE)

**Status:** ✅ Complete (May 10, 2026)

**Objectives:** Update Sanity schemas for locale-aware fields

**Deliverables:**

- [x] Sanity schema fields: { en: string, es: string } structure for title, description, content, etc.
- [x] sanity-queries.ts: Query functions accept locale param
- [x] GROQ queries: Use coalesce(field[$locale], field.en) pattern for graceful fallback
- [x] Locale-specific ISR cache keys with collection revalidation tags
- [x] Content editing: Admin edits separate EN/ES versions per document
- [x] Webhook revalidates collection tags used by all locale cache entries

**Success Metrics:**

- [x] Sanity content renders in both EN and ES
- [x] Locale fallback works (coalesce pattern)
- [x] Per-locale cache tags prevent cross-locale pollution
- [x] Smoke tests validate bilingual content rendering

### Phase 8.4: SEO & Sitemap (PLANNED)

**Status:** ✅ Complete (May 11, 2026)

**Objectives:** Implement locale variants in sitemap & robots.txt

**Deliverables:**

- [x] Sitemap: Include /en/_ and /es/_ URLs
- [x] Hreflang alternates for static locale pages
- [x] Canonical links for locale-prefixed pages
- [x] Static smoke coverage for sitemap and hreflang contracts

### Phase 8.5: Sanity Content Model Refactor (COMPLETE)

**Status:** ✅ Complete (May 12, 2026)

**Objectives:** Expand the CMS model for Classic / Sidebar / Bento portfolio layouts.

**Deliverables:**

- [x] Sanity document model expanded from 5 to 14 types
- [x] Shared localized field helpers in `sanity/lib/i18n-helpers.ts`
- [x] `siteSettings`, `project`, and `post` expanded with optional fields
- [x] New About, Skill, Experience, Certification, Education, Language, Strength, SocialPost, and Testimonial schemas
- [x] Studio desk structure grouped into Singletons, Portfolio, Blog, Skills & Credentials, and About Extras
- [x] GROQ query layer expanded with `localized-v3` cache keys and collection tags
- [x] Content-model smoke tests added to CI

---

## Phase 9: Post-Launch & UI Enhancement (COMPLETE)

**Status:** ✅ Phases 9.0-9.18 complete
**Current Date:** May 25, 2026
**Overall Progress:** 100%

### Phase 9.0: Production Deployment (COMPLETE)

**Status:** ✅ Live as of May 11, 2026

- [x] Bilingual production deployment (en/es)
- [x] Domain live at https://emudev.cc
- [x] Analytics tracking enabled (Vercel Analytics)
- [x] Monitoring & alerts configured
- [x] Post-launch retrospective

### Phase 9.1: Magic UI Installation (COMPLETE)

**Status:** ✅ Complete (May 12, 2026) (see `plans/260511-2210-magic-ui-install`)
**Priority:** P1
**Phases:** 3

Deliverables:
- [x] Install 10 free-tier Magic UI components via shadcn CLI
- [x] Source MagicCard & Lens from Pro (manual copy, API-compatible local components)
- [x] Integrate CSS token system (full shadcn/ui HSL token set + @theme inline in globals.css)
- [x] Add `components.json` (shadcn config) + `lib/utils.ts` (cn utility)
- [x] Add framer-motion, clsx, tailwind-merge, next-themes dependencies

### Phase 9.2: Classic Layout UI (COMPLETE)

**Status:** ✅ Complete (May 12, 2026)
**Priority:** P1
**Phases:** 8

**Deliverables:**

- [x] Page shell: DotPattern background, StatusPill, LangThemeToggle, DockNav
- [x] Hero + About sections (BlurFade, NumberTicker, AnimatedShinyText, Chip row)
- [x] Experience Timeline (vertical hairline, MagicCard rows, BlurFade stagger)
- [x] Projects Grid (MagicCard, BorderBeam on featured, Lens on cover)
- [x] Skills 2×2 tiles + GitHub Contributions heatmap (API route)
- [x] Social posts, Credentials, Strengths, Writing List sections
- [x] Contact form (MagicCard, ShimmerButton) + POST /api/contact (Resend)
- [x] Footer + SEO polish (generateMetadata, OG image, sitemap, robots.ts)
- [x] 11 section components in `components/sections/` (HeroSection, AboutSection, ExperienceTimeline, SkillsSection, ProjectsGrid, CredentialsSection, WritingList, SocialPostsGrid, StrengthsCard, ContributionsCard, FooterSection, ContactSection)
- [x] New hooks: `hooks/use-active-section.ts` (scroll-triggered section tracking)
- [x] New lib files: `lib/content.ts` (content aggregation), `lib/github.ts` (GitHub contributions API)
- [x] Hydration fix: `components/ui/lang-theme-toggle.tsx` uses `useSyncExternalStore` to prevent React 19 hydration mismatch

### Phase 9.3: SEO Canonical & Hreflang Fix (COMPLETE)

**Status:** ✅ Complete (May 12, 2026)
**Priority:** P1

**Deliverables:**

- [x] `lib/metadata.ts`: `localeAlternates(pathname, locale)` now accepts optional `locale` param for self-referential canonicals
- [x] Canonical per-locale: `/en/about` → canonical: `/en/about` (not always `/en/...`)
- [x] All locale pages converted from `export const metadata` to `export async function generateMetadata({ params })` to access locale at runtime
- [x] Blog `[slug]` and projects `[slug]` pages now pass locale to `localeAlternates()` for correct per-locale canonical
- [x] Hreflang alternates include self-reference + `en`, `es`, `x-default` per page
- [x] Verified with smoke tests and manual inspection

### Phase 9.4: Sanity Seed Data & Content Population (PENDING)

**Status:** ⏳ Pending (plan created: `plans/260512-1933-sanity-content-population/`)
**Priority:** P1

**Deliverables (Planned):**

- [ ] Seed files generated: `sanity/seed/` directory with 10 NDJSON files (siteSettings, about, experience×4, skills×17, certifications, education, languages, strengths×5, projects×3)
- [ ] `sanity/seed/seed.sh` script to merge + import all seed data to Sanity via `sanity import` CLI
- [ ] Verify all 14 content types instantiated with bilingual content
- [ ] Test ISR revalidation with seeded content

### Phase 9.5: MagicUI Blog Redesign (COMPLETE)

**Status:** ✅ Complete (May 12, 2026)
**Priority:** P1

**Deliverables:**

- [x] Featured blog post hero section with cover image + metadata
- [x] Tag filter for blog posts (per-locale)
- [x] Blog card grid with hover effects and date/author display
- [x] Polished blog post layout with typography and styling
- [x] Author attribution with bilingual support

### Phase 9.6: Three.js Hero Particle Background (COMPLETE)

**Status:** ✅ Complete (May 15, 2026)
**Priority:** P0 (visual polish)

**Deliverables:**

- [x] Three.js WebGL particle network: 110 nodes with accent-orange connection lines
- [x] `components/ui/hero-background.tsx` — Client component with mouse parallax, ambient rotation, prefers-reduced-motion support
- [x] `components/ui/hero-background-loader.tsx` — SSR-safe dynamic import shim (ssr: false boundary pattern)
- [x] Design token `--hero-vignette` added to `app/globals.css` (dark: white fade, light: accent-orange fade)
- [x] `three@^0.184.0` dependency added to package.json
- [x] HeroSection integrated with HeroBackground positioned absolutely behind content
- [x] Documentation added to `docs/design-guidelines.md` (SSR boundary pattern, vignette token) and `docs/system-architecture.md`

**Technical Highlights:**

- Static topology (pre-computed connection lines) for performance
- Responsive canvas with ResizeObserver
- Mobile optimized: capped pixel ratio (1.5×), fixed particle count
- Motion-safe: respects `prefers-reduced-motion` → static frame
- Uses design token `--accent` (#e34d2a) for connection color

### Phase 9.7: Navigation Refactor & PageTransition (COMPLETE)

**Status:** ✅ Complete (May 15, 2026); About page re-added (May 19, 2026)
**Priority:** P0 (UX polish)

**Deliverables:**

- [x] Initially removed `/[locale]/about` and `/[locale]/contact` standalone page routes
- [x] About and Contact initially implemented as `<section id="about|contact">` elements on homepage
- [x] Top nav uses native `<a href="/{locale}#anchor">` tags for same-page hash navigation (not next-intl Link)
- [x] Nav order: Home → Projects → Blog → About (hash) → Contact (hash)
- [x] **Re-added** `/[locale]/about` as dedicated About page route (May 19, 2026) — reuses existing AboutSection component
- [x] `components/ui/page-transition.tsx` — Client component with motion.main keyed by pathname
- [x] PageTransition animation: opacity 0→1, y: 8→0, blur 4px→0, 300ms easeOut
- [x] Applied globally in `app/[locale]/layout.tsx` wrapping page children
- [x] Hash anchor navigation does NOT trigger PageTransition (same pathname)
- [x] Navigation: added Projects route link (`Link href="/projects"`) to nav, updated nav order: Home → Projects → Blog → About → Contact
- [x] Documentation updated: `docs/design-guidelines.md` (Motion section + PageTransition), `docs/code-standards.md` (hash-anchor pattern), `docs/system-architecture.md` (route table)

**Technical Highlights:**

- Native `<a>` prevents next-intl Client Component hydration issues with hash-only navigation
- PageTransition triggers on full route changes (pathname key change in motion.main)
- Motion library dependency: `motion/react` (framer-motion v11+)
- Navigation uses mix of full routes (Home, Projects, Blog) and hash anchors (About, Contact) for flexible user flows

### Phase 9.8: DotPattern Hydration Fix (COMPLETE)

**Status:** ✅ Complete (May 15, 2026)
**Priority:** P1 (stability)

**Deliverables:**

- [x] Fixed hydration mismatch in `components/ui/dot-pattern.tsx`
- [x] Root cause: `useId()` indexing shifts between SSR and client when ThemeProvider injects `<script>` tag
- [x] Solution: Conditionally render `<defs>/<radialGradient>` ONLY when `glow={true}`
- [x] When `glow=false` (layout default), no `id` attribute emitted → no SSR/client mismatch
- [x] Added `shouldRenderDots` guard to prevent dot rendering before dimensions measured
- [x] Verified in both light and dark themes

**Technical Highlights:**

- Eliminates React hydration mismatch error in browser console
- Conditional ID generation prevents index desync
- Performance: no impact (glow typically false in layout backgrounds)

### Phase 9.9: Footer & Social Feed Redesign (COMPLETE)

**Status:** ✅ Complete (May 15, 2026)
**Priority:** P1 (UX completeness)

**Deliverables:**

- [x] `FooterSection` rebuilt as async server component — brand column (name, tagline, social links), Navigate column (Home/Blog/Projects/Contact), Explore column (About/Experience/Skills/Credentials), copyright bar
- [x] Footer i18n: `getTranslations('footer')`, `getLocale()` from next-intl/server; keys added to `messages/en.json` and `messages/es.json`
- [x] Social feed replaced marquee with `SocialFeedGrid` — 7 platform filter tabs (All/YouTube/TikTok/Instagram/Reddit/X/Threads), 3-col responsive grid, BlurFade animations per card
- [x] `SocialFeedCard` — platform color/label config map, MediaPlaceholder for video platforms, engagement metrics, `fmt()` helper
- [x] Removed social links block from below ContactSection (now in footer only)
- [x] Pagination for SocialFeedGrid: PAGE_SIZE=6, prev/next buttons, page counter; filter tab click resets page to 1; BlurFade re-keyed on page change (`${id}-p${page}`)

**Technical Highlights:**

- Footer navigation uses locale-prefixed hrefs (`/${locale}#section` for hash anchors, `/${locale}/blog` for routes)
- SocialFeedGrid filter tabs reset `useMemo` on tab change; BlurFade staggered delay `0.04 + i * 0.05`

### Phase 9.10: DotPattern Twinkle Animation (COMPLETE)

**Status:** ✅ Complete (May 16, 2026)
**Priority:** P2 (visual polish)

**Deliverables:**

- [x] Added `twinkle?: boolean` prop to `components/ui/dot-pattern.tsx`
- [x] Implemented `useReducedMotion()` from `motion/react` — skips animation for users with reduced motion preference
- [x] Per-dot animation: `dotTiming(index)` function uses two independent hash seeds (`n1`, `n2`) for delay + star selection and duration
- [x] Star selection: `isStar = n1 < 0.12` → ~12% of dots randomly selected for twinkling
- [x] Twinkling animation: `fillOpacity: [0.2, 0.72, 0.2]` pulse, duration 2.5–5s (calculated per-dot), delay 0–7s, `ease: 'easeInOut'`, `repeat: Infinity`
- [x] Non-twinkling dots: static `fillOpacity={0.2}` with no animation
- [x] Applied in `app/[locale]/layout.tsx`: `<DotPattern twinkle className="text-muted-foreground [mask-image:...]" />`
- [x] Design tokens: Dot color from `text-muted-foreground` token (full color, no opacity modifier)

**Technical Highlights:**

- Independent hash seeds prevent delay/duration correlation
- `prefers-reduced-motion` support ensures accessibility
- Per-dot random selection creates natural star-like twinkling effect
- No impact on layout or performance (CSS-driven animation)

### Phase 9.11: Contact Form Simplification (COMPLETE)

**Status:** ✅ Complete (May 16, 2026)
**Priority:** P2 (UX cleanup)

**Deliverables:**

- [x] Contact form reduced from 7 fields to 4: name, email, company (optional), message
- [x] Removed oppType, budget, timeline, foundVia fields (no longer collected)
- [x] Removed SelectField component (no longer needed)
- [x] API endpoint: `POST /api/contact` sends only name, email (optional company), message to DB
- [x] Email notification updated: From + Company (if provided) + message body
- [x] New env var: `CONTACT_TO_EMAIL=esteban@emudev.com` (takes priority over `ADMIN_EMAIL`)
- [x] Message keys updated: removed opp/budget/timeline/found keys; updated subtitle to general contact framing
- [x] i18n: `messages/en.json` and `messages/es.json` updated with 4-field form labels

**Technical Highlights:**

- Simplified contact form flow reduces spam filtering complexity
- `CONTACT_TO_EMAIL` allows independent contact routing from admin email

### Phase 9.12: Smooth Scroll Behavior (COMPLETE)

**Status:** ✅ Complete (May 16, 2026)
**Priority:** P2 (UX polish)

**Deliverables:**

- [x] Added `scroll-behavior: smooth` to `html` in `app/globals.css` (@layer base)
- [x] Added `@media (prefers-reduced-motion: reduce)` guard: resets to `scroll-behavior: auto`
- [x] Applied to all anchor navigation: hero stats (#experience, #skills, #credentials, #posts, #languages, #social), footer links, section navigation

**Technical Highlights:**

- Respects accessibility preferences (prefers-reduced-motion)
- Improves perceived smoothness of hash anchor navigation

### Phase 9.13: Hero Section — 6 Stats with Anchor Links (COMPLETE)

**Status:** ✅ Complete (May 16, 2026)
**Priority:** P1 (core feature)

**Deliverables:**

- [x] Hero stats expanded from 5 to 6: Years of Experience, Skills, Credentials, Posts, Languages, Social Links
- [x] Grid layout: `grid-cols-3 sm:grid-cols-6` (responsive 3×2 on mobile, 1×6 on desktop)
- [x] `yearsOfExperience`: computed in `app/[locale]/page.tsx` from earliest `experience.startDate` — `currentYear - min(startDate.year)`
- [x] `languageCount`: from `languages.length` (already fetched)
- [x] `postCount`: from `posts.length` (already fetched)
- [x] Stat anchors: #experience, #skills, #credentials, #writing, #credentials (languages), #social
- [x] Stats are clickable links with hover brightening + ArrowRight affordance
- [x] i18n: Added `statExperience`, `statSkills`, `statCredentials`, `statPosts`, `statLanguages`, `statLinks` to messages
- [x] Removed `projectCount` prop (replaced with language count)

**Technical Highlights:**

- Years of experience computed at runtime from earliest recorded start date
- Each stat anchors to relevant section for easy navigation
- Responsive grid adapts 6 stats to mobile (3 per row) and desktop (single row)

### Phase 9.14: Homepage Section Reorder (COMPLETE)

**Status:** ✅ Complete (May 16, 2026)
**Priority:** P2 (UX structure)

**Deliverables:**

- [x] Updated section order: Hero → About → Experience → Projects → Skills → Credentials → Writing → Strengths → Social → Contact → Footer
- [x] Previously: Social was before Credentials, Strengths was before Writing
- [x] All section IDs updated in HTML to match nav anchor links
- [x] Footer positioned at end (after Contact)

**Technical Highlights:**

- Better UX flow: core info → credentials → content → social proof → contact call-to-action
- Strengthens conversion funnel (call-to-action positioned before footer)

### Phase 9.16: Mobile Scroll Parallax & GitHub Contributions Fix (COMPLETE)

**Status:** ✅ Complete (May 20, 2026)
**Priority:** P1 (stability + mobile UX)

**Deliverables:**

- [x] Mobile scroll parallax: Hero background responds to scroll on touch devices (pointer:coarse); desktop remains mousemove parallax
- [x] Replaced gyroscope-based parallax with scroll progress (0–1) → camera Y position (±1.0×) on mobile
- [x] prefers-reduced-motion respected on both desktop and mobile parallax paths
- [x] GitHub contributions route error handling: try/catch for network errors + JSON parse failures
- [x] Graceful fallback: empty contributions array if API call fails

**Technical Highlights:**

- Mobile detection via CSS media query `(pointer: coarse)` in hero-background.tsx
- Scroll event listener calculates document.scrollingElement.scrollTop / (scrollHeight - clientHeight)
- Desktop parallax unaffected; mobile parallax replaces gyroscope permission prompt

### Phase 9.17: Visual Enhancements — Space Depth Hero & DotPattern + Breadcrumb Navigation (COMPLETE)

**Status:** ✅ Complete (May 25, 2026)
**Priority:** P1 (visual polish + SEO)

**Deliverables:**

**HeroBackground Space Depth Redesign:**

- [x] Redesigned particle system: 110 total particles across 3 depth layers (far: 55@1.2px opacity 0.30, mid: 38@2.2px opacity 0.65, near: 17@3.8px opacity 0.92)
- [x] Accent nodes: ~9 green (#22c55e) at 3.2px opacity 0.82, ~5 cold-blue (#b8d4ff) at 2.8px opacity 0.60
- [x] Orange connection lines (#e34d2a) at opacity 0.42 with CONNECTION_DIST=4.2
- [x] Documentation updated: design-guidelines.md, codebase-summary.md

**DotPattern Space Depth + Color Accents Redesign:**

- [x] Depth tier sizes: 30% small/far (0.55×), 55% medium (1.0×), 15% large/near (1.6×)
- [x] Depth opacity (white dots): far 0.18, mid 0.32, near 0.50
- [x] Deterministic pseudorandom seeding: 3 seeds per dot (delay, duration, color)
- [x] Color accents: ~6% green pulse (fillOpacity peak 0.80), ~6% orange pulse (0.70), ~12% white twinkle (mutually exclusive)
- [x] Dot radius reduced to `cr={1}` (was 1.5)
- [x] LayoutWidgets wrapper now has `opacity-40` for background recession effect
- [x] Documentation updated: design-guidelines.md, codebase-summary.md

**Breadcrumb Navigation (New Component):**

- [x] New `components/ui/breadcrumb.tsx` component
- [x] Props: `items: Array<{ label: string; href?: string }>`
- [x] Features: aria-current on current page, middot separator, locale-aware Link, max-w-60 truncation
- [x] Added to blog list: home → blog
- [x] Added to blog post detail: home → blog → post title (with JSON-LD breadcrumb schema for SEO)
- [x] Added to projects list: home → projects
- [x] Added to projects detail: home → projects → project title
- [x] Documentation added: code-standards.md (Breadcrumb pattern section)

**Technical Highlights:**

- Space depth creates perception of background recession via particle layering + opacity gradients
- Color accent seeding ensures consistent per-dot behavior (delay/duration/color always match for same dot index)
- Breadcrumb JSON-LD schema improves rich snippet rendering in search results
- Mobile parallax fix + space depth redesign enhance perceived depth on all devices
- Documentation updated across 4 files (codebase-summary, design-guidelines, code-standards, system-architecture)

**Success Metrics:**

- [x] Visual polish: space depth perceived via layering and accent colors
- [x] SEO improvement: breadcrumb schema for blog/project detail pages
- [x] Mobile UX: smooth scroll parallax without permission prompts
- [x] Background recession: opacity-40 on LayoutWidgets dims DotPattern effectively

### Phase 9.18: Certifications Enhancement & Client Privacy (COMPLETE)

**Status:** ✅ Complete (May 25, 2026)

### Phase 9.19: Vercel Analytics & Speed Insights (COMPLETE)

**Status:** ✅ Complete (May 26, 2026)
**Priority:** P1 (monitoring/observability)

**Deliverables:**

- [x] Added `@vercel/analytics` and `@vercel/speed-insights` packages
- [x] Imported `Analytics` and `SpeedInsights` components in `app/[locale]/layout.tsx`
- [x] No additional env vars needed; auto-configured via Vercel project settings
- [x] Analytics tracks: pageviews, session count, referrer, device type, locale (geo IP)
- [x] Speed Insights tracks: Core Web Vitals (LCP, FID, CLS), first-party execution time
- [x] Zero client-side cost: uses browser Web Vitals API + Vercel edge infrastructure

### Phase 9.20: SEO & Structured Data (OG Images, JSON-LD, AI Bot Rules) (COMPLETE)

**Status:** ✅ Complete (May 26, 2026)
**Priority:** P1 (SEO)

**Deliverables:**

- [x] `app/opengraph-image.tsx` — Default OG image (1200×630, ImageResponse edge runtime)
- [x] Per-page OG images: `/[locale]/blog/[slug]/opengraph-image.tsx`, `/[locale]/projects/[slug]/opengraph-image.tsx`
- [x] JSON-LD Person schema on homepage (jobTitle, sameAs links)
- [x] Breadcrumb JSON-LD schema on blog/project detail pages (home → category → page)
- [x] `app/robots.ts` updated: disallows AI training bots (GPTBot, ClaudeBot, Google-Extended, CCBot, anthropic-ai, cohere-ai)
- [x] `app/sitemap.ts` includes all locale variants with `lastModified` and `changeFrequency`
- [x] Per-page `generateMetadata()` with self-referential canonicals and hreflang alternates

### Phase 9.21: WCAG 2.2 Accessibility & Performance Optimizations (COMPLETE)

**Status:** ✅ Complete (May 26, 2026)
**Priority:** P1 (accessibility/performance)

**Accessibility (WCAG 2.2):**

- [x] `scroll-mt-16` on all 9 section anchors (fixes 56px header obscuring sections on anchor nav)
- [x] Focus-visible rings on all form inputs and nav links (`focus-visible:ring-2 ring-ring/50 ring-offset-1`)
- [x] `aria-current="location"` on active dock nav items
- [x] `aria-label="Main navigation"` on header nav; `aria-label="Page sections"` on dock nav
- [x] Skip link (first `<body>` child) with target `id="main-content"` on main element
- [x] `useReducedMotion()` in BlurFade (renders plain div instead of animating)
- [x] `prefers-reduced-motion` guard in hero-background.tsx (both mobile scroll parallax and desktop mousemove parallax)
- [x] `prefers-reduced-motion` guard in dot-pattern.tsx (twinkling animation skipped)
- [x] Contrast fix: `--fg-4` opacity raised to 0.45 (from 0.40) for WCAG AA compliance
- [x] Alt text + `role="img" aria-label` on decorative elements (hero status dot, etc.)

**Performance:**

- [x] Speculation Rules API in `<head>`: prerendering same-origin pages on moderate hover (~200ms); excludes `/studio/*` and `/api/*`
- [x] LQIP (Low-Quality Image Placeholder): Hero avatar uses Sanity CDN URL params (`?w=20&blur=50&q=10`)
- [x] Responsive images: ProjectsGrid uses `sizes="(max-width: 768px) 100vw, 50vw"` for proper srcset selection
- [x] CDN preconnect: `<link rel="preconnect" href="https://cdn.sanity.io" />` in layout head

**Documentation:**

- [x] `docs/code-standards-extended.md` (306 LOC) — SEO patterns, WCAG 2.2 accessibility patterns, performance patterns, analytics setup
- [x] Updated `docs/code-standards.md` with reference to extended patterns
- [x] Updated `docs/system-architecture.md` with SEO layer, analytics section
- [x] Updated `docs/design-guidelines.md` with WCAG 2.2 section
- [x] Updated `docs/codebase-summary.md` with new files and feature notes

### Phase 9.18: Certifications Enhancement & Client Privacy (COMPLETE)

**Status:** ✅ Complete (May 25, 2026)

**Certifications Widget (CredentialsSection):**
- [x] `CredentialRow` with optional `href` (external link wrapper) and `credentialId` (mono/muted display)
- [x] ExternalLink icon on hover when href present (fades to accent color via group-hover)
- [x] Data passed from GROQ: `credentialUrl`, `credentialId`

**Client Name Privacy (Experience):**
- [x] Schema: `companyAlias` (opt-in public name), `clientAliases` array (public-safe labels)
- [x] GROQ projection: `"displayCompany": coalesce(companyAlias, company)` (raw `company` excluded from frontend)
- [x] UI: ExperienceCard renders `displayCompany` (alias if set, real name as fallback)

**Hero Scrim (UX Polish):**
- [x] Theme-adaptive `backdrop-blur-md bg-canvas/60` overlay as content wrapper's first child
- [x] Dark mode: dims particle field; Light mode: softens dot pattern; improves text contrast

**Documentation Updates:**
- [x] codebase-summary.md, design-guidelines.md, code-standards.md, system-architecture.md
- [x] All files optimized to stay under 800 LOC

### Phase 9.15: AI Chat Widget & TTS Migration (COMPLETE)

**Status:** ✅ Complete (May 19-20, 2026)
**Priority:** P0 (engagement feature)

**Deliverables (Gemini & Google Cloud TTS):**

- [x] **Claude → Gemini Migration:** `app/api/chat/route.ts` now uses `@google/generative-ai`, model `gemini-2.5-flash-lite`
- [x] **TTS Migration:** Web Speech API → Google Cloud TTS WaveNet (`app/api/tts/route.ts` POST endpoint)
- [x] `lib/chat/system-prompt.ts`: PREAMBLE rewritten with warmer tone; new `buildSystemPromptForLocale(locale?)` export
- [x] `app/api/chat/route.ts`: Accepts optional `locale` field in POST body; validates to ['en', 'es'], defaults to 'en'; uses `systemInstruction` parameter for Gemini; max 350 output tokens; max 6 messages context
- [x] `app/api/tts/route.ts` (NEW): Google Cloud TTS WaveNet; POST `{text, lang}` → base64 MP3 audio; WaveNet voices EN `en-US-Wavenet-J`, ES `es-US-Wavenet-C`; rate limiting 30 req/hr/IP with stale-entry pruning
- [x] `components/ui/ai-chat-widget.tsx` (443 LOC): Full widget with profile photo (Sanity CDN), bubble with AnimatedShinyText shimmer, timer (8–20s first, then 30–60s repeating), locale-aware suggestions, voice I/O support, MarkdownText rendering of responses; ping ring + scale pulse animation on collapsed button, URL parsing, quick-reply chips
- [x] `hooks/use-speech-recognition.ts` (102 LOC): Rewritten for stability—recognition created once on mount, onTranscript in stable useRef, lang updated via separate useEffect
- [x] `hooks/use-speech-synthesis.ts` (57 LOC): [REWRITTEN] Now fetches `/api/tts` server route instead of `window.speechSynthesis`; plays MP3 via `new Audio('data:audio/mpeg;base64,' + audioBase64)`; interface unchanged
- [x] `components/layout-widgets.tsx`: Updated to pass `avatarUrl` prop from settings; hosts AIChatWidget, DotPattern, SanityVisualEditing
- [x] `app/[locale]/layout.tsx`: Passes `avatarUrl={settings?.avatar ?? undefined}` to LayoutWidgets
- [x] **Env vars added:** `GEMINI_API_KEY` (replaced ANTHROPIC_API_KEY), `GOOGLE_TTS_API_KEY`, `CHAT_ALLOWED_ORIGIN` (CORS whitelist)
- [x] **Rate limiting:** Chat & TTS both limited to 30 req/hr/IP with per-IP window tracking and stale-entry pruning
- [x] **Security:** 9 regex patterns detect prompt injection in chat messages; CORS validation on origin header
- [x] `lib/social-adapters.ts` (40 LOC): Pure adapters for social posts, relativeTime helper using Intl.RelativeTimeFormat
- [x] `components/sections/CredentialsSection.tsx`: Fixed language proficiency `levels` array from ['basic', 'intermediate', 'advanced', 'fluent', 'native'] to ['basic', 'conversational', 'professional', 'fluent', 'native'] to match Sanity schema PROFICIENCY values
- [x] `messages/en.json` + `messages/es.json`: New `chat` namespace with 21 keys: bubble, ariaOpen/Close/Clear/Voice/Mic/Send, headerTitle, headerSubtitle, placeholder, welcome, listening, hint, hintCooldown, errorGeneric/Retry/Scope/Limit/LimitCta, suggestions (3 items), **[NEW]** quickReplies array (3 items: "Yes!", "No thanks", "Tell me more" in English)
- [x] `app/globals.css`: **[NEW]** `chat-pulse` keyframe added for collapsed button scale animation (3s ease-in-out, scales 1→1.15→1)
- [x] Removed `framer-motion` from dependencies (all animations use `motion/react` directly)
- [x] `page.tsx`: SkillsSection, SocialPostsGrid, ContactSection now lazy-loaded via `next/dynamic` with `ssr: false`

**Technical Highlights:**

- **Gemini vs Claude:** Switched to Google Gemini 2.5 Flash-Lite for cost/latency; uses `systemInstruction` parameter (not Claude's `system` role)
- **TTS Migration:** Server-side Google Cloud TTS WaveNet replaces browser Web Speech API; more consistent voice, better language support
- Locale-aware system prompt appends language-lock instruction for correct bot language (EN/ES)
- Speech recognition: client-side browser API; single instance, proper cleanup on lang change
- Speech synthesis: now server-side via `/api/tts` endpoint; plays MP3 audio from base64
- Social feed backend wired with real Sanity data via adapters
- CredentialsSection proficiency fix enables correct dot indicators per language level
- Bundle optimization: removed dead framer-motion, lazy-loaded heavy sections
- Chat widget fully client-side rendered (SSR: false in layout-widgets boundary)
- Rate limiting: 30 req/hr/IP per endpoint with map-based tracking and window resets
- Injection protection: 9 regex patterns detect prompt injection attempts in user messages

### Success Metrics (9.0)

- [x] Uptime: 99.9%
- [x] FCP: <1.5s (en and es)
- [x] Error rate: <0.1%
- [x] Contact form submissions: >0 (localized)
- [x] Performance: Lighthouse >90
- [x] Accessibility: WCAG 2.1 AA

---

## Test Coverage Summary

| Test Suite                 | Count           | Status         | Notes                                                                     |
| -------------------------- | --------------- | -------------- | ------------------------------------------------------------------------- |
| **Smoke - Original**       | 11              | ✅ All passing | Health, pages, navigation, contact form, sitemap, robots                  |
| **Smoke - i18n Bilingual** | 11              | ✅ All passing | Static contracts plus integration-gated locale checks                     |
| **Smoke - Content Model**  | 6               | ✅ All passing | Static contracts for Sanity helpers, registry, queries, and cache version |
| **Total Smoke Tests**      | Multiple suites | ✅ Passing     | Static suites run in CI; browser suites run with live server              |

---

## Future Features (Backlog)

### High Priority

- **Admin Dashboard** — View/delete contact submissions, content stats
- **Search** — Full-text search across projects & blog (per-locale)
- **Newsletter** — Email subscription (Resend list)
- **Analytics** — Track pageviews, popular pages (per-locale)
- **Structured Data** — Schema.org markup for SEO

### Medium Priority

- **Dark Mode Toggle** — User preference with localStorage
- **Project Gallery** — Lightbox for project screenshots
- **Video Embeds** — Demo videos in project detail
- **Code Highlighting** — Syntax highlighting for code blocks
- **Related Posts** — Show similar blog posts (per-locale)
- **Reading Time** — Estimate reading time for posts

### Low Priority

- **Changelog** — Document site updates
- **Sidebar Layout** — Alternative layout variant (post-Classic UI)
- **Bento Layout** — Dashboard-style variant (post-Classic UI)
- **Testimonials** — Client testimonials section (data model ready)
- **Speaking Engagements** — Conference talks & podcasts

---

## Dependencies & Blockers

### Current Blockers

None identified.

### Phase Dependencies

```
Phase 1 (DONE)
├─ Phase 2 (DONE)
├─ Phase 3 (DONE)
├─ Phase 4 (DONE, depends on: Phase 2, Phase 3)
├─ Phase 5 (DONE, depends on: Phase 1, Phase 3)
├─ Phase 6 (DONE, depends on: Phase 1, domain)
├─ Phase 7 (DONE, depends on: Phase 4, Phase 5, Phase 6)
└─ Phase 8 (DONE through 8.5, depends on: Phase 1-7)
```

### External Dependencies

- [x] Sanity project created
- [x] Supabase projects created (3 environments)
- [x] Vercel project setup
- [x] GitHub Environments configured
- [x] Cloudflare domain setup
- [x] Resend API key obtained
- [x] Sitemap hreflang (Phase 8.4)

---

## Metrics & Monitoring

### Key Success Indicators (May 11, 2026 Status)

| Metric                  | Phase | Target                          | Current                           | Status        |
| ----------------------- | ----- | ------------------------------- | --------------------------------- | ------------- |
| **Build Time**          | 1     | <3 min                          | ~2 min                            | ✅            |
| **Page Load (FCP)**     | 4     | <1.5s                           | TBD                               | 📊 Monitoring |
| **Cache Hit Ratio**     | 6     | >80%                            | TBD                               | 📊 Monitoring |
| **Test Coverage**       | 7-8.5 | Static + browser smoke coverage | Route, i18n, content model suites | ✅            |
| **Uptime**              | 8     | 99.9%                           | TBD                               | 📊 Monitoring |
| **Contact Submissions** | 8     | >1/week                         | TBD                               | 📊 Monitoring |
| **Bilingual Coverage**  | 8     | 100%                            | Complete through sitemap/hreflang | ✅            |

### Monitoring Tools

- Vercel Analytics (built-in Core Web Vitals)
- Lighthouse CI (in deploy workflow)
- Sanity Activity Log (content changes)
- Supabase Logs (database queries, auth)
- Cloudflare Analytics (traffic, cache, WAF)
- GitHub Actions (CI/CD status)

---

## Release Schedule

| Phase     | Start   | End    | Duration             | Status      |
| --------- | ------- | ------ | -------------------- | ----------- |
| Phase 1   | May 1   | May 8  | 1 week               | ✅ Complete |
| Phase 2   | May 9   | May 8  | 0 days (accelerated) | ✅ Complete |
| Phase 3   | May 9   | May 8  | 0 days (accelerated) | ✅ Complete |
| Phase 4   | May 9   | May 8  | 0 days (accelerated) | ✅ Complete |
| Phase 5   | May 9   | May 8  | 0 days (parallel)    | ✅ Complete |
| Phase 6   | May 9   | May 10 | 2 days               | ✅ Complete |
| Phase 7   | May 10  | May 10 | 1 day                | ✅ Complete |
| Phase 8.1 | May 10  | May 10 | 1 day                | ✅ Complete |
| Phase 8.2 | May 10  | May 10 | 1 day                | ✅ Complete |
| Phase 8.3 | May 10  | May 10 | 1 day                | ✅ Complete |
| Phase 8.4 | May 11  | May 11 | —                    | ✅ Complete |
| Phase 8.5 | May 12  | May 12 | —                    | ✅ Complete |
| Phase 9.0 | May 11  | May 11 | Ongoing              | ✅ Live          |
| Phase 9.1 | May 12  | May 12 | 1 day                | ✅ Complete      |
| Phase 9.2 | May 12  | May 12 | 1 day                | ✅ Complete      |
| Phase 9.3 | May 12  | May 12 | <1 day               | ✅ Complete      |
| Phase 9.4 | May 13  | May 13 | 1 day                | ✅ Complete      |
| Phase 9.5 | May 12  | May 12 | 1 day                | ✅ Complete      |
| Phase 9.6 | May 14  | May 14 | <1 day               | ✅ Complete      |
| Phase 9.7 | May 15  | May 15 | <1 day               | ✅ Complete      |
| Phase 9.8 | May 15  | May 15 | <1 day               | ✅ Complete      |
| Phase 9.9 | May 15  | May 15 | <1 day               | ✅ Complete      |
| Phase 9.10 | May 16 | May 16 | <1 day               | ✅ Complete      |
| Phase 9.11 | May 16 | May 16 | <1 day               | ✅ Complete      |
| Phase 9.12 | May 16 | May 16 | <1 day               | ✅ Complete      |
| Phase 9.13 | May 16 | May 16 | <1 day               | ✅ Complete      |
| Phase 9.14 | May 16 | May 16 | <1 day               | ✅ Complete      |
| Phase 9.15 | May 19 | May 19 | <1 day               | ✅ Complete      |
| Phase 9.16 | May 20 | May 20 | <1 day               | ✅ Complete      |
| Phase 9.17 | May 25 | May 25 | <1 day               | ✅ Complete      |
| Phase 9.19 | May 26 | May 26 | <1 day               | ✅ Complete      |
| Phase 9.20 | May 26 | May 26 | <1 day               | ✅ Complete      |
| Phase 9.21 | May 26 | May 26 | <1 day               | ✅ Complete      |

**Actual:** Production bilingual deployment completed in ~2 weeks (May 1-11, 2026). All Phase 9 work (9.0-9.21) completed by May 26, 2026. Phase 9.15-9.18: AI chat widget enhancements (Gemini 2.5 Flash-Lite, Google Cloud TTS WaveNet, profile photo, voice I/O, locale-aware), bundle optimization (framer-motion removal, lazy-load sections), social feed backend wiring (pagination PAGE_SIZE=9), mobile scroll parallax (pointer:coarse), GitHub contributions fix, space depth hero redesign (3-layer particles, accent colors), DotPattern depth tiers + deterministic seeding, breadcrumb navigation, certifications enhancement, client privacy aliasing. Phase 9.19-9.21: Vercel Analytics + Speed Insights (no env vars, zero client cost), SEO layer (OG images, JSON-LD Person/Breadcrumb schemas, AI bot disallow rules), WCAG 2.2 accessibility (scroll-mt-16 header fix, focus-visible rings, aria-current, nav landmarks, skip link, prefers-reduced-motion throughout, contrast fix to 0.45), performance optimizations (Speculation Rules API, LQIP, responsive images, CDN preconnect). Documentation: code-standards-extended.md (306 LOC), architecture + design guidelines updated. Next phases: admin dashboard, search, newsletter.

---

## Version History

| Version             | Date   | Phases  | Changes                                                                              |
| ------------------- | ------ | ------- | ------------------------------------------------------------------------------------ |
| 0.1.0               | May 8  | 1–5     | Scaffold, Sanity schema, Supabase migrations, UI components, CI/CD workflows         |
| 0.2.0               | May 10 | 6       | Cloudflare WAF, cache optimization, draft mode, Presentation Tool                    |
| 0.3.0               | May 10 | 7       | Smoke tests, production readiness, post-deploy validation                            |
| 1.0.0-i18n.1        | May 10 | 8.1     | Bilingual i18n: next-intl middleware, /en /es routing, message files, LocaleSwitcher |
| 1.0.0-i18n.2        | May 10 | 8.2     | UI string extraction: getTranslations(), useTranslations() throughout codebase       |
| 1.0.0-i18n.3        | May 10 | 8.3     | Sanity bilingual schemas: locale-aware content fields, per-locale ISR cache tags     |
| 1.0.0               | May 11 | 8.1-8.4 | Production bilingual launch with sitemap and hreflang coverage                       |
| 1.1.0-content-model | May 12 | 8.5     | Sanity content model refactor: 14 document types, grouped Studio, expanded GROQ      |
| 1.2.0-magic-ui      | May 12 | 9.1     | Magic UI install: 12 components, shadcn/ui HSL tokens, cn utility, framer-motion    |
| 1.2.1-classic-ui    | May 12 | 9.2     | Classic Layout: 11 sections, Dock nav, scroll tracking, GitHub contributions, hydration fix |
| 1.2.2-seo-canonical | May 12 | 9.3     | SEO canonical per-locale, self-referential hreflang, generateMetadata for all pages  |
| 1.2.3-design-tokens | May 13 | 9.4     | Design tokens system: dark-first CSS custom properties, [data-theme] attribute, semantic scales |
| 1.3.0-blog-redesign | May 13 | 9.5     | MagicUI blog redesign: featured hero, tag filter, card grid, bilingual layout       |
| 1.4.0-nav-refactor  | May 15 | 9.6-9.8 | Navigation refactor: removed /about /contact routes, hash anchors, PageTransition, DotPattern fix |
| 1.5.0-social-redesign | May 15 | 9.9  | Footer & social feed redesign: async server Footer, SocialFeedGrid with pagination (PAGE_SIZE=9) |
| 1.6.0-hero-metrics  | May 16 | 9.10-9.14 | Hero metrics: 6 stats (yrs exp, skills, creds, posts, langs, links); Contact form 4-field; smooth scroll; section reorder |
| 1.7.0-gemini-tts    | May 20 | 9.15  | AI chat & TTS migration: Claude → Gemini 2.5 Flash-Lite (fallback: gemini-2.5-flash); Web Speech API → Google Cloud TTS WaveNet; `/api/tts` REST endpoint; rate limiting (30 req/hr/IP); error codes (GEMINI_*, CONTENT_FILTERED); CORS strict whitelist; 12s timeout, maxDuration=30s; env vars GEMINI_API_KEY, GOOGLE_TTS_API_KEY, CHAT_ALLOWED_ORIGIN, GEMINI_MODEL (optional override) |
| 1.8.0-mobile-parallax | May 20 | 9.16  | Mobile scroll parallax: hero background responds to scroll on touch devices (pointer:coarse); desktop remains mousemove parallax; prefers-reduced-motion respected on both paths; GitHub contributions route error handling (try/catch network + JSON parse) |
| 1.9.0-space-depth-breadcrumbs | May 25 | 9.17 | Visual enhancements: HeroBackground 3-layer depth system (110 particles, accent green/blue nodes, orange connections); DotPattern depth tiers (0.55/1.0/1.6× sizes, far/mid/near opacities), color accents (6% green, 6% orange, 12% white twinkle), deterministic seeding, opacity-40 background recession; Breadcrumb component (new UI, blog/projects with JSON-LD schema); documentation updates |
| 1.10.0-analytics-seo-a11y | May 26 | 9.19-9.21 | Vercel Analytics + Speed Insights (zero client cost; Web Vitals API + edge infra); SEO layer (OG images via ImageResponse, JSON-LD Person/Breadcrumb schemas, AI bot disallow rules); WCAG 2.2 accessibility (scroll-mt-16 header fix, focus-visible rings, aria-current, nav landmarks, skip link, prefers-reduced-motion throughout, contrast 0.45); performance (Speculation Rules API eager:moderate, LQIP blur placeholders, responsive image sizes, CDN preconnect); documentation (code-standards-extended.md 306 LOC, system-architecture + design-guidelines updated) |
| 2.0.0-future        | TBD    | 10+   | Post-launch: admin dashboard, search, newsletter, testimonials, advanced features    |
