---
phase: 2
title: "UI Layer: ExperienceCard"
status: completed
priority: P2
effort: "10m"
dependencies: [1]
---

# Phase 2: UI Layer — ExperienceCard

## Overview
Update `ExperienceCard` to render `experience.displayCompany` instead of `experience.company`. One-line change after Phase 1 resolves the type.

## Requirements
- Functional:
  - `ExperienceCard` renders `experience.displayCompany` in place of `experience.company`
  - Rendering stays identical — same position, same styles — just uses the alias-aware field
- Non-functional:
  - `npx tsc --noEmit` passes cleanly after this phase

## Architecture

In `components/ui/experience-card.tsx`, line:
```tsx
{[experience.company, experience.location].filter(Boolean).join(" - ")}
```
Change to:
```tsx
{[experience.displayCompany, experience.location].filter(Boolean).join(" - ")}
```

No other rendering changes needed. `companyUrl` is already in the `Experience` type and not referenced in `ExperienceCard` (the company name is not currently linked in the UI — keep it that way to avoid leaking the URL as an indirect identifier).

## Related Code Files
- Modify: `components/ui/experience-card.tsx`

## Implementation Steps
1. Open `components/ui/experience-card.tsx`
2. Replace `experience.company` with `experience.displayCompany`
3. Run `npx tsc --noEmit` — must pass with zero errors

## Success Criteria
- [x] `experience.displayCompany` rendered in ExperienceCard
- [x] `npx tsc --noEmit` passes
- [x] Visual output unchanged for entries without alias; aliased entries show alias

## Completion Notes

- Updated the company/location line to use the alias-aware field.
- Manual Sanity Studio and browser visual checks were not run in this environment.

## Risk Assessment
Trivial. One identifier rename. Blocked by Phase 1 type change.
