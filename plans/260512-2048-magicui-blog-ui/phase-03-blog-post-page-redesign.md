---
phase: 3
title: "Blog post page redesign"
status: pending
priority: P1
effort: "1.5h"
dependencies: [1]
---

# Phase 3: Blog post page redesign

## Overview

Upgrade `app/[locale]/blog/[slug]/page.tsx` from a bare article to a polished post layout: full-width cover image hero, author chip, reading-time + date metadata, tag badges, and prose content. No new dependencies — `PortableTextRenderer` already handles Sanity rich text.

## Requirements

- Functional: cover image, author avatar+name, publish date, reading time, tags all render from Sanity data
- Non-functional: layout stays a Server Component; `generateMetadata` includes OG image from cover

## Related Code Files

- Modify: `app/[locale]/blog/[slug]/page.tsx`

## Implementation Steps

### Step 1: Replace `app/[locale]/blog/[slug]/page.tsx`

```tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { getPosts, getPostBySlug } from '@/lib/sanity-queries'
import { localeAlternates } from '@/lib/metadata'
import { PortableTextRenderer } from '@/components/portable-text-renderer'
import { Chip } from '@/components/ui/chip'
import { BlurFade } from '@/components/ui/blur-fade'
import { routing } from '@/i18n/routing'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const postsByLocale = await Promise.all(
    routing.locales.map(async (locale) => ({
      locale,
      posts: (await getPosts(locale)) ?? [],
    }))
  )
  return postsByLocale.flatMap(({ locale, posts }) =>
    posts.flatMap((post) => {
      const slug = post.slug?.current
      return slug ? [{ locale, slug }] : []
    })
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getPostBySlug(slug, locale)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    alternates: localeAlternates(`/blog/${slug}`, locale),
    openGraph: post.cover
      ? { images: [{ url: post.cover, width: 1200, height: 630 }] }
      : undefined,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  const post = await getPostBySlug(slug, locale)
  if (!post) notFound()

  const author = post.authorOverride ?? post.author

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      {/* Back link */}
      <BlurFade delay={0.05}>
        <Link href="/blog" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          ← Blog
        </Link>
      </BlurFade>

      {/* Cover */}
      {post.cover && (
        <BlurFade delay={0.1}>
          <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-2xl">
            <Image src={post.cover} alt={post.title ?? ''} fill className="object-cover" priority />
          </div>
        </BlurFade>
      )}

      <BlurFade delay={0.15}>
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((t) => <Chip key={t._id}>{t.title}</Chip>)}
          </div>
        )}

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold tracking-tight leading-tight">{post.title}</h1>

        {/* Meta row */}
        <div className="mb-10 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {author?.name && (
            <div className="flex items-center gap-2">
              {author.image && (
                <Image src={author.image} alt={author.name} width={24} height={24} className="rounded-full" />
              )}
              <span>{author.name}</span>
            </div>
          )}
          {post.publishedAt && (
            <time>
              {new Date(post.publishedAt).toLocaleDateString(locale === 'es' ? 'es-CR' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </time>
          )}
          {post.readingMinutes && <span>{post.readingMinutes} min read</span>}
        </div>
      </BlurFade>

      {/* Content */}
      {post.content && (
        <BlurFade delay={0.2}>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <PortableTextRenderer
              content={post.content as Parameters<typeof PortableTextRenderer>[0]['content']}
            />
          </div>
        </BlurFade>
      )}
    </article>
  )
}
```

### Step 2: Verify

```bash
npm run typecheck
npm run build
```

## Todo List

- [ ] Replace `app/[locale]/blog/[slug]/page.tsx` with new implementation
- [ ] Add `localeAlternates` import from `@/lib/metadata`
- [ ] Add `Chip`, `BlurFade`, `Image` imports
- [ ] Add `Link` from `@/i18n/navigation`
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run build` — passes (static params still generated correctly)

## Success Criteria

- [ ] Cover image renders full-width with `priority` flag for LCP
- [ ] Author avatar + name shown when available
- [ ] Tags render as `Chip` components below title
- [ ] Date is locale-aware (`es-CR` vs `en-US` formatting)
- [ ] Back "← Blog" link present
- [ ] `generateMetadata` includes OG image from cover
- [ ] `localeAlternates` passes locale (satisfies SEO plan requirement for this page)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `authorOverride` ref resolves differently from `author` | Low | Low | Both fields fetched in same query; fallback `?? post.author` handles it |
| `generateStaticParams` breaks if slug query changes | Low | Medium | Slug query unchanged — still uses `getPosts(locale)` |
