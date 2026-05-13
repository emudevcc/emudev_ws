# Design Guidelines

## Color Palette

### Semantic Design Tokens

Dark-first palette defined in `app/globals.css`:

| Token | Dark | Light | Purpose |
|-------|------|-------|---------|
| `--canvas` | #0f0f10 | #f0eee9 | Page background |
| `--accent` | #e34d2a | #e34d2a | Signal orange, CTAs, focus |
| `--surface-1` | rgba(255,255,255,0.04) | rgba(0,0,0,0.025) | Cards, panels |
| `--surface-2` | rgba(255,255,255,0.06) | rgba(0,0,0,0.05) | Buttons, secondary |
| `--surface-input` | rgba(255,255,255,0.03) | rgba(0,0,0,0.02) | Form inputs |
| `--hairline` | rgba(255,255,255,0.08) | rgba(0,0,0,0.08) | Borders, dividers |
| `--fg-1` | #ffffff | #111111 | Primary text |
| `--fg-2` | rgba(255,255,255,0.75) | rgba(0,0,0,0.70) | Secondary text |
| `--fg-3` | rgba(255,255,255,0.55) | rgba(0,0,0,0.55) | Tertiary text, hints |
| `--fg-4` | rgba(255,255,255,0.40) | rgba(0,0,0,0.40) | Disabled, meta |
| `--status-ok` | #22c55e | #22c55e | Success, validation |

### shadcn Compatibility Aliases

For existing components, these aliases map to the new tokens:
```css
--background: var(--canvas)
--foreground: var(--fg-1)
--muted: var(--surface-2)
--muted-foreground: var(--fg-3)
--border: var(--hairline)
--input: var(--surface-input)
--ring: var(--accent)
```

### Usage

```tsx
// Use semantic tokens via Tailwind classes
<div className="bg-canvas text-fg-1">
  <p className="text-fg-3">Secondary text</p>
  <button className="bg-fg-1 text-canvas">Primary CTA</button>
  <input className="bg-surface-input border border-hairline" />
  <div className="border-b border-hairline">Divider</div>
</div>

// Or use shadcn compat aliases
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Secondary text</p>
</div>
```

---

## Typography

### Font Stack

```css
/* Tailwind Inter (Google Fonts) */
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### Heading Scales

| Level | Size (token) | Weight | Line Height (token) | Usage |
|-------|------|--------|-------------|-------|
| H1 | 56px (`--t-display`) | 600 | 1.05 (`--lh-display`) | Hero text, large displays |
| H2 | 40px (`--t-h1`) | 600 | 1.15 (`--lh-heading`) | Page titles, main sections |
| H3 | 28px (`--t-h2`) | 600 | 1.15 (`--lh-heading`) | Section headers |
| H4 | 20px (`--t-h3`) | 600 | 1.15 (`--lh-heading`) | Card headers, subsections |
| Body | 16px (`--t-body`) | 400 | 1.5 (`--lh-body`) | Paragraph text, default |
| Small | 14px (`--t-body-sm`) | 400 | 1.5 (`--lh-body`) | Secondary text, labels |
| Meta | 13.5px (`--t-meta`) | 400 | 1.5 (`--lh-body`) | Metadata, timestamps |
| Label | 12px (`--t-label`) | 400 | 1.5 (`--lh-body`) | Form labels, buttons |
| Micro | 11px (`--t-micro`) | 400 | 1.5 (`--lh-body`) | Eyebrow, badges, small text |

### Implementation

```tsx
// Use semantic HTML with Tailwind classes
<h1 className="text-4xl font-bold leading-tight">Page Title</h1>
<h2 className="text-2xl font-bold leading-snug">Section Header</h2>
<p className="text-base leading-relaxed">Body text</p>
<p className="text-sm text-muted-foreground">Small caption</p>
```

---

## Spacing

### Scale (Custom Design Tokens `--s-*`)

| Token | Size | Common Use |
|-------|------|------------|
| `--s-1` | 4px | Micro padding, tight gaps |
| `--s-2` | 8px | Small padding, inline spacing |
| `--s-3` | 12px | Default small padding |
| `--s-4` | 14px | Button padding (vertical) |
| `--s-5` | 16px | Component padding, gap default |
| `--s-6` | 20px | Card padding, section gaps |
| `--s-7` | 24px | Generous padding, spacing |
| `--s-8` | 32px | Large section spacing |
| `--s-9` | 40px | Page section padding |
| `--s-10` | 56px | Hero/large sections |

**Tailwind mapping:** `p-1` = `--s-1` (4px), `gap-6` = `--s-6` (20px), etc.

### Usage Guidelines

| Scenario | Token/Tailwind | Example |
|----------|---------|---------|
| **Component padding** | `--s-5` / `p-4` (16px) or `--s-6` / `p-6` (20px) | `p-4` or `px-6` |
| **Section padding** | `--s-9` / `py-9` (40px) | `py-20` (Tailwind native) |
| **Grid gaps** | `--s-5` / `gap-4` (16px) or `--s-6` / `gap-6` (20px) | `gap-6` |
| **Vertical rhythm** | Between elements | `mb-4` or `mb-5` |
| **Horizontal margin** | Center with auto | `mx-auto` |

### Container Widths

```tsx
// Global max width (kept consistent across pages)
<section className="mx-auto max-w-6xl px-6 py-20">
  {/* Content */}
