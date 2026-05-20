# Code Standards

## TypeScript & Type Safety

### Type Definitions

1. **Sanity types** (`types/sanity.types.ts`) — Generated from Sanity schemas (~900 LOC)
   - **CRITICAL:** Regenerate after every schema change: `npm run sanity:types && npm run typecheck`
   - Export all 14 document types (Project, Post, Skill, Experience, Certification, Education, Language, Strength, SocialPost, Testimonial, About, SiteSettings, Author, Tag)
   - Includes utility types: Slug, SanityImageAsset, SanityDocument, SanityReference
   - Bilingual schemas use `{ en: string, es: string }` structure
   - `content-model.spec.ts` validates schema registry, 6 i18n helpers, query exports, and 'localized-v3' cache version on every deploy

2. **Supabase types** (`types/supabase.types.ts`) — Auto-generated
   - Generated via: `supabase gen types typescript --linked > types/supabase.types.ts`
   - Run after migrations: `npm run supabase:types`
   - Never edit manually; regenerate from schema

3. **React component props** — Explicit interfaces
   ```typescript
   interface ProjectCardProps {
     project: Project
   }
   export function ProjectCard({ project }: ProjectCardProps) {}
   ```

### Null Handling

**Always use explicit null guards — never rely on falsy checks:**

```typescript
// Bad
const projects = (await getProjects()) || []

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

| Category             | Case                                      | Example                                                        |
| -------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| **Files**            | kebab-case                                | `contact-form.tsx`, `sanity-queries.ts`, `locale-switcher.tsx` |
| **Directories**      | kebab-case                                | `app/projects/[slug]/`, `lib/`, `types/`, `i18n/`              |
| **Variables**        | camelCase                                 | `projectId`, `siteSettings`, `isLoading`, `locale`             |
| **Constants**        | UPPER_SNAKE_CASE (if truly constant)      | `ADMIN_EMAIL`, `DEFAULT_LOCALE`                                |
| **Functions**        | camelCase                                 | `getProjects()`, `submitContact()`, `useTranslations()`        |
| **Components**       | PascalCase                                | `ProjectCard`, `ContactForm`, `LocaleSwitcher`                 |
| **Types/Interfaces** | PascalCase                                | `Project`, `ContactSubmission`, `LocaleString`                 |
| **GROQ Queries**     | Inline or kebab-case alias                | `getProjects`, `getProjectBySlug`                              |
| **Env Vars**         | UPPER*SNAKE_CASE with NEXT_PUBLIC* prefix | `NEXT_PUBLIC_SANITY_PROJECT_ID`, `SANITY_REVALIDATE_SECRET`    |
| **Locales**          | lowercase 2-letter code                   | `'en'`, `'es'` (not 'EN', 'ES')                                |
| **Section anchors**  | lowercase hyphenated                      | `id="about"`, `id="contact"` (in JSX/HTML)                     |

---

## Hash-Anchor Navigation Pattern

**When to use:** Same-page scroll navigation (e.g., About and Contact sections on homepage).

**Pattern:**

```tsx
// Navigation (use native <a> for hash anchors, not next-intl Link)
<a href={`/${locale}#about`} className="nav-link">
  About
</a>

// Section definition (same page)
<section id="about" className="py-24">
  <h2>About Me</h2>
  ...
</section>
```

**Why not next-intl Link?**

- `Link` from next-intl triggers full page navigation (uses router.push)
- Router.push with hash-only path (#about) is treated as a route change
- This causes hydration issues with ThemeProvider and other hydration-sensitive components
- Native `<a>` provides browser-native hash navigation without client-side routing

**Rule:** Use native `<a href="/{locale}#anchor">` for same-page navigation. Use next-intl `Link` only for full route changes (pages, blog posts, projects).

---

## ISR Cache Pattern

**Goal:** Content updates reflect within seconds via Sanity webhook, fallback to 1-hour revalidate.

### Query with `unstable_cache` + Locale Cache Keys

```typescript
// lib/sanity-queries.ts
export const getProjects = (locale: string) =>
  unstable_cache(
    async () =>
      sanityFetch<Array<Project>>({
        query: groq`*[_type == "project"] | order(publishedAt desc) { ... }`,
        params: { locale },
      }),
    [`localized-v3-projects-${locale}`], // Per-locale cache key
    { tags: ['projects'], revalidate: 3600 } // Collection tag + 1h TTL
  )()

