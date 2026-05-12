---
phase: 5
title: 'Supporting Content Types'
status: completed
priority: P1
effort: '3h'
dependencies: [1, 3]
---

# Phase 5: Supporting Content Types

## Overview

Four small collection types that fill out the sidebar/bento layouts: `language` (spoken), `strength` (CliftonStrengths), `socialPost` (curated X/Reddit posts), `testimonial` (optional, refs Experience). Each is independent. `testimonial` is the only one with a reference — to `experience` (Phase 3).

## Requirements

**Language**

- name (string), code (string: `en | es | …`), proficiency (enum), cefr (string, optional)
- `proficiency` enum: `native | fluent | professional | conversational | basic`
- `cefr` examples: `A1, A2, B1, B2, C1, C2`

**Strength** (CliftonStrengths)

- name (string), rank (number 1-5), domain (enum), description (rich text🌐)
- `domain` enum: `executing | influencing | relationship-building | strategic-thinking`
- `rank` validation: integer, min 1, max 5

**SocialPost**

- platform (enum: `x | reddit`), handle (string), subreddit (string, optional), body🌐 (rich text), postedAt (datetime), permalink (url), stats (object: likes/replies/reposts numbers), featured (boolean)
- `subreddit` only meaningful when `platform == 'reddit'`

**Testimonial** (optional collection)

- quote🌐, author (string), authorRole🌐, authorCompany (string), authorAvatar (image), relatedExperience (ref→experience, optional)

## Architecture

`socialPost.stats` is a single object field (not multiple top-level numbers) to keep grouping clear:

```ts
{ name: 'stats', type: 'object', fields: [
  { name: 'likes', type: 'number' },
  { name: 'replies', type: 'number' },
  { name: 'reposts', type: 'number' },
]}
```

Conditional visibility for `subreddit`: use `hidden: ({ parent }) => parent?.platform !== 'reddit'`.

## Related Code Files

**Create**

- `sanity/schemas/language-type.ts`
- `sanity/schemas/strength-type.ts`
- `sanity/schemas/social-post-type.ts`
- `sanity/schemas/testimonial-type.ts`

**Modify**

- None (registration in Phase 7)

## Implementation Steps

1. **Language** — `sanity/schemas/language-type.ts`:

   ```ts
   import { defineType, defineField } from 'sanity'

   const PROFICIENCY = [
     { title: 'Native', value: 'native' },
     { title: 'Fluent', value: 'fluent' },
     { title: 'Professional', value: 'professional' },
     { title: 'Conversational', value: 'conversational' },
     { title: 'Basic', value: 'basic' },
   ] as const

   export const languageType = defineType({
     name: 'language',
     title: 'Language (Spoken)',
     type: 'document',
     fields: [
       defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
       defineField({ name: 'code', type: 'string', description: 'ISO 639-1 (e.g. "en", "es")' }),
       defineField({ name: 'proficiency', type: 'string', options: { list: PROFICIENCY } }),
       defineField({ name: 'cefr', type: 'string', description: 'CEFR level (A1..C2)' }),
     ],
     preview: { select: { title: 'name', subtitle: 'proficiency' } },
   })
   ```

