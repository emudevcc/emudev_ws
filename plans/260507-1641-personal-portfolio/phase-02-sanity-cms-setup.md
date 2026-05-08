---
phase: 2
title: "Sanity CMS Setup"
status: complete
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 2: Sanity CMS Setup

## Overview

Define Sanity v3 schema for portfolio content (Project, Post, Author, Tag, SiteSettings), configure GROQ queries with `cacheTag()` ISR invalidation, set up the Presentation real-time preview tool, add the ISR revalidation webhook endpoint, and generate TypeScript types with `@sanity/codegen`.

## Key Insights

- **Two datasets:** `production` and `staging` (develop uses staging dataset locally). Set `NEXT_PUBLIC_SANITY_DATASET` per environment.
- **ISR pattern:** Use `'use cache'` + `cacheTag()` in query functions; `updateTag()` in the revalidation webhook. Replaces older `revalidatePath()`.
- **`next-sanity` v5:** Static import only — no dynamic `getClient()`. Import from `@/lib/sanity.client`.
- **Presentation tool:** Built into Sanity v3 — no extra package. Requires `draftMode()` in Next.js pages.
- **Type codegen:** Run `sanity typegen generate` after every schema change; commit `types/sanity.types.ts`.
- **Read token:** `SANITY_API_READ_TOKEN` is read-only — safe for server-side preview. Never expose write tokens.
- **Webhook secret:** Validate `SANITY_REVALIDATE_SECRET` in the revalidation endpoint header.

## Requirements

**Functional:**
- Sanity Studio v3 embedded at `/studio` route (Next.js route)
- Schema: `project`, `post`, `author`, `tag`, `siteSettings` document types
- GROQ query functions in `lib/sanity-queries.ts` with `cacheTag()` for all public data
- ISR webhook at `POST /api/revalidate-tag` — validates secret, calls `updateTag()`
- Presentation real-time preview wired to Next.js pages
- TypeScript types auto-generated and committed to `types/sanity.types.ts`

**Non-functional:**
- `sanity typegen generate` completes without errors
- Studio loads at `http://localhost:3000/studio` locally

## Architecture

```
sanity/
├── schema.ts               ← schema registry (imports all types)
├── schemas/
│   ├── project-type.ts
│   ├── post-type.ts
│   ├── author-type.ts
│   ├── tag-type.ts
│   └── site-settings-type.ts
└── sanity.config.ts        ← studio config (datasets, plugins)

app/
├── studio/[[...tool]]/
│   └── page.tsx            ← embedded Studio
└── api/
    └── revalidate-tag/
        └── route.ts        ← ISR webhook

lib/
├── sanity.client.ts        ← (already created in Phase 1)
└── sanity-queries.ts       ← GROQ + cacheTag wrappers

types/
└── sanity.types.ts         ← auto-generated

sanity.codegen.ts           ← codegen config
```

**Data flow (ISR revalidation):**
```
Sanity editor publishes → webhook fires → POST /api/revalidate-tag
  → validates secret → updateTag('projects') → Next.js re-renders tagged pages
```

## Related Code Files

**Create:**
- `sanity/schema.ts`
- `sanity/schemas/project-type.ts`
- `sanity/schemas/post-type.ts`
- `sanity/schemas/author-type.ts`
- `sanity/schemas/tag-type.ts`
- `sanity/schemas/site-settings-type.ts`
- `sanity/sanity.config.ts`
- `app/studio/[[...tool]]/page.tsx`
- `app/api/revalidate-tag/route.ts`
- `lib/sanity-queries.ts`
- `sanity.codegen.ts`
- `types/sanity.types.ts` (generated)

**Modify:**
- `lib/sanity.client.ts` — add `sanityFetch` with draft support
- `next.config.ts` — add Sanity CDN to `images.remotePatterns`

## Implementation Steps

1. **Install Sanity packages** (if not already in Phase 1):
   ```bash
   npm install sanity@^3 next-sanity@^5 @sanity/vision
   npm install -D @sanity/codegen
   ```

