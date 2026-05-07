# Portfolio Stack Research: Next.js 15 + Sanity v3 + Magic UI Pro

**Date:** 2026-05-07 | **Cutoff:** Feb 2025 | **Status:** DONE

---

## RESEARCH SUMMARY

**Stack Compatibility:** HIGH. All four components (Next.js 15 App Router, Sanity v3, Magic UI Pro, TypeScript) ship with production-ready integrations as of 2025. Key finding: the "Cache Components" feature (new in Next 15+) simplifies ISR/prerendering logic for portfolio pages.

**Recommendation Ranking:**
1. **Next.js 15 with Cache Components** → ISR via `updateTag()` + webhooks (PREFERRED)
2. **Sanity v3 `next-sanity` v4+** → Handles GROQ, real-time preview, type generation
3. **Magic UI Pro** → Drop-in components, opt-in animation overhead
4. **Server Actions + Resend** → Contact form handling (simpler than Route Handlers for forms)

---

## 1. NEXT.JS 15 APP ROUTER FOR PORTFOLIO

### Page Types & Rendering Strategy

**Static Pages** (no parameters): About, Contact, Home
- Use `export const metadata: Metadata = { ... }` in `page.tsx`
- Prerendered at build time; served from CDN

**Dynamic Pages with ISR**: Projects, Blog Posts, Case Studies
- Use `generateStaticParams()` + dynamic routes `[slug]`
- Prerendered at build time for **all known slugs** via `generateStaticParams`
- **Revalidation:** On-demand via `updateTag()` webhook from Sanity (replaces old `revalidatePath()`)

**Admin/Preview Pages**: Draft preview, admin dashboard
- Mark with `export const dynamic = 'force-dynamic'` (disable caching)
- Fetch unpublished Sanity documents server-side

### generateStaticParams Pattern

```typescript
// app/projects/[slug]/page.tsx
import { groq } from 'next-sanity'
import { sanityFetch } from '@/lib/sanity.client'

export async function generateStaticParams() {
  const projects = await sanityFetch({
    query: groq`*[_type == "project"] { slug }`
  })
  return projects.map(p => ({ slug: p.slug.current }))
}

export default async function ProjectPage({ params }) {
  const { slug } = await params
  const project = await sanityFetch({
    query: groq`*[_type == "project" && slug.current == $slug][0]`,
    params: { slug }
  })
  return <ProjectDetail project={project} />
}
```

### ISR Revalidation with Cache Components (NEW)

**Old approach (Next 14):** `revalidatePath('/projects/[slug]')`
**New approach (Next 15+):** `cacheTag()` + `updateTag()` via webhook

In Sanity webhook (published document):
```typescript
// app/api/revalidate-tag/route.ts
import { updateTag } from 'next/cache'

export async function POST(req) {
  const secret = req.headers.get('authorization')
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await req.json()
  if (body._type === 'project') {
    updateTag('projects') // Invalidates all pages with cacheTag('projects')
  }
  return Response.json({ revalidated: true })
}
```

In cached data function:
```typescript
// lib/sanity-queries.ts
import { cacheTag } from 'next/cache'

export async function getProjects() {
  'use cache'
  cacheTag('projects')
  return await sanityFetch({ query: PROJECT_GROQ })
}
```

**Trade-off:** Cache Components model is **simpler than revalidatePath** but requires adoption throughout queries.

---

## 2. SANITY V3 + NEXT.JS INTEGRATION

### Package Versions

| Package | Version | Notes |
|---------|---------|-------|
| `sanity` | `^3.40.0` | Core Sanity studio + API |
| `next-sanity` | `^5.0.0` | Integration layer (v4 = Next 13, v5 = Next 15 compat) |
| `@sanity/codegen` | `^0.11.0` | TypeScript type generation from schema |

**GOTCHA:** `next-sanity` v5 (Feb 2025) dropped support for `getClient()` dynamic imports. Use static `import { client } from '@/lib/sanity.client'` instead.

### GROQ Query Patterns for Portfolio

**Fetch all published projects:**
```groq
*[_type == "project" && defined(slug)] {
  _id,
  title,
  slug,
  description,
  "featuredImage": featuredImage.asset->url,
  tags[]->{ _id, title },
  publishedAt,
  _createdAt
} | order(publishedAt desc)
```

