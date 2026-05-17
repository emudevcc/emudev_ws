---
phase: 1
title: "Reorder sections in page.tsx"
status: complete
priority: P3
effort: "5m"
dependencies: []
---

# Phase 1: Reorder sections in page.tsx

## Overview

Move `StrengthsCard`, `SocialPostsGrid`, and `ContactSection` to the bottom of the homepage, directly above `FooterSection`. JSX-only change — no data-fetching or component logic touched.

## Requirements

- Functional:
  - New section order (top → bottom):
    1. HeroSection
    2. AboutSection
    3. ExperienceTimeline
    4. ProjectsGrid
    5. SkillsSection
    6. CredentialsSection
    7. WritingList
    8. StrengthsCard  ← moved from position 8
    9. SocialPostsGrid ← moved from position 6
    10. ContactSection ← was already near bottom
    11. FooterSection
- Non-functional:
  - No imports added or removed — all components already imported
  - No `Promise.all` fetch order change needed (all data fetched in parallel regardless of render order)

## Architecture

Single file edit — reorder JSX blocks in `app/[locale]/page.tsx` return statement. The data fetches in `Promise.all` don't need reordering because they are all parallel and named; each component receives its own named variable.

## Related Code Files

- Modify: `app/[locale]/page.tsx`

## Implementation Steps

1. Open `app/[locale]/page.tsx`.
2. In the JSX return block, change the order from:
   ```tsx
   <HeroSection ... />
   <AboutSection ... />
   <ExperienceTimeline ... />
   <ProjectsGrid ... />
   <SkillsSection ... />
   <SocialPostsGrid ... />       ← currently here (position 6)
   <CredentialsSection ... />
   <StrengthsCard ... />         ← currently here (position 8)
   <WritingList ... />
   <ContactSection ... />
   <FooterSection ... />
   ```
   To:
   ```tsx
   <HeroSection ... />
   <AboutSection ... />
   <ExperienceTimeline ... />
   <ProjectsGrid ... />
   <SkillsSection ... />
   <CredentialsSection ... />
   <WritingList ... />
   <StrengthsCard ... />         ← moved to bottom group
   <SocialPostsGrid ... />       ← moved to bottom group
   <ContactSection ... />
   <FooterSection ... />
   ```
3. Run `npx tsc --noEmit` to confirm no breakage.

## Success Criteria

- [x] `SocialPostsGrid` renders after `WritingList`, before `ContactSection`
- [x] `StrengthsCard` renders after `WritingList`, before `SocialPostsGrid`
- [x] `CredentialsSection` renders before `WritingList` (moved up)
- [x] `npx tsc --noEmit` passes

## Verification

- Confirmed `app/[locale]/page.tsx` renders the homepage sections in the planned order:
  Hero → About → Experience → Projects → Skills → Credentials → Writing → Strengths → Social → Contact → Footer.
- Ran `npx tsc --noEmit` successfully.

## Risk Assessment

- **Zero risk** — purely declarative JSX reorder; no logic, no imports, no data changes
- Each section is self-contained; order does not affect data or state