2. **Create Sanity schema types:**

   `sanity/schemas/project-type.ts`:
   ```typescript
   import { defineType, defineField } from 'sanity'

   export const projectType = defineType({
     name: 'project',
     title: 'Project',
     type: 'document',
     fields: [
       defineField({ name: 'title', type: 'string', validation: r => r.required() }),
       defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
       defineField({ name: 'description', type: 'text', rows: 3 }),
       defineField({
         name: 'content',
         type: 'array',
         of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
       }),
       defineField({ name: 'featuredImage', type: 'image', options: { hotspot: true } }),
       defineField({ name: 'tags', type: 'array', of: [{ type: 'reference', to: [{ type: 'tag' }] }] }),
       defineField({ name: 'liveUrl', type: 'url' }),
       defineField({ name: 'repoUrl', type: 'url' }),
       defineField({ name: 'publishedAt', type: 'datetime', initialValue: () => new Date().toISOString() }),
     ],
     preview: {
       select: { title: 'title', media: 'featuredImage' },
     },
   })
   ```

   `sanity/schemas/post-type.ts`:
   ```typescript
   export const postType = defineType({
     name: 'post',
     title: 'Blog Post',
     type: 'document',
     fields: [
       defineField({ name: 'title', type: 'string', validation: r => r.required() }),
       defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
       defineField({ name: 'excerpt', type: 'text', rows: 2 }),
       defineField({ name: 'content', type: 'array', of: [{ type: 'block' }, { type: 'image' }] }),
       defineField({ name: 'author', type: 'reference', to: [{ type: 'author' }] }),
       defineField({ name: 'tags', type: 'array', of: [{ type: 'reference', to: [{ type: 'tag' }] }] }),
       defineField({ name: 'publishedAt', type: 'datetime' }),
     ],
   })
   ```

   `sanity/schemas/author-type.ts`, `tag-type.ts`, `site-settings-type.ts` — follow same pattern. `siteSettings` uses `__experimental_actions: ['update', 'publish']` to prevent deletion (singleton).

3. **Register schema** — `sanity/schema.ts`:
   ```typescript
   import { projectType } from './schemas/project-type'
   import { postType } from './schemas/post-type'
   import { authorType } from './schemas/author-type'
   import { tagType } from './schemas/tag-type'
   import { siteSettingsType } from './schemas/site-settings-type'

   export const schema = { types: [projectType, postType, authorType, tagType, siteSettingsType] }
   ```

4. **Configure Sanity studio** — `sanity/sanity.config.ts`:
   ```typescript
   import { defineConfig } from 'sanity'
   import { structureTool } from 'sanity/structure'
   import { visionTool } from '@sanity/vision'
   import { presentationTool } from 'sanity/presentation'
   import { schema } from './schema'

   export default defineConfig({
     name: 'portfolio',
     title: 'Portfolio CMS',
     projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
     dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
     plugins: [
       structureTool(),
       visionTool(),
       presentationTool({
         previewUrl: {
           previewMode: { enable: '/api/draft-mode/enable' },
         },
       }),
     ],
     schema,
   })
   ```

5. **Embed Studio in Next.js** — `app/studio/[[...tool]]/page.tsx`:
   ```typescript
   'use client'
   import { NextStudio } from 'next-sanity/studio'
   import config from '@/sanity/sanity.config'

   export default function StudioPage() {
     return <NextStudio config={config} />
   }
   ```
   Add to `next.config.ts`: `transpilePackages: ['@sanity/icons', '@sanity/ui']`

6. **Write GROQ query functions** — `lib/sanity-queries.ts`:
   ```typescript
   import { cacheTag } from 'next/cache'
   import { groq } from 'next-sanity'
   import { sanityFetch } from './sanity.client'
   import type { Project, Post, SiteSettings } from '@/types/sanity.types'

   export async function getProjects(): Promise<Project[]> {
     'use cache'
     cacheTag('projects')
     return sanityFetch({
       query: groq`*[_type == "project"] | order(publishedAt desc) {
         _id, title, slug, description,
         "featuredImage": featuredImage.asset->url,
         tags[]->{ _id, title }, liveUrl, repoUrl, publishedAt
       }`,
     })
   }

   export async function getProjectBySlug(slug: string): Promise<Project | null> {
     'use cache'
     cacheTag('projects', `project:${slug}`)
     return sanityFetch({
       query: groq`*[_type == "project" && slug.current == $slug][0] {
         ...,
         "featuredImage": featuredImage.asset->url,
         tags[]->{ _id, title }
       }`,
       params: { slug },
     })
   }

   export async function getPosts(): Promise<Post[]> {
     'use cache'
     cacheTag('posts')
     return sanityFetch({
       query: groq`*[_type == "post"] | order(publishedAt desc) {
         _id, title, slug, excerpt, publishedAt, author->{ name }
       }`,
     })
   }

   export async function getSiteSettings(): Promise<SiteSettings | null> {
     'use cache'
     cacheTag('site-settings')
     return sanityFetch({
       query: groq`*[_type == "siteSettings"][0]`,
     })
   }
   ```