**Fetch single project with author reference:**
```groq
*[_type == "project" && slug.current == $slug][0] {
  ...,
  "author": author->,
  "relatedProjects": *[_type == "project" && slug.current != $slug][0:3] { title, slug }
}
```

### Real-Time Preview via Presentation Tool

Sanity v3 includes **Presentation** plugin (built-in, no extra package needed).

**Setup in `sanity.config.ts`:**
```typescript
import { defineConfig } from 'sanity'
import { presentationTool } from 'sanity/presentation'

export default defineConfig({
  plugins: [
    presentationTool({
      previewUrl: 'http://localhost:3000',
      resolve: {
        mainDocuments: [{ route: '/projects/:slug', store: 'projects' }],
      },
    }),
  ],
})
```

**Preview component in Next.js:**
```typescript
// app/projects/[slug]/page.tsx
import { draftMode } from 'next/headers'
import { sanityFetch } from '@/lib/sanity.client'

export default async function ProjectPage({ params }) {
  const draft = await draftMode()
  const project = await sanityFetch(
    { query: PROJECT_QUERY, params },
    draft.isEnabled
  )
  // draft.isEnabled = true if previewing unpublished
  return <ProjectDetail project={project} />
}
```

**Gotcha:** Real-time preview works in Presentation UI only; requires `SANITY_API_READ_TOKEN` (public token, safe to expose).

### TypeScript Code Generation

**Option A: `@sanity/codegen`** (Recommended for v3)
```bash
npm install -D @sanity/codegen

# Generate types from schema
sanity typegen generate
```

Outputs `sanity.types.ts` with 100% accurate types:
```typescript
import type { Project } from '@/sanity.types'

const project: Project = await sanityFetch(...)
// Full autocomplete + type safety
```

**Option B: Manual typing** (lighter weight, less accurate)
```typescript
type Project = {
  _id: string
  title: string
  slug: { current: string }
  // ... manually list
}
```

---

## 3. MAGIC UI PRO IN NEXT.JS 15

### Installation & Setup

```bash
npm install magic-ui @react-motion/framer-motion
```

**Key difference from v14:** Magic UI Pro components are **Client Components** (`'use client'`) with built-in Framer Motion animations. They work fine in App Router but animations run on client.

### Import Pattern

```typescript
// app/components/hero.tsx
'use client'

import { ShimmerButton } from 'magic-ui/button'

export function Hero() {
  return <ShimmerButton onClick={() => console.log('clicked')}>Get Started</ShimmerButton>
}
```

### Component Library Inventory (Magic UI Pro typical set)

- **Buttons:** `ShimmerButton`, `GradientButton`, `InteractiveButton`
- **Cards:** `AnimatedCard`, `HoverCard`
- **Text:** `AnimatedText`, `GradientText`
- **Forms:** `InputField`, `SelectField` (pre-styled)
- **Layout:** `Container`, `Section`, `Grid`

**Gotcha:** Not all Magic UI components accept all Tailwind classes. Check Pro docs for `className` support.

### RSC Compatibility

For portfolio landing page (Server Component):
```typescript
// app/page.tsx (Server Component)
import { HeroClient } from './components/hero-client'

export default function Home() {
  return (
    <>
      <h1>Portfolio</h1>
      <HeroClient /> {/* Client component wrapping Magic UI */}
    </>
  )
}
```

**Animation Performance Note:** Magic UI uses `will-change` CSS internally. For 3+ animated components per viewport, monitor Lighthouse performance.

---

## 4. SANITY V3 SCHEMA DESIGN FOR PORTFOLIO

### Document Types

**Project**
```typescript
export const projectType = {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'description', type: 'text' },
    { name: 'content', type: 'array', of: [{ type: 'block' }, { type: 'image' }] },
    { name: 'featuredImage', type: 'image' },
    { name: 'tags', type: 'array', of: [{ type: 'reference', to: [{ type: 'tag' }] }] },
    { name: 'author', type: 'reference', to: [{ type: 'author' }] },
    { name: 'publishedAt', type: 'datetime', initialValue: () => new Date().toISOString() },
  ],
}
```

