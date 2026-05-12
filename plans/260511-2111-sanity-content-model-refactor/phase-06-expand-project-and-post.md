---
phase: 6
title: "Expand Project and Post"
status: pending
priority: P1
effort: "3h"
dependencies: [1, 3]
---

# Phase 6: Expand Project and Post

## Overview

Highest-risk phase — modifies two existing schemas with data already in the dataset. Renames `featuredImage` → `cover` on Project (and adds `cover` on Post if missing), adds many optional fields, swaps Project's tag-based taxonomy for Skill-ref-based `tech`. Post change is purely additive; Project change is mostly additive but includes a rename and a removal (`tags[]`). Author Phase A: keep `author` ref; add optional `authorOverride` for future deprecation.

## Requirements

**Project additions** (all optional unless noted)
- `tagline🌐`, `cover` (rename), `gallery` (array<image>), `tech` (array<ref skill>), `role🌐`, `year` (number), `status` (enum `live|archived|wip`), `featured` (boolean), `caseStudyUrl` (url), `metrics` (array<object: label🌐, value (string)>), `order` (number)

**Project removals/renames**
- Rename `featuredImage` → `cover` (preserve image data: same field shape)
- Remove `tags[]` array (use `tech` refs instead). Existing tag refs orphaned in dataset; safe but unused.

**Post additions** (all optional)
- `cover` (image — currently no image field on Post; add it)
- `readingMinutes` (number)
- `canonicalUrl` (url)
- `status` (enum `draft|published`, default `published`)
- `authorOverride` (ref→author, optional) — Phase A author deprecation prep

**Post unchanged**
- `title`, `slug`, `excerpt`, `content`, `author`, `tags`, `publishedAt` — keep as-is

**Non-functional**
- Existing project/post documents must continue loading without manual data migration
- GROQ queries (Phase 7) must still resolve `featuredImage` for legacy data via fallback: `coalesce(cover.asset->url, featuredImage.asset->url)` until UI is migrated

## Architecture