// Usage in page
const projects = (await getProjects(locale)) ?? []
```

### Webhook Revalidation

```typescript
// app/api/revalidate-tag/route.ts
const TAG_MAP: Record<string, string[]> = {
  project: ['projects'],
  post: ['posts'],
  siteSettings: ['site-settings'],
  skill: ['skills', 'projects', 'experiences', 'certifications'],
}

const tags = TAG_MAP[body._type] ?? []
for (const tag of tags) {
  revalidateTag(tag) // Instantly invalidates cache
}
```

### Key Rules

1. **Always use `?? []` for null-coalescing** — Build may not have Sanity env vars
2. **Per-locale cache keys** — include locale in the `unstable_cache` key
3. **Collection revalidation tags** — webhook calls collection tags such as `projects`, `posts`, `skills`
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
  const { error } = await supabase.from('contact_submissions').insert({ name, email, message })

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
          "cover": coalesce(cover.asset->url, featuredImage.asset->url),
          "tech": tech[]->{ _id, name, iconSlug, category, level }
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
3. **Reference expansion** — Use `->` to expand references (author->, tech[]->, image.asset->url)
4. **Asset URLs** — Extract via `asset->url` (Sanity CDN-enabled)
5. **Null handling** — Return `T | null` for single-document queries; wrap caller in `?? null`
6. **Caching key** — Use `[`project-${slug}-${locale}`]` to vary cache per route param and locale
7. **Tags strategy** — Include collection tags (`'projects'`) and route-specific tags (`'project:slug'`) where useful

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

const isValidSecret = await validatePreviewUrl(req.url, process.env.SANITY_STUDIO_REVALIDATE_SECRET)
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

**Setup:** `npm run test:smoke:local` (localhost:3000) or `npm run test:smoke` (production)

**Three test suites:** pages.spec.ts (health/navigation), i18n-bilingual.spec.ts (routing/message parity), content-model.spec.ts (schema/query contracts).

**Key contracts tested:**
- Routing: `locales: ['en', 'es']`, `defaultLocale: 'en'`, `localePrefix: 'always'`
- Message parity: leafKeys(en.json) === leafKeys(es.json)
- Static rendering: all locale pages load without console errors
- Content model: Sanity schema registry, query exports, cache version 'localized-v3'

**Timing:** ~7-10 seconds against production. Runs in CI post-deploy.

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

## SEO Metadata Patterns

### Locale-Aware Canonical Links (All Locales Always Prefixed)

For pages with locale variants (EN/ES), use `generateMetadata` to generate self-referential canonicals per locale. Note: `localePrefix: 'always'` means English URLs are always `/en/path`, never bare `/path`.

```typescript
// app/[locale]/about/page.tsx
import { localeAlternates } from '@/lib/metadata'
import { getTranslations } from 'next-intl'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `https://emudev.cc/${locale}/about`, // Self-referential (always /en, never bare)
      languages: localeAlternates('/about', locale), // Hreflang: /en/about, /es/about, /en/about (x-default)
    },
    openGraph: {
      url: `https://emudev.cc/${locale}/about`,
    },
  }
}