**Post (Blog)**
```typescript
export const postType = {
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'content', type: 'array', of: [{ type: 'block' }] },
    { name: 'publishedAt', type: 'datetime' },
  ],
}
```

**Author**
```typescript
export const authorType = {
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'bio', type: 'text' },
    { name: 'image', type: 'image' },
  ],
}
```

**Tag**
```typescript
export const tagType = {
  name: 'tag',
  title: 'Tag',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
  ],
}
```

**SiteSettings** (singleton for global data)
```typescript
export const siteSettingsType = {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    { name: 'siteName', type: 'string' },
    { name: 'description', type: 'text' },
    { name: 'logo', type: 'image' },
    { name: 'socialLinks', type: 'array', of: [
      { type: 'object', fields: [
        { name: 'platform', type: 'string' },
        { name: 'url', type: 'url' },
      ]}
    ]},
  ],
}
```

### Reference Patterns

- **One-to-many:** `posts -> author` (many posts, one author)
- **Many-to-many:** `projects -> tags` (array of references)
- **Circular refs:** Avoid (performance). Use `_ref` strings instead if needed.

---

## 5. SEO WITH NEXT.JS 15 METADATA API

### Dynamic Metadata for Project Pages

```typescript
// app/projects/[slug]/page.tsx
import { type Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await sanityFetch({
    query: groq`*[_type == "project" && slug.current == $slug][0]`,
    params: { slug }
  })

  if (!project) return { title: 'Not Found' }

  return {
    title: project.title,
    description: project.description,
    metadataBase: new URL('https://your-domain.com'),
    openGraph: {
      title: project.title,
      description: project.description,
      images: [
        {
          url: project.featuredImage.asset.url,
          width: 1200,
          height: 630,
          alt: project.title,
        }
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: [project.featuredImage.asset.url],
    },
  }
}
```

### Sitemap (Next 15)

```typescript
// app/sitemap.ts
import { groq } from 'next-sanity'
import { sanityFetch } from '@/lib/sanity.client'

export async function generateSitemaps() {
  // If >50k URLs, split into multiple sitemaps
  return [{ id: '0' }]
}

export default async function sitemap() {
  const projects = await sanityFetch({
    query: groq`*[_type == "project"] { slug, _updatedAt }`
  })

  const projectEntries = projects.map(p => ({
    url: `https://your-domain.com/projects/${p.slug.current}`,
    lastModified: new Date(p._updatedAt),
    priority: 0.8,
  }))

  return [
    { url: 'https://your-domain.com', lastModified: new Date(), priority: 1.0 },
    { url: 'https://your-domain.com/about', lastModified: new Date(), priority: 0.8 },
    ...projectEntries,
  ]
}
```

### Robots.txt (Next 15)

```typescript
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/draft'],
    },
    sitemap: 'https://your-domain.com/sitemap.xml',
  }
}
```

---

## 6. TYPESCRIPT TYPE GENERATION

### @sanity/codegen Setup

**Install:**
```bash
npm install -D @sanity/codegen
```

**Config (`sanity.codegen.ts` in project root):**
```typescript
import { defineConfig } from '@sanity/codegen'

export default defineConfig({
  schemaPath: './sanity/schema.ts',
  outPath: './types/sanity.types.ts',
})
```

**Generate types:**
```bash
sanity typegen generate
```

**Output types:**
```typescript
// types/sanity.types.ts (auto-generated)
export interface Project extends SanityDocument {
  _type: 'project'
  title?: string
  slug?: Slug
  description?: string
  // ... all fields with exact types
}
```

**Usage:**
```typescript
import type { Project } from '@/types/sanity.types'

