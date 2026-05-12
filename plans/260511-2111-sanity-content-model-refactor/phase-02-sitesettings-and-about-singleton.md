---
phase: 2
title: "SiteSettings and About Singleton"
status: pending
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 2: SiteSettings and About Singleton

## Overview

Expand `siteSettings` from 4 fields (siteName, description, logo, socialLinks) to a full identity/contact/availability record needed by all upcoming UI layouts (header, hero, footer, contact CTA). Create new `about` singleton for the dedicated About page. Both are document types but enforced as singletons via desk-structure config in Phase 7. All new fields **optional** — existing siteSettings document remains valid.

## Requirements

**Functional**
- `siteSettings` gains: fullName, shortName, role🌐, tagline🌐, heroIntro (rich text🌐), avatar, resumePdfEn (PDF), resumePdfEs (PDF), location, timezone, availableForWork (bool), availabilityNote🌐, calComUrl, email, defaultLocale (en|es)
- `siteSettings.socialLinks[]` expands to include `handle` (string) + `visible` (bool, default true); `platform` enum expands to `github | linkedin | twitter | x | youtube | instagram | reddit | spotify | email`
- `about` singleton: paragraphs (rich text🌐), funFacts (array<string>🌐), photoCaption🌐
- All new fields optional — no `required()` on additions

**Non-functional**
- File fields restrict to `application/pdf`
- `email` uses `type: 'email'` (built-in validation)
- `calComUrl` uses `type: 'url'`
- `availableForWork` defaults to `false` via `initialValue`

## Architecture

**SiteSettings field groups** (visual hint via `fieldsets`):
- `identity`: fullName, shortName, role, tagline, avatar
- `intro`: heroIntro
- `availability`: availableForWork, availabilityNote, location, timezone
- `contact`: email, calComUrl, socialLinks
- `assets`: logo, resumePdfEn, resumePdfEs
- `config`: defaultLocale

**Platform enum** (`as const` for type safety):
```ts
const SOCIAL_PLATFORMS = [
  { title: 'GitHub', value: 'github' },
  { title: 'LinkedIn', value: 'linkedin' },
  { title: 'Twitter', value: 'twitter' },
  { title: 'X', value: 'x' },
  { title: 'YouTube', value: 'youtube' },
  { title: 'Instagram', value: 'instagram' },
  { title: 'Reddit', value: 'reddit' },
  { title: 'Spotify', value: 'spotify' },
  { title: 'Email', value: 'email' },
] as const
```

## Related Code Files

**Create**
- `sanity/schemas/about-type.ts`

**Modify**
- `sanity/schemas/site-settings-type.ts`

**Delete**
- None

## Implementation Steps

1. **siteSettings expansion** — open `sanity/schemas/site-settings-type.ts`. Keep existing imports (already updated in Phase 1: `localizedString`, `localizedText` from `../lib/i18n-helpers`). Add `localizedRichText` to import list.
2. Define `SOCIAL_PLATFORMS` constant above `defineType`.
3. Add fields (after existing `logo`, `socialLinks` stays last):
   - `fullName` (string)
   - `shortName` (string)
   - `localizedString('role', 'Role / Job Title')`
   - `localizedString('tagline', 'Tagline')`
   - `localizedRichText('heroIntro', 'Hero Intro')`
   - `avatar` (image, `options: { hotspot: true }`)
   - `resumePdfEn` (file, `options: { accept: 'application/pdf' }`)
   - `resumePdfEs` (file, `options: { accept: 'application/pdf' }`)
   - `location` (string)
   - `timezone` (string, e.g. "America/Mexico_City")
   - `availableForWork` (boolean, `initialValue: false`)
   - `localizedString('availabilityNote', 'Availability Note')`
   - `calComUrl` (url)
   - `email` (email)
   - `defaultLocale` (string, `options.list: [{title:'English',value:'en'},{title:'Spanish',value:'es'}]`, `initialValue: 'en'`)
4. Replace `socialLinks` array `of[]`:
   ```ts
   defineField({
     name: 'socialLinks',
     type: 'array',
     of: [{
       type: 'object',
       fields: [
         { name: 'platform', type: 'string', options: { list: SOCIAL_PLATFORMS } },
         { name: 'handle', type: 'string' },
         { name: 'url', type: 'url' },
         { name: 'visible', type: 'boolean', initialValue: true },
       ],
       preview: { select: { title: 'platform', subtitle: 'handle' } },
     }],
   })
   ```
5. Add `preview` block: `select: { title: 'fullName', subtitle: 'role.en', media: 'avatar' }`.
6. **About type** — create `sanity/schemas/about-type.ts`:
   ```ts
   import { defineType } from 'sanity'
   import { localizedRichText, localizedArray, localizedString } from '../lib/i18n-helpers'

   export const aboutType = defineType({
     name: 'about',
     title: 'About',
     type: 'document',
     fields: [
       localizedRichText('paragraphs', 'Paragraphs'),
       localizedArray('funFacts', 'Fun Facts'),
       localizedString('photoCaption', 'Photo Caption'),
     ],
     preview: { prepare: () => ({ title: 'About Page' }) },
   })
   ```
7. Phase 2 does NOT register the types in `sanity/schema.ts` yet (Phase 7 owns that). However, to test Studio loads, you may register `aboutType` early; final wiring is in Phase 7.
8. Run `npm run typecheck`.

## Todo List

- [ ] siteSettings: add 14 new top-level fields
- [ ] siteSettings: expand socialLinks shape (platform enum + handle + visible)
- [ ] siteSettings: add fieldsets and preview
- [ ] Create `about-type.ts` with 3 localized fields
- [ ] `npm run typecheck` passes

## Success Criteria

- [ ] Existing siteSettings document loads in Studio with no validation errors
- [ ] All new fields visible and editable in Studio (after Phase 7 registration)
- [ ] PDF upload fields reject non-PDF mime types
- [ ] `email` field rejects non-email input
- [ ] `about` document creatable via Studio (after Phase 7 registration)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Existing siteSettings document breaks | Very Low | High | All adds are optional; Sanity adds null fields gracefully |
| socialLinks data loss from shape change | Low | Medium | Existing `{platform, url}` items remain valid — new fields just become null; manual handle backfill in Studio |
| Multiple `about` documents created | Medium | Low | Phase 7 structure config makes singleton — until then, document the convention in commit message |

## Rollback

`git checkout sanity/schemas/site-settings-type.ts` reverts siteSettings to 4-field shape. Delete `sanity/schemas/about-type.ts`. Existing dataset documents keep their newly-added field data (ignored on load); no destructive change.
