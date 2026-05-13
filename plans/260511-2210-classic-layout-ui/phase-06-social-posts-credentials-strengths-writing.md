---
phase: 6
title: "Social Posts, Credentials, Strengths, Writing"
status: completed
priority: P1
effort: "6h"
dependencies: [2, 3]
---

# Phase 6: Social Posts, Credentials, Strengths, Writing

## Overview

Build four sections in one phase: `SocialPostsGrid` (X/Reddit cards), `CredentialsSection` (certs + education + languages), `StrengthsCard` (CliftonStrengths 5-col grid), and `WritingList` (blog post rows). All wired to Sanity queries. This phase is the densest in terms of data shape variety.

## Requirements

**Functional:**
- `SocialPostsGrid` renders 2-col grid of `<PostCard/>` (platform-agnostic); optionally a `<Marquee/>` row for overflow
- `CredentialsSection` renders certifications list (left col) + education + languages (right col)
- `StrengthsCard` renders 5 CliftonStrengths in a responsive grid
- `WritingList` renders blog posts as full-width rows with hover translate-x

**Non-functional:**
- Section IDs: `id="social"`, `id="credentials"`, `id="strengths"` (inside CredentialsSection), `id="writing"`
- Language proficiency: 5-dot bar (filled dots = level)
- Writing rows: `hover:translate-x-1` transition

## Related Code Files

- Create: `components/sections/SocialPostsGrid.tsx`
- Create: `components/ui/post-card.tsx`
- Create: `components/sections/CredentialsSection.tsx`
- Create: `components/sections/StrengthsCard.tsx`
- Create: `components/sections/WritingList.tsx`
- Modify: `app/[locale]/page.tsx` (add all four sections)

## Implementation Steps

### Step 1: Add queries to `app/[locale]/page.tsx`

```tsx
import {
  getSocialPosts, getCertifications, getEducation,
  getLanguages, getStrengths, getPosts,
} from '@/lib/sanity/queries'
import { SocialPostsGrid } from '@/components/sections/SocialPostsGrid'
import { CredentialsSection } from '@/components/sections/CredentialsSection'
import { StrengthsCard } from '@/components/sections/StrengthsCard'
import { WritingList } from '@/components/sections/WritingList'

// Add to Promise.all:
const [socialPosts, certs, education, languages, strengths, posts] = await Promise.all([
  getSocialPosts(locale),
  getCertifications(locale),
  getEducation(locale),
  getLanguages(locale),
  getStrengths(),
  getPosts(locale),
])

// Add to JSX after SkillsSection:
<SocialPostsGrid posts={socialPosts} />
<CredentialsSection certs={certs} education={education} languages={languages} />
<StrengthsCard strengths={strengths} />
<WritingList posts={posts} />
```

### Step 2: Create `components/ui/post-card.tsx`

```tsx
import { ArrowUpRight } from 'lucide-react'
import type { SocialPost } from '@/lib/sanity/types'

const PLATFORM_LABELS: Record<string, string> = {
  twitter: 'X (Twitter)',
  reddit: 'Reddit',
  linkedin: 'LinkedIn',
}

interface PostCardProps { post: SocialPost }

export function PostCard({ post }: PostCardProps) {
  return (
    <a href={post.permalink} target="_blank" rel="noreferrer"
      className="group flex flex-col gap-3 rounded-xl border border-border/60 p-5 hover:border-border transition-colors">
      {/* Platform + date */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-muted-foreground">
          {PLATFORM_LABELS[post.platform] ?? post.platform}
          {post.subreddit && <span className="ml-1">· r/{post.subreddit}</span>}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {new Date(post.postedAt).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Body */}
      <p className="text-sm text-foreground leading-relaxed line-clamp-4">{post.body}</p>

      {/* Stats */}
      {post.stats && (
        <div className="flex gap-4 font-mono text-[11px] text-muted-foreground">
          {post.stats.likes != null && <span>{post.stats.likes} likes</span>}
          {post.stats.comments != null && <span>{post.stats.comments} comments</span>}
          {post.stats.upvotes != null && <span>{post.stats.upvotes} upvotes</span>}
        </div>
      )}

      {/* Link */}
      <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground group-hover:text-foreground transition-colors mt-auto">
        View post <ArrowUpRight size={11} />
      </span>
    </a>
  )
}
```

