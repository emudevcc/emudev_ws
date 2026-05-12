---
phase: 4
title: "Certification and Education Schemas"
status: pending
priority: P1
effort: "2h"
dependencies: [1, 3]
---

# Phase 4: Certification and Education Schemas

## Overview

Two credential-tracking collections for the sidebar/about layouts. `certification` references `skill` (Phase 3) to tag what each cert validates. `education` is self-contained.

## Requirements

**Functional — Certification**
- Fields: name (string), issuer (string), issuerLogo (image), issueDate (date), expiryDate (date, optional), credentialId (string), credentialUrl (url), badgeImage (image), skills (array<ref skill>)
- `name`, `issuer`, `issueDate` required
- `credentialUrl` is the public verification link (e.g., Credly badge URL)

**Functional — Education**
- Fields: institution (string), degree🌐, field🌐, startYear (number), endYear (number, optional), location (string), notes🌐 (optional)
- `institution`, `degree.en`, `startYear` required
- `endYear` empty = ongoing

**Non-functional**
- Years stored as number (2018), not date — degrees usually only granular to year
- Both types orderable by date desc

## Architecture

`certification.skills`: same ref shape as `experience.tech` — `array of {type: reference, to: [{type:'skill'}]}`.

`education` uses `localizedString` for `degree`, `field`, and `localizedText` (rows=3) for `notes`.

## Related Code Files

**Create**
- `sanity/schemas/certification-type.ts`
- `sanity/schemas/education-type.ts`

**Modify**
- None (registration in Phase 7)

## Implementation Steps

1. **Create Certification** — `sanity/schemas/certification-type.ts`:
   ```ts
   import { defineType, defineField } from 'sanity'

   export const certificationType = defineType({
     name: 'certification',
     title: 'Certification',
     type: 'document',
     fields: [
       defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
       defineField({ name: 'issuer', type: 'string', validation: (r) => r.required() }),
       defineField({ name: 'issuerLogo', type: 'image', options: { hotspot: false } }),
       defineField({ name: 'issueDate', type: 'date', validation: (r) => r.required() }),
       defineField({ name: 'expiryDate', type: 'date' }),
       defineField({ name: 'credentialId', type: 'string' }),
       defineField({ name: 'credentialUrl', type: 'url' }),
       defineField({ name: 'badgeImage', type: 'image' }),
       defineField({
         name: 'skills',
         type: 'array',
         of: [{ type: 'reference', to: [{ type: 'skill' }] }],
       }),
     ],
     preview: { select: { title: 'name', subtitle: 'issuer', media: 'badgeImage' } },
     orderings: [
       { title: 'Issue date, newest first', name: 'issueDateDesc', by: [{ field: 'issueDate', direction: 'desc' }] },
     ],
   })
   ```

2. **Create Education** — `sanity/schemas/education-type.ts`:
   ```ts
   import { defineType, defineField } from 'sanity'
   import { localizedString, localizedText } from '../lib/i18n-helpers'

   export const educationType = defineType({
     name: 'education',
     title: 'Education',
     type: 'document',
     fields: [
       defineField({ name: 'institution', type: 'string', validation: (r) => r.required() }),
       localizedString('degree', 'Degree', true),
       localizedString('field', 'Field of Study'),
       defineField({ name: 'startYear', type: 'number', validation: (r) => r.required().integer().min(1900).max(2100) }),
       defineField({ name: 'endYear', type: 'number', validation: (r) => r.integer().min(1900).max(2100) }),
       defineField({ name: 'location', type: 'string' }),
       localizedText('notes', 'Notes', 3),
     ],
     preview: {
       select: { title: 'institution', subtitleEn: 'degree.en', start: 'startYear', end: 'endYear' },
       prepare({ title, subtitleEn, start, end }) {
         const range = end ? `${start}–${end}` : `${start}–Present`
         return { title, subtitle: `${subtitleEn ?? ''} (${range})` }
       },
     },
     orderings: [
       { title: 'Start year, newest first', name: 'startYearDesc', by: [{ field: 'startYear', direction: 'desc' }] },
     ],
   })
   ```

3. `npm run typecheck`.

## Todo List

- [ ] Create `certification-type.ts` with 9 fields, skills ref, preview, ordering
- [ ] Create `education-type.ts` with 7 fields, year validation, custom preview
- [ ] `npm run typecheck` passes

## Success Criteria

- [ ] Certification validates required name + issuer + issueDate
- [ ] Certification.skills picker shows Skill docs (post-Phase 7)
- [ ] Education enforces year range 1900-2100
- [ ] Education preview shows "Institution — Degree (2018–2022)" or "(2020–Present)"

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Phase 3 not merged before Phase 4 starts | Low | High | Hard dependency declared in frontmatter; CI gate `npm run sanity:types` will fail if `skill` type missing |
| Year as number vs date inconsistency | Low | Low | Document convention in field description |

## Rollback

Delete both files. No dataset impact.
