---
phase: 3
title: "Hero and About Sections"
status: pending
priority: P1
effort: "5h"
dependencies: [1, 2]
---

# Phase 3: Hero and About Sections

## Overview

Build `HeroSection` (avatar, animated name, stats, CTA buttons) and `AboutSection` (bio paragraphs with BlurFade, chip row). Both sections are wired to Sanity queries: `getSiteSettings` for hero data and `getAbout` + `getSiteSettings` for about data.

## Requirements

**Functional:**
- `HeroSection` renders: avatar + meta row, h1 with animated name, tagline, 3 CTA buttons, 4-stat grid
- `AboutSection` renders: eyebrow + h2, 3 bio paragraphs with BlurFade, chip row (location, timezone, email)
- Both sections wire to Sanity data via server component props
- Stats use `NumberTicker` for animated count-up on mount

**Non-functional:**
- Section IDs match Dock nav: `id="home"` and `id="about"`
- Both sections use `<BlurFade>` for scroll entry animations
- `HeroSection` height ≥ 100vh (full viewport first section)

## Related Code Files

- Create: `components/sections/HeroSection.tsx`
- Create: `components/sections/AboutSection.tsx`
- Modify: `app/[locale]/page.tsx` (add both sections, pass Sanity data)

## Implementation Steps

### Step 1: Update `app/[locale]/page.tsx`

```tsx
// app/[locale]/page.tsx
import { getSiteSettings, getAbout } from '@/lib/sanity/queries'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [settings, about] = await Promise.all([
    getSiteSettings(locale),
    getAbout(locale),
  ])

  return (
    <>
      <HeroSection settings={settings} />
      <AboutSection about={about} settings={settings} />
      {/* Phases 4-7 sections added here in subsequent phases */}
    </>
  )
}
```

### Step 2: Create `components/sections/HeroSection.tsx`

```tsx
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { NumberTicker } from '@/components/ui/number-ticker'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import { BlurFade } from '@/components/ui/blur-fade'
import type { SiteSettings } from '@/lib/sanity/types'

interface HeroSectionProps { settings: SiteSettings | null }

export function HeroSection({ settings }: HeroSectionProps) {
  const t = useTranslations('hero')

  const stats = [
    { value: settings?.yearsExperience ?? 0,    label: t('statYearsExp') },
    { value: settings?.projectsShipped ?? 0,    label: t('statProjects') },
    { value: settings?.certifications ?? 0,     label: t('statCertifications') },
    { value: settings?.languagesSpoken ?? 0,    label: t('statLanguages') },
  ]

  return (
    <section id="home" className="min-h-screen flex flex-col justify-center py-24">
      {/* Avatar + meta */}
      <BlurFade delay={0}>
        <div className="flex items-center gap-4 mb-8">
          <div className="relative size-[84px] shrink-0">
            {settings?.avatar && (
              <Image src={settings.avatar} alt={settings.shortName ?? ''} fill className="rounded-full object-cover" />
            )}
            <span className="absolute bottom-1 right-1 size-3.5 rounded-full bg-emerald-500 border-2 border-background" />
          </div>
          <div className="flex flex-col gap-0.5 font-mono text-xs text-muted-foreground">
            <span>{settings?.location}</span>
            <span>{settings?.timezone}</span>
            <span>@{settings?.githubHandle}</span>
          </div>
        </div>
      </BlurFade>

      {/* Heading */}
      <BlurFade delay={0.1}>
        <h1 className="text-[56px] font-bold leading-none tracking-tight mb-4">
          <span className="text-muted-foreground">{t('greeting')} </span>
          <AnimatedShinyText className="inline">{settings?.shortName}</AnimatedShinyText>
          <br />
          <span className="text-2xl font-normal text-muted-foreground mt-2 block">{settings?.role}</span>
        </h1>
      </BlurFade>

      {/* Tagline */}
      <BlurFade delay={0.2}>
        <p className="max-w-[560px] text-muted-foreground mb-8">{settings?.tagline}</p>
      </BlurFade>

      {/* CTA row */}
      <BlurFade delay={0.3}>
        <div className="flex flex-wrap gap-3 mb-16">
          <InteractiveHoverButton>
            <a href="#contact">{t('ctaContact')}</a>
          </InteractiveHoverButton>
          {settings?.calComUrl && (
            <a href={settings.calComUrl} target="_blank" rel="noreferrer"
              className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
              {t('ctaSchedule')}
            </a>
          )}
          {settings?.resumePdf && (
            <a href={settings.resumePdf} target="_blank" rel="noreferrer"
              className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
              {t('ctaResume')}
            </a>
          )}
        </div>
      </BlurFade>

      {/* Stats grid */}
      <BlurFade delay={0.4}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-1">
              <NumberTicker value={value} className="text-4xl font-bold tabular-nums" />
              <span className="text-xs font-mono text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </BlurFade>
    </section>
  )
}
```

