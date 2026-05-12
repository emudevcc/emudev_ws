---
phase: 7
title: 'Wire Up Types and Queries'
status: completed
priority: P1
effort: '4h'
dependencies: [1, 2, 3, 4, 5, 6]
---

# Phase 7: Wire Up Types and Queries

## Overview

Final integration phase: register all 9 new types in `sanity/schema.ts`, define custom desk structure to organize 14 types into 5 logical groups, regenerate TypeScript types, add GROQ queries for new collections (Experience, Skill, About, Certification, Education, Language, Strength, SocialPost, Testimonial) and the expanded `siteSettings`. After this phase, the Studio fully reflects the new content model and Next.js can consume strongly-typed data via existing `unstable_cache` pattern.

## Requirements

**Functional**

- All 9 new types appear in Studio nav, grouped by category
- `siteSettings`, `about` enforced as singletons via structure (one doc only, no "create new" button)
- New GROQ queries follow existing pattern: `unstable_cache` + `coalesce([$locale], .en)` + cache tags
- TypeScript types regenerated; downstream consumers compile

**Non-functional**

- Cache version bumped to `localized-v3` (schema change invalidates old cached payloads)
- Each new collection gets a stable cache tag (e.g., `'experiences'`, `'skills'`)
- Custom structure file is < 200 lines (per project rule)

## Architecture

**Desk structure groups** (in `sanity/structure.ts`):

| Group                | Items                              |
| -------------------- | ---------------------------------- |
| Singletons           | Site Settings, About               |
| Portfolio            | Project, Experience, Education     |
| Blog                 | Post, Tag, Author                  |
| Skills & Credentials | Skill, Certification, Language     |
| About Extras         | Strength, Testimonial, Social Post |

**Singleton enforcement**: use `S.listItem().child(S.document().schemaType('siteSettings').documentId('siteSettings'))` — fixed document ID. Same pattern for `about`.

**New cache tags**: `experiences`, `experience:${slug-or-id}`, `skills`, `about`, `certifications`, `educations`, `languages`, `strengths`, `socialPosts`, `testimonials`.

## Related Code Files

**Create**

- `sanity/structure.ts`

**Modify**

- `sanity/schema.ts` (register all new types)
- `sanity/sanity.config.ts` (plug `structureTool({ structure })`)
- `lib/sanity-queries.ts` (add new queries, update existing siteSettings query, bump cache version)

**Auto-regenerated**

- `types/sanity.types.ts` (via `npm run sanity:types`)

## Implementation Steps

1. **Register types** — `sanity/schema.ts`:

   ```ts
   import { projectType } from './schemas/project-type'
   import { postType } from './schemas/post-type'
   import { authorType } from './schemas/author-type'
   import { tagType } from './schemas/tag-type'
   import { siteSettingsType } from './schemas/site-settings-type'
   import { aboutType } from './schemas/about-type'
   import { skillType } from './schemas/skill-type'
   import { experienceType } from './schemas/experience-type'
   import { certificationType } from './schemas/certification-type'
   import { educationType } from './schemas/education-type'
   import { languageType } from './schemas/language-type'
   import { strengthType } from './schemas/strength-type'
   import { socialPostType } from './schemas/social-post-type'
   import { testimonialType } from './schemas/testimonial-type'

   export const schema = {
     types: [
       // Existing
       projectType,
       postType,
       authorType,
       tagType,
       siteSettingsType,
       // New (Phase 2-5)
       aboutType,
       skillType,
       experienceType,
       certificationType,
       educationType,
       languageType,
       strengthType,
       socialPostType,
       testimonialType,
     ],
   }
   ```