export default async function AboutPage({ params }) {
  const { locale } = await params
  // ...
}
```

**Key Rules:**

1. **All locale pages use `generateMetadata`** — not `export const metadata` (can't access locale at static time)
2. **Pass locale to `localeAlternates(pathname, locale)`** — generates hreflang for `/en/path`, `/es/path`, `/en/path` (x-default). Never bare paths.
3. **Self-referential canonical** — `/en/about` has canonical `/en/about` (always prefixed due to `localePrefix: 'always'`)
4. **Dynamic routes** — `/[locale]/blog/[slug]` calls `localeAlternates('/blog/${slug}', locale)` to include slug in alternates

---

## Breaking Changes & Migrations

When making breaking changes: (1) update CHANGELOG with migration guide, (2) create deprecation period if possible, (3) notify in release notes, (4) test locally, (5) update related docs.

---

## CSS Design Tokens Naming Conventions

**Dark-first token system in `app/globals.css` uses consistent naming patterns:**

| Category | Pattern | Examples |
|----------|---------|----------|
| **Colors (brand)** | `--{name}` | `--accent`, `--accent-soft`, `--status-ok` |
| **Canvas/background** | `--canvas` | `--canvas: #0f0f10` (dark), `#f0eee9` (light) |
| **Surfaces (opacity)** | `--surface-{level}` | `--surface-1`, `--surface-2`, `--surface-input` |
| **Borders** | `--hairline`, `--hairline-mid` | Light opacity on dark, dark on light |
| **Foreground/text** | `--fg-{level}` (opacity scale) | `--fg-1` (primary) → `--fg-4` (quaternary) |
| **Type scale** | `--t-{size}` | `--t-display`, `--t-h1`, `--t-body`, `--t-label` |
| **Line height** | `--lh-{variant}` | `--lh-display`, `--lh-heading`, `--lh-body` |
| **Spacing** | `--s-{1..10}` | `--s-1` (4px) → `--s-10` (56px) |
| **Radii** | `--r-{component}` or `--radius` | `--r-input`, `--r-card`, `--r-pill` |
| **Shadows** | `--shadow-{type}` | `--shadow-dock` (elevated), `--shadow-glow-ok` (status) |
| **Font families** | `--font-{type}` | `--font-sans`, `--font-mono` |
| **Animation** | `--ease`, `--dur{-variant}` | `--dur-fast` (0.15s), `--dur` (0.2s) |

**Key rules:**
- All color tokens defined at `:root` (dark) with `[data-theme="light"]` overrides
- No hardcoded hex/rgb values in components; use CSS variable or Tailwind utility
- Type scale and spacing use numeric scales (1-10) for hierarchy
- Radii use semantic names (input, btn, card, dock, pill) matching component use case

---

## Magic UI & Component Installation

**Status:** Phase 9.1-9.2 ✅ complete. 12 Magic UI components installed (10 free-tier, 2 Pro local). See `docs/design-guidelines.md` for component details.

**Quick reference:** Free-tier components auto-installed via shadcn CLI. Pro components (MagicCard, Lens) are API-compatible local copies. All use `cn()` utility from `lib/utils.ts` for class merging. `AnimatedShinyText` used in chat widget bubble.

---

## AI Chat Integration

### System Prompt Pattern (Locale-Aware)

**File:** `lib/chat/system-prompt.ts`

```typescript
// PREAMBLE: warmer tone, explicit rules
const PREAMBLE = `You are an AI assistant for Esteban's portfolio...
Never decline questions about my career, projects, or skills...`

// Language-lock instructions per locale
const LANG_INSTRUCTIONS = {
  'es': 'Responde SIEMPRE en español.',
  'en': 'Respond in English.',
}

export function buildSystemPromptForLocale(locale?: string) {
  const lang = locale || 'en'
  const instruction = LANG_INSTRUCTIONS[lang as keyof typeof LANG_INSTRUCTIONS] || LANG_INSTRUCTIONS['en']
  return `${PREAMBLE}\n\n${instruction}`
}
```

**Usage in API route:**

```typescript
// app/api/chat/route.ts
const body = await req.json()
const locale = (['en', 'es'].includes(body.locale) ? body.locale : 'en')
const systemPrompt = buildSystemPromptForLocale(locale)
```