2. **Strength** — `sanity/schemas/strength-type.ts`:

   ```ts
   import { defineType, defineField } from 'sanity'
   import { localizedRichText } from '../lib/i18n-helpers'

   const DOMAINS = [
     { title: 'Executing', value: 'executing' },
     { title: 'Influencing', value: 'influencing' },
     { title: 'Relationship Building', value: 'relationship-building' },
     { title: 'Strategic Thinking', value: 'strategic-thinking' },
   ] as const

   export const strengthType = defineType({
     name: 'strength',
     title: 'Strength (CliftonStrengths)',
     type: 'document',
     fields: [
       defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
       defineField({
         name: 'rank',
         type: 'number',
         validation: (r) => r.required().integer().min(1).max(5),
       }),
       defineField({ name: 'domain', type: 'string', options: { list: DOMAINS } }),
       localizedRichText('description', 'Description'),
     ],
     preview: {
       select: { title: 'name', rank: 'rank', subtitle: 'domain' },
       prepare: ({ title, rank, subtitle }) => ({ title: `#${rank} ${title}`, subtitle }),
     },
     orderings: [
       { title: 'Rank ascending', name: 'rankAsc', by: [{ field: 'rank', direction: 'asc' }] },
     ],
   })
   ```

3. **SocialPost** — `sanity/schemas/social-post-type.ts`:

   ```ts
   import { defineType, defineField } from 'sanity'
   import { localizedRichText } from '../lib/i18n-helpers'

   const PLATFORMS = [
     { title: 'X (Twitter)', value: 'x' },
     { title: 'Reddit', value: 'reddit' },
   ] as const

   export const socialPostType = defineType({
     name: 'socialPost',
     title: 'Social Post',
     type: 'document',
     fields: [
       defineField({
         name: 'platform',
         type: 'string',
         options: { list: PLATFORMS },
         validation: (r) => r.required(),
       }),
       defineField({ name: 'handle', type: 'string', validation: (r) => r.required() }),
       defineField({
         name: 'subreddit',
         type: 'string',
         hidden: ({ parent }) => parent?.platform !== 'reddit',
       }),
       localizedRichText('body', 'Body'),
       defineField({ name: 'postedAt', type: 'datetime', validation: (r) => r.required() }),
       defineField({ name: 'permalink', type: 'url' }),
       defineField({
         name: 'stats',
         type: 'object',
         fields: [
           { name: 'likes', type: 'number' },
           { name: 'replies', type: 'number' },
           { name: 'reposts', type: 'number' },
         ],
       }),
       defineField({ name: 'featured', type: 'boolean', initialValue: false }),
     ],
     preview: { select: { title: 'handle', subtitle: 'platform' } },
     orderings: [
       {
         title: 'Posted, newest first',
         name: 'postedAtDesc',
         by: [{ field: 'postedAt', direction: 'desc' }],
       },
     ],
   })
   ```

4. **Testimonial** — `sanity/schemas/testimonial-type.ts`:

   ```ts
   import { defineType, defineField } from 'sanity'
   import { localizedText, localizedString } from '../lib/i18n-helpers'

   export const testimonialType = defineType({
     name: 'testimonial',
     title: 'Testimonial',
     type: 'document',
     fields: [
       localizedText('quote', 'Quote', 4),
       defineField({ name: 'author', type: 'string', validation: (r) => r.required() }),
       localizedString('authorRole', 'Author Role'),
       defineField({ name: 'authorCompany', type: 'string' }),
       defineField({ name: 'authorAvatar', type: 'image', options: { hotspot: true } }),
       defineField({
         name: 'relatedExperience',
         type: 'reference',
         to: [{ type: 'experience' }],
       }),
     ],
     preview: { select: { title: 'author', subtitle: 'authorCompany', media: 'authorAvatar' } },
   })
   ```

5. `npm run typecheck`.

## Todo List

- [x] Create `language-type.ts` (4 fields, proficiency enum)
- [x] Create `strength-type.ts` (4 fields, custom rank preview, ordering)
- [x] Create `social-post-type.ts` (8 fields, conditional `subreddit`, stats object)
- [x] Create `testimonial-type.ts` (6 fields, experience ref)
- [x] `npm run typecheck` passes

## Success Criteria

- [x] Strength.rank rejects values outside 1-5
- [x] SocialPost.subreddit hidden in Studio when platform != 'reddit'
- [x] Testimonial.relatedExperience picker shows Experience docs (post-Phase 7)
- [x] All preview cards render correctly in Studio document list

## Risk Assessment

| Risk                                                               | Likelihood | Impact | Mitigation                                                                               |
| ------------------------------------------------------------------ | ---------- | ------ | ---------------------------------------------------------------------------------------- |
| Conditional `hidden` callback fails for new doc (parent undefined) | Low        | Low    | `parent?.platform` uses optional chaining; renders hidden by default which is acceptable |
| Phase 3 not complete → testimonial ref invalid                     | Low        | High   | Explicit `dependencies: [3]` in frontmatter                                              |
| Stats object missing types after type-gen                          | Low        | Low    | Verify `types/sanity.types.ts` includes `stats?: { likes?: number; … }` in Phase 7       |

## Rollback

Delete the four new files. No dataset impact.
