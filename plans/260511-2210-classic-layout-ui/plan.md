---
title: "Classic Layout UI"
description: >-
  Refactor app/[locale]/page.tsx into a full Classic portfolio layout wired to the
  new Sanity content model. 12 sections, MagicUI components, bilingual i18n, Dock nav.
status: completed
priority: P1
effort: 40h
branch: "development"
tags:
  - ui
  - magic-ui
  - sanity
  - i18n
  - portfolio
blockedBy:
  - 260511-2111-sanity-content-model-refactor
  - 260511-2210-magic-ui-install
blocks: []
created: "2026-05-12T04:14:35.553Z"
createdBy: "ck:plan"
source: skill
---

# Classic Layout UI

## Overview

Replace `app/[locale]/page.tsx` with a single-page Classic portfolio layout composed of 12 sections (Hero → Footer), a floating Dock nav, and an ambient DotPattern background. Every section is wired to Sanity queries from `260511-2111-sanity-content-model-refactor`. Existing routes (`/about`, `/blog`, `/projects`, `/contact`) are preserved unchanged.

**MagicUI components used (disciplined set of 7):** `Dock`, `DotPattern`, `MagicCard`, `NumberTicker`, `BlurFade`, `ShimmerButton`, `BorderBeam` (featured cards only).

**Blocked by:**
- `260511-2111-sanity-content-model-refactor` — provides all new GROQ query functions + types
- `260511-2210-magic-ui-install` — provides all MagicUI components

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Foundation and Design Tokens](./phase-01-foundation-and-design-tokens.md) | Completed |
| 2 | [Page Shell and Navigation](./phase-02-page-shell-and-navigation.md) | Completed |
| 3 | [Hero and About Sections](./phase-03-hero-and-about-sections.md) | Completed |
| 4 | [Experience and Projects Sections](./phase-04-experience-and-projects-sections.md) | Completed |
| 5 | [Skills and Contributions](./phase-05-skills-and-contributions.md) | Completed |
| 6 | [Social Posts, Credentials, Strengths, Writing](./phase-06-social-posts-credentials-strengths-writing.md) | Completed |
| 7 | [Contact, Footer, and API](./phase-07-contact-footer-and-api.md) | Completed |
| 8 | [SEO and Polish](./phase-08-seo-and-polish.md) | Completed |

## Completion Notes

- Implemented the Classic homepage against the local `lib/sanity-queries.ts` module rather than the plan's placeholder `lib/sanity/queries` path.
- Preserved existing `/about`, `/blog`, `/projects`, and `/contact` routes and kept a semantic top nav for smoke coverage alongside the Dock.
- GitHub and contact API routes are implemented defensively and return clean 503 responses when deployment secrets are not configured.
- Verification completed with `npm run typecheck`, `npm run lint`, `npm run build`, full smoke coverage against `http://localhost:3001` with one warmed rerun of `tests/smoke/navigation.spec.ts`, and i18n browser integration.

## Dependencies

**Blocked by:**
- `260511-2111-sanity-content-model-refactor` — getExperiences, getSkills, getAbout, getCertifications, getEducation, getLanguages, getStrengths, getSocialPosts, getTestimonials; cache version `localized-v3`
- `260511-2210-magic-ui-install` — MagicUI components in `components/ui/`

**Phase order (intra-plan):**
- Phase 1 (tokens/i18n messages) → required by all sections
- Phase 2 (layout shell/Dock) → required by Phase 3+
- Phases 3–7 sequential (sections top → bottom)
- Phase 8 (polish/SEO) last

## Architecture

```
app/[locale]/
  layout.tsx           ← add Dock, DotPattern, top bar (Phase 2)
  page.tsx             ← replace with 12-section composition (Phases 3-7)
  api/
    contact/route.ts   ← NEW: POST → Resend (Phase 7)
    github/
      contributions/
        route.ts       ← NEW: GET contributions (Phase 5)
components/
  sections/            ← NEW directory: 12 section components
    HeroSection.tsx
    AboutSection.tsx
    ExperienceTimeline.tsx
    ProjectsGrid.tsx
    SkillsSection.tsx
    ContributionsCard.tsx
    SocialPostsGrid.tsx
    CredentialsSection.tsx
    StrengthsCard.tsx
    WritingList.tsx
    ContactSection.tsx
    FooterSection.tsx
  ui/
    dock.tsx           ← NEW MagicUI Dock wrapper
    status-pill.tsx    ← NEW
    lang-theme-toggle.tsx ← NEW
    chip.tsx           ← NEW
    project-card.tsx   ← REPLACE existing
    experience-card.tsx ← NEW
    post-card.tsx      ← NEW
lib/
  github.ts            ← NEW: getContributions()
messages/
  en.json es.json      ← EXTEND: hero/about/experience/contact/credentials keys
```

## Content Model → Query Map

| Section | Sanity Query | Fields |
|---------|-------------|--------|
| HeroSection | `getSiteSettings` | avatar, availableForWork, location, timezone, socials, shortName, role, tagline, calComUrl, resumePdf |
| AboutSection | `getAbout` + `getSiteSettings` | paragraphs, location, timezone, email |
| ExperienceTimeline | `getExperiences` | role, startDate, endDate, company, clients, summary, tech→Skill |
| ProjectsGrid | `getProjects` (updated) | cover, title, tagline, tech→Skill, repoUrl, liveUrl, featured, status, order |
| SkillsSection | `getSkills` | name, category, order |
| ContributionsCard | GitHub API (runtime) | weeks (52×7 intensity) |
| SocialPostsGrid | `getSocialPosts` | platform, handle, subreddit, postedAt, body, stats, permalink, featured |
| CredentialsSection | `getCertifications` + `getEducation` + `getLanguages` | per-type fields |
| StrengthsCard | `getStrengths` | rank, name, description |
| WritingList | `getPosts` (updated) | title, publishedAt, readingMinutes, tags, slug, status |
| ContactSection | `getSiteSettings` | socials (visible), location |
| FooterSection | computed | year |
