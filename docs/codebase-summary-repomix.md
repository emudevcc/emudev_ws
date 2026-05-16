# Codebase Compaction Summary (repomix)

Generated: May 15, 2026

## Repository Metrics

- **Total Files:** 210 files
- **Total Tokens:** 598,233 tokens
- **Total Characters:** 1,930,393 chars
- **Output:** `repomix-output.xml`
- **Security:** ✔ No suspicious files detected

## Top 5 Files by Token Count

1. `release-manifest.json` (137,060 tokens, 22.9%)
2. `graphify-out/graph.html` (129,517 tokens, 21.6%)
3. `graphify-out/graph.json` (107,978 tokens, 18%)
4. `graphify-out/cache/ast/...` (various AST cache files, 2.6% combined)

Note: Large files are primarily build artifacts (release manifest, graphify knowledge graph cache). These can be ignored for documentation review.

## Core Codebase Structure

```
emudev_ws/
├── app/                          # Next.js App Router (SSG/ISR/SSR routes, server actions, API routes)
├── components/                   # React components (sections, UI, layout)
├── hooks/                        # Custom React hooks (scroll tracking, theme management)
├── lib/                          # Utilities, clients, queries (Sanity, Supabase, GitHub)
├── sanity/                       # CMS schemas, seed data, studio config
├── supabase/                     # Database migrations, RLS policies
├── types/                        # Generated TypeScript types (Sanity, Supabase)
├── i18n/                         # Internationalization (routing, messages, navigation)
├── messages/                     # Translation files (en.json, es.json)
├── tests/                        # Playwright smoke tests
├── .github/workflows/            # CI/CD pipelines
├── .claude/rules/                # Development rules and patterns
├── docs/                         # This documentation suite
├── scripts/                      # Build/validation scripts
└── Configuration files           # next.config.ts, tailwind.config.ts, tsconfig.json, etc.
```

## Key Implementation Patterns (from codebase)

### 1. Frontend Architecture
- **Framework:** Next.js 15 App Router with React 19
- **Styling:** Tailwind CSS v4 + custom design tokens (dark-first, [data-theme] attribute)
- **UI Components:** MagicUI (12 components: 10 free-tier + 2 Pro local)
- **Internationalization:** next-intl v4 (EN/ES bilingual routing)
- **State Management:** useActionState for forms, React context for theme

### 2. Content Management
- **CMS:** Sanity v3 (14 document types, GROQ queries, bilingual schemas)
- **Caching:** Next.js `unstable_cache` with per-locale keys and collection revalidation tags
- **Cache Invalidation:** Sanity webhook → `/api/revalidate-tag` → revalidateTag() → <5s updates

### 3. Database & Auth
- **Database:** Supabase Postgres (contact_submissions, auth.users, auth.sessions)
- **Authentication:** Magic Link via Supabase Auth (email-based, admin allow-list)
- **Security:** Row-Level Security (RLS) policies on contact_submissions table

### 4. Page Generation Strategy
- **Homepage:** SSG × 2 locales (en, es)
- **Projects/Blog Lists:** ISR × 2 locales with per-locale cache keys
- **Project/Blog Detail:** SSG per [locale]/[slug] (both en and es variants)
- **API Routes:** No caching (revalidate every request)

### 5. Navigation Refactor (Phase 9.7)
- **Removed:** Standalone `/about` and `/contact` page routes
- **Added:** Hash anchors (#about, #contact) on homepage
- **Nav Pattern:** Home & Blog use next-intl Link (full route); About & Contact use native `<a href="/{locale}#anchor">` (same-page scroll)

### 6. Animation & UX
- **PageTransition Component:** motion.main keyed by pathname; blur-fade animation on route changes
- **Three.js Hero:** 110-particle network with mouse parallax and ambient rotation
- **Design Tokens:** Motion scale (--ease, --dur-fast, --dur) for consistent animations

### 7. Error Handling & Validation
- **Form Validation:** Server-side in action.ts; client display via useActionState state
- **External Services:** Resend email instantiated inside try/catch (DB insert is authoritative, email is best-effort)
- **API Security:** Webhook secret validation in headers; preview URL token validation via @sanity/preview-url-secret

## Documentation Coverage

All major systems documented:
- **codebase-summary.md** — File-by-file breakdown, data flows, architectural patterns, dependencies
- **system-architecture.md** — Component layers, content management, database, auth, email, deployment
- **code-standards.md** — Type safety, naming, ISR pattern, server actions, API security, Supabase usage
- **design-guidelines.md** — Color tokens, typography, spacing, motion, theming, Three.js boundary pattern
- **project-overview-pdr.md** — Project description, goals, stack, phase roadmap, success metrics
- **project-roadmap.md** — Detailed phase breakdown, test coverage, dependencies, release schedule, version history

## Build & Deployment

- **Build Time:** ~2-3 minutes (lint, typecheck, generate static params × 2 locales, build)
- **Hosting:** Vercel (dev/staging/production environments)
- **CDN/WAF:** Cloudflare (Full Strict SSL/TLS, cache rules, WAF, purge on deploy)
- **CI/CD:** GitHub Actions (3 workflows: ci.yml, deploy.yml, hotfix.yml)
- **Testing:** Playwright smoke tests (route checks, i18n contracts, content-model validation)

## Recent Changes (May 15, 2026)

1. **Navigation Refactor:** Removed /about and /contact standalone routes; implemented hash anchor navigation (#about, #contact) on homepage with native `<a>` tags
2. **PageTransition:** New motion.react component for blur-fade route animations (keyed by pathname)
3. **DotPattern Fix:** Conditional glow defs to prevent SSR/client hydration mismatch
4. **Documentation:** Updated codebase-summary.md, system-architecture.md, code-standards.md, design-guidelines.md, project-overview-pdr.md, project-roadmap.md

## Notes for Future Development

- **Phase 9.9+:** Sanity seed data population, monitoring, analytics, admin dashboard, search
- **Known Constraints:** ESLint ^9 (v10 breaks react plugin); next-intl required for bilingual routing; unstable_cache used instead of 'use cache' (not available in 15.5)
- **Performance:** All static/ISR content pre-generated at build; API routes bypass cache; dynamic image generation via Sanity assets
