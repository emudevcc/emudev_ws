---
phase: 5
title: "Skills and Contributions"
status: completed
priority: P1
effort: "4h"
dependencies: [2, 3]
---

# Phase 5: Skills and Contributions

## Overview

Build `SkillsSection` (2×2 category tiles) and `ContributionsCard` (GitHub heatmap). `SkillsSection` is wired to `getSkills`. `ContributionsCard` fetches from a new Next.js API route `app/api/github/contributions/route.ts` that proxies the GitHub GraphQL API.

## Requirements

**Functional:**
- `SkillsSection` groups skills by category (Platform, Language, Framework, Tool) into 4 tiles
- `ContributionsCard` renders 53×7 heatmap from GitHub contribution data
- `app/api/github/contributions/route.ts` fetches from GitHub GraphQL API; requires `GITHUB_TOKEN` env var
- GitHub API route caches for 1 hour (`revalidate: 3600`)

**Non-functional:**
- Section ID: `id="skills"` (contributions sub-section within it)
- Skill tile headers: mono uppercase, accent color
- Heatmap squares: 10px with 2px gap; color levels 0–4 using accent-tinted palette
- `GITHUB_TOKEN` must be in Vercel env vars (not `NEXT_PUBLIC_`)

## Related Code Files

- Create: `components/sections/SkillsSection.tsx`
- Create: `components/sections/ContributionsCard.tsx`
- Create: `app/api/github/contributions/route.ts`
- Modify: `app/[locale]/page.tsx` (add SkillsSection; ContributionsCard lives inside it)

## Implementation Steps

### Step 1: Add `getSkills` to `app/[locale]/page.tsx`

```tsx
import { getSkills } from '@/lib/sanity/queries'
import { SkillsSection } from '@/components/sections/SkillsSection'

// Add to Promise.all:
const skills = await getSkills(locale)

// Add to JSX after ProjectsGrid:
<SkillsSection skills={skills} />
```

### Step 2: Create `app/api/github/contributions/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

const GITHUB_USERNAME = process.env.GITHUB_USERNAME ?? 'your-github-username'

export async function GET(req: NextRequest) {
  const year = req.nextUrl.searchParams.get('year')
  const token = process.env.GITHUB_TOKEN
  if (!token) return NextResponse.json(null, { status: 503 })

  const fromDate = year ? `${year}-01-01T00:00:00Z` : undefined
  const toDate = year ? `${year}-12-31T23:59:59Z` : undefined

  const query = `query ContributionCalendar($username: String!, $from: DateTime, $to: DateTime) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }`

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { username: GITHUB_USERNAME, from: fromDate, to: toDate } }),
    next: { revalidate: 3600 },
  })

  if (!res.ok) return NextResponse.json(null, { status: res.status })

  const json = await res.json()
  const cal = json?.data?.user?.contributionsCollection?.contributionCalendar
  if (!cal) return NextResponse.json(null, { status: 404 })

  // Map to internal shape
  const weeks = cal.weeks.map((w: any) => ({
    days: w.contributionDays.map((d: any) => ({
      date: d.date,
      count: d.contributionCount,
      level: levelMap[d.contributionLevel as keyof typeof levelMap] ?? 0,
    })),
  }))

  return NextResponse.json({ totalContributions: cal.totalContributions, weeks })
}

const levelMap = {
  NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4,
} as const
```

Add to `.env.local` (and Vercel env):
```
GITHUB_TOKEN=ghp_xxx
GITHUB_USERNAME=your-github-username
```

### Step 3: Create `components/sections/SkillsSection.tsx`

```tsx
import { useTranslations } from 'next-intl'
import { BlurFade } from '@/components/ui/blur-fade'
import { Chip } from '@/components/ui/chip'
import { ContributionsCard } from '@/components/sections/ContributionsCard'
import type { Skill } from '@/lib/sanity/types'

const CATEGORIES = [
  { key: 'platform',   labelKey: 'categoryPlatform'   },
  { key: 'language',   labelKey: 'categoryLanguage'   },
  { key: 'framework',  labelKey: 'categoryFramework'  },
  { key: 'tool',       labelKey: 'categoryTool'       },
] as const

interface SkillsSectionProps { skills: Skill[] }