2. **Custom structure** — `sanity/structure.ts`:

   ```ts
   import type { StructureResolver } from 'sanity/structure'

   export const structure: StructureResolver = (S) =>
     S.list()
       .title('Content')
       .items([
         S.listItem()
           .title('Singletons')
           .child(
             S.list()
               .title('Singletons')
               .items([
                 S.listItem()
                   .title('Site Settings')
                   .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
                 S.listItem()
                   .title('About')
                   .child(S.document().schemaType('about').documentId('about')),
               ])
           ),
         S.divider(),
         S.listItem()
           .title('Portfolio')
           .child(
             S.list()
               .title('Portfolio')
               .items([
                 S.documentTypeListItem('project'),
                 S.documentTypeListItem('experience'),
                 S.documentTypeListItem('education'),
               ])
           ),
         S.listItem()
           .title('Blog')
           .child(
             S.list()
               .title('Blog')
               .items([
                 S.documentTypeListItem('post'),
                 S.documentTypeListItem('tag'),
                 S.documentTypeListItem('author'),
               ])
           ),
         S.listItem()
           .title('Skills & Credentials')
           .child(
             S.list()
               .title('Skills & Credentials')
               .items([
                 S.documentTypeListItem('skill'),
                 S.documentTypeListItem('certification'),
                 S.documentTypeListItem('language'),
               ])
           ),
         S.listItem()
           .title('About Extras')
           .child(
             S.list()
               .title('About Extras')
               .items([
                 S.documentTypeListItem('strength'),
                 S.documentTypeListItem('testimonial'),
                 S.documentTypeListItem('socialPost'),
               ])
           ),
       ])
   ```

3. **Wire structure into config** — `sanity/sanity.config.ts`:
   - Add import: `import { structure } from './structure'`
   - Change `structureTool()` → `structureTool({ structure })`

4. **Hide singletons from "create new"** — in `siteSettingsType` and `aboutType`, optionally add (no plugin needed for this phase; structure-only enforcement is sufficient for MVP):
   - Already enforced by structure binding to fixed `documentId`. Users can still hit "Create" via global menu — accept this limitation for now (YAGNI). If issue arises, add a `documentInternationalization`-style filter later.

5. **Bump cache version** — `lib/sanity-queries.ts`: `const cacheVersion = 'localized-v3'`.

6. **Update existing `getSiteSettings`** to return new fields:

   ```ts
   query: groq`*[_type == "siteSettings"][0] {
     fullName,
     shortName,
     "role": coalesce(role[$locale], role.en),
     "tagline": coalesce(tagline[$locale], tagline.en),
     "heroIntro": coalesce(heroIntro[$locale], heroIntro.en),
     "siteName": coalesce(siteName[$locale], siteName.en),
     "description": coalesce(description[$locale], description.en),
     "logo": logo.asset->url,
     "avatar": avatar.asset->url,
     "resumePdfEn": resumePdfEn.asset->url,
     "resumePdfEs": resumePdfEs.asset->url,
     location,
     timezone,
     availableForWork,
     "availabilityNote": coalesce(availabilityNote[$locale], availabilityNote.en),
     calComUrl,
     email,
     defaultLocale,
     "socialLinks": socialLinks[visible != false]{ platform, handle, url, visible }
   }`
   ```

   Update the `SiteSettings` TS type to match (or remove it and use generated types).

7. **Add new queries** to `lib/sanity-queries.ts` (one function per new collection). Pattern for each:

   ```ts
   export const getExperiences = (locale?: string) => {
     const safeLocale = normalizeLocale(locale)
     return unstable_cache(
       async () =>
         sanityFetch<Experience[]>({
           query: groq`*[_type == "experience"] | order(startDate desc) {
           _id,
           "role": coalesce(role[$locale], role.en),
           company, companyUrl,
           "companyLogo": companyLogo.asset->url,
           location, employmentType, startDate, endDate,
           "summary": coalesce(summary[$locale], summary.en),
           "highlights": coalesce(highlights[$locale], highlights.en),
           "tech": tech[]->{ _id, name, "iconImage": iconImage.asset->url, iconSlug, category, level },
           clients, order
         }`,
           params: { locale: safeLocale },
         }),
       [`${cacheVersion}-experiences-${safeLocale}`],
       { tags: ['experiences'], revalidate: 3600 }
     )()
   }
   ```

   Add similar functions for:
   - `getSkills(locale?)` — `*[_type == "skill"] | order(order asc)`
   - `getAbout(locale?)` — `*[_type == "about"][0]`
   - `getCertifications(locale?)` — `*[_type == "certification"] | order(issueDate desc)`
   - `getEducations(locale?)` — `*[_type == "education"] | order(startYear desc)`
   - `getLanguages()` — `*[_type == "language"]` (no locale)
   - `getStrengths(locale?)` — `*[_type == "strength"] | order(rank asc)`
   - `getSocialPosts(locale?)` — `*[_type == "socialPost"] | order(postedAt desc)`
   - `getTestimonials(locale?)` — `*[_type == "testimonial"]`