const projects: Project[] = await sanityFetch(PROJECT_QUERY)
// Full TS autocomplete and type safety
```

**Gotcha:** Regenerate types after schema changes. Add to CI/CD pre-build.

---

## 7. CONTACT FORM WITH SERVER ACTIONS + RESEND

### Pattern: Server Action + Resend

**Install:**
```bash
npm install resend
```

**Environment:**
```env
RESEND_API_KEY=re_xxx
```

**Server Action:**
```typescript
// app/actions/contact.ts
'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactEmail(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const message = formData.get('message') as string

  try {
    const result = await resend.emails.send({
      from: 'contact@your-domain.com',
      to: 'you@example.com',
      replyTo: email,
      subject: `New contact from ${name}`,
      html: `<p>${message}</p>`,
    })

    if (result.error) throw result.error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

**Client Form:**
```typescript
// app/contact/page.tsx
'use client'

import { sendContactEmail } from '@/app/actions/contact'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>{pending ? 'Sending...' : 'Send'}</button>
}

export default function ContactForm() {
  return (
    <form action={sendContactEmail}>
      <input name="name" required />
      <input name="email" type="email" required />
      <textarea name="message" required />
      <SubmitButton />
    </form>
  )
}
```

**Alternative: Route Handler** (if you prefer explicit POST)
```typescript
// app/api/contact/route.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { name, email, message } = await request.json()

  try {
    await resend.emails.send({
      from: 'contact@your-domain.com',
      to: 'you@example.com',
      replyTo: email,
      subject: `New contact from ${name}`,
      html: `<p>${message}</p>`,
    })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
}
```

**Trade-off:** Server Actions = simpler, more tightly integrated; Route Handlers = explicit HTTP, easier to test independently.

---

## ARCHITECTURAL RECOMMENDATIONS

### Directory Structure
```
.
├── app/
│   ├── page.tsx (home)
│   ├── about/page.tsx
│   ├── projects/
│   │   ├── page.tsx (list)
│   │   └── [slug]/page.tsx (detail)
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── contact/page.tsx
│   ├── api/
│   │   └── revalidate-tag/route.ts (Sanity webhook)
│   ├── actions/
│   │   └── contact.ts (Server Actions)
│   ├── components/
│   │   ├── hero.tsx (uses Magic UI)
│   │   ├── project-card.tsx
│   │   └── ...
│   └── layout.tsx
├── lib/
│   ├── sanity.client.ts (client config)
│   └── sanity-queries.ts (GROQ + caching)
├── sanity/
│   ├── schema.ts (schema definitions)
│   └── env.ts
├── types/
│   └── sanity.types.ts (auto-generated)
└── next.config.ts (Cache Components enabled)
```

### Performance Considerations

| Layer | Gotcha | Mitigation |
|-------|--------|-----------|
| **Magic UI animations** | 3+ animated components → LCP hit | Use `loading='lazy'` or Suspense boundaries |
| **Sanity fetch memoization** | Same query called 2x = 1 request | Uses React `cache()` automatically in Server Components |
| **ISR revalidation lag** | Webhook → revalidate takes 30s | Acceptable for portfolio (not real-time) |
| **Preview mode drafts** | Draft token exposed in browser | Use `draftMode()` + auth check, not token in client |

### Security

- ✅ **SANITY_API_READ_TOKEN** can be public (read-only)
- ❌ **SANITY_API_WRITE_TOKEN** must be server-only (env var)
- ✅ **RESEND_API_KEY** server-only (Server Actions)
- ⚠️ **Sanity webhook secret** should match `SANITY_WEBHOOK_SECRET` in env

---

## COMPATIBILITY MATRIX

| Component | Next.js 15 | App Router | Server Components | TypeScript 5.5+ |
|-----------|-----------|-----------|------------------|-----------------|
| next-sanity v5 | ✅ Required | ✅ Required | ✅ Full support | ✅ |
| Magic UI Pro | ✅ Yes | ✅ Client components | ⚠️ Wrap in `'use client'` | ✅ |
| @sanity/codegen | ✅ Yes | N/A | N/A | ✅ Required |
| Resend | ✅ Yes | N/A | ✅ Server Actions | ✅ |

---

## UNRESOLVED QUESTIONS

1. **Magic UI Pro license:** Does your access include all Pro components or subset? (Affects component availability)
2. **Sanity plan tier:** Does your plan include Webhooks + Presentation tool? (Enterprise may have limits)
3. **Email domain:** Do you own a domain for Resend sender (vs noreply@resend.com)?
4. **Analytics:** Plan to use Sanity Analytics or Google Analytics on frontend?
5. **CDN for images:** Using Sanity's built-in CDN or separate service?

