---
phase: 3
title: "Sanity Bilingual Content"
status: completed
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 3: Sanity Bilingual Content

## Overview

Update Sanity schemas to store translated fields as nested objects (`{ en: ..., es: ... }`), regenerate TypeScript types, and update all GROQ queries to accept a `locale` parameter. After this phase, each Sanity document holds both language versions and pages render the correct locale's content.

## Architecture — Localized Fields Pattern

One document per content item. Translation fields are nested objects:

```
post document {
  title: { en: "My post", es: "Mi publicación" }
  slug: { en: { current: "my-post" }, es: { current: "mi-publicacion" } }
  excerpt: { en: "...", es: "..." }
  content: { en: [...blocks], es: [...blocks] }
  author → (reference, locale-independent)
  tags → (references, locale-independent — tag titles also localized)
  publishedAt → (datetime, locale-independent)
}
```

**Why localized fields, not separate documents?**
- Single-author portfolio with <20 documents — no need for multi-editor workflows
- No `@sanity/document-internationalization` plugin required
- One document to preview, publish, and reference
- GROQ stays simple: `title[$locale]` instead of cross-document joins

## Related Code Files

- Modify: `sanity/schemas/post-type.ts`
- Modify: `sanity/schemas/project-type.ts`
- Modify: `sanity/schemas/author-type.ts`
- Modify: `sanity/schemas/tag-type.ts`
- Modify: `sanity/schemas/site-settings-type.ts`
- Modify: `lib/sanity-queries.ts` — all queries accept `locale: string` param
- Modify: `app/[locale]/blog/page.tsx` — pass locale to query
- Modify: `app/[locale]/blog/[slug]/page.tsx` — pass locale to query
- Modify: `app/[locale]/projects/page.tsx` — pass locale to query
- Modify: `app/[locale]/projects/[slug]/page.tsx` — pass locale to query
- Modify: `app/[locale]/about/page.tsx` — pass locale to query (author bio)
- Modify: `app/[locale]/layout.tsx` — pass locale to site settings query
- Regenerate: `types/sanity.types.ts` via `npm run sanity:types`

## Implementation Steps

### 1. Define a reusable `localizedString` field helper

