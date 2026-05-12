---
phase: 2
title: "Page Shell and Navigation"
status: pending
priority: P1
effort: "4h"
dependencies: [1]
---

# Phase 2: Page Shell and Navigation

## Overview

Set up the page chrome: DotPattern ambient background, floating Dock nav with IntersectionObserver active-section tracking, StatusPill (availability), LangThemeToggle, and Chip UI primitives. No section content yet — just the layout scaffolding that wraps all sections.

## Requirements

**Functional:**
- `app/[locale]/layout.tsx` renders DotPattern background + top bar (StatusPill left, LangThemeToggle right) + Dock at bottom
- Dock highlights the active section icon as user scrolls (IntersectionObserver)
- StatusPill reads `availableForWork` + `availableShort` from `getSiteSettings`
- LangThemeToggle switches locale (`/en` ↔ `/es`) and dark/light theme
- Chip renders a small rounded tag (text only, optional icon)

**Non-functional:**
- Dock uses `position: fixed; bottom: 24px` with `backdrop-blur-xl`
- DotPattern is `position: absolute`, full-bleed, masked top-center, z-index 0
- All content columns capped at `max-w-[880px] mx-auto px-8`

## Related Code Files

- Modify: `app/[locale]/layout.tsx`
- Create: `components/ui/dock-nav.tsx`
- Create: `components/ui/status-pill.tsx`
- Create: `components/ui/lang-theme-toggle.tsx`
- Create: `components/ui/chip.tsx`

## Implementation Steps

### Step 1: Extend `app/[locale]/layout.tsx`

Add DotPattern, top bar, and Dock around `{children}`. Wrap in `dark` class provider (next-themes or simple `useTheme` from `next-themes`).

```tsx
// app/[locale]/layout.tsx (additions only)
import { DotPattern } from '@/components/ui/dot-pattern'
import { DockNav } from '@/components/ui/dock-nav'
import { StatusPill } from '@/components/ui/status-pill'
import { LangThemeToggle } from '@/components/ui/lang-theme-toggle'
import { getSiteSettings } from '@/lib/sanity/queries'

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params
  const settings = await getSiteSettings(locale)

  return (
    <html lang={locale}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {/* Ambient background */}
          <DotPattern className="fixed inset-0 z-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top_center,white,transparent_70%)]" />

          {/* Top bar */}
          <div className="fixed top-5 left-0 right-0 z-20 flex items-center justify-between px-8 max-w-[880px] mx-auto">
            <StatusPill available={settings?.availableForWork} label={settings?.availableShort} />
            <LangThemeToggle currentLocale={locale} />
          </div>

          {/* Main content */}
          <main className="relative z-10 max-w-[880px] mx-auto px-8 pt-20">
            {children}
          </main>

          {/* Floating dock */}
          <DockNav />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

Install `next-themes` if not present: `npm install next-themes`.

### Step 2: Create `components/ui/dock-nav.tsx`

Wraps MagicUI `Dock` + `DockIcon`. Uses `useActiveSection` hook (IntersectionObserver) to highlight the current section.

```tsx
'use client'
import { Dock, DockIcon } from '@/components/ui/dock'
import { useActiveSection } from '@/hooks/use-active-section'
import { Home, User, Briefcase, Code, Layers, MessageSquare, BookOpen, Mail } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'home',         icon: Home,          label: 'Home' },
  { id: 'about',        icon: User,          label: 'About' },
  { id: 'experience',   icon: Briefcase,     label: 'Experience' },
  { id: 'projects',     icon: Code,          label: 'Projects' },
  { id: 'skills',       icon: Layers,        label: 'Skills' },
  { id: 'social',       icon: MessageSquare, label: 'Social' },
  { id: 'writing',      icon: BookOpen,      label: 'Writing' },
  { id: 'contact',      icon: Mail,          label: 'Contact' },
]

export function DockNav() {
  const active = useActiveSection(NAV_ITEMS.map(n => n.id))

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
      <Dock direction="middle" iconSize={36} iconMagnification={48}
        className="backdrop-blur-xl bg-background/60 border border-border/50">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <DockIcon
            key={id}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
            className={active === id ? 'text-primary' : 'text-muted-foreground'}
            aria-label={label}
          >
            <Icon size={18} />
          </DockIcon>
        ))}
      </Dock>
    </div>
  )
}
```

### Step 3: Create `hooks/use-active-section.ts`

```typescript
'use client'
import { useState, useEffect } from 'react'

export function useActiveSection(sectionIds: string[]): string {
  const [active, setActive] = useState(sectionIds[0])

  useEffect(() => {
    const observers = sectionIds.map(id => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { threshold: 0.4 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [sectionIds])

  return active
}
```

### Step 4: Create `components/ui/status-pill.tsx`

```tsx
interface StatusPillProps { available?: boolean; label?: string }

export function StatusPill({ available = false, label = 'Available' }: StatusPillProps) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/60 bg-background/70 backdrop-blur-sm">
      <span className={`size-2 rounded-full ${available ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
      <span className="font-mono text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}
```

### Step 5: Create `components/ui/lang-theme-toggle.tsx`

```tsx
'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function LangThemeToggle({ currentLocale }: { currentLocale: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const toggleLocale = () => {
    const next = currentLocale === 'en' ? 'es' : 'en'
    router.push(pathname.replace(`/${currentLocale}`, `/${next}`))
  }

  return (
    <div className="flex items-center gap-1 px-1 py-1 rounded-full border border-border/60 bg-background/70 backdrop-blur-sm">
      <button onClick={toggleLocale}
        className="px-2 py-0.5 rounded-full font-mono text-[11px] hover:bg-muted transition-colors">
        {currentLocale.toUpperCase()}
      </button>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="p-1 rounded-full hover:bg-muted transition-colors">
        {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
      </button>
    </div>
  )
}
```

### Step 6: Create `components/ui/chip.tsx`

```tsx
import { cn } from '@/lib/utils'

interface ChipProps { label: string; className?: string }

export function Chip({ label, className }: ChipProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono border border-border/60 bg-muted/50 text-muted-foreground',
      className
    )}>
      {label}
    </span>
  )
}
```

### Step 7: Verify

```bash
npm run typecheck && npm run build
```

The page should render with DotPattern, top bar, and Dock. No sections yet.

## Todo List

- [ ] Install `next-themes` if absent
- [ ] Modify `app/[locale]/layout.tsx` with DotPattern + top bar + Dock
- [ ] Create `hooks/use-active-section.ts`
- [ ] Create `components/ui/dock-nav.tsx`
- [ ] Create `components/ui/status-pill.tsx`
- [ ] Create `components/ui/lang-theme-toggle.tsx`
- [ ] Create `components/ui/chip.tsx`
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run build` — passes

## Success Criteria

- [ ] Layout renders with DotPattern, StatusPill, LangThemeToggle, Dock
- [ ] Dock icons scroll to section on click
- [ ] Active section icon highlighted (IntersectionObserver)
- [ ] Lang toggle switches `/en` ↔ `/es` routes
- [ ] Theme toggle switches dark/light
- [ ] `npm run build` passes

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `getSiteSettings` called in layout causes build error if Sanity not ready | Low | Medium | Wrap in try/catch; pass `null` props to StatusPill |
| IntersectionObserver fires before sections mount | Very Low | Low | `useEffect` defers registration; sections mount on same page |
| `next-themes` flash of unstyled content | Low | Low | Add `suppressHydrationWarning` to `<html>` |
| Dock z-index conflicts with Sanity overlay | Very Low | Low | Dock z-30; Sanity overlay uses z-50+ |
