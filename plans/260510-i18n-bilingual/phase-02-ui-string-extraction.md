---
phase: 2
title: "UI String Extraction"
status: pending
priority: P1
effort: "2h"
dependencies: [1]
---

# Phase 2: UI String Extraction

## Overview

Replace all hard-coded English strings in components and pages with `next-intl` translation calls. Populate `messages/en.json` and `messages/es.json` with the full string inventory. After this phase, switching locale renders Spanish UI text throughout.

## Requirements

- Functional:
  - All visible UI text translates when locale switches
  - Date formatting uses the active locale (not hardcoded `en-US`)
  - Server components use `getTranslations()`, client components use `useTranslations()`
- Non-functional:
  - No `any` casts; keys are type-safe via next-intl's `Messages` type inference
  - Spanish translations must be real, not machine-translated placeholders

## Architecture

```
messages/
├── en.json   ← full inventory
└── es.json   ← full Spanish translations

Server components → await getTranslations('namespace')
Client components → useTranslations('namespace')
Date formatting   → useFormatter() / getFormatter() with locale
```

## Related Code Files

- Modify: `messages/en.json`
- Modify: `messages/es.json`
- Modify: `components/site-nav.tsx`
- Modify: `components/ui/hero-section.tsx` (if exists as client component)
- Modify: `components/contact-form.tsx`
- Modify: `components/tag-filter.tsx`
- Modify: `components/post-card.tsx`
- Modify: `components/project-card.tsx`
- Modify: `app/[locale]/page.tsx`
- Modify: `app/[locale]/about/page.tsx`
- Modify: `app/[locale]/blog/page.tsx`
- Modify: `app/[locale]/blog/[slug]/page.tsx`
- Modify: `app/[locale]/contact/page.tsx`
- Modify: `app/[locale]/projects/page.tsx`
- Modify: `app/[locale]/projects/[slug]/page.tsx`

## Implementation Steps

### 1. Full `messages/en.json`

```json
{
  "nav": {
    "home": "Home",
    "projects": "Projects",
    "blog": "Blog",
    "about": "About",
    "contact": "Contact"
  },
  "home": {
    "featuredProjects": "Featured Projects",
    "noProjects": "No projects yet — check back soon."
  },
  "about": {
    "title": "About",
    "metaDescription": "About Esteban Montero — software engineer",
    "fallbackBio": "Software engineer passionate about building great products."
  },
  "blog": {
    "title": "Blog",
    "metaDescription": "Thoughts and articles by Esteban Montero",
    "empty": "No posts yet."
  },
  "contact": {
    "title": "Contact",
    "metaDescription": "Get in touch with Esteban Montero",
    "heading": "Contact",
    "description": "Have a project in mind? Send me a message and I'll get back to you.",
    "namePlaceholder": "Your name",
    "emailPlaceholder": "you@example.com",
    "messagePlaceholder": "Tell me about your project…",
    "nameLabel": "Name",
    "emailLabel": "Email",
    "messageLabel": "Message",
    "submit": "Send Message",
    "submitting": "Sending…",
    "success": "Message sent! I'll get back to you soon."
  },
  "projects": {
    "title": "Projects",
    "metaDescription": "A collection of projects by Esteban Montero",
    "empty": "No projects yet.",
    "liveSite": "Live site ↗",
    "repository": "Repository ↗"
  },
  "common": {
    "all": "All",
    "noResults": "No projects match this filter.",
    "projectImageAlt": "Project image"
  },
  "hero": {
    "viewProjects": "View Projects",
    "getInTouch": "Get in Touch"
  }
}
```

### 2. Full `messages/es.json`

```json
{
  "nav": {
    "home": "Inicio",
    "projects": "Proyectos",
    "blog": "Blog",
    "about": "Sobre mí",
    "contact": "Contacto"
  },
  "home": {
    "featuredProjects": "Proyectos destacados",
    "noProjects": "Sin proyectos aún — vuelve pronto."
  },
  "about": {
    "title": "Sobre mí",
    "metaDescription": "Sobre Esteban Montero — ingeniero de software",
    "fallbackBio": "Ingeniero de software apasionado por crear grandes productos."
  },
  "blog": {
    "title": "Blog",
    "metaDescription": "Pensamientos y artículos de Esteban Montero",
    "empty": "Sin publicaciones aún."
  },
  "contact": {
    "title": "Contacto",
    "metaDescription": "Contáctame — Esteban Montero",
    "heading": "Contacto",
    "description": "¿Tienes un proyecto en mente? Envíame un mensaje y te responderé.",
    "namePlaceholder": "Tu nombre",
    "emailPlaceholder": "tu@email.com",
    "messagePlaceholder": "Cuéntame sobre tu proyecto…",
    "nameLabel": "Nombre",
    "emailLabel": "Correo",
    "messageLabel": "Mensaje",
    "submit": "Enviar mensaje",
    "submitting": "Enviando…",
    "success": "¡Mensaje enviado! Te responderé pronto."
  },
  "projects": {
    "title": "Proyectos",
    "metaDescription": "Una colección de proyectos de Esteban Montero",
    "empty": "Sin proyectos aún.",
    "liveSite": "Sitio en vivo ↗",
    "repository": "Repositorio ↗"
  },
  "common": {
    "all": "Todos",
    "noResults": "Ningún proyecto coincide con este filtro.",
    "projectImageAlt": "Imagen del proyecto"
  },
  "hero": {
    "viewProjects": "Ver proyectos",
    "getInTouch": "Contáctame"
  }
}
```