export function SkillsSection({ skills }: SkillsSectionProps) {
  const t = useTranslations('skills')

  const grouped = CATEGORIES.map(cat => ({
    label: t(cat.labelKey),
    items: skills.filter(s => s.category === cat.key).sort((a, b) => a.order - b.order),
  }))

  return (
    <section id="skills" className="py-24">
      <BlurFade delay={0}>
        <p className="font-mono text-xs text-muted-foreground mb-3">{t('eyebrow')}</p>
        <h2 className="text-[38px] font-bold tracking-tight mb-10">{t('title')}</h2>
      </BlurFade>

      {/* 2×2 category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        {grouped.map(({ label, items }, i) => (
          <BlurFade key={label} delay={0.05 + i * 0.07}>
            <div className="rounded-xl border border-border/60 p-5">
              <p className="font-mono text-xs text-primary uppercase tracking-widest mb-3">{label}</p>
              <div className="flex flex-wrap gap-1.5">
                {items.map(s => <Chip key={s.name} label={s.name} />)}
              </div>
            </div>
          </BlurFade>
        ))}
      </div>

      {/* GitHub contributions below skills */}
      <BlurFade delay={0.35}>
        <ContributionsCard />
      </BlurFade>
    </section>
  )
}
```

### Step 4: Create `components/sections/ContributionsCard.tsx`

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Github } from 'lucide-react'
import type { GitHubContributions } from '@/lib/github'

const LEVEL_COLORS = [
  'bg-muted/40',           // 0 — none
  'bg-primary/20',         // 1
  'bg-primary/40',         // 2
  'bg-primary/65',         // 3
  'bg-primary',            // 4 — max
]

export function ContributionsCard() {
  const t = useTranslations('contributions')
  const [data, setData] = useState<GitHubContributions | null>(null)

  useEffect(() => {
    fetch('/api/github/contributions')
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => null)
  }, [])

  return (
    <div className="rounded-xl border border-border/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Github size={16} className="text-muted-foreground" />
          <p className="font-mono text-xs text-muted-foreground">{t('eyebrow')}</p>
        </div>
        <span className="font-mono text-xs text-muted-foreground">{t('lastYear')}</span>
      </div>

      {data ? (
        <>
          <div className="flex gap-[3px] overflow-x-auto pb-1">
            {data.weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.days.map((day, di) => (
                  <div
                    key={di}
                    className={`size-[10px] rounded-[2px] ${LEVEL_COLORS[day.level]}`}
                    title={`${day.date}: ${day.count} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>
          <p className="font-mono text-[11px] text-muted-foreground mt-3">
            {data.totalContributions.toLocaleString()} contributions
          </p>
        </>
      ) : (
        <div className="h-[90px] bg-muted/30 rounded animate-pulse" />
      )}
    </div>
  )
}
```

### Step 5: Verify

```bash
# Add GITHUB_TOKEN to .env.local, then:
npm run typecheck && npm run dev
# Hit http://localhost:3000/api/github/contributions — should return JSON
npm run build
```

## Todo List

- [x] Create `app/api/github/contributions/route.ts`
- [x] Document `GITHUB_TOKEN` + `GITHUB_USERNAME` env requirements; route returns 503 when absent
- [x] Create `components/sections/SkillsSection.tsx`
- [x] Create `components/sections/ContributionsCard.tsx`
- [x] Add `getSkills` + `SkillsSection` to `app/[locale]/page.tsx`
- [x] `npm run typecheck` — zero errors
- [x] `npm run build` — passes
- [x] Visual: skills grid shows 4 tiles, contributions heatmap renders

## Success Criteria

- [x] `SkillsSection` renders 4 category tiles with chips from Sanity data
- [x] `ContributionsCard` renders 53-week heatmap from GitHub API
- [x] `/api/github/contributions` returns `{ totalContributions, weeks }` JSON
- [x] API route returns 503 cleanly when `GITHUB_TOKEN` is missing
- [x] `npm run build` passes

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `GITHUB_TOKEN` missing in CI | Medium | Low | API returns 503; ContributionsCard shows skeleton |
| GitHub GraphQL rate limit | Very Low | Low | 1h cache means ≤24 req/day |
| Heatmap overflows on mobile | Low | Low | `overflow-x-auto` on heatmap container |
| Skills `category` value mismatch (e.g. `tools` vs `tool`) | Low | Low | Confirm exact category string in Sanity schema |