**Rename strategy** — Sanity does not rename fields server-side. New field `cover` lives alongside legacy `featuredImage` in the dataset. Two options:
1. **Soft rename** (chosen): add `cover` field, keep `featuredImage` removed from schema (Studio won't show it but data persists). Query coalesces both during transition.
2. **Hard rename** (rejected): write a migration script. YAGNI for current dataset size.

**Project status enum**:
```ts
const STATUSES = [
  { title: 'Live', value: 'live' },
  { title: 'Archived', value: 'archived' },
  { title: 'Work in Progress', value: 'wip' },
] as const
```

**Project metrics shape**:
```ts
{ name: 'metrics', type: 'array', of: [{
  type: 'object',
  fields: [
    localizedString('label', 'Label'),
    { name: 'value', type: 'string' },  // string, supports "+250%" "$1.2M"
  ],
  preview: { select: { title: 'label.en', subtitle: 'value' } },
}]}
```

## Related Code Files

**Create**
- None

**Modify**
- `sanity/schemas/project-type.ts`
- `sanity/schemas/post-type.ts`
- `lib/sanity-queries.ts` (only the `featuredImage` → `cover` fallback in existing queries — full new queries are in Phase 7)

**Delete**
- None (`featuredImage` field deleted from schema only, data preserved)

## Implementation Steps

1. **Project** — open `sanity/schemas/project-type.ts`:
   - Update imports: add `localizedRichText` (no — not needed here) — keep current `localizedString, localizedText, localizedSlug, localizedContent` plus skill ref pattern.
   - Define `STATUSES` constant near top.
   - Replace existing `featuredImage` field with `defineField({ name: 'cover', type: 'image', options: { hotspot: true } })`.
   - Remove the `tags[]` field block.
   - Add the following fields (placement: after `localizedContent`, before `cover`):
     ```ts
     localizedString('tagline', 'Tagline'),
     localizedString('role', 'Role'),
     defineField({ name: 'year', type: 'number', validation: (r) => r.integer().min(1900).max(2100) }),
     defineField({ name: 'status', type: 'string', options: { list: STATUSES }, initialValue: 'live' }),
     defineField({ name: 'featured', type: 'boolean', initialValue: false }),
     defineField({ name: 'caseStudyUrl', type: 'url' }),
     defineField({ name: 'order', type: 'number' }),
     defineField({
       name: 'tech',
       type: 'array',
       of: [{ type: 'reference', to: [{ type: 'skill' }] }],
     }),
     defineField({
       name: 'gallery',
       type: 'array',
       of: [{ type: 'image', options: { hotspot: true } }],
     }),
     defineField({
       name: 'metrics',
       type: 'array',
       of: [{
         type: 'object',
         fields: [
           localizedString('label', 'Label'),
           { name: 'value', type: 'string' },
         ],
         preview: { select: { title: 'label.en', subtitle: 'value' } },
       }],
     }),
     ```
   - Update preview `media: 'featuredImage'` → `media: 'cover'`.

2. **Post** — open `sanity/schemas/post-type.ts`:
   - Define `POST_STATUSES`:
     ```ts
     const POST_STATUSES = [
       { title: 'Draft', value: 'draft' },
       { title: 'Published', value: 'published' },
     ] as const
     ```
   - Add (after existing `content` block, before `author`):
     ```ts
     defineField({ name: 'cover', type: 'image', options: { hotspot: true } }),
     ```
   - Add (after `publishedAt`):
     ```ts
     defineField({ name: 'readingMinutes', type: 'number' }),
     defineField({ name: 'canonicalUrl', type: 'url' }),
     defineField({ name: 'status', type: 'string', options: { list: POST_STATUSES }, initialValue: 'published' }),
     defineField({ name: 'authorOverride', type: 'reference', to: [{ type: 'author' }], description: 'Optional override for the author field. Author deprecation: future phase will replace author ref with siteSettings fallback.' }),
     ```
   - Update preview to include cover: `select: { title: 'title.en', subtitle: 'publishedAt', media: 'cover' }`.

3. **Update GROQ fallback** — `lib/sanity-queries.ts`, lines 64-110 (project queries):
   - Replace `"featuredImage": featuredImage.asset->url,` with `"cover": coalesce(cover.asset->url, featuredImage.asset->url),`
   - Update `ProjectSummary` type to rename `featuredImage` → `cover` (string)
   - (Phase 7 owns broader query additions; this phase only patches the rename.)

4. Run `npm run typecheck` and `npm run sanity:types`. Verify new fields appear in `types/sanity.types.ts`.

5. Manually load Studio at `/studio`, open an existing project doc. Confirm:
   - Old `featuredImage` value is no longer visible in form but document still saves
   - New `cover` field is empty (expected); editor migrates by re-uploading
   - Legacy `tags[]` data hidden from form

## Todo List

- [ ] Project: rename `featuredImage` → `cover`
- [ ] Project: remove `tags[]` field block
- [ ] Project: add 10 new fields (tagline, role, year, status, featured, caseStudyUrl, order, tech, gallery, metrics)
- [ ] Project: update preview `media` to `cover`
- [ ] Post: add 5 new fields (cover, readingMinutes, canonicalUrl, status, authorOverride)
- [ ] Post: update preview to include cover
- [ ] Update GROQ `ProjectSummary` type + project queries to use `cover` with fallback to `featuredImage`
- [ ] `npm run typecheck` passes
- [ ] `npm run sanity:types` regenerates and reflects all new fields
- [ ] Studio loads existing projects without errors

## Success Criteria

- [ ] Existing project documents load in Studio after schema change
- [ ] Project preview shows `cover` when set, otherwise falls back via GROQ to legacy `featuredImage`
- [ ] Project.tech reference picker works (refs Skill)
- [ ] Post.status defaults to `published` for new docs
- [ ] Post.authorOverride is optional and saves correctly
- [ ] `types/sanity.types.ts` regenerated successfully

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Existing projects lose `featuredImage` visibility | High | Medium | Coalesce fallback in GROQ; field data preserved server-side; editors re-upload as `cover` over time |
| `tags[]` removal orphans data | Medium | Low | Field removed from schema only; dataset retains orphan refs harmlessly |
| Author Phase A unclear — devs delete `author` field prematurely | Medium | High | Comment in schema + this plan: do NOT remove `author` until Phase B (separate plan) |
| Type regen reveals breaking type changes downstream | Medium | High | Run `npm run typecheck` after regen; expect compile errors only in places that reference removed `tags` on Project (manually fix call sites) |
| GROQ field name change breaks consumers | Medium | High | Audit all `.featuredImage` usages in `app/**/*.tsx` and `components/**/*.tsx` before commit — list expected ≤ 10 sites; update each |

## Caller Audit

Before committing, grep and list every consumer:
```
rg "featuredImage" --type ts --type tsx
rg "\.tags\b" app/ components/ --type ts --type tsx
```
Update each call site to use `cover` / `tech`. Document the audit in the PR description.

## Rollback

`git checkout sanity/schemas/project-type.ts sanity/schemas/post-type.ts lib/sanity-queries.ts`. Dataset retains all data (no destructive change). Studio reverts to prior schema; previously-renamed `cover` data becomes orphaned (harmless).