**Key points:**
- System prompt appends locale-specific language lock to ensure bot responds in user's language
- Caller passes `locale` from POST body; validated to ['en', 'es']
- Defaults to 'en' if missing or invalid

### Speech Recognition & Synthesis (Voice I/O)

**Files:** `hooks/use-speech-recognition.ts`, `hooks/use-speech-synthesis.ts`

**Recognition pattern (stable instance):**

```typescript
// Create recognition ONCE on mount
const recognitionRef = useRef<SpeechRecognition | null>(null)
const onTranscriptRef = useRef(onTranscript) // Stable callback ref

useEffect(() => {
  recognitionRef.current = new (window.SpeechRecognition || ...)(...)
  recognitionRef.current.onresult = (e) => {
    onTranscriptRef.current?.(e.results[e.results.length - 1][0].transcript)
  }
}, []) // Empty deps: one instance per component mount

// Update language imperatively without teardown
useEffect(() => {
  if (recognitionRef.current) {
    recognitionRef.current.lang = `${lang}-${langRegion[lang]}`
  }
}, [lang]) // Only lang dependency
```

**Synthesis pattern (voice selection cascade):**

```typescript
const PREFERRED_VOICES = {
  es: ['Paulina', 'Monica', 'Google español', ...],
  en: ['Samantha', 'Google US English', ...],
}

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices()
  const preferred = PREFERRED_VOICES[lang as keyof typeof PREFERRED_VOICES] || []
  
  // Try preferred names → exact locale match → any prefix match
  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name))
    if (v) return v
  }
  return voices.find(v => v.lang.startsWith(lang)) || null
}
```

---

## Lazy-Loading Pattern (`next/dynamic` with SSR: false)

For client-only components (Three.js, speech APIs, etc.) in server components:

**Pattern:**

```typescript
// components/ui/component-loader.tsx (Client Component shim)
'use client'
import dynamic from 'next/dynamic'

export const HeavyComponent = dynamic(
  () => import('./heavy-component').then(m => m.HeavyComponent),
  { ssr: false }  // Skip SSR; load only on client
)

// pages/page.tsx (Server Component)
import { HeavyComponent } from '@/components/ui/component-loader'
export default async function Page() {
  return <HeavyComponent />  // Renders on client; skipped during SSR
}
```

**Current usage:**

| Component | File | Purpose |
|-----------|------|---------|
| `HeroBackground` | `components/ui/hero-background-loader.tsx` | Three.js particle network |
| `AIChatWidget` | `components/layout-widgets.tsx` | Full chat with voice + avatar |
| `DotPattern` | `components/layout-widgets.tsx` | Background pattern |
| `SkillsSection` | `app/[locale]/page.tsx` | Lazy-loaded section (not critical) |
| `SocialPostsGrid` | `app/[locale]/page.tsx` | Lazy-loaded social feed |
| `ContactSection` | `app/[locale]/page.tsx` | Lazy-loaded contact form |

**Key rules:**
1. Loader file must be Client Component ('use client' at top)
2. Dynamic import returns module; extract with `.then(m => m.Export)`
3. Parent can be Server Component (loader acts as boundary)
4. No props passed through loader; use props in actual component

---

## Performance Considerations

- **Bundle Size:** Monitor with `npm run build`; lazy-load heavy components (SkillsSection, SocialPostsGrid, ContactSection use `next/dynamic`)
- **Cache Strategy:** Per-locale tags prevent cross-locale pollution; 1-hour TTL + webhook revalidation
- **Database:** Use RLS to prevent N+1 queries; index frequently-queried fields
- **Images:** Use Sanity CDN for all images; rely on Next.js image optimization
- **API Calls:** Minimize external service calls; wrap in try/catch for reliability
- **Speech APIs:** Instantiate only on client; handle browser compatibility (webkit prefix fallback)
