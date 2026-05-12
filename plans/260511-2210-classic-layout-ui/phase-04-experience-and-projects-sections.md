---
phase: 4
title: "Experience and Projects Sections"
status: pending
priority: P1
effort: "6h"
dependencies: [2, 3]
---

# Phase 4: Experience and Projects Sections

## Overview

Build `ExperienceTimeline` (vertical hairline timeline with MagicCard rows) and `ProjectsGrid` (2-col grid with MagicCard + BorderBeam on featured + Lens on cover). Both wired to Sanity: `getExperiences` and `getProjects`.

## Requirements

**Functional:**
- `ExperienceTimeline` renders a vertical timeline; each row is `<ExperienceCard/>` inside `<MagicCard/>`; current role dot has accent glow
- `ProjectsGrid` renders 2-col grid of `<ProjectCard/>`; featured cards have `<BorderBeam/>`; cover uses `<Lens/>`
- Both wired to Sanity via server component props
- Tech chips render using `<Chip/>` from Phase 2

**Non-functional:**
- Section IDs: `id="experience"` and `id="projects"`
- BlurFade stagger on each timeline row (delay = index × 0.08)
- Timeline hairline is 1px, `bg-border`, absolutely positioned

## Related Code Files

- Create: `components/sections/ExperienceTimeline.tsx`
- Create: `components/ui/experience-card.tsx`
- Create: `components/sections/ProjectsGrid.tsx`
- Update: `components/ui/project-card.tsx` (replace existing)
- Modify: `app/[locale]/page.tsx` (add both sections)

## Implementation Steps

### Step 1: Add queries to `app/[locale]/page.tsx`

```tsx
import { getExperiences, getProjects } from '@/lib/sanity/queries'
import { ExperienceTimeline } from '@/components/sections/ExperienceTimeline'
import { ProjectsGrid } from '@/components/sections/ProjectsGrid'

// Inside HomePage, add to Promise.all:
const [settings, about, experiences, projects] = await Promise.all([
  getSiteSettings(locale),
  getAbout(locale),
  getExperiences(locale),
  getProjects(locale),
])

// In JSX, add after AboutSection:
<ExperienceTimeline experiences={experiences} />
<ProjectsGrid projects={projects} />
```

### Step 2: Create `components/ui/experience-card.tsx`

```tsx
import { useTranslations } from 'next-intl'
import { Chip } from '@/components/ui/chip'
import type { Experience } from '@/lib/sanity/types'

interface ExperienceCardProps { experience: Experience; isCurrent?: boolean }

export function ExperienceCard({ experience, isCurrent }: ExperienceCardProps) {
  const t = useTranslations('experience')

  const startYear = new Date(experience.startDate).getFullYear()
  const endLabel = experience.endDate
    ? new Date(experience.endDate).getFullYear().toString()
    : t('present')

  return (
    <div className="relative pl-10">
      {/* Timeline dot */}
      <span className={`absolute left-[-5px] top-1.5 size-2.5 rounded-full border-2 border-background
        ${isCurrent ? 'bg-primary ring-2 ring-primary/40' : 'bg-muted-foreground'}`}
      />

      {/* Period */}
      <p className="font-mono text-xs text-muted-foreground mb-1">
        {startYear} – {endLabel}
      </p>

      {/* Role + company */}
      <p className="font-semibold">{experience.role}</p>
      <p className="text-sm text-muted-foreground mb-2">{experience.company}
        {experience.client && <span className="ml-2 opacity-60">· {experience.client}</span>}
      </p>

      {/* Summary */}
      {experience.summary && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{experience.summary}</p>
      )}

      {/* Tech chips */}
      {experience.tech?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {experience.tech.map(s => <Chip key={s.name} label={s.name} />)}
        </div>
      )}
    </div>
  )
}
```

### Step 3: Create `components/sections/ExperienceTimeline.tsx`