</section>
```

---

## Responsive Design

### Breakpoints (Tailwind v4)

| Prefix | Screen Width | Device |
|--------|--------------|--------|
| (none) | 0px | Mobile (default) |
| `sm` | 640px | Small tablet |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

### Mobile-First Strategy

**Always start with mobile styles, then add `md:`, `lg:` for larger screens:**

```tsx
// Bad: Desktop-first
<div className="lg:grid-cols-3 md:grid-cols-2 grid-cols-1">

// Good: Mobile-first
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

### Common Responsive Patterns

**Projects Grid:**
```tsx
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  {projects.map(project => <ProjectCard key={project._id} project={project} />)}
</div>
```

**Hero Section:**
```tsx
<section className="px-6 py-12 md:py-20 lg:py-32">
  <div className="mx-auto max-w-4xl">
    <h1 className="text-3xl md:text-5xl font-bold">Heading</h1>
    <p className="mt-6 text-base md:text-lg text-muted-foreground">Subtitle</p>
  </div>
</section>
```

**Two-Column Layout:**
```tsx
<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
  <aside>{/* Sidebar */}</aside>
  <main>{/* Main content */}</main>
</div>
```

---

## Components

### Component Structure

All components are in `components/` with clear naming:

```
components/
├── contact-form.tsx        # Server-bound form
├── portable-text-renderer.tsx  # Rich text rendering
├── project-card.tsx        # Reusable card component
├── site-nav.tsx            # Navigation + auth state
└── ui/
    └── hero-section.tsx    # Branded hero section
```

### Component Props Pattern

```typescript
interface ProjectCardProps {
  project: Project
  isHighlighted?: boolean
}

export function ProjectCard({ project, isHighlighted = false }: ProjectCardProps) {
  return (
    <article className={cn(
      "rounded-lg border p-6",
      isHighlighted && "border-foreground bg-foreground/5"
    )}>
      {/* content */}
    </article>
  )
}
```

### Composition Over Props Drilling

**Bad:**
```tsx
<Card title={title} description={desc} footer={footer} actions={actions} />
```

**Good:**
```tsx
<Card>
  <Card.Header>
    <Card.Title>{title}</Card.Title>
  </Card.Header>
  <Card.Content>{description}</Card.Content>
  <Card.Footer>{footer}</Card.Footer>
</Card>
```

---

## Animations & Interactions

### CSS Transitions

Use Tailwind's transition utilities:

```tsx
// Smooth opacity change on hover
<button className="transition-opacity hover:opacity-80">
  Hover me
</button>

// Color transition on focus
<input className="transition-colors focus:ring-2 focus:ring-foreground" />

// Duration variants
<div className="transition-all duration-300">
  Smooth animation
</div>
```

### Avoid Over-Animation

- Keep animations <300ms for UI feedback
- Use `will-change` sparingly (performance cost)
- Prefer CSS transitions over JavaScript animations
- No auto-play animations (respect prefers-reduced-motion)

### Accessibility: Respect Motion Preferences

```tsx
import { useReducedMotion } from '@/lib/hooks'

export function AnimatedHero() {
  const prefersReducedMotion = useReducedMotion()
  
  return (
    <div className={prefersReducedMotion ? '' : 'animate-fade-in'}>
      {/* content */}
    </div>
  )
}
```

---

## Forms

### Input Styling

```tsx
<input
  type="text"
  placeholder="Your name"
  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-foreground/20 transition-colors"
/>
```

### Form States

| State | Styling |
|-------|---------|
| **Idle** | `border border-border` |
| **Focus** | `focus:ring-2 focus:ring-foreground/20` |
| **Filled** | `border-border` (no change in Tailwind) |
| **Error** | `border border-destructive` |
| **Disabled** | `disabled:opacity-60 disabled:cursor-not-allowed` |

### Form Layout

```tsx
<form className="space-y-5">
  <div>
    <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
      Name
    </label>
    <input id="name" name="name" required className="w-full..." />
  </div>
  
  <div>
    <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
      Email
    </label>
    <input id="email" name="email" type="email" required className="w-full..." />
  </div>
  
  <button type="submit" className="w-full...">
    Submit
  </button>
</form>
```

Use `space-y-5` for consistent vertical spacing between form groups.

---

## Buttons

### Primary Button

```tsx
<button className="rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-60">
  Click me
</button>
```

### Secondary Button

```tsx
<button className="rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-border disabled:opacity-60">
  Secondary
</button>
```

### Button Sizes

| Size | Padding | Font | Use Case |
|------|---------|------|----------|
| **Large** | `px-6 py-3` | `text-base` | CTA buttons |
| **Default** | `px-4 py-2.5` | `text-sm` | Form submit, cards |
| **Small** | `px-3 py-2` | `text-xs` | Secondary actions |

---

## Cards & Containers

### Card Pattern

```tsx
<article className="rounded-lg border border-border p-6 transition-colors hover:border-foreground/50">
  <h3 className="text-lg font-semibold mb-3">{title}</h3>
  <p className="text-muted-foreground mb-4">{description}</p>
  <a href={url} className="text-foreground font-medium text-sm hover:underline">
    Learn more →
  </a>
</article>
```

### Card Grid

```tsx
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} item={item} />)}
</div>
```

---

## Design Tokens System

### Overview

Custom design token system replaces shadcn HSL color system. Dark-first architecture with light mode overrides via `[data-theme="light"]`.

**Key files:**
- `app/globals.css` — Design token definitions, Tailwind mapping, element base styles
- `app/[locale]/layout.tsx` — Font imports (Inter + JetBrains Mono) with CSS variables

### Token Architecture

**Dark mode (default, `:root`):**
```css
:root {
  /* Brand colors */
  --accent: #e34d2a;           /* Signal orange */
  --status-ok: #22c55e;        /* Success green */

  /* Palette (dark-first) */
  --canvas: #0f0f10;           /* Page background */
  --surface-1: rgba(255,255,255,0.04);
  --surface-2: rgba(255,255,255,0.06);
  --hairline: rgba(255,255,255,0.08);

  /* Type scale */
  --t-display: 56px; --t-h1: 40px; --t-h2: 28px;
  --t-body: 16px; --t-body-sm: 14px;

  /* Foreground scale (opacity variants) */
  --fg-1: #ffffff;             /* Primary text */
  --fg-2: rgba(255,255,255,0.75);  /* Secondary */
  --fg-3: rgba(255,255,255,0.55);  /* Tertiary */
  --fg-4: rgba(255,255,255,0.40);  /* Quaternary */
}
```

**Light mode (`[data-theme="light"]`):**
```css
[data-theme="light"] {
  --canvas: #f0eee9;           /* Warm white */
  --surface-1: rgba(0,0,0,0.025);
  --fg-1: #111111;             /* Dark text */
  --fg-2: rgba(0,0,0,0.70);
  /* ... */
}
```

**Tailwind mapping via `@theme inline`:**
```css
@theme inline {
  --color-canvas: var(--canvas);
  --color-surface-1: var(--surface-1);
  --color-accent: var(--accent);
  /* shadcn compat aliases for existing components */
  --color-background: var(--canvas);
  --color-foreground: var(--fg-1);
  /* ... */
}
```

**Custom variant for dark mode selectors:**
```css
@custom-variant dark (&:is([data-theme="dark"] *));
```

### Theme Provider Setup

ThemeProvider wraps the locale layout with dark-first defaults:

```tsx
import { ThemeProvider } from 'next-themes'

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

**Key settings:**
- `attribute="data-theme"` — Uses `data-theme` attribute instead of class
- `defaultTheme="dark"` — Dark mode on first load
- `enableSystem={false}` — Ignore OS preferences
- `disableTransitionOnChange` — Instant theme switch (no fade)

### Typography System

Fonts imported in `app/[locale]/layout.tsx` with CSS variables:

```tsx
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export default async function LocaleLayout({ children, params }: LayoutProps) {
  return (
    <html>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
```

**Defined in globals.css:**
```css
:root {
  --font-sans: var(--font-inter, 'Inter', system-ui, -apple-system, sans-serif);
  --font-mono: var(--font-jetbrains-mono, 'JetBrains Mono', ui-monospace, monospace);

  --t-display: 56px;  /* H1 equivalent */
  --t-h1: 40px;       /* Page headings */
  --t-h2: 28px;       /* Section headings */
  --t-h3: 20px;       /* Subsection */
  --t-body: 16px;     /* Paragraph text */
  --t-body-sm: 14px;  /* Secondary text */
}
```

**Element defaults (`@layer base`):**
- `h1` — 56px, 600 weight, display line-height
- `h2` — 40px, 600 weight, heading line-height
- `h3` — 28px, 600 weight, heading line-height
- `p` — 16px, body line-height, `--fg-2` color (secondary opacity)
- `code` — JetBrains Mono, 92% em size, `--surface-2` background

### LangThemeToggle Component (Hydration-Safe)

Combined locale + theme toggle in `components/ui/lang-theme-toggle.tsx`. Uses **`useSyncExternalStore`** to prevent React 19 hydration mismatch:

```tsx
'use client'

import { useSyncExternalStore } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { useTheme } from 'next-themes'

export function LangThemeToggle() {
  const router = useRouter()
  const locale = useLocale()
  const { theme, setTheme } = useTheme()

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,   // Client
    () => false   // Server
  )

  if (!isMounted) return null

  return (
    <div className="flex gap-2">
      <button onClick={() => router.replace('/', { locale: locale === 'en' ? 'es' : 'en' })}>
        {locale === 'en' ? 'ES' : 'EN'}
      </button>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  )
}
```

**Why `useSyncExternalStore`?** Provides explicit client-only rendering without hydration mismatch warnings in React 19.

---

## Internationalization (i18n) Components

### Component Patterns for Bilingual Support

**No Hardcoded UI Strings:**

```tsx
// Bad: hardcoded English string
export function ProjectCard({ project }) {
  return (
    <article>
      <h3>{project.title}</h3>
      <p>Learn more →</p>
    </article>
  )
}

// Good: use translations
import { useTranslations } from 'next-intl'

export function ProjectCard({ project }) {
  const t = useTranslations('projects')
  
  return (
    <article>
      <h3>{project.title}</h3>
      <p>{t('learnMore')} →</p>
    </article>
  )
}
```

### LocaleSwitcher Component

Built-in component at `components/locale-switcher.tsx`:

```tsx
'use client'

import { useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'

export function LocaleSwitcher() {
  const router = useRouter()
  const locale = useLocale()
  
  return (
    <button
      onClick={() => router.replace('/', { locale: locale === 'en' ? 'es' : 'en' })}
      className="px-3 py-2 rounded-lg border text-sm font-medium transition-colors hover:bg-border"
    >
      {locale === 'en' ? 'ES' : 'EN'}
    </button>
  )
}
```

**Usage:** Add to site navigation (SiteNav includes LocaleSwitcher in header)

### Navigation with Locale-Aware Links

```tsx
import { Link } from '@/i18n/navigation'

export function Nav() {
  return (
    <nav>
      {/* Links automatically include current locale */}
      <Link href="/projects">Projects</Link>
      <Link href="/blog">Blog</Link>
      <Link href={`/${locale}/contact`}>Contact</Link>
    </nav>
  )
}
```

### Translation Messages Structure

File: `messages/en.json`, `messages/es.json`

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
    "title": "Welcome to my portfolio",
    "subtitle": "Full-stack engineer & designer"
  },
  "projects": {
    "title": "My Projects",
    "learnMore": "Learn more",
    "viewRepo": "View Repository",
    "viewLive": "View Live"
  },
  "contact": {
    "title": "Get in Touch",
    "nameLabel": "Name",
    "namePlaceholder": "Your name",
    "emailLabel": "Email",
    "emailPlaceholder": "your@email.com",
    "messageLabel": "Message",
    "messagePlaceholder": "Your message...",
    "submit": "Send Message",
    "success": "Message sent! I'll get back to you soon.",
    "error": "Something went wrong. Please try again."
  }
}
```

### Component Localization Checklist

Before shipping a new component:

- [ ] All UI text externalized to messages/{locale}.json
- [ ] Using `getTranslations()` in server components
- [ ] Using `useTranslations()` in client components
- [ ] No hardcoded strings in JSX
- [ ] Dynamic content (from Sanity) uses locale-aware queries
- [ ] Links use `<Link>` from '@/i18n/navigation'
- [ ] Forms submit with current locale context
- [ ] Dates/numbers formatted with Intl API if needed (future enhancement)

---

## Accessibility

### Semantic HTML

```tsx
// Always use semantic tags
<nav>{/* navigation */}</nav>
<header>{/* header */}</header>
<main>{/* main content */}</main>
<article>{/* article */}</article>
<section>{/* section */}</section>
<footer>{/* footer */}</footer>

// Avoid
<div role="navigation">{/* ❌ */}</div>
```

### Focus Management

```tsx
// Visible focus indicator (required for keyboard navigation)
<button className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground">
  Keyboard navigable
</button>
```

### Color Contrast

- Text on background: 4.5:1 minimum (WCAG AA)
- Large text (18pt+): 3:1 minimum
- Test with WebAIM contrast checker before shipping

### Alt Text & Labels

```tsx
// Always provide alt text for images
<img src={url} alt="Project screenshot showing dashboard" />

// Always label form inputs
<label htmlFor="email">Email address</label>
<input id="email" name="email" type="email" />
```

### Skip Links

```tsx
{/* Add at top of layout */}
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
<main id="main-content">{/* ... */}</main>
```

---

## Performance

### Image Optimization

- Use Sanity CDN for CMS images (automatic optimization)
- Avoid client-side image processing
- Lazy load below-fold images: `loading="lazy"`

### Code Splitting

- Next.js App Router auto-code-splits per route
- Use dynamic imports for heavy components:
  ```typescript
  const HeavyComponent = dynamic(() => import('@/components/heavy'), {
    loading: () => <Skeleton />
  })
  ```

### CSS

- Avoid inline styles (use Tailwind classes)
- Minimize custom CSS (leverage Tailwind utilities)
- No unused CSS in production (Tailwind purges automatically)

---

## File Naming & Organization

### Component Files

```
components/
├── kebab-case-component.tsx    # Component + styles
├── another-component.tsx
└── ui/                         # Reusable UI primitives
    ├── hero-section.tsx
    └── card.tsx
```

### CSS/Tailwind

- Component styles → inline `className` attributes
- Global styles → `app/globals.css`
- No separate `.module.css` files (Tailwind sufficient)

---

## Checklist for New Components

Before shipping a new component:

- [ ] TypeScript types defined (props interface)
- [ ] Responsive (mobile-first, tested on all breakpoints)
- [ ] Accessible (semantic HTML, ARIA labels, focus states)
- [ ] Performance (no unnecessary re-renders, optimized imports)
- [ ] Consistent (uses semantic color tokens, Tailwind spacing)
- [ ] Documented (JSDoc comments for complex props)
- [ ] Tested (works in light/dark mode, all interactions)
- [ ] Consistent naming (kebab-case files, PascalCase exports)

---

## Magic UI Integration (Phase 9.1-9.2)

### Phase 9.1: Magic UI Installation (Planned)

1. **Free-tier components** via `npx shadcn@latest add "https://magicui.design/r/[name].json"`
   - Installed to `components/ui/`
   - 10 core components planned (Dock, DotPattern, MagicCard, NumberTicker, BlurFade, ShimmerButton, BorderBeam, etc.)
2. **Pro components** (MagicCard, Lens variants)
   - Manually sourced from magicui.design/pro
   - Copied to `components/ui/`
3. **CSS token integration**
   - Extend Tailwind config with Magic UI token set
   - @theme inline for animation/gradient presets
   - Maintain backward compatibility with existing semantic tokens

### Phase 9.2: Classic Layout UI (Planned)

1. Build 12-section portfolio using Magic UI components
2. Integrate with all 14 Sanity document types (bilingual)
3. Floating Dock navigation, DotPattern background
4. Dark mode toggle (via next-themes)
5. Responsive across all breakpoints
6. Full i18n coverage for new UI strings

### Token Evolution

Current semantic color tokens will remain; Magic UI will extend with:
- Additional color variants (vibrant, muted, etc.)
- Gradient presets
- Shadow depth scales (lg, xl, 2xl)
- Animation library (fade, slide, scale, etc.)

All changes backward compatible with existing components.
