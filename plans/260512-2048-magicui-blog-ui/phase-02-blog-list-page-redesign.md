---
phase: 2
title: "Blog list page redesign"
status: pending
priority: P1
effort: "1.5h"
dependencies: [1, 4]
---

# Phase 2: Blog list page redesign

## Overview

Replace the basic `<PostCard>` list in `app/[locale]/blog/page.tsx` with a MagicUI-style layout: featured hero post at the top, a client wrapper for tag filtering, and a `BlurFade`-animated card grid below.

## Requirements

- Functional: first published post renders as `BlogHeroPost`; remaining posts render as `BlogPostCard` in a responsive grid; tag filter shows all unique tags and filters the grid client-side
- Non-functional: page stays a Server Component (data fetching at the top); only the filter wrapper is `'use client'`

## Architecture

```
BlogPage (Server Component)
  ├── BlogHeroPost (hero = posts[0])
  ├── BlogListClient (Client Component — owns filter state)
  │     ├── BlogTagFilter (tag pills)
  │     └── BlurFade grid of BlogPostCard
  └── generateMetadata (phase 5)
```

`BlogListClient` is a thin wrapper that receives `posts` as a prop, extracts unique tags, and passes filtered posts to the grid. No API calls inside it.

## Related Code Files

- Modify: `app/[locale]/blog/page.tsx`
- Create: `app/[locale]/blog/_components/blog-list-client.tsx`

## Implementation Steps

### Step 1: Create `app/[locale]/blog/_components/blog-list-client.tsx`

```tsx
'use client'

import { useState, useMemo } from 'react'
import { BlurFade } from '@/components/ui/blur-fade'
import { BlogTagFilter } from '@/components/blog/blog-tag-filter'
import { BlogPostCard } from '@/components/blog/blog-post-card'
import type { PostSummary } from '@/lib/sanity-queries'

type Props = { posts: PostSummary[] }

export function BlogListClient({ posts }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const seen = new Set<string>()
    const tags: Array<{ _id: string; title?: string }> = []
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        if (!seen.has(tag._id)) {
          seen.add(tag._id)
          tags.push(tag)
        }
      }
    }
    return tags
  }, [posts])

  const filtered = activeTag
    ? posts.filter((p) => p.tags?.some((t) => t._id === activeTag))
    : posts

  return (
    <>
      <BlogTagFilter tags={allTags} onFilter={setActiveTag} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post, i) => (
          <BlurFade key={post._id} delay={0.05 * i} inView>
            <BlogPostCard post={post} />
          </BlurFade>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-muted-foreground">No posts in this category yet.</p>
      )}
    </>
  )
}
```

### Step 2: Update `app/[locale]/blog/page.tsx`

```tsx
import type { Metadata } from 'next'
import { localeAlternates } from '@/lib/metadata'
import { getPosts } from '@/lib/sanity-queries'
import { BlurFade } from '@/components/ui/blur-fade'
import { BlogHeroPost } from '@/components/blog/blog-hero-post'
import { BlogListClient } from './_components/blog-list-client'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Blog',
    description: 'Thoughts and articles by Esteban Montero',
    alternates: localeAlternates('/blog', locale),
  }
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const posts = (await getPosts(locale)) ?? []
  const published = posts.filter((p) => p.status !== 'draft')
  const [hero, ...rest] = published

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <BlurFade delay={0.05}>
        <h1 className="mb-12 text-4xl font-bold tracking-tight">Blog</h1>
      </BlurFade>

      {hero && <BlogHeroPost post={hero} />}

      {rest.length > 0 ? (
        <BlogListClient posts={rest} />
      ) : (
        !hero && <p className="text-muted-foreground">No posts yet.</p>
      )}
    </section>
  )
}
```

Note: `export const metadata` → `export async function generateMetadata` also satisfies phase 5 for this page.

## Todo List

- [ ] Create `app/[locale]/blog/_components/` directory
- [ ] Create `app/[locale]/blog/_components/blog-list-client.tsx`
- [ ] Replace `app/[locale]/blog/page.tsx` with new implementation
- [ ] Remove `import { PostCard }` from blog page
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run build` — passes

## Success Criteria

- [ ] First published post renders as full-width hero
- [ ] Remaining posts render in 3-column grid (responsive to 2-col → 1-col)
- [ ] Tag filter shows all unique tags; clicking filters grid without page reload
- [ ] "All" button resets filter
- [ ] Empty state shown when no posts match filter
- [ ] Draft posts excluded from display
