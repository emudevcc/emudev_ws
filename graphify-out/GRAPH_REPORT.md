# Graph Report - emudev_ws  (2026-05-08)

## Corpus Check
- 63 files · ~23,392 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 507 nodes · 522 edges · 39 communities (35 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d4d4f83e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 30|Community 30]]

## God Nodes (most connected - your core abstractions)
1. `Implementation Steps` - 13 edges
2. `Phase 2: Sanity CMS Setup` - 12 edges
3. `Implementation Steps` - 12 edges
4. `Phase 7: Smoke Tests & QA` - 12 edges
5. `Phase 3: Supabase Setup` - 12 edges
6. `Phase 6: Vercel + Cloudflare Infrastructure` - 12 edges
7. `Implementation Steps` - 12 edges
8. `Phase 1: Project Scaffold & Tooling` - 12 edges
9. `Phase 4: Portfolio UI Pages` - 12 edges
10. `Phase 5: GitHub Actions CI/CD Pipeline` - 12 edges

## Surprising Connections (you probably didn't know these)
- `ProjectsPage()` --calls--> `getProjects`  [EXTRACTED]
  app/projects/page.tsx → lib/sanity-queries.ts
- `AboutPage()` --calls--> `getSiteSettings`  [EXTRACTED]
  app/about/page.tsx → lib/sanity-queries.ts
- `BlogPage()` --calls--> `getPosts`  [EXTRACTED]
  app/blog/page.tsx → lib/sanity-queries.ts
- `sendMagicLink()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  app/actions/auth.ts → lib/supabase-server.ts
- `signOut()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  app/actions/auth.ts → lib/supabase-server.ts

