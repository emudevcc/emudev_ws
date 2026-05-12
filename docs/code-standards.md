# Code Standards

## TypeScript & Type Safety

### Type Definitions

1. **Sanity types** (`types/sanity.types.ts`) — Hand-written stubs, not codegen
   - Update manually after schema changes: `sanity typegen generate`
   - Export document interfaces (Project, Post, Author, Tag, SiteSettings)
   - Includes utility types: Slug, SanityImageAsset, SanityDocument
   - Bilingual schemas use `{ en: string, es: string }` structure

2. **Supabase types** (`types/supabase.types.ts`) — Auto-generated
   - Generated via: `supabase gen types typescript --linked > types/supabase.types.ts`
   - Run after migrations: `npm run supabase:types`
   - Never edit manually; regenerate from schema

3. **React component props** — Explicit interfaces
   ```typescript
   interface ProjectCardProps {
     project: Project
   }
   export function ProjectCard({ project }: ProjectCardProps) { }
   ```

### Null Handling

**Always use explicit null guards — never rely on falsy checks:**

```typescript
// Bad
const projects = await getProjects() || []

// Good (handles empty array vs null)
const projects = (await getProjects()) ?? []

// In Sanity queries
if (!projectId) return null as T // at fetch time
// Caller: const projects = (await getProjects()) ?? []
```

**Pattern for dynamic routes:**
```typescript
export async function generateStaticParams() {
  const posts = (await getPosts()) ?? []
  return posts.map(post => ({ slug: post.slug.current }))
}

export default async function Page({ params }) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound() // 404, not null render
  return <PostContent post={post} />
}
```

---

## Naming Conventions

| Category | Case | Example |
|----------|------|---------|
| **Files** | kebab-case | `contact-form.tsx`, `sanity-queries.ts`, `locale-switcher.tsx` |
| **Directories** | kebab-case | `app/projects/[slug]/`, `lib/`, `types/`, `i18n/` |
| **Variables** | camelCase | `projectId`, `siteSettings`, `isLoading`, `locale` |
| **Constants** | UPPER_SNAKE_CASE (if truly constant) | `ADMIN_EMAIL`, `DEFAULT_LOCALE` |
| **Functions** | camelCase | `getProjects()`, `submitContact()`, `useTranslations()` |
| **Components** | PascalCase | `ProjectCard`, `ContactForm`, `LocaleSwitcher` |
| **Types/Interfaces** | PascalCase | `Project`, `ContactSubmission`, `LocaleString` |
| **GROQ Queries** | Inline or kebab-case alias | `getProjects`, `getProjectBySlug` |
| **Env Vars** | UPPER_SNAKE_CASE with NEXT_PUBLIC_ prefix | `NEXT_PUBLIC_SANITY_PROJECT_ID`, `SANITY_REVALIDATE_SECRET` |
| **Locales** | lowercase 2-letter code | `'en'`, `'es'` (not 'EN', 'ES') |

---

## ISR Cache Pattern

**Goal:** Content updates reflect within seconds via Sanity webhook, fallback to 1-hour revalidate.

### Query with `unstable_cache` + Per-Locale Tags

```typescript
// lib/sanity-queries.ts
export const getProjects = (locale: string) =>
  unstable_cache(
    async () =>
      sanityFetch<Array<Project>>({
        query: groq`*[_type == "project"] | order(publishedAt desc) { ... }`,
        params: { locale },
      }),
    [`projects-${locale}`],                           // Per-locale cache key
    { tags: [`projects-${locale}`], revalidate: 3600 } // Per-locale tag + 1h TTL
  )()

// Usage in page
const projects = (await getProjects(locale)) ?? []
```

### Webhook Revalidation (Per-Locale)

```typescript
// app/api/revalidate-tag/route.ts
const TAG_MAP: Record<string, string[]> = {
  project: ['projects-en', 'projects-es'],  // Revalidate both locales
  post: ['posts-en', 'posts-es'],
  siteSettings: ['site-settings'],
}

const tags = TAG_MAP[body._type] ?? []
for (const tag of tags) {
  revalidateTag(tag) // Instantly invalidates cache
}
```