### 3. Server components — use `getTranslations()`

Pattern for async server components and page metadata:

```tsx
// app/[locale]/about/page.tsx (example)
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  return { title: t('title'), description: t('metaDescription') }
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  // ...
  return <h1>{t('title')}</h1>
}
```

Apply the same pattern to: `page.tsx` (home), `blog/page.tsx`, `contact/page.tsx`, `projects/page.tsx`, `blog/[slug]/page.tsx`, `projects/[slug]/page.tsx`.

### 4. Client components — use `useTranslations()`

Components that are already `'use client'` (contact-form, tag-filter, locale-switcher):

```tsx
'use client'
import { useTranslations } from 'next-intl'

export function ContactForm() {
  const t = useTranslations('contact')
  // ...
  return (
    <input name="name" placeholder={t('namePlaceholder')} />
  )
}
```

### 5. SiteNav — server component, use `getTranslations()`

`SiteNav` is a server component. Replace hardcoded labels:

```tsx
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { LocaleSwitcher } from './locale-switcher'

export async function SiteNav() {
  const t = await getTranslations('nav')
  const links = [
    { href: '/' as const, label: t('home') },
    { href: '/projects' as const, label: t('projects') },
    { href: '/blog' as const, label: t('blog') },
    { href: '/about' as const, label: t('about') },
    { href: '/contact' as const, label: t('contact') },
  ]
  return (
    <nav className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          emudev
        </Link>
        <ul className="flex gap-6 text-sm text-muted-foreground">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="transition-colors hover:text-foreground">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <LocaleSwitcher />
      </div>
    </nav>
  )
}
```

### 6. Date formatting — use `getFormatter()` / `useFormatter()`

Replace all hardcoded `new Date().toLocaleDateString('en-US', ...)` calls:

```tsx
// Server component
import { getFormatter } from 'next-intl/server'
const format = await getFormatter({ locale })
const date = format.dateTime(new Date(post.publishedAt), { dateStyle: 'medium' })

// Client component
import { useFormatter } from 'next-intl'
const format = useFormatter()
const date = format.dateTime(new Date(post.publishedAt), { dateStyle: 'medium' })
```

Files with hardcoded `en-US` date locale: `components/post-card.tsx`, `app/[locale]/blog/[slug]/page.tsx`.

## Todo List

- [ ] Write full `messages/en.json`
- [ ] Write full `messages/es.json`
- [ ] Update `app/[locale]/page.tsx` — `getTranslations('home')`
- [ ] Update `app/[locale]/about/page.tsx` — `getTranslations('about')` + metadata
- [ ] Update `app/[locale]/blog/page.tsx` — `getTranslations('blog')` + metadata
- [ ] Update `app/[locale]/blog/[slug]/page.tsx` — date format + metadata
- [ ] Update `app/[locale]/contact/page.tsx` — `getTranslations('contact')` + metadata
- [ ] Update `app/[locale]/projects/page.tsx` — `getTranslations('projects')` + metadata
- [ ] Update `app/[locale]/projects/[slug]/page.tsx` — link labels + metadata
- [ ] Update `components/site-nav.tsx` — `getTranslations('nav')`
- [ ] Update `components/contact-form.tsx` — `useTranslations('contact')`
- [ ] Update `components/tag-filter.tsx` — `useTranslations('common')`
- [ ] Update `components/post-card.tsx` — `useFormatter()` for dates
- [ ] Update `components/project-card.tsx` — `useTranslations('common')` for alt text
- [ ] Update hero section component — `useTranslations('hero')`
- [ ] Verify switching locale changes all visible text
- [ ] Verify `npx tsc --noEmit` passes

## Success Criteria

- [ ] `/en/` renders "Featured Projects", `/es/` renders "Proyectos destacados"
- [ ] `/en/contact` form shows English labels; `/es/contact` shows Spanish labels
- [ ] Nav links say "Home / Projects / Blog / About / Contact" in EN and "Inicio / Proyectos / Blog / Sobre mí / Contacto" in ES
- [ ] Date on blog post pages formats per locale (e.g. "May 10, 2026" vs "10 may 2026")
- [ ] Locale switcher button visible in nav, toggles locale on click
- [ ] No hardcoded English strings remain in components or pages
- [ ] TypeScript: no `any` casts for translation keys

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `useTranslations` in a server component (wrong hook) | Medium | Always use `getTranslations()` in server; `useTranslations()` only in `'use client'` |
| Missing key in `es.json` causes runtime error | Low | next-intl falls back to key name; add missing keys before shipping |
| `getTranslations` call without `locale` param in server component inside `[locale]` layout | Low | Pass `{ locale }` explicitly from `params` to avoid relying on implicit context |
