---
phase: 4
title: "Portfolio UI Pages"
status: complete
priority: P1
effort: "6h"
dependencies: [2, 3]
---

# Phase 4: Portfolio UI Pages

## Overview

Build all portfolio pages and UI components using Next.js 15 App Router Server Components, Magic UI Pro for animated elements, and Sanity GROQ queries for content. Pages: Home (hero + featured projects), Projects (list + detail), Blog (list + detail), About, Contact (form → Supabase + Resend). SEO metadata, sitemap, and robots.txt included.

## Key Insights

- **Server Components first:** Pages fetch data server-side via `sanityFetch()`. Only interactive elements (animated hero, contact form) use `'use client'`.
- **Magic UI Pro is client-only:** Wrap in `'use client'` files under `components/ui/`. Import from Server Components as regular components (React handles the boundary).
- **ISR is automatic:** `cacheTag()` in query functions handles invalidation — no `revalidate` prop needed on `fetch()`.
- **Contact form:** Server Action writes to Supabase `contact_submissions` + sends email via Resend. No Route Handler needed.
- **OG images:** Use Next.js `ImageResponse` (`app/opengraph-image.tsx`) for dynamic OG images — works at edge without a separate service.
- **Portfolio pages are mostly static:** `generateStaticParams()` pre-renders all project/post slugs at build time.

## Requirements

**Functional:**
- Home: hero section, featured projects grid, skills/tech stack, CTA
- Projects list: all projects from Sanity, filterable by tag
- Project detail: full content, featured image, links (live + repo), related projects
- Blog list: all posts, sorted by date
- Blog post detail: full Portable Text content, author, OG image
- About: bio, skills, experience (data from SiteSettings + static content)
- Contact: form with name/email/message → Supabase insert + Resend email
- Sitemap.xml + robots.txt generated from Sanity data
- Dynamic OG images per page

**Non-functional:**
- Lighthouse score > 90 on Home and Projects pages
- All pages pass `next build` TypeScript checks

## Architecture

```
app/
├── page.tsx                          ← Home (Server Component)
├── about/
│   └── page.tsx                      ← About (Server Component)
├── projects/
│   ├── page.tsx                      ← Projects list (Server Component)
│   └── [slug]/
│       ├── page.tsx                  ← Project detail (Server Component)
│       └── opengraph-image.tsx       ← Dynamic OG image
├── blog/
│   ├── page.tsx                      ← Blog list (Server Component)
│   └── [slug]/
│       ├── page.tsx                  ← Blog post (Server Component)
│       └── opengraph-image.tsx       ← Dynamic OG image
├── contact/
│   └── page.tsx                      ← Contact form page
├── actions/
│   ├── contact.ts                    ← Server Action: submit contact form
│   └── auth.ts                       ← (from Phase 3)
├── sitemap.ts                        ← Dynamic sitemap
└── robots.ts                         ← Robots.txt

components/
├── ui/                               ← Magic UI Pro wrappers ('use client')
│   ├── animated-hero.tsx
│   ├── shimmer-button.tsx
│   ├── project-card-animated.tsx
│   └── text-reveal.tsx
├── project-card.tsx                  ← Server Component card
├── post-card.tsx
├── portable-text-renderer.tsx        ← Sanity PortableText renderer
├── contact-form.tsx                  ← 'use client' form component
├── tag-filter.tsx                    ← 'use client' filter
└── nav.tsx                           ← Navigation (Server Component)
```

## Related Code Files