### Key Rules

1. **Always use `?? []` for null-coalescing** — Build may not have Sanity env vars
2. **Per-locale cache tags** — `getProjectBySlug(slug, locale)` uses `['projects-en', 'projects-es']` or per-route variants
3. **Per-locale revalidation** — Webhook calls both `revalidateTag('projects-en')` and `revalidateTag('projects-es')`
4. **Headers matter** — Webhook secret in header (x-sanity-webhook-secret), never query params
5. **Fallback is time-based** — If webhook fails/is missed, 1-hour TTL still revalidates

---

## Server Action Pattern

Used for contact form, Magic Link auth, and other mutations.

### Basic Template

```typescript
'use server'

export async function submitContact(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  // 1. Extract & validate input
  const name = ((formData.get('name') as string | null) ?? '').trim()
  if (!name) return { error: 'Name required.' }

  // 2. Perform mutation (DB, email, etc.)
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('contact_submissions')
    .insert({ name, email, message })

  if (error) return { error: 'Save failed.' }

  // 3. Return state (client displays via useActionState)
  return { success: true }
}
```

### Client Usage

```typescript
'use client'

export function ContactForm() {
  const [state, action] = useActionState(submitContact, null)

  return (
    <form action={action}>
      {state?.error && <p className="error">{state.error}</p>}
      {state?.success && <p className="success">Sent!</p>}
      {/* form fields */}
    </form>
  )
}
```

### Security Checklist

- [ ] Validate all input (length, format, type)
- [ ] Use server-side validation only (client-side is UI, not security)
- [ ] Sanitize strings in HTML output (escape special chars)
- [ ] Access private services (Supabase service role, email API) on server only
- [ ] Return user-friendly errors (never leak stack traces)

---

## Sanity Query Pattern

All GROQ queries use `unstable_cache` with per-locale revalidation tags.

### Basic Structure with Locale Fallback

```typescript
import { unstable_cache } from 'next/cache'
import { groq } from 'next-sanity'
import { sanityFetch } from './sanity-client'

export const getProjectBySlug = (slug: string, locale: string) =>
  unstable_cache(
    async () =>
      sanityFetch<Project | null>({
        query: groq`*[_type == "project" && slug.current == $slug][0] {
          ...,
          title: coalesce(title[$locale], title.en),
          description: coalesce(description[$locale], description.en),
          "featuredImage": featuredImage.asset->url,
          tags[]->{ _id, title }
        }`,
        params: { slug, locale }, // Parameterized queries
      }),
    [`project-${slug}-${locale}`],
    { tags: ['projects', `projects:${locale}`, `project:${slug}`], revalidate: 3600 }
  )()
```

### Key Points

1. **Parameterized queries** — Always use `params: { slug, locale }` in GROQ (prevents injection)
2. **Locale fallback** — Use `coalesce(field[$locale], field.en)` for graceful English fallback
3. **Reference expansion** — Use `->` to expand references (author->, tags[]->, image.asset->url)
4. **Asset URLs** — Extract via `asset->url` (Sanity CDN-enabled)
5. **Null handling** — Return `T | null` for single-document queries; wrap caller in `?? null`
6. **Caching key** — Use `[`project-${slug}-${locale}`]` to vary cache per route param and locale
7. **Tags strategy** — Include both generic (`'projects'`) and specific (`'projects:en'`, `'project:slug'`) tags for flexible revalidation

---

## API Route Security Patterns

### Webhook Secret Validation (Sanity Revalidate)

```typescript
// app/api/revalidate-tag/route.ts
const secret = req.headers.get('x-sanity-webhook-secret')
if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Rules:**
- Secret in **header**, never query params (would leak in logs)
- Compare as strings; use timing-safe comparison if available
- Return 401 immediately; don't process payload

### Draft Mode Token Validation

```typescript
// app/api/draft-mode/enable/route.ts
import { validatePreviewUrl } from '@sanity/preview-url-secret'

