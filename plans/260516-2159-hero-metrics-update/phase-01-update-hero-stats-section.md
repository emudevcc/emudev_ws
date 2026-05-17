---
phase: 1
title: "Update hero stats section"
status: pending
priority: P2
effort: "20m"
dependencies: []
---

# Phase 1: Update Hero Stats Section

## Overview

Replace the 4-stat hero grid (Projects/Skills/Credentials/Links) with 5 stats: Years of experience, Skills, Credentials, Posts, Social links. "Years of experience" is derived at render time from the earliest `startDate` across the experiences array — no Sanity schema changes needed.

## Requirements

- Functional:
  - 5 stats in order: Years of experience, Skills, Credentials, Posts, Social links
  - "Years of experience" = `currentYear − min(experience.startDate year)` — dynamic, no hardcoding
  - "Posts" = count of blog posts (`posts.length`)
  - Each stat is still a clickable anchor link
  - Hrefs: `#experience`, `#skills`, `#credentials`, `#writing`, `#social`
- Non-functional:
  - Grid layout: `grid-cols-3 sm:grid-cols-5` (3 on mobile to fit naturally, 5 on sm+)
  - `max-w-3xl` → `max-w-4xl` to give 5 columns breathing room
  - i18n: remove `statProjects`, add `statExperience` and `statPosts` in EN + ES
  - `projectCount` prop removed from `HeroSectionProps`

## Architecture

Data flow:
```
page.tsx
  ├── experiences[] (already fetched)  → yearsOfExperience: number (computed inline)
  ├── posts[] (already fetched)        → postCount: number (posts.length)
  ├── skills[] (already fetched)       → skillCount: number
  ├── certs[] (already fetched)        → certificationCount: number
  └── settings.socialLinks[]           → socialLinkCount: number (in HeroSection already)

HeroSection receives: yearsOfExperience, skillCount, certificationCount, postCount, settings
```

`yearsOfExperience` computation (in `page.tsx`):
```ts
const thisYear = new Date().getFullYear()
const earliestYear = experiences?.reduce((min, e) => {
  if (!e.startDate) return min
  const y = new Date(e.startDate).getFullYear()
  return y < min ? y : min
}, thisYear) ?? thisYear
const yearsOfExperience = thisYear - earliestYear
```

## Related Code Files

- Modify: `app/[locale]/page.tsx`
- Modify: `components/sections/HeroSection.tsx`
- Modify: `messages/en.json`
- Modify: `messages/es.json`

## Implementation Steps

### 1. `app/[locale]/page.tsx`

Add `yearsOfExperience` computation and update `HeroSection` call:

```tsx
// After Promise.all, add:
const thisYear = new Date().getFullYear()
const earliestYear = experiences?.reduce((min, e) => {
  if (!e.startDate) return min
  const y = new Date(e.startDate).getFullYear()
  return y < min ? y : min
}, thisYear) ?? thisYear
const yearsOfExperience = thisYear - earliestYear

// Update HeroSection props (remove projectCount, add yearsOfExperience + postCount):
<HeroSection
  settings={settings}
  yearsOfExperience={yearsOfExperience}
  skillCount={skills?.length ?? 0}
  certificationCount={certs?.length ?? 0}
  postCount={posts?.length ?? 0}
/>
```

### 2. `components/sections/HeroSection.tsx`

Update props type and stats array:

```ts
type HeroSectionProps = {
  settings: SiteSettings | null
  yearsOfExperience: number
  skillCount: number
  certificationCount: number
  postCount: number
}
```

Replace stats array:
```ts
const stats = [
  { value: yearsOfExperience, label: t('statExperience'), href: '#experience' },
  { value: skillCount,        label: t('statSkills'),     href: '#skills' },
  { value: certificationCount, label: t('statCredentials'), href: '#credentials' },
  { value: postCount,         label: t('statPosts'),      href: '#writing' },
  { value: settings?.socialLinks?.length ?? 0, label: t('statLinks'), href: '#social' },
]
```

Update grid container (max-w-3xl → max-w-4xl, sm:grid-cols-4 → sm:grid-cols-5):
```tsx
<div className="mt-16 grid max-w-4xl grid-cols-3 gap-5 sm:grid-cols-5">
```

Note: mobile shows 3 columns (first 3 stats on row 1, last 2 on row 2). This is acceptable — the `gap-5` and `border-l-2` design works well at any column count.

### 3. `messages/en.json` — hero section

```json
"hero": {
  ...existing keys...
  "statExperience": "yrs experience",
  "statSkills": "skills",
  "statCredentials": "credentials",
  "statPosts": "posts",
  "statLinks": "links"
}
```
Remove `"statProjects"`.

### 4. `messages/es.json` — hero section

```json
"hero": {
  ...existing keys...
  "statExperience": "años de exp.",
  "statSkills": "habilidades",
  "statCredentials": "credenciales",
  "statPosts": "publicaciones",
  "statLinks": "enlaces"
}
```
Remove `"statProjects"`.

## Success Criteria

- [ ] Hero shows 5 stat boxes: Years of experience, Skills, Credentials, Posts, Social links
- [ ] `projectCount` prop is gone from `HeroSection` and `page.tsx`
- [ ] Years of experience is a non-zero computed number (not 0 unless experience list is empty)
- [ ] Each stat links to the correct section anchor
- [ ] `npx tsc --noEmit` passes (no orphaned props or missing keys)
- [ ] EN + ES i18n has no `statProjects` key; both have `statExperience` and `statPosts`

## Risk Assessment

- **Low risk** — all data already available in `page.tsx`; computation is simple arithmetic
- If `experiences` is empty or all entries lack `startDate`, `yearsOfExperience` gracefully degrades to `0`
- Grid change from 4→5 cols: on 320px mobile with `grid-cols-3`, last row has 2 items (not 3) — visually fine with left-aligned stats
- No Sanity schema changes, no new fetches