### Step 3: Create `components/sections/SocialPostsGrid.tsx`

```tsx
import { useTranslations } from 'next-intl'
import { BlurFade } from '@/components/ui/blur-fade'
import { Marquee } from '@/components/ui/marquee'
import { PostCard } from '@/components/ui/post-card'
import type { SocialPost } from '@/lib/sanity/types'

export function SocialPostsGrid({ posts }: { posts: SocialPost[] }) {
  const t = useTranslations('social')

  const featured = posts.filter(p => p.featured).slice(0, 4)
  const overflow  = posts.filter(p => !p.featured)

  return (
    <section id="social" className="py-24">
      <BlurFade delay={0}>
        <p className="font-mono text-xs text-muted-foreground mb-3">{t('eyebrow')}</p>
        <h2 className="text-[38px] font-bold tracking-tight mb-10">{t('title')}</h2>
      </BlurFade>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {featured.map((post, i) => (
          <BlurFade key={post._id} delay={0.05 + i * 0.07}>
            <PostCard post={post} />
          </BlurFade>
        ))}
      </div>

      {/* Overflow marquee */}
      {overflow.length > 0 && (
        <Marquee pauseOnHover className="[--duration:40s]">
          {overflow.map(post => (
            <PostCard key={post._id} post={post} />
          ))}
        </Marquee>
      )}
    </section>
  )
}
```

### Step 4: Create `components/sections/CredentialsSection.tsx`

```tsx
import { useTranslations } from 'next-intl'
import { BlurFade } from '@/components/ui/blur-fade'
import type { Certification, Education, Language } from '@/lib/sanity/types'

const PROFICIENCY_ORDER = ['native', 'fluent', 'advanced', 'intermediate', 'basic']

interface CredentialsSectionProps {
  certs: Certification[]
  education: Education[]
  languages: Language[]
}

export function CredentialsSection({ certs, education, languages }: CredentialsSectionProps) {
  const t = useTranslations('credentials')

  return (
    <section id="credentials" className="py-24">
      <BlurFade delay={0}>
        <p className="font-mono text-xs text-muted-foreground mb-3">{t('eyebrow')}</p>
      </BlurFade>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Left: Certifications */}
        <BlurFade delay={0.1}>
          <h3 className="font-semibold mb-5">{t('certifications')}</h3>
          <div className="space-y-4">
            {certs.map(cert => (
              <div key={cert._id} className="flex items-start gap-3">
                <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary text-xs font-bold">{cert.issuer?.[0] ?? '?'}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{cert.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {cert.issuer} · {new Date(cert.issuedAt).getFullYear()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </BlurFade>

        {/* Right: Education + Languages */}
        <div className="space-y-8">
          <BlurFade delay={0.15}>
            <h3 className="font-semibold mb-5">{t('education')}</h3>
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu._id}>
                  <p className="text-sm font-medium">{edu.degree}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {edu.institution} · {edu.startYear}–{edu.endYear ?? ''}
                  </p>
                </div>
              ))}
            </div>
          </BlurFade>

          <div className="border-t border-border/60 pt-6" />

          <BlurFade delay={0.2}>
            <h3 className="font-semibold mb-5">{t('languages')}</h3>
            <div className="space-y-3">
              {languages.map(lang => (
                <div key={lang._id} className="flex items-center justify-between">
                  <span className="text-sm">{lang.name}</span>
                  <div className="flex items-center gap-3">
                    <ProficiencyDots level={lang.proficiency} />
                    <span className="font-mono text-[11px] text-muted-foreground w-20 text-right">
                      {t(`proficiency${capitalize(lang.proficiency)}` as any)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}

function ProficiencyDots({ level }: { level: string }) {
  const idx = PROFICIENCY_ORDER.indexOf(level)
  const filled = idx === -1 ? 0 : PROFICIENCY_ORDER.length - idx
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}
          className={`size-1.5 rounded-full ${i < filled ? 'bg-primary' : 'bg-muted'}`} />
      ))}
    </div>
  )
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }
```

### Step 5: Create `components/sections/StrengthsCard.tsx`