### Step 3: Create `components/sections/AboutSection.tsx`

```tsx
import { useTranslations } from 'next-intl'
import { BlurFade } from '@/components/ui/blur-fade'
import { Chip } from '@/components/ui/chip'
import type { About, SiteSettings } from '@/lib/sanity/types'

interface AboutSectionProps {
  about: About | null
  settings: SiteSettings | null
}

export function AboutSection({ about, settings }: AboutSectionProps) {
  const t = useTranslations('about')

  return (
    <section id="about" className="py-24">
      <BlurFade delay={0}>
        <p className="font-mono text-xs text-muted-foreground mb-3">{t('eyebrow')}</p>
        <h2 className="text-[38px] font-bold tracking-tight mb-10">{t('title')}</h2>
      </BlurFade>

      <div className="space-y-5 max-w-[680px] mb-8">
        {about?.paragraphs?.map((para, i) => (
          <BlurFade key={i} delay={0.1 + i * 0.1}>
            <p className="text-muted-foreground leading-relaxed">{para}</p>
          </BlurFade>
        ))}
      </div>

      <BlurFade delay={0.4}>
        <div className="flex flex-wrap gap-2">
          {settings?.location && <Chip label={settings.location} />}
          {settings?.timezone && <Chip label={settings.timezone} />}
          {settings?.email && <Chip label={settings.email} />}
        </div>
      </BlurFade>
    </section>
  )
}
```

### Step 4: Extend Sanity types

Ensure `lib/sanity/types.ts` (from `260511-2111` plan) exports:
- `SiteSettings` with: `avatar`, `shortName`, `role`, `tagline`, `location`, `timezone`, `githubHandle`, `email`, `calComUrl`, `resumePdf`, `availableForWork`, `availableShort`, `yearsExperience`, `projectsShipped`, `certifications`, `languagesSpoken`
- `About` with: `paragraphs: string[]`

If `yearsExperience` / `projectsShipped` / `certifications` / `languagesSpoken` are not in the Sanity schema, add them as number fields to `siteSettings` document type in the content model plan.

### Step 5: Verify

```bash
npm run typecheck && npm run build
```

Navigate to `http://localhost:3000/en` — hero and about sections should render with Sanity data.

## Todo List

- [ ] Update `app/[locale]/page.tsx` to fetch and pass Sanity data
- [ ] Create `components/sections/HeroSection.tsx`
- [ ] Create `components/sections/AboutSection.tsx`
- [ ] Verify `SiteSettings` and `About` types cover all hero/about fields
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run build` — passes
- [ ] Visual check: hero ≥ 100vh, BlurFade animates on scroll, NumberTicker counts up

## Success Criteria

- [ ] `HeroSection` renders with live Sanity data (avatar, name, tagline, stats)
- [ ] `AnimatedShinyText` on name, `NumberTicker` on each stat value
- [ ] `InteractiveHoverButton` links to `#contact`
- [ ] `AboutSection` renders bio paragraphs from `getAbout`
- [ ] BlurFade scroll animations work on both sections
- [ ] Chip row shows location, timezone, email

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `yearsExperience` stat fields not in SiteSettings schema | Medium | Low | Add fields in content model phase; hardcode fallback values for now |
| `AnimatedShinyText` needs dark background to be visible | Low | Low | Component uses gradient overlay — works on both themes |
| `NumberTicker` animates on every re-render | Very Low | Low | Wrap in `useMemo` if needed |