## Communities (39 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (45): 1. NEXT.JS 15 APP ROUTER FOR PORTFOLIO, 4. SANITY V3 SCHEMA DESIGN FOR PORTFOLIO, 5. SEO WITH NEXT.JS 15 METADATA API, 6. TYPESCRIPT TYPE GENERATION, 7. CONTACT FORM WITH SERVER ACTIONS + RESEND, ARCHITECTURAL RECOMMENDATIONS, code:typescript (// app/projects/[slug]/page.tsx), code:typescript (export const projectType = {) (+37 more)

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (26): AboutPage(), metadata, HomePage(), sitemap(), BlogPage(), metadata, PortableTextRenderer(), PortableTextRendererProps (+18 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (31): 1. SUPABASE MULTI-PROJECT STRATEGY, 3. SECRETS MODEL IMPLEMENTATION, 4. CLOUDFLARE + VERCEL SETUP, 5. HOTFIX WORKFLOW, 6. CODEX REVIEW INTEGRATION (GitHub Copilot/Codex), ARCHITECTURE SUMMARY, Cache Rules for Next.js ISR, code:bash (# Local: Create migration) (+23 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (25): Architecture, code:block1 (sanity/), code:typescript (import { revalidateTag } from 'next/cache'), code:typescript (import { defineConfig } from '@sanity/codegen'), code:bash (npx sanity typegen generate), code:json ("sanity:types": "sanity typegen generate",), code:block2 (Sanity editor publishes → webhook fires → POST /api/revalida), code:bash (npm install sanity@^3 next-sanity@^5 @sanity/vision) (+17 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (25): Architecture, code:block1 (/                               ← git root), code:bash (npx husky init), code:json ("lint-staged": {), code:bash (supabase init), code:bash (npm run lint), code:bash (npx create-next-app@latest . \), code:bash (npm install next-sanity@^5 sanity@^3 @sanity/codegen \) (+17 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (23): Architecture, code:block1 (supabase/), code:typescript ('use server'), code:bash (# Add to package.json scripts:), code:json ("supabase:types": "supabase gen types typescript --linked > ), code:block2 (contact_submissions), code:bash (supabase login), code:sql (-- contact_submissions: public INSERT (contact form), admin ) (+15 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (24): Architecture, code:block1 (Internet), code:block10 (Name: Block SQLi), code:block11 (Name: Allow search engines), code:bash (CF_API_TOKEN=xxx), code:bash (# Install Vercel CLI globally), code:json ({), code:block4 (If: URI path matches regex: /_next/static/.*) (+16 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (23): Architecture, code:block1 (app/), code:typescript (import type { MetadataRoute } from 'next'), code:bash (npm run build), code:bash (npm install @portabletext/react @sanity/image-url resend), code:typescript (import type { Metadata } from 'next'), code:typescript (import { AnimatedHero } from '@/components/ui/animated-hero'), code:typescript (import { getProjectBySlug, getProjects } from '@/lib/sanity-) (+15 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (22): Architecture, code:block1 (tests/), code:json ("test:smoke": "playwright test tests/smoke/",), code:bash (npm install -D @playwright/test), code:typescript (import { defineConfig, devices } from '@playwright/test'), code:typescript (import { test, expect } from '@playwright/test'), code:typescript (import { test, expect } from '@playwright/test'), code:typescript (import { test, expect } from '@playwright/test') (+14 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (21): Architecture Overview, code:mermaid ([Simple component diagram]), code:bash (npm run command), Configuration Files, Context Links, Data Models, Executive Summary, [Feature Name] Implementation Plan (+13 more)

### Community 10 - "Community 10"
Cohesion: 0.09
Nodes (21): Architecture, code:block1 (.github/), code:yaml (name: CI), code:yaml (name: Deploy), code:yaml (name: Hotfix), code:block5 (VERCEL_TOKEN          ← Vercel account token), code:block6 (VERCEL_PROJECT_ID), code:bash (# Protect main) (+13 more)

### Community 11 - "Community 11"
Cohesion: 0.15
Nodes (10): sendMagicLink(), signOut(), resend, submitContact(), ContactForm(), metadata, supabase, createSupabaseServerClient() (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.1
Nodes (19): Approach, Architecture Changes, Backward Compatibility, code:mermaid ([Before/After comparison diagram]), [Component/Module] Refactoring Plan, Context Links, Current State Analysis, Executive Summary (+11 more)

### Community 13 - "Community 13"
Cohesion: 0.11
Nodes (18): Cache Directives: `'use cache'` → `unstable_cache`, code:typescript (// lib/sanity-queries.ts), code:javascript (// eslint.config.mjs), code:typescript (// lib/sanity-client.ts), ESLint Flat Config: v10 incompatibility, `__experimental_actions`: Removed from schema, Lessons Learned, Next.js 15.5 + Sanity + Supabase Portfolio Scaffold (+10 more)

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (17): Approach, [Bug Fix] Implementation Plan, Changes Required, Context Links, Evidence, Executive Summary, Implementation Steps, Issue Analysis (+9 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (16): 2. GITHUB ACTIONS CI/CD PIPELINE, Cloudflare Cache Purge, code:bash (# Purge only changed pages (requires tracking file changes)), code:bash (git tag -a "prod-$(date +%Y%m%d-%H%M%S)" -m "Production rele), code:bash (# Requires version file tracking or commit parsing), code:yaml (name: Deploy), code:bash (# Via gh CLI (requires admin token)), code:bash (# tests/smoke/health.spec.ts) (+8 more)

### Community 16 - "Community 16"
Cohesion: 0.19
Nodes (6): schema, authorType, postType, projectType, siteSettingsType, tagType

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (10): code:json ({), code:block2 (./docs), Documentation Management, Git, Hook Response Protocol, [IMPORTANT] Consider Modularization, Privacy Block Hook (`@@PRIVACY_PROMPT@@`), Python Scripts (Skills) (+2 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (11): Bug Fix Template, Context Management Best Practices, Context Refresh Triggers, Cross-References Instead of Duplication, Feature Implementation Template, Keep Plans Focused, Plan Template Usage Guide, Quality Checklist (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.17
Nodes (12): 2. SANITY V3 + NEXT.JS INTEGRATION, code:typescript (type Project = {), code:groq (*[_type == "project" && defined(slug)] {), code:groq (*[_type == "project" && slug.current == $slug][0] {), code:typescript (import { defineConfig } from 'sanity'), code:typescript (// app/projects/[slug]/page.tsx), code:bash (npm install -D @sanity/codegen), code:typescript (import type { Project } from '@/sanity.types') (+4 more)

### Community 20 - "Community 20"
Cohesion: 0.22
Nodes (8): Author, Post, Project, SanityDocument, SanityImageAsset, SiteSettings, Slug, Tag

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (8): 3. MAGIC UI PRO IN NEXT.JS 15, code:bash (npm install magic-ui @react-motion/framer-motion), code:typescript (// app/components/hero.tsx), code:typescript (// app/page.tsx (Server Component)), Component Library Inventory (Magic UI Pro typical set), Import Pattern, Installation & Setup, RSC Compatibility

### Community 22 - "Community 22"
Cohesion: 0.33
Nodes (4): inter, metadata, links, SiteNav()

### Community 23 - "Community 23"
Cohesion: 0.4
Nodes (4): Dependencies, Overview, Personal Portfolio — Next.js 15 + Sanity + Supabase + Vercel/CF, Phases

### Community 24 - "Community 24"
Cohesion: 0.5
Nodes (3): appErrors, errors, publicPages

## Knowledge Gaps
- **312 isolated node(s):** `config`, `nextConfig`, `Json`, `SanityDocument`, `Slug` (+307 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Portfolio Stack Research: Next.js 15 + Sanity v3 + Magic UI Pro` connect `Community 0` to `Community 19`, `Community 21`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `Supabase + Vercel + Cloudflare + GitHub Actions CI/CD Research Report` connect `Community 2` to `Community 15`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `2. SANITY V3 + NEXT.JS INTEGRATION` connect `Community 19` to `Community 0`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `config`, `nextConfig`, `Json` to the rest of the system?**
  _312 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._