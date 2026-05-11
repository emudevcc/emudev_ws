# Design Guidelines

## Color Palette

### Semantic Colors

Defined via CSS variables in `globals.css` or Tailwind config:

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `--background` | #ffffff | #0a0a0a | Page background |
| `--foreground` | #000000 | #ffffff | Text, primary elements |
| `--muted-foreground` | #666666 | #999999 | Secondary text, hints |
| `--border` | #e5e5e5 | #222222 | Borders, dividers |
| `--destructive` | #ff0000 | #ff4444 | Errors, warnings |
| `--input-bg` | #f5f5f5 | #1a1a1a | Form inputs |

### Usage

```tsx
// Use semantic tokens, not raw colors
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Secondary text</p>
  <button className="bg-foreground text-background">Primary CTA</button>
  <input className="bg-input-bg border border-border" />
  <p className="text-destructive">Error message</p>
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

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| H1 | 2.5rem (40px) | 700 (bold) | 1.2 | Page titles, hero |
| H2 | 2rem (32px) | 700 (bold) | 1.3 | Section headers |
| H3 | 1.5rem (24px) | 600 (semibold) | 1.4 | Subsection headers |
| H4 | 1.25rem (20px) | 600 (semibold) | 1.5 | Card headers |
| Body | 1rem (16px) | 400 (normal) | 1.6 | Paragraph text |
| Small | 0.875rem (14px) | 400 (normal) | 1.5 | Captions, labels |

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

### Scale (Tailwind Default)

```
0    4px
1    8px
2    12px
3    16px
4    20px
5    24px
6    32px
8    40px
10   48px
12   56px
16   64px
20   80px
```

### Usage Guidelines

| Scenario | Spacing | Example |
|----------|---------|---------|
| **Component padding** | 4 (16px) or 6 (24px) | `p-4` or `px-6` |
| **Section padding** | 20 (80px) or 16 (64px) | `py-20` |
| **Grid gaps** | 4 (16px) or 6 (24px) | `gap-6` |
| **Vertical rhythm** | 4-8 between elements | `mb-4` between paragraphs |
| **Horizontal margin** | Auto for centering | `mx-auto` |

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

## Dark Mode (Placeholder)

### Implementation

Tailwind v4 supports dark mode via `dark:` prefix. Add to base CSS:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ffffff;
    /* ... other tokens ... */
  }
}
```

### Usage

```tsx
<div className="bg-white dark:bg-black text-black dark:text-white">
  {/* Automatically switches based on system preference */}
</div>
```

### Toggle (Future Enhancement)

When implementing user preference:

```tsx
export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-lg border"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

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

## Future Design System Integration

### When Magic UI Pro is Added

1. Import component library
2. Extend Tailwind config with component presets
3. Replace placeholder components with library versions
4. Document component usage in this file
5. Create Storybook if needed for design system documentation

### Color Palette Evolution

Current semantic tokens will remain; Magic UI Pro will extend with:
- Additional color variants
- Gradient presets
- Shadow depth scales
- Animation library

All changes will be backward compatible with existing components.
