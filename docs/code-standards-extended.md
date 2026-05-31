# Code Standards — Extended Patterns

Extended patterns for SEO, accessibility, and performance. See `code-standards.md` for core patterns (TypeScript, naming, caching, server actions, APIs).

## SEO Patterns (OG Image, JSON-LD, AI Bot Rules)

### Open Graph Image Generation

**File:** `app/opengraph-image.tsx`

```typescript
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ /* styles */ }}>
      <div>Esteban Montero</div>
      <div>Adobe Analytics Architect & Software Engineer</div>
    </div>,
    size
  )
}
```

**Usage in layout metadata:**
```typescript
const ogImage = '/opengraph-image'
openGraph: {
  images: [{ url: ogImage, width: 1200, height: 630, alt: siteName }],
}
```

**Per-page dynamic OG images:** Routes like `/[locale]/blog/[slug]/opengraph-image.tsx` use same ImageResponse pattern for dynamic content (blog title, author, date).

### JSON-LD Structured Data (Person Schema)

**Location:** `app/[locale]/page.tsx` (homepage)

```typescript
const jsonLd: Person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Esteban Montero',
  jobTitle: 'Software Engineer',
  sameAs: [
    'https://linkedin.com/in/...',
    'https://github.com/...',
  ],
}

// In component head or Script tag
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

**Breadcrumb Schema (Blog/Projects detail):** Generated in `components/ui/breadcrumb.tsx` with BreadcrumbList type for search snippet enhancement.

### AI Bot Disallow Rules

**File:** `app/robots.ts`

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot', 'anthropic-ai', 'cohere-ai'],
        disallow: '/',
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
```

**Key:** Block AI training bots explicitly. Allows human search engines (Google, Bing, etc.) to index normally.

---

## WCAG 2.2 Accessibility Patterns

### Scroll-Margin for Fixed Header

**Problem:** Fixed 56px header obscures section tops when navigating via anchor links (WCAG 2.4.11 Focus Not Obscured).

**Solution:** Add `scroll-mt-16` (64px = 56px header + 8px buffer) to all section anchors:

```tsx
<section id="about" className="scroll-mt-16">
  <h2>About</h2>
</section>
```

**Applied to:** 9 sections: hero, about, experience, projects, skills, credentials, writing, strengths, social, contact.

### Focus-Visible Ring Pattern

**WCAG 2.4.7 Focus Visible:** All interactive elements must show visible focus indicator.

```tsx
// Form inputs
<input
  className="focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1"
/>

// Nav links (header)
<a href="/about" className="focus-visible:ring-2" />
```

**Key:** Use `focus-visible` (shows on keyboard nav, not mouse click) instead of `focus` for better UX.

### Aria-Current Location

**WCAG 4.1.2 Name, Role, Value:** Indicate currently active nav item.

**File:** `components/ui/dock-nav.tsx`

```tsx
<a href="#about" aria-current={active === 'about' ? 'location' : undefined}>
  About
</a>
```

### Nav Landmarks

**WCAG 1.3.1 Info & Relationships:** Label navigation regions.

**File:** `components/classic-shell.tsx` + `components/ui/dock-nav.tsx`

```tsx
<header>
  <nav aria-label="Main navigation">
    {/* main nav links */}
  </nav>
</header>

<nav aria-label="Page sections">
  {/* dock nav for section anchors */}
</nav>
```

### Skip Link

**WCAG 2.4.1 Bypass Blocks:** Allow keyboard users to skip to main content.

**File:** `app/[locale]/layout.tsx` (first `<body>` child)

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 ..."
>
  Skip to main content
</a>
```

**Target:** `<motion.main id="main-content">` in `PageTransition`.

### Prefers-Reduced-Motion

**WCAG 2.3.3 Animation from Interactions:** Respect user motion preferences.

**File:** `components/ui/blur-fade.tsx`

```typescript
const prefersReducedMotion = useReducedMotion()
if (prefersReducedMotion) {
  return <div className={className}>{children}</div>
}
```

Also applied to:
- `app/globals.css`: `@media (prefers-reduced-motion: reduce) { scroll-behavior: auto }`
- `components/ui/hero-background.tsx`: Mobile scroll parallax skipped; desktop parallax skipped
- `components/ui/dot-pattern.tsx`: Twinkling animation skipped

### Contrast Fix

**WCAG 2.4.3 Focus Visible Contrast:** Dark mode foreground opacity increased.

**File:** `app/globals.css` (`:root[data-theme="dark"]`)

```css
--fg-4: rgb(161 161 170 / 0.45); /* was 0.40 */
```

Ensures quaternary foreground text (like disabled form inputs) meets WCAG AA contrast ratio.

### Image Alt Text & Role

**WCAG 1.1.1 Non-text Content:** All images need descriptive alt text. Decorative icons need `role="img"` + `aria-label`.

**Example:** Hero status dot

```tsx
<div role="img" aria-label="Available for work" className="w-3 h-3 bg-green-500" />
```

---

## Performance Patterns (Speculation Rules, LQIP, Preconnect)

### Speculation Rules API

**File:** `app/[locale]/layout.tsx` (in `<head>`)

```tsx
<script
  type="speculationrules"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      prerender: [
        {
          where: {
            and: [
              { href_matches: '/*' },
              { not: { href_matches: '/studio*' } },
              { not: { href_matches: '/api/*' } },
            ],
          },
          eagerness: 'moderate',
        },
      ],
    }),
  }}
/>
```

**Effect:** Chromium prerendering of same-origin pages on moderate hover intent (~200ms). Safari/Firefox safely ignore.

### Low-Quality Image Placeholder (LQIP)

**Hero avatar in HeroSection:**

```tsx
<Image
  src={avatarUrl}
  alt="Esteban Montero"
  placeholder="blur"
  blurDataURL={`${avatarUrl}?w=20&blur=50&q=10`} // Sanity CDN params
/>
```

### Responsive Images & srcset

**File:** `components/sections/ProjectsGrid.tsx`

```tsx
<Image
  src={project.cover}
  alt={project.title}
  sizes="(max-width: 768px) 100vw, 50vw" // Mobile: 100vw; desktop: 50vw
  fill
/>
```

Ensures proper srcset selection by informing Next.js of image display sizes.

### CDN Preconnect

**File:** `app/[locale]/layout.tsx` (in `<head>`)

```tsx
<link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
<link rel="dns-prefetch" href="https://cdn.sanity.io" />
```

Reduces first-request latency to Sanity's CDN by pre-establishing connection.

---

## Analytics & Monitoring

### Vercel Analytics & Speed Insights

**File:** `app/[locale]/layout.tsx`

```tsx
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function Layout({ ... }) {
  return (
    <html>
      <body>
        {/* ... */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

**Setup:** No additional env vars needed. Both are auto-configured via Vercel project settings when deployed to Vercel.

**What they track:**
- **Analytics:** Pageviews, session count, referrer, device type, locale (via geo IP)
- **Speed Insights:** Core Web Vitals (LCP, FID, CLS), first-party script execution time

**No client-side cost:** Both use Web Vitals API (built into browser) and Vercel's edge infrastructure.

