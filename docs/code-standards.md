# Code Standards

## TypeScript & Type Safety

### Type Definitions

1. **Sanity types** (`types/sanity.types.ts`) — Hand-written stubs, not codegen
   - Update manually after schema changes: `sanity typegen generate`
   - Export document interfaces (Project, Post, Author, Tag, SiteSettings)
   - Includes utility types: Slug, SanityImageAsset, SanityDocument

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
| **Files** | kebab-case | `contact-form.tsx`, `sanity-queries.ts` |
| **Directories** | kebab-case | `app/projects/[slug]/`, `lib/`, `types/` |
| **Variables** | camelCase | `projectId`, `siteSettings`, `isLoading` |
| **Constants** | UPPER_SNAKE_CASE (if truly constant) | `ADMIN_EMAIL` |
| **Functions** | camelCase | `getProjects()`, `submitContact()` |
| **Components** | PascalCase | `ProjectCard`, `ContactForm`, `HeroSection` |
| **Types/Interfaces** | PascalCase | `Project`, `ContactSubmission` |
| **GROQ Queries** | Inline or kebab-case alias | `getProjects`, `getProjectBySlug` |
| **Env Vars** | UPPER_SNAKE_CASE with NEXT_PUBLIC_ prefix | `NEXT_PUBLIC_SANITY_PROJECT_ID`, `SANITY_REVALIDATE_SECRET` |

---

## ISR Cache Pattern

**Goal:** Content updates reflect within seconds via Sanity webhook, fallback to 1-hour revalidate.

### Query with `unstable_cache` + Tags

```typescript
// lib/sanity-queries.ts
export const getProjects = unstable_cache(
  async () =>
    sanityFetch<Array<Project>>({
      query: groq`*[_type == "project"] | order(publishedAt desc) { ... }`,
    }),
  ['projects'],                    // cache key (for debugging)
  { tags: ['projects'], revalidate: 3600 } // tags + 1 hour TTL
)

// Usage in page
const projects = (await getProjects()) ?? []
```

### Webhook Revalidation

```typescript
// app/api/revalidate-tag/route.ts
const TAG_MAP: Record<string, string[]> = {
  project: ['projects'],
  post: ['posts'],
  siteSettings: ['site-settings'],
}

const tags = TAG_MAP[body._type] ?? []
for (const tag of tags) {
  revalidateTag(tag) // instantly invalidates cache
}
```

### Key Rules

1. **Always use `?? []` for null-coalescing** — Build may not have Sanity env vars
2. **Per-route slugs get individual tags** — `getProjectBySlug(slug)` uses `['projects', 'project:slug']`
3. **Headers matter** — Webhook secret in header (x-sanity-webhook-secret), never query params
4. **Fallback is time-based** — If webhook fails/is missed, 1-hour TTL still revalidates

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

All GROQ queries use `unstable_cache` with revalidation tags.

### Basic Structure

```typescript
import { unstable_cache } from 'next/cache'
import { groq } from 'next-sanity'
import { sanityFetch } from './sanity-client'

export const getProjectBySlug = (slug: string) =>
  unstable_cache(
    async () =>
      sanityFetch<Project | null>({
        query: groq`*[_type == "project" && slug.current == $slug][0] {
          ...,
          "featuredImage": featuredImage.asset->url,
          tags[]->{ _id, title }
        }`,
        params: { slug }, // parameterized queries (prevents injection)
      }),
    [`project-${slug}`],
    { tags: ['projects', `project:${slug}`], revalidate: 3600 }
  )()
```

### Key Points