```tsx
import { useTranslations } from 'next-intl'
import { BlurFade } from '@/components/ui/blur-fade'
import type { Strength } from '@/lib/sanity/types'

export function StrengthsCard({ strengths }: { strengths: Strength[] }) {
  const t = useTranslations('strengths')

  return (
    <section id="strengths" className="py-16">
      <BlurFade delay={0}>
        <p className="font-mono text-xs text-muted-foreground mb-3">{t('eyebrow')}</p>
        <h2 className="text-[38px] font-bold tracking-tight mb-10">{t('title')}</h2>
      </BlurFade>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {strengths.slice(0, 5).map((s, i) => (
          <BlurFade key={s._id} delay={0.05 + i * 0.07}>
            <div className="rounded-xl border border-border/60 p-4 flex flex-col gap-2">
              <span className="font-mono text-xs text-primary">
                {String(s.rank).padStart(2, '0')} —
              </span>
              <p className="font-semibold text-sm">{s.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </div>
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
```

### Step 6: Create `components/sections/WritingList.tsx`

```tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { BlurFade } from '@/components/ui/blur-fade'
import type { Post } from '@/lib/sanity/types'

export function WritingList({ posts }: { posts: Post[] }) {
  const t = useTranslations('writing')

  const published = posts.filter(p => p.status === 'published')

  return (
    <section id="writing" className="py-24">
      <BlurFade delay={0}>
        <p className="font-mono text-xs text-muted-foreground mb-3">{t('eyebrow')}</p>
        <h2 className="text-[38px] font-bold tracking-tight mb-10">{t('title')}</h2>
      </BlurFade>

      <div className="space-y-0 divide-y divide-border/60">
        {published.map((post, i) => (
          <BlurFade key={post._id} delay={0.03 + i * 0.05}>
            <Link href={`/blog/${post.slug.current}`}
              className="group flex items-center justify-between py-5 hover:translate-x-1 transition-transform">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                  <span>{new Date(post.publishedAt).toLocaleDateString('en', { dateStyle: 'medium' })}</span>
                  {post.readingMinutes && <span>{post.readingMinutes} {t('readMin')}</span>}
                  {post.tags?.[0] && <span>{post.tags[0]}</span>}
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{post.title}</h3>
              </div>
              <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-4" />
            </Link>
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
```

### Step 7: Sanity types to verify

`lib/sanity/types.ts` must export:
- `SocialPost`: `_id`, `platform`, `handle?`, `subreddit?`, `postedAt`, `body`, `stats?`, `permalink`, `featured`
- `Certification`: `_id`, `name`, `issuer?`, `issuedAt`
- `Education`: `_id`, `degree`, `institution`, `startYear`, `endYear?`
- `Language`: `_id`, `name`, `proficiency` (`native | fluent | advanced | intermediate | basic`)
- `Strength`: `_id`, `rank`, `name`, `description`
- `Post`: `_id`, `title`, `slug`, `publishedAt`, `readingMinutes?`, `tags?`, `status`

### Step 8: Verify

```bash
npm run typecheck && npm run build
```

## Todo List

- [x] Create `components/ui/social-post-card.tsx`
- [x] Create `components/sections/SocialPostsGrid.tsx`
- [x] Create `components/sections/CredentialsSection.tsx`
- [x] Create `components/sections/StrengthsCard.tsx`
- [x] Create `components/sections/WritingList.tsx`
- [x] Add all 4 sections + query calls to `app/[locale]/page.tsx`
- [x] Verify all Sanity types cover required fields
- [x] `npm run typecheck` — zero errors
- [x] `npm run build` — passes
- [x] Visual: all 4 sections render with Sanity data

## Success Criteria

- [x] `SocialPostsGrid` shows featured posts in 2-col grid, overflow in Marquee
- [x] `CredentialsSection` shows certs left, education + languages right with proficiency dots
- [x] `StrengthsCard` shows 5 CliftonStrengths in responsive grid
- [x] `WritingList` rows translate on hover; only published posts shown
- [x] `npm run build` passes

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `Marquee` component API differs from expected (pauseOnHover prop) | Low | Low | Check installed component API; adjust prop name if needed |
| Language proficiency `t()` key mismatch | Low | Low | Phase 1 defines exact key names; match them in `capitalize()` call |
| `Post.slug` shape is `{ current: string }` vs plain string | Very Low | Low | Sanity slugs are always `{ current: string }` objects |
| `getSocialPosts` / `getLanguages` queries not yet implemented | Medium | High | These come from `260511-2111-sanity-content-model-refactor`; blocked until that plan completes |
