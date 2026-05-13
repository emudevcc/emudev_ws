---
phase: 4
title: "New blog UI components"
status: pending
priority: P1
effort: "2h"
dependencies: [1]
---

# Phase 4: New blog UI components

## Overview

Create three new components in `components/blog/`. These are pure UI — no page logic — so they can be built and previewed before the pages are wired up.

## Requirements

- Functional: card, hero, and tag-filter components match MagicUI blog aesthetic
- Non-functional: uses existing installed primitives (`BlurFade`, `MagicCard`, `Chip`); no new deps

## Related Code Files

- Create: `components/blog/blog-post-card.tsx`
- Create: `components/blog/blog-hero-post.tsx`
- Create: `components/blog/blog-tag-filter.tsx`
- Delete (after phase 2 migrates callers): `components/post-card.tsx`

## Architecture

```
components/blog/
├── blog-post-card.tsx      # server component — renders one post in grid
├── blog-hero-post.tsx      # server component — featured/first post banner
└── blog-tag-filter.tsx     # 'use client' — tag pill bar, filters parent list
```

`BlogTagFilter` manages `selectedTag` state and calls an `onFilter` callback passed from the page. The page keeps `posts` as a prop so filtering is pure client-side (no refetch).

## Implementation Steps

### Step 1: `components/blog/blog-post-card.tsx`

```tsx
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { MagicCard } from '@/components/ui/magic-card'
import { Chip } from '@/components/ui/chip'
import type { PostSummary } from '@/lib/sanity-queries'

type Props = { post: PostSummary }

export function BlogPostCard({ post }: Props) {
  const slug = post.slug?.current
  if (!slug) return null

  return (
    <MagicCard className="group overflow-hidden rounded-xl border border-border/50 bg-card p-0">
      <Link href={`/blog/${slug}`} className="block h-full">
        {post.cover && (
          <div className="relative h-44 w-full overflow-hidden">
            <Image src={post.cover} alt={post.title ?? ''} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
          </div>
        )}
        <div className="flex flex-col gap-2 p-5">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((t) => (
                <Chip key={t._id} className="text-[11px]">{t.title}</Chip>
              ))}
            </div>
          )}
          <h2 className="text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
          )}
          <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
            {post.publishedAt && (
              <time>{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
            )}
            {post.readingMinutes && <span>{post.readingMinutes} min read</span>}
          </div>
        </div>
      </Link>
    </MagicCard>
  )
}
```

### Step 2: `components/blog/blog-hero-post.tsx`

```tsx
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { BlurFade } from '@/components/ui/blur-fade'
import { Chip } from '@/components/ui/chip'
import type { PostSummary } from '@/lib/sanity-queries'

type Props = { post: PostSummary }

export function BlogHeroPost({ post }: Props) {
  const slug = post.slug?.current
  if (!slug) return null

  return (
    <BlurFade delay={0.1}>
      <Link href={`/blog/${slug}`} className="group mb-14 grid gap-6 md:grid-cols-2 md:items-center">
        {post.cover ? (
          <div className="relative aspect-video overflow-hidden rounded-2xl">
            <Image src={post.cover} alt={post.title ?? ''} fill className="object-cover transition-transform duration-500 group-hover:scale-103" />
          </div>
        ) : (
          <div className="aspect-video rounded-2xl bg-muted" />
        )}
        <div className="flex flex-col gap-3">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => <Chip key={t._id}>{t.title}</Chip>)}
            </div>
          )}
          <h2 className="text-2xl font-bold leading-tight tracking-tight group-hover:text-primary transition-colors md:text-3xl">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {post.author?.name && <span>{post.author.name}</span>}
            {post.publishedAt && (
              <time>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
            )}
            {post.readingMinutes && <span>{post.readingMinutes} min read</span>}
          </div>
        </div>
      </Link>
    </BlurFade>
  )
}
```

### Step 3: `components/blog/blog-tag-filter.tsx`

```tsx
'use client'

import { useState } from 'react'
import { Chip } from '@/components/ui/chip'

type Tag = { _id: string; title?: string }

type Props = {
  tags: Tag[]
  onFilter: (tagId: string | null) => void
}

export function BlogTagFilter({ tags, onFilter }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  function select(id: string | null) {
    setSelected(id)
    onFilter(id)
  }

  if (tags.length === 0) return null

  return (
    <div className="mb-10 flex flex-wrap gap-2">
      <button
        onClick={() => select(null)}
        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
          selected === null
            ? 'border-foreground bg-foreground text-background'
            : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag._id}
          onClick={() => select(tag._id)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            selected === tag._id
              ? 'border-foreground bg-foreground text-background'
              : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
          }`}
        >
          {tag.title}
        </button>
      ))}
    </div>
  )
}
```

Note: `BlogTagFilter` is used in a Client Component wrapper in the blog list page — the page itself stays a Server Component. See phase 2 for the wrapper pattern.

## Todo List

- [ ] Create `components/blog/` directory
- [ ] Create `components/blog/blog-post-card.tsx`
- [ ] Create `components/blog/blog-hero-post.tsx`
- [ ] Create `components/blog/blog-tag-filter.tsx`
- [ ] Verify `BlurFade`, `MagicCard`, `Chip` imports resolve
- [ ] `npm run typecheck` — zero errors

## Success Criteria

- [ ] All 3 components created with correct TypeScript types
- [ ] `BlogTagFilter` is `'use client'`; other two are server-safe
- [ ] No new npm dependencies required
- [ ] No import errors