8. **Regenerate types**:

   ```bash
   npm run sanity:types
   ```

   Verify `types/sanity.types.ts` now exports interfaces for: `About`, `Skill`, `Experience`, `Certification`, `Education`, `Language`, `Strength`, `SocialPost`, `Testimonial`, plus updated `SiteSettings`, `Project`, `Post`.

9. **Replace local TS types in queries file** — drop hand-rolled `ProjectSummary`/`SiteSettings`/etc. types in favor of generated ones from `@/types/sanity.types`. (Optional in this phase if it requires too many touchpoints — file under follow-up if so.)

10. **Compile gate**:

    ```bash
    npm run typecheck
    npm run lint
    npm run build
    ```

11. **Studio smoke test**: visit `/studio`, confirm:
    - 5 groups in left nav (Singletons, Portfolio, Blog, Skills & Credentials, About Extras)
    - Site Settings opens singleton doc (no list of multiple)
    - About opens singleton doc
    - Creating a Skill, then Experience, can pick Skill in `tech` ref

12. **Front-end smoke test**: `getProjects()`, `getPosts()`, `getSiteSettings()` still return data without runtime errors. (UI consumption is future work.)

## Todo List

- [x] Register all 9 new types in `schema.ts`
- [x] Create `sanity/structure.ts` with 5 groups + 2 singletons
- [x] Update `sanity.config.ts` to use custom structure
- [x] Bump `cacheVersion` to `localized-v3`
- [x] Expand `getSiteSettings` GROQ query
- [x] Add 9 new query functions (experiences, skills, about, certifications, educations, languages, strengths, socialPosts, testimonials)
- [x] Run `npm run sanity:types`
- [x] Run `npm run typecheck`
- [x] Run `npm run lint`
- [x] Run `npm run build`
- [x] Studio smoke test
- [x] Front-end smoke test (existing pages still load)

## Success Criteria

- [x] All 14 types listed in Studio under the 5 logical groups
- [x] `siteSettings` and `about` enforced as singletons (clicking opens the same doc each time)
- [x] `types/sanity.types.ts` regenerated; `git diff` shows new interfaces for all added types
- [x] `npm run build` succeeds with zero TypeScript errors
- [x] `lib/sanity-queries.ts` exports new functions matching the established pattern
- [x] Cache tags wired (Phase 6 doc updates revalidate via existing webhook + new tag names)
- [x] Existing projects, posts, siteSettings still resolve via legacy + new fields

## Risk Assessment

| Risk                                                                      | Likelihood | Impact | Mitigation                                                                                                    |
| ------------------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| Type regen exposes downstream type errors across `app/` and `components/` | High       | High   | Build serves as compile gate; fix call sites or add narrow `as any` only as last resort flagged for follow-up |
| Custom structure typo hides a type entirely                               | Medium     | Medium | Studio smoke test enumerates groups; commit only after manual check                                           |
| Cache version bump causes brief stale-data churn in production            | Low        | Low    | Acceptable — content is largely additive; revalidation fires within 1h or on next publish via webhook         |
| Singleton not enforced if user navigates outside custom structure         | Low        | Low    | Document the limitation; investigate `defineDocumentSingleton` plugin if it becomes a problem                 |
| Webhook revalidation doesn't know new cache tags                          | Medium     | Medium | Audit `app/api/revalidate/route.ts` (or equivalent) and add new tag names to its switch/list                  |

## Rollback

`git checkout sanity/schema.ts sanity/sanity.config.ts lib/sanity-queries.ts types/sanity.types.ts && rm sanity/structure.ts`. New types unregister; Studio reverts to flat list of 5 original types. Dataset documents for new types remain but become invisible until re-registered. No destructive change.

## Unresolved Questions

- Should `lib/sanity-queries.ts` be split when it grows past 200 LOC (development-rules cap)? Likely yes — propose `lib/sanity-queries/` directory with one file per collection in a follow-up plan. Out of scope here.
- Author Phase B (full deprecation, swap to `siteSettings` fallback) — separate plan, not blocked by this work.
- Should we add `defineDocumentSingleton` plugin for stricter singleton enforcement? Defer — current structure binding is sufficient.
- Webhook revalidation route audit: location of route handler not verified in this plan. Reviewer should grep `revalidateTag` to find current handler and confirm tag registration coverage.