```tsx
import { useTranslations } from 'next-intl'
import { MagicCard } from '@/components/ui/magic-card'
import { BlurFade } from '@/components/ui/blur-fade'
import { ExperienceCard } from '@/components/ui/experience-card'
import type { Experience } from '@/lib/sanity/types'

export function ExperienceTimeline({ experiences }: { experiences: Experience[] }) {
  const t = useTranslations('experience')

  return (
    <section id="experience" className="py-24">
      <BlurFade delay={0}>
        <p className="font-mono text-xs text-muted-foreground mb-3">{t('eyebrow')}</p>
        <h2 className="text-[38px] font-bold tracking-tight mb-12">{t('title')}</h2>
      </BlurFade>

      {/* Vertical hairline */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-6">
          {experiences.map((exp, i) => (
            <BlurFade key={exp._id} delay={0.05 + i * 0.08}>
              <MagicCard
                className="rounded-xl p-5 border border-border/60"
                gradientColor={exp.endDate === null ? '#1d4ed8' : '#262626'}
                gradientOpacity={0.08}
              >
                <ExperienceCard
                  experience={exp}
                  isCurrent={!exp.endDate}
                />
              </MagicCard>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### Step 4: Replace `components/ui/project-card.tsx`

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { MagicCard } from '@/components/ui/magic-card'
import { BorderBeam } from '@/components/ui/border-beam'
import { Lens } from '@/components/ui/lens'
import { Chip } from '@/components/ui/chip'
import type { Project } from '@/lib/sanity/types'

interface ProjectCardProps { project: Project }

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <MagicCard
      className="relative rounded-xl overflow-hidden border border-border/60 flex flex-col"
      gradientOpacity={0.06}
    >
      {project.featured && <BorderBeam size={200} duration={8} />}

      {/* Cover image with Lens */}
      {project.cover && (
        <Lens zoomFactor={1.4} lensSize={150}>
          <div className="relative aspect-video w-full bg-muted">
            <Image src={project.cover} alt={project.title} fill className="object-cover" />
          </div>
        </Lens>
      )}

      {/* Body */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold">{project.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{project.tagline}</p>
        </div>

        {project.tech?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tech.map(s => <Chip key={s.name} label={s.name} />)}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between">
          {project.repoUrl && (
            <Link href={project.repoUrl} target="_blank"
              className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
              {project.repoUrl.replace('https://github.com/', '')}
              <ArrowUpRight size={12} />
            </Link>
          )}
          {project.liveUrl && !project.repoUrl && (
            <Link href={project.liveUrl} target="_blank"
              className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
              Live <ArrowUpRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </MagicCard>
  )
}
```

### Step 5: Create `components/sections/ProjectsGrid.tsx`

```tsx
import { useTranslations } from 'next-intl'
import { BlurFade } from '@/components/ui/blur-fade'
import { ProjectCard } from '@/components/ui/project-card'
import type { Project } from '@/lib/sanity/types'

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const t = useTranslations('projects')

  return (
    <section id="projects" className="py-24">
      <BlurFade delay={0}>
        <p className="font-mono text-xs text-muted-foreground mb-3">{t('eyebrow')}</p>
        <h2 className="text-[38px] font-bold tracking-tight mb-10">{t('title')}</h2>
      </BlurFade>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {projects.map((project, i) => (
          <BlurFade key={project._id} delay={0.05 + i * 0.07}>
            <ProjectCard project={project} />
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
```

### Step 6: Sanity types to verify

`lib/sanity/types.ts` must export:
- `Experience`: `_id`, `role`, `company`, `client?`, `startDate`, `endDate?`, `summary?`, `tech: Skill[]`
- `Project`: `_id`, `title`, `tagline?`, `cover?`, `tech: Skill[]`, `repoUrl?`, `liveUrl?`, `featured`, `status`, `order`
- `Skill`: `name`, `category`

### Step 7: Verify

```bash
npm run typecheck && npm run build
```

## Todo List

- [ ] Add `getExperiences` + `getProjects` imports to `app/[locale]/page.tsx`
- [ ] Create `components/ui/experience-card.tsx`
- [ ] Create `components/sections/ExperienceTimeline.tsx`
- [ ] Replace `components/ui/project-card.tsx`
- [ ] Create `components/sections/ProjectsGrid.tsx`
- [ ] Verify `Experience` and `Project` types cover all fields
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run build` — passes
- [ ] Visual: timeline hairline visible, MagicCard mouse-spotlight works, Lens zoom on hover, BorderBeam on featured projects

## Success Criteria

- [ ] `ExperienceTimeline` renders with live Sanity data; current role dot has glow
- [ ] Each experience row inside `MagicCard` with mouse spotlight
- [ ] `BlurFade` stagger works on both sections
- [ ] `ProjectsGrid` shows 2-column layout with `ProjectCard`
- [ ] Featured projects have `BorderBeam` animated border
- [ ] Project cover images have `Lens` zoom on hover
- [ ] `npm run build` passes

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `MagicCard` not yet sourced (Phase 2 of magic-ui-install pending) | Medium | High | Write section stub; swap in MagicCard wrapper after install plan completes |
| `Lens` Pro component not yet sourced | Medium | High | Same: replace cover `div` with Lens after sourcing |
| Project `cover` field is Sanity image ref, needs URL transform | Low | Low | Use `urlFor(project.cover)` from sanity image builder |
| `BorderBeam` className conflicts with card overflow:hidden | Low | Low | Set `overflow: visible` on outer wrapper or inset BorderBeam |