1. **Parameterized queries** — Always use `params: { slug }` in GROQ
2. **Reference expansion** — Use `->` to expand references (author->, tags[]->, image.asset->url)
3. **Asset URLs** — Extract via `asset->url` (Sanity CDN-enabled)
4. **Null handling** — Return `T | null` for single-document queries; wrap caller in `?? null`
5. **Caching key** — Use `[`project-${slug}`]` to vary cache per route param

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
```

**Pattern:** Use `@sanity/preview-url-secret` for robust token validation.

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

## Component Structure

### Functional Components (Preferred)

```typescript
// components/project-card.tsx
interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="rounded-lg border p-6">
      <h3 className="text-lg font-semibold">{project.title}</h3>
      {/* content */}
    </article>
  )
}
```

### Client vs Server Components

| Type | When | Example |
|------|------|---------|
| **Server** (default) | Data fetching, secrets, static | Page components, data fetching |
| **Client** (`'use client'`) | Interactivity, hooks, state | Forms, modals, Sonner toasts |
| **Hybrid** | Fetch on server, render interactive on client | Page with server-side data + client buttons |

---

## Error Handling

### Try-Catch for External Services

```typescript
// Email is best-effort; don't fail the user
try {
  await resend.emails.send({ /* ... */ })
} catch (err) {
  console.error('[contact] Resend notification failed:', err)
  // Continue — DB insert is authoritative
}
```

### NotFound for Missing Content

```typescript
export default async function PostPage({ params }) {
  const post = await getPostBySlug(params.slug)
  if (!post) {
    notFound() // Renders 404, not null/error
  }
  return <PostDetail post={post} />
}
```

### Validation Errors in Server Actions

```typescript
if (name.length > 100) {
  return { error: 'Name is too long.' }
}
// Return structured state; client displays via useActionState
```

---

## Styling with Tailwind CSS v4

### Utility-First

```tsx
<button className="rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity disabled:opacity-60">
  Send
</button>
```

### CSS Variables (Semantic)

```css
/* Defined in globals.css or tailwind.config.ts */
--background: #ffffff
--foreground: #000000
--muted-foreground: #666666
--destructive: #ff0000
```

**Usage:**
```tsx
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">Secondary text</p>
  <p className="text-destructive">Error message</p>
</div>
```

### Responsive Breakpoints

```tsx
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* Mobile: 1 col, Tablet (md): 2 cols, Desktop (lg): 3 cols */}
</div>
```

### Animation & Transitions

```tsx
<button className="transition-opacity disabled:opacity-60">
  {/* opacity changes smoothly */}
</button>

<div className="animate-pulse">
  {/* Tailwind built-in animations */}
</div>
```

---

## Performance Considerations

1. **Image optimization** — Sanity CDN serves images; no next/image needed for CMS images
2. **Bundle splitting** — App Router auto-code-splits per route
3. **ISR revalidate** — Set to 1 hour for non-critical content; 5-10 min for frequently updated
4. **Avoid client-side fetching** — Use server actions or page-level queries instead
5. **Monitor build time** — Aim for <3 min; profile if exceeding

---

## Git & Commit Standards

### Branch Workflow

**Merge path:** `feature/*` → `develop` → `staging` → `main`

```
feature/phase-6-cloudflare  ──PR──►  develop  ──PR──►  staging  ──PR──►  main
hotfix/fix-broken-form       ──PR──►  main (auto-deploy, backports to develop)
```

**Rules:**
- Never commit directly to `main`, `staging`, or `develop`
- Branch from `develop` for all new phases, features, and fixes
- Branch from `main` only for hotfixes
- Delete feature branches after merge
- PR title must follow conventional commit format (used as merge commit message)

**Naming:**
```bash
feature/phase-6-cloudflare       # new phase
feature/add-dark-mode-toggle     # new feature
fix/contact-form-validation      # bug fix
hotfix/broken-rls-policy         # emergency production fix
```

### Conventional Commits

```
feat: add project archive feature
fix: correct null guard in sanity query
docs: update deployment guide
refactor: extract sanity query helper
test: add smoke tests for blog routes
chore: upgrade next.js to 15.6
```

### Pre-Commit Hooks (Husky + lint-staged)

Only Prettier runs (ESLint via separate `npm run lint` in CI):
```json
{
  "*.{ts,tsx,mjs}": ["prettier --write"],
  "*.{json,css}": ["prettier --write"]
}
```

**Note:** ESLint v9 (not v10) required for compatibility with eslint-plugin-react@7.x.

---

## Security Checklist

- [ ] No API keys or credentials in `.env.local` (use GitHub Secrets)
- [ ] Webhook secrets in headers, not query params
- [ ] HTML escaping before email (use utility function)
- [ ] RLS policies test in staging before production
- [ ] TypeScript strict mode enabled
- [ ] Input validation on server (not client)
- [ ] CORS/CSP headers in `next.config.ts` if needed
- [ ] Sanitize user input before storage (SQL injection, XSS)