**Create:**
- `app/page.tsx`
- `app/about/page.tsx`
- `app/projects/page.tsx`
- `app/projects/[slug]/page.tsx`
- `app/projects/[slug]/opengraph-image.tsx`
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/blog/[slug]/opengraph-image.tsx`
- `app/contact/page.tsx`
- `app/actions/contact.ts`
- `app/sitemap.ts`
- `app/robots.ts`
- `components/ui/animated-hero.tsx`
- `components/ui/shimmer-button.tsx`
- `components/ui/project-card-animated.tsx`
- `components/project-card.tsx`
- `components/post-card.tsx`
- `components/portable-text-renderer.tsx`
- `components/contact-form.tsx`
- `components/tag-filter.tsx`
- `components/nav.tsx`

**Modify:**
- `app/layout.tsx` — add nav, fonts, metadata base
- `lib/sanity-queries.ts` — add `getPostBySlug`, `getAboutContent`

## Implementation Steps

1. **Install additional packages**:
   ```bash
   npm install @portabletext/react @sanity/image-url resend
   ```

2. **Root layout** — `app/layout.tsx`:
   ```typescript
   import type { Metadata } from 'next'
   import { Inter } from 'next/font/google'
   import { Nav } from '@/components/nav'

   const inter = Inter({ subsets: ['latin'] })

   export const metadata: Metadata = {
     metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
     title: { default: 'Portfolio', template: '%s | Portfolio' },
     description: 'Personal portfolio',
   }

   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <html lang="en">
         <body className={inter.className}>
           <Nav />
           <main>{children}</main>
         </body>
       </html>
     )
   }
   ```

3. **Home page** — `app/page.tsx`:
   ```typescript
   import { AnimatedHero } from '@/components/ui/animated-hero'
   import { ProjectCard } from '@/components/project-card'
   import { getProjects, getSiteSettings } from '@/lib/sanity-queries'

   export default async function HomePage() {
     const [projects, settings] = await Promise.all([getProjects(), getSiteSettings()])
     const featured = projects.slice(0, 3)

     return (
       <>
         <AnimatedHero name={settings?.siteName} bio={settings?.description} />
         <section className="py-16">
           <h2 className="text-2xl font-bold mb-8">Featured Projects</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {featured.map(p => <ProjectCard key={p._id} project={p} />)}
           </div>
         </section>
       </>
     )
   }
   ```

4. **Projects list page** — `app/projects/page.tsx`:
   - Fetch all projects from `getProjects()`
   - Render `<TagFilter>` (client) + `<ProjectCard>` grid (server rendered, JS-filtered on client)

5. **Project detail page** — `app/projects/[slug]/page.tsx`:
   ```typescript
   import { getProjectBySlug, getProjects } from '@/lib/sanity-queries'
   import { PortableTextRenderer } from '@/components/portable-text-renderer'
   import { notFound } from 'next/navigation'
   import type { Metadata } from 'next'

   export async function generateStaticParams() {
     const projects = await getProjects()
     return projects.map(p => ({ slug: p.slug?.current }))
   }

   export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
     const { slug } = await params
     const project = await getProjectBySlug(slug)
     if (!project) return {}
     return {
       title: project.title,
       description: project.description,
       openGraph: {
         images: [project.featuredImage ?? ''],
       },
     }
   }

   export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
     const { slug } = await params
     const project = await getProjectBySlug(slug)
     if (!project) notFound()
     return (
       <article>
         <h1>{project.title}</h1>
         <PortableTextRenderer content={project.content} />
       </article>
     )
   }
   ```

6. **PortableText renderer** — `components/portable-text-renderer.tsx`:
   ```typescript
   import { PortableText } from '@portabletext/react'
   import type { PortableTextBlock } from '@portabletext/types'

   export function PortableTextRenderer({ content }: { content: PortableTextBlock[] }) {
     return (
       <PortableText
         value={content}
         components={{
           block: {
             h2: ({ children }) => <h2 className="text-2xl font-bold mt-8">{children}</h2>,
             normal: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
           },
         }}
       />
     )
   }
   ```

7. **Contact form Server Action** — `app/actions/contact.ts`:
   ```typescript
   'use server'
   import { Resend } from 'resend'
   import { createSupabaseServerClient } from '@/lib/supabase-server'

   const resend = new Resend(process.env.RESEND_API_KEY)

   export async function submitContact(formData: FormData) {
     const name = formData.get('name') as string
     const email = formData.get('email') as string
     const message = formData.get('message') as string

     if (!name || !email || !message) return { error: 'All fields required' }

     const supabase = await createSupabaseServerClient()
     const { error: dbError } = await supabase
       .from('contact_submissions')
       .insert({ name, email, message })

     if (dbError) return { error: 'Failed to save submission' }

     await resend.emails.send({
       from: `Portfolio <contact@${process.env.NEXT_PUBLIC_SITE_DOMAIN}>`,
       to: process.env.ADMIN_EMAIL!,
       replyTo: email,
       subject: `New contact from ${name}`,
       html: `<p><strong>${name}</strong> (${email})<br/>${message}</p>`,
     })

     return { success: true }
   }
   ```

8. **Contact form component** — `components/contact-form.tsx` (`'use client'`):
   ```typescript
   'use client'
   import { useFormStatus } from 'react-dom'
   import { submitContact } from '@/app/actions/contact'

   function SubmitButton() {
     const { pending } = useFormStatus()
     return <button type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send Message'}</button>
   }

   export function ContactForm() {
     return (
       <form action={submitContact} className="space-y-4">
         <input name="name" placeholder="Name" required className="w-full border p-2 rounded" />
         <input name="email" type="email" placeholder="Email" required className="w-full border p-2 rounded" />
         <textarea name="message" rows={5} placeholder="Message" required className="w-full border p-2 rounded" />
         <SubmitButton />
       </form>
     )
   }
   ```

9. **Sitemap** — `app/sitemap.ts`:
   ```typescript
   import { getProjects, getPosts } from '@/lib/sanity-queries'

   export default async function sitemap() {
     const [projects, posts] = await Promise.all([getProjects(), getPosts()])
     const base = process.env.NEXT_PUBLIC_SITE_URL!

     return [
       { url: base, lastModified: new Date(), priority: 1.0 },
       { url: `${base}/about`, lastModified: new Date(), priority: 0.8 },
       { url: `${base}/projects`, lastModified: new Date(), priority: 0.9 },
       { url: `${base}/blog`, lastModified: new Date(), priority: 0.8 },
       { url: `${base}/contact`, lastModified: new Date(), priority: 0.7 },
       ...projects.map(p => ({
         url: `${base}/projects/${p.slug?.current}`,
         lastModified: new Date(p.publishedAt ?? p._createdAt),
         priority: 0.8,
       })),
       ...posts.map(p => ({
         url: `${base}/blog/${p.slug?.current}`,
         lastModified: new Date(p.publishedAt ?? p._createdAt),
         priority: 0.7,
       })),
     ]
   }
   ```

10. **Robots.txt** — `app/robots.ts`:
    ```typescript
    import type { MetadataRoute } from 'next'

    export default function robots(): MetadataRoute.Robots {
      return {
        rules: { userAgent: '*', allow: '/', disallow: ['/studio', '/api', '/admin'] },
        sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
      }
    }
    ```

11. **Add `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_SITE_DOMAIN`** to `.env.example`.

12. **Magic UI Pro animated components** — create minimal wrappers in `components/ui/`:
    - `animated-hero.tsx`: hero section with `GradientText` + `ShimmerButton`
    - `project-card-animated.tsx`: project card with `HoverCard` animation
    - `text-reveal.tsx`: scroll-triggered text reveal for About page

13. **Verify build**:
    ```bash
    npm run build
    # Check: zero TS errors, all routes pre-rendered or ISR
    ```

## Todo List

- [ ] Install `@portabletext/react`, `@sanity/image-url`, `resend`
- [ ] Update `app/layout.tsx` with Nav, fonts, metadata base
- [ ] Build Home page with animated hero + featured projects grid
- [ ] Build Projects list page with tag filtering
- [ ] Build Project detail page with `generateStaticParams` + `generateMetadata`
- [ ] Build Blog list page
- [ ] Build Blog post detail page with PortableText renderer
- [ ] Build About page (bio, skills, experience)
- [ ] Build Contact page with server-action form + Supabase insert + Resend email
- [ ] Create Magic UI Pro animated wrappers in `components/ui/`
- [ ] Create `PortableTextRenderer` component
- [ ] Add `ContactForm` client component
- [ ] Create `app/sitemap.ts` with Sanity data
- [ ] Create `app/robots.ts`
- [ ] Add dynamic OG images for projects + blog posts
- [ ] Run `npm run build` — zero errors

## Success Criteria

- [ ] All 6 pages render correctly in `npm run dev`
- [ ] `npm run build` succeeds with zero TypeScript errors
- [ ] Contact form submits: row in Supabase `contact_submissions` + email received
- [ ] `/sitemap.xml` returns valid XML with project + post URLs
- [ ] `/robots.txt` disallows `/studio` and `/api`
- [ ] Project detail OG image generates at `/projects/[slug]/opengraph-image`
- [ ] Lighthouse Performance > 90 on Home page

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Magic UI Pro animation → LCP regression | Medium | Lazy-load below-fold animated components; defer non-critical animations |
| Resend email delivery (no verified domain) | Medium | Use `onboarding@resend.dev` sender for dev; verify domain before prod |
| PortableText custom block missing renderers | Low | Add fallback renderer for unknown block types |
| `generateStaticParams` fails on empty CMS | Low | Return empty array — pages fall back to on-demand SSR |

## Security Considerations

- Contact Server Action: validate field lengths (name ≤ 100, message ≤ 2000) before DB insert
- No admin email in `NEXT_PUBLIC_*` — use `ADMIN_EMAIL` server-only env var
- Studio route `/studio` blocked in `robots.txt` + WAF rule (Phase 6)
- OG image endpoint: read-only Sanity fetch — no auth required

## Next Steps

- Phase 7: Add Playwright smoke tests targeting page URLs verified in this phase
