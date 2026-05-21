---
phase: 1
title: "Implement Breadcrumb"
status: completed
priority: P2
effort: "45m"
dependencies: []
---

# Phase 1: Implement Breadcrumb

## Overview

Create a reusable `Breadcrumb` component and wire it into both blog pages. Replace the bare `← Blog` back link on the post page.

## Requirements

- Functional:
  - Blog listing (`/blog`): shows `Home · Blog`
  - Blog post (`/blog/[slug]`): shows `Home · Blog · {post.title}` with title truncated if long
  - `Home` and `Blog` are clickable links; current page item is not a link
  - i18n: uses `useTranslations` for `nav.home` and `blog.title` labels
  - JSON-LD `BreadcrumbList` on post page only (listing page can omit — less SEO value)
- Non-functional:
  - No new dependencies
  - Accessible: `<nav aria-label="Breadcrumb">`, `aria-current="page"` on last item, separators `aria-hidden`
  - Matches design system: `font-mono text-xs`, `text-muted-foreground`, links use `hover:text-accent`

## Architecture

```
components/ui/breadcrumb.tsx          ← new reusable component
app/[locale]/blog/page.tsx            ← add <Breadcrumb> above heading
app/[locale]/blog/[slug]/page.tsx     ← replace ← Blog link with <Breadcrumb> + add JSON-LD
```

**Component signature:**
```tsx
type BreadcrumbItem = { label: string; href?: string }

export function Breadcrumb({ items }: { items: BreadcrumbItem[] })
// items: array of crumbs; last item rendered as plain text (current page), rest as <Link>
```

**Rendered HTML:**
```html
<nav aria-label="Breadcrumb">
  <ol class="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
    <li><a href="/en">Home</a></li>
    <li aria-hidden="true">·</li>
    <li><a href="/en/blog">Blog</a></li>
    <li aria-hidden="true">·</li>
    <li aria-current="page" class="max-w-[240px] truncate">Post Title</li>
  </ol>
</nav>
```

**Blog listing usage (`blog/page.tsx`):**
```tsx
// Server component — no useTranslations; pass labels directly from getTranslations()
const t = await getTranslations()
<Breadcrumb items={[
  { label: t('nav.home'), href: '/' },
  { label: t('blog.title') },
]}/>
```

**Blog post usage (`blog/[slug]/page.tsx`):**
```tsx
const t = await getTranslations()
<Breadcrumb items={[
  { label: t('nav.home'), href: '/' },
  { label: t('blog.title'), href: '/blog' },
  { label: post.title ?? '' },
]}/>
```

**JSON-LD (blog post page only):**
```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
    { '@type': 'ListItem', position: 3, name: post.title },
  ],
})}}/>
```
Use `process.env.NEXT_PUBLIC_SITE_URL` for `siteUrl`.

## Related Code Files

- Create: `components/ui/breadcrumb.tsx`
- Modify: `app/[locale]/blog/page.tsx`
- Modify: `app/[locale]/blog/[slug]/page.tsx`

## Implementation Steps

1. **Create `components/ui/breadcrumb.tsx`**
   - `BreadcrumbItem` type: `{ label: string; href?: string }`
   - Import `Link` from `@/i18n/navigation` (locale-aware)
   - Render `<nav aria-label="Breadcrumb"><ol>` with `·` separators between items
   - Last item: `<li aria-current="page" className="max-w-[240px] truncate text-foreground/60">` — no link
   - Non-last items with `href`: `<Link className="transition-colors hover:text-accent">`
   - Separators: `<li aria-hidden="true">·</li>`

2. **Modify `app/[locale]/blog/page.tsx`**
   - Add `import { getTranslations } from 'next-intl/server'` (already server component)
   - Fetch `t = await getTranslations()` at top of `BlogPage`
   - Insert `<Breadcrumb items={[{ label: t('nav.home'), href: '/' }, { label: t('blog.title') }]} />` above the existing `<BlurFade>` heading block, wrapped in its own `<BlurFade delay={0.02}>`

3. **Modify `app/[locale]/blog/[slug]/page.tsx`**
   - Add `import { getTranslations } from 'next-intl/server'`
   - Remove the existing `<BlurFade delay={0.04}><Link href="/blog" ...>← Blog</Link></BlurFade>` block (lines 52-59)
   - Replace with `<Breadcrumb>` + JSON-LD script in a single `<BlurFade delay={0.04}>` wrapper
   - Shift remaining `BlurFade` delays down by one step if needed (they can stay as-is since 0.04 is reused)

## Success Criteria

- [x] `components/ui/breadcrumb.tsx` created, no TypeScript errors
- [ ] Blog listing (`/en/blog`) shows `Home · Blog` — "Blog" not a link
- [ ] Blog post shows `Home · Blog · {title}` — "Home" and "Blog" are links, title truncated if long
- [ ] Both pages: `<nav aria-label="Breadcrumb">` present in DOM
- [ ] Blog post: JSON-LD `BreadcrumbList` in page source
- [x] `npx tsc --noEmit` passes

## Completion Notes

- Implemented locale-aware breadcrumb links via `@/i18n/navigation`.
- Blog post JSON-LD uses `NEXT_PUBLIC_SITE_URL` with a production fallback.
- Manual browser DOM/source verification was not run in this environment.

## Risk Assessment

- **`getTranslations()` in page.tsx**: Already a server component pattern used elsewhere in the project — safe.
- **Locale-aware links**: Using `Link` from `@/i18n/navigation` ensures locale prefix is injected automatically — no manual `/en/` prefix needed.
- **`post.title` truncation**: CSS `truncate` with `max-w-[240px]` prevents overflow on long titles; accessible via full title in JSON-LD.