const isValidSecret = await validatePreviewUrl(
  req.url,
  process.env.SANITY_STUDIO_REVALIDATE_SECRET
)
if (!isValidSecret) {
  return NextResponse.json({ error: 'Invalid preview URL' }, { status: 401 })
}

draftMode().enable()
redirect(`/studio`)
```

**Pattern:** Use `@sanity/preview-url-secret` for robust token validation (prevents open redirect attacks).

---

## Supabase Client Usage

### Server-Side

```typescript
// lib/supabase-server.ts
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => {
          // Set cookies in response
        },
      },
    }
  )
}
```

**Use for:**
- Server actions (contact form submission)
- Middleware (auth state management)
- Page-level data fetching (requires admin auth)

### Browser-Side (Discouraged in this Project)

```typescript
// lib/supabase-browser.ts
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Limitations:**
- Can only INSERT/SELECT via RLS policies
- Suitable for anonymous contact form, not admin panels

### RLS Policies

```sql
-- Public: anyone can submit contact form
CREATE POLICY "public_insert_contact" ON contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

-- Admin only: read submissions
CREATE POLICY "admin_read_contact" ON contact_submissions
  FOR SELECT
  USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));
```

**Rules:**
- Never trust client for authorization — RLS is the enforcement layer
- `anon` role for public operations (INSERT only)
- Authenticated role with email check for admin operations
- Test policies in staging before production

---

## Internationalization (i18n) Patterns

### Setup

- **Framework:** `next-intl` v4 for bilingual support (English & Spanish)
- **Routing:** All content routes use `[locale]` segment: `/[locale]/about`, `/[locale]/projects/[slug]`
- **Middleware:** Routes all requests to locale-prefixed paths; detects locale from Accept-Language, defaults to 'en'
- **Messages:** `messages/en.json` and `messages/es.json` contain all UI strings by namespace

### Server Components (Pages, Layouts)

Use `getTranslations()` from `next-intl` to fetch translations for a namespace:

```typescript
// app/[locale]/layout.tsx
import { getTranslations } from 'next-intl'

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  
  return (
    <html lang={locale}>
      <body>
        <nav>
          <a href={`/${locale}`}>{t('home')}</a>
          <a href={`/${locale}/projects`}>{t('projects')}</a>
        </nav>
        {children}
      </body>
    </html>
  )
}
```

### Client Components

Use `useTranslations()` hook for client-side rendering:

```typescript
'use client'

import { useTranslations } from 'next-intl'

export function ContactForm() {
  const t = useTranslations('contact')
  
  return (
    <form>
      <label>{t('nameLabel')}</label>
      <input placeholder={t('namePlaceholder')} />
      <button type="submit">{t('submit')}</button>
    </form>
  )
}
```

### Dynamic Routes with Locale

Always include `locale` in `generateStaticParams()`:

```typescript
export async function generateStaticParams() {
  const projects = (await getProjects()) ?? []
  const locales = ['en', 'es']
  
  return locales.flatMap(locale =>
    projects.map(p => ({ locale, slug: p.slug.current }))
  )
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'project' })
  const project = await getProjectBySlug(slug, locale)
  
  if (!project) notFound()
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <ProjectContent project={project} />
    </div>
  )
}
```

### Message File Structure

```json
// messages/en.json
{
  "nav": {
    "home": "Home",
    "projects": "Projects",
    "blog": "Blog",
    "contact": "Contact"
  },
  "project": {
    "title": "Projects",
    "description": "My work"
  },
  "contact": {
    "nameLabel": "Name",
    "submit": "Send"
  }
}

// messages/es.json (exact key structure, different values)
{
  "nav": {
    "home": "Inicio",
    "projects": "Proyectos",
    "blog": "Blog",
    "contact": "Contacto"
  },
  "project": {
    "title": "Proyectos",
    "description": "Mi trabajo"
  },
  "contact": {
    "nameLabel": "Nombre",
    "submit": "Enviar"
  }
}
```

**Rules:**
- Keys must match exactly between EN and ES (smoke tests verify)
- Use nested objects for namespaces (nav, project, contact, etc.)
- No hardcoded strings in components/pages
- Use locale from URL params, not cookies/localStorage