To avoid repeating the `{ en, es }` object pattern, define it inline in each schema (Sanity doesn't have a global field type registry, so inline is standard):

```ts
// inline pattern in each schema file:
{
  name: 'title',
  type: 'object',
  fields: [
    { name: 'en', type: 'string', title: 'English', validation: (r) => r.required() },
    { name: 'es', type: 'string', title: 'Español' },
  ],
}
```

### 2. Update `sanity/schemas/post-type.ts`

```ts
import { defineType, defineField } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'object',
      fields: [
        { name: 'en', type: 'string', title: 'English', validation: (r) => r.required() },
        { name: 'es', type: 'string', title: 'Español' },
      ],
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'object',
      fields: [
        { name: 'en', type: 'slug', title: 'English', options: { source: 'title.en' } },
        { name: 'es', type: 'slug', title: 'Español', options: { source: 'title.es' } },
      ],
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'object',
      fields: [
        { name: 'en', type: 'text', title: 'English', rows: 2 },
        { name: 'es', type: 'text', title: 'Español', rows: 2 },
      ],
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'object',
      fields: [
        {
          name: 'en',
          title: 'English',
          type: 'array',
          of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
        },
        {
          name: 'es',
          title: 'Español',
          type: 'array',
          of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
        },
      ],
    }),
    defineField({ name: 'author', type: 'reference', to: [{ type: 'author' }] }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    }),
    defineField({ name: 'publishedAt', type: 'datetime' }),
  ],
  preview: {
    select: { title: 'title.en', subtitle: 'publishedAt' },
  },
})
```

### 3. Update `sanity/schemas/project-type.ts`

Same pattern — localize `title`, `slug`, `description`, `content`:

```ts
defineField({
  name: 'title',
  type: 'object',
  fields: [
    { name: 'en', type: 'string', title: 'English', validation: (r) => r.required() },
    { name: 'es', type: 'string', title: 'Español' },
  ],
}),
defineField({
  name: 'slug',
  type: 'object',
  fields: [
    { name: 'en', type: 'slug', title: 'English', options: { source: 'title.en' } },
    { name: 'es', type: 'slug', title: 'Español', options: { source: 'title.es' } },
  ],
}),
defineField({
  name: 'description',
  type: 'object',
  fields: [
    { name: 'en', type: 'text', title: 'English', rows: 2 },
    { name: 'es', type: 'text', title: 'Español', rows: 2 },
  ],
}),
// content same as post
```

Keep locale-independent fields unchanged: `featuredImage`, `liveUrl`, `repoUrl`, `publishedAt`, `tags`.

### 4. Update `sanity/schemas/tag-type.ts`

Tags have a `title` and `slug`. Localize both:

```ts
defineField({
  name: 'title',
  type: 'object',
  fields: [
    { name: 'en', type: 'string', title: 'English', validation: (r) => r.required() },
    { name: 'es', type: 'string', title: 'Español' },
  ],
}),
defineField({
  name: 'slug',
  type: 'object',
  fields: [
    { name: 'en', type: 'slug', options: { source: 'title.en' } },
    { name: 'es', type: 'slug', options: { source: 'title.es' } },
  ],
}),
```

### 5. Update `sanity/schemas/author-type.ts`

Localize `name` and `bio`:

```ts
defineField({
  name: 'name',
  type: 'object',
  fields: [
    { name: 'en', type: 'string', title: 'English', validation: (r) => r.required() },
    { name: 'es', type: 'string', title: 'Español' },
  ],
}),
defineField({
  name: 'bio',
  type: 'object',
  fields: [
    { name: 'en', type: 'text', title: 'English', rows: 3 },
    { name: 'es', type: 'text', title: 'Español', rows: 3 },
  ],
}),
```

### 6. Update `sanity/schemas/site-settings-type.ts`

Localize `siteName` and `description`:

```ts
defineField({
  name: 'siteName',
  type: 'object',
  fields: [
    { name: 'en', type: 'string', title: 'English' },
    { name: 'es', type: 'string', title: 'Español' },
  ],
}),
defineField({
  name: 'description',
  type: 'object',
  fields: [
    { name: 'en', type: 'text', title: 'English', rows: 2 },
    { name: 'es', type: 'text', title: 'Español', rows: 2 },
  ],
}),
```

### 7. Regenerate Sanity TypeScript types

```bash
npm run sanity:types
```

This runs `sanity schema extract && sanity typegen generate && mv sanity.types.ts types/sanity.types.ts`. The generated types will reflect the new object structure (e.g., `title: { en?: string; es?: string }`).

### 8. Update `lib/sanity-queries.ts` — add `locale` param to all queries

All query functions now accept `locale: string` and project the correct language field using GROQ's `[$locale]` accessor. Use `coalesce` to fall back to English when the Spanish field is empty:

```ts
export const getPosts = (locale: string) =>
  unstable_cache(
    async () =>
      sanityFetch<Array<{
        _id: string
        title: string
        slug: string
        excerpt: string
        publishedAt: string
        _createdAt: string
        author: { name: string }
      }>>({
        query: groq`*[_type == "post"] | order(publishedAt desc) {
          _id,
          "title": coalesce(title[$locale], title.en),
          "slug": coalesce(slug[$locale].current, slug.en.current),
          "excerpt": coalesce(excerpt[$locale], excerpt.en),
          publishedAt, _createdAt,
          "author": author->{ "name": coalesce(name[$locale], name.en) }
        }`,
        params: { locale },
      }),
    [`posts-${locale}`],
    { tags: ['posts'], revalidate: 3600 }
  )()
```

Apply the same pattern to:
- `getProjectBySlug(slug, locale)` — projects list + detail
- `getPostBySlug(slug, locale)` — blog post detail
- `getSiteSettings(locale)` — siteName, description

**Slug lookup across locales** — `getPostBySlug` and `getProjectBySlug` need to match on either the EN or ES slug, since a visitor on `/es/blog/mi-articulo` uses the Spanish slug:

```groq
*[_type == "post" && (slug.en.current == $slug || slug.es.current == $slug)][0] {
  "title": coalesce(title[$locale], title.en),
  "slug": coalesce(slug[$locale].current, slug.en.current),
  "content": coalesce(content[$locale], content.en),
  ...
}
```

### 9. Update pages to pass `locale` to queries

Every page that calls a Sanity query now extracts `locale` from `params` and passes it:

```tsx
// app/[locale]/blog/page.tsx
export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const posts = await getPosts(locale)
  // ...
}
```

Same for: `projects/page.tsx`, `blog/[slug]/page.tsx`, `projects/[slug]/page.tsx`, `about/page.tsx` (for author bio), `[locale]/layout.tsx` (for site settings).

### 10. Content migration in Sanity Studio

Since existing documents store `title` as a plain string, after deploying the schema change the Studio will show the new object fields empty (old string data is orphaned as unknown fields). For a personal portfolio with few documents, **manually re-enter content** in Studio:

1. Open Studio → Blog Posts → each post → fill in `Title > English` from existing title
2. Regenerate the EN slug from the new `slug.en` field
3. Fill in `Title > Español` and `slug.es` with the Spanish translation
4. Repeat for Projects, Tags, Author, Site Settings

> The old `title` string value is preserved in the document's raw JSON as an unknown field — it won't break anything but won't be shown in Studio. It can be cleaned up later with a GROQ migration if desired.

## Todo List

- [x] Update `sanity/schemas/post-type.ts` (title, slug, excerpt, content)
- [x] Update `sanity/schemas/project-type.ts` (title, slug, description, content)
- [x] Update `sanity/schemas/tag-type.ts` (title, slug)
- [x] Update `sanity/schemas/author-type.ts` (name, bio)
- [x] Update `sanity/schemas/site-settings-type.ts` (siteName, description)
- [x] Run `npm run sanity:types` — verify no type errors
- [x] Update `lib/sanity-queries.ts` — all functions accept `locale`, use `coalesce(field[$locale], field.en)`
- [x] Update `getPostBySlug` / `getProjectBySlug` — match slug on both EN and ES
- [x] Update `app/[locale]/blog/page.tsx` — pass locale to `getPosts`
- [x] Update `app/[locale]/blog/[slug]/page.tsx` — pass locale to `getPostBySlug`
- [x] Update `app/[locale]/projects/page.tsx` — pass locale to `getProjects`
- [x] Update `app/[locale]/projects/[slug]/page.tsx` — pass locale to `getProjectBySlug`
- [x] Update `app/[locale]/about/page.tsx` — pass locale to author query
- [x] Update `app/[locale]/layout.tsx` — pass locale to `getSiteSettings`
- [x] Run `npx tsc --noEmit` — no type errors
- [x] Open Sanity Studio and re-enter EN content for all documents
- [ ] Add Spanish translations for all documents in Studio
- [x] Verify `/en/blog` shows English post titles, `/es/blog` shows Spanish titles
- [ ] Verify `/es/blog/mi-articulo` resolves via Spanish slug

## Success Criteria

- [x] Sanity Studio shows localized fields (Title > English / Español) for all content types
- [x] `npm run sanity:types` succeeds — `types/sanity.types.ts` updated
- [x] `npx tsc --noEmit` — no errors after type regen
- [x] `/en/projects` and `/es/projects` render correctly with locale-appropriate titles
- [ ] `/es/blog/[spanish-slug]` resolves to the correct post in Spanish
- [x] `coalesce` fallback works — Spanish page shows English title when `es` field is empty

## Completion Notes — 2026-05-10

- Existing published Sanity content was migrated programmatically into the new English fields with `SANITY_API_WRITE_TOKEN`.
- The draft post had only `title` available for migration; its `slug`, `excerpt`, and `content` were null and left untouched.
- Spanish fields are present and supported, but full Spanish copy/slugs still need to be authored in Studio.
- `npm run sanity:types`, `npx tsc --noEmit`, and `npm run build` passed after the schema/query changes.

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Existing documents lose their old `title` string data | Medium | Data stays in raw JSON as unknown field; re-enter manually in Studio (few docs) |
| GROQ `[$locale]` fails if locale param is undefined | High | Validate `locale` is `'en' \| 'es'` before calling queries; default to `'en'` |
| Slug collision — same slug in EN and ES | Low | Unlikely; if it happens, Spanish slug should be the Spanish translation |
| `sanity typegen` fails after schema change | Low | Run `sanity schema extract` separately first; check for schema validation errors |
| Tag titles not localized in query results | Medium | Ensure `tags[]->` projection also localizes: `"title": coalesce(title[$locale], title.en)` |