7. **ISR webhook** — `app/api/revalidate-tag/route.ts`:
   ```typescript
   import { revalidateTag } from 'next/cache'
   import { type NextRequest } from 'next/server'

   const TAG_MAP: Record<string, string[]> = {
     project: ['projects'],
     post: ['posts'],
     siteSettings: ['site-settings'],
   }

   export async function POST(req: NextRequest) {
     const secret = req.nextUrl.searchParams.get('secret')
     if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
       return Response.json({ error: 'Unauthorized' }, { status: 401 })
     }

     const body = await req.json()
     const type = body._type as string
     const tags = TAG_MAP[type] ?? []

     for (const tag of tags) {
       revalidateTag(tag)
     }

     return Response.json({ revalidated: true, tags })
   }
   ```

8. **Configure codegen** — `sanity.codegen.ts`:
   ```typescript
   import { defineConfig } from '@sanity/codegen'
   export default defineConfig({
     schemaPath: './sanity/schema.ts',
     outPath: './types/sanity.types.ts',
   })
   ```

9. **Generate types**:
   ```bash
   npx sanity typegen generate
   ```
   Commit `types/sanity.types.ts`.

10. **Configure Sanity webhook** (done in Sanity dashboard):
    - URL: `https://{domain}/api/revalidate-tag?secret={SANITY_REVALIDATE_SECRET}`
    - Trigger: on document publish/unpublish
    - Dataset: match environment (`staging` or `production`)

11. **Add to package.json scripts**:
    ```json
    "sanity:types": "sanity typegen generate",
    "sanity:dev": "sanity dev"
    ```

## Todo List

- [ ] Install `sanity`, `next-sanity`, `@sanity/vision`, `@sanity/codegen`
- [ ] Create schema files for all 5 document types (project, post, author, tag, siteSettings)
- [ ] Register schema in `sanity/schema.ts`
- [ ] Configure Sanity studio in `sanity/sanity.config.ts` with Presentation plugin
- [ ] Embed Studio at `app/studio/[[...tool]]/page.tsx`
- [ ] Write GROQ query functions in `lib/sanity-queries.ts` with `cacheTag()`
- [ ] Create ISR webhook endpoint `app/api/revalidate-tag/route.ts`
- [ ] Configure `sanity.codegen.ts`
- [ ] Run `sanity typegen generate` and commit `types/sanity.types.ts`
- [ ] Configure Sanity webhook in dashboard (staging + production datasets)
- [ ] Test Studio loads at `/studio` locally

## Success Criteria

- [ ] Sanity Studio accessible at `http://localhost:3000/studio`
- [ ] `sanity typegen generate` succeeds with zero errors
- [ ] `types/sanity.types.ts` contains typed interfaces for all schema types
- [ ] `GET /api/health` still returns 200
- [ ] `POST /api/revalidate-tag?secret=xxx` returns `{ revalidated: true }`
- [ ] GROQ query functions return typed data (no `any`)

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Sanity webhook delays (~30s) | Low | Acceptable for portfolio — not real-time |
| Preview draft token exposure | High | Use `draftMode()` server-side only; never put write token in client |
| `dynamicIO` + `'use cache'` missing in some fetch paths | Medium | Audit all `sanityFetch` calls for `cacheTag()` wrapper |
| Schema change breaks generated types | Medium | Run `sanity:types` in CI pre-build step |

## Security Considerations

- `SANITY_REVALIDATE_SECRET` validated in webhook — reject 401 on mismatch
- `SANITY_API_READ_TOKEN` server-side only (for draft preview)
- No write token exposed to client or environment
- Studio route (`/studio`) is unprotected locally; add auth for production deployment if needed

## Next Steps

- Phase 4: Consume GROQ queries in all portfolio page components