---

## Testing Patterns

### Playwright Smoke Tests

**Setup:**
```bash
npm run test:smoke:local   # Run against localhost:3000
npm run test:smoke         # Run against BASE_URL env var (production)
```

**Test structure:**
```typescript
import { expect, test } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/')
    
    const status = page.url()
    expect(status).toContain('/en') // Verify locale routing
    
    const heading = await page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
  })
  
  test('contact form renders with required fields', async ({ page }) => {
    await page.goto('/contact')
    
    await expect(page.getByLabel(/name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible()
  })
})
```

### Bilingual Test Contracts

**Message Key Parity:**
```typescript
test('message namespaces and keys match for English and Spanish', () => {
  const en = readJson('messages/en.json')
  const es = readJson('messages/es.json')

  const enKeys = leafKeys(en).sort()
  const esKeys = leafKeys(es).sort()

  expect(esKeys).toEqual(enKeys)
})
```

**Routing Contracts:**
```typescript
test('routing is explicit bilingual en/es with English default', () => {
  const routing = readText('i18n/routing.ts')

  expect(routing).toContain("locales: ['en', 'es']")
  expect(routing).toContain("defaultLocale: 'en'")
  expect(routing).toContain("localePrefix: 'always'")
})
```

**Static Rendering (Per-Locale):**
```typescript
test('static pages render without errors in both locales', async ({ page }) => {
  const pages = ['', '/about', '/projects', '/blog', '/contact']
  const locales = ['en', 'es']

  for (const locale of locales) {
    for (const path of pages) {
      const url = `/${locale}${path}`
      await page.goto(url)
      expect(page.url()).toContain(`/${locale}`)
      
      // Verify no console errors
      const errors = []
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text())
      })
      expect(errors).toHaveLength(0)
    }
  }
})
```

### Key Guidelines

- **Target:** Run ~47 tests total (11 original + 36 i18n-specific)
- **Timing:** ~7-10 seconds against production
- **Frequency:** On every deploy (staging + production)
- **Scope:** Happy path only (not comprehensive feature tests)
- **CI Integration:** GitHub Actions runs smoke tests post-deploy

---

## ESLint & Code Quality

### Configuration

- **Version:** ESLint v9 (v10 incompatible with eslint-plugin-react@7.x)
- **Format:** Flat config (`eslint.config.mjs`)
- **Plugins:** @eslint/js, typescript-eslint, react
- **Run:** `npm run lint` (CI enforces on all PRs)

### Best Practices

- No console.log in production code (linter catches)
- Prefer const over let; never use var
- Async/await over .then() chains
- Destructuring for imports and props
- No unused variables or imports

---

## Comments & Documentation

### When to Comment

**DO write comments for:**
- Non-obvious business logic (e.g., ISR revalidation strategy)
- Security decisions (e.g., why secret is in header, not query param)
- Performance optimizations (e.g., per-locale caching strategy)
- RLS policies (e.g., admin email gating)

**DON'T comment:**
- Self-documenting code (good variable names)
- Types (they're self-explanatory)
- Obvious logic

### Example

```typescript
// Good: explains WHY, not WHAT
// Webhook revalidates both locales to prevent cross-locale cache pollution
revalidateTag(`projects-${locale}`)

// Bad: restates the code
// Increment counter
counter++
```

---

## Breaking Changes & Migrations

When making breaking changes:

1. **Update docs/CHANGELOG.md** with migration guide
2. **Create deprecation period** if possible (2+ releases)
3. **Notify users** in release notes
4. **Test migrations** locally before releasing
5. **Update related docs** (codebase-summary, deployment guide, etc.)

---

## Performance Considerations

- **Bundle Size:** Monitor with `npm run build`; lazy-load heavy components
- **Cache Strategy:** Per-locale tags prevent cross-locale pollution; 1-hour TTL + webhook revalidation
- **Database:** Use RLS to prevent N+1 queries; index frequently-queried fields
- **Images:** Use Sanity CDN for all images; rely on Next.js image optimization
- **API Calls:** Minimize external service calls; wrap in try/catch for reliability
