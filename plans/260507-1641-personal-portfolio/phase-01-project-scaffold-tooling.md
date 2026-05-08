---
phase: 1
title: "Project Scaffold & Tooling"
status: complete
priority: P1
effort: "4h"
dependencies: []
---

# Phase 1: Project Scaffold & Tooling

## Overview

Bootstrap the Next.js 15 monorepo with App Router, TypeScript strict mode, Tailwind CSS v4, Magic UI Pro, ESLint/Prettier, and Husky pre-commit hooks. Establish the full directory structure and shared config files that all subsequent phases build on.

## Key Insights

- Next.js 15 App Router uses `'use cache'` + `cacheTag()`/`updateTag()` — newer than `revalidatePath()`. All data-fetching wrappers must use this pattern.
- Magic UI Pro components are `'use client'` only (Framer Motion inside). Wrap in client boundary when consuming from Server Components.
- `next-sanity` v5 dropped dynamic `getClient()` — use static import of client config.
- `@sanity/codegen` generates TypeScript types from schema; regenerate on every schema change and in CI pre-build.
- Tailwind CSS v4 uses CSS config (`@theme`) rather than `tailwind.config.js` — verify Magic UI Pro compatibility.

## Requirements

**Functional:**
- Next.js 15 project with App Router, TypeScript 5.5+, strict mode
- Tailwind CSS v4 + Magic UI Pro configured
- Path aliases (`@/`) working
- ESLint (Next.js recommended) + Prettier configured
- Husky + lint-staged pre-commit hooks
- `.env.example` with all required env var names (no values)
- `supabase/` directory initialized with CLI
- `sanity/` directory placeholder (schema added in Phase 2)

**Non-functional:**
- `npm run build` produces zero TS/lint errors on fresh scaffold
- `npm run dev` starts without errors (placeholder pages acceptable)

## Architecture

```
/                               ← git root
├── app/                        ← Next.js App Router
│   ├── layout.tsx              ← root layout (fonts, providers)
│   ├── page.tsx                ← home (placeholder)
│   ├── about/page.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── contact/page.tsx
│   └── api/
│       ├── health/route.ts     ← smoke test target
│       └── revalidate-tag/route.ts  ← Sanity ISR webhook
├── components/                 ← shared UI (server + client)
│   └── ui/                    ← Magic UI Pro wrappers
├── lib/
│   ├── sanity.client.ts        ← Sanity static client
│   ├── sanity-queries.ts       ← GROQ + cacheTag wrappers
│   └── supabase.ts             ← Supabase client (browser + server)
├── sanity/
│   └── schema.ts               ← placeholder
├── supabase/
│   └── migrations/             ← SQL migrations (Phase 3)
├── types/
│   └── sanity.types.ts         ← auto-generated (Phase 2)
├── tests/
│   └── smoke/                  ← Playwright smoke tests (Phase 7)
├── .github/
│   └── workflows/              ← CI/CD (Phase 5)
├── next.config.ts
├── tailwind.css                ← Tailwind v4 CSS entry
├── .env.example
├── .env.local                  ← gitignored
├── .eslintrc.json
├── .prettierrc
└── tsconfig.json
```

## Related Code Files

**Create:**
- `app/layout.tsx`
- `app/page.tsx` (placeholder)
- `app/about/page.tsx` (placeholder)
- `app/projects/page.tsx` (placeholder)
- `app/projects/[slug]/page.tsx` (placeholder)
- `app/blog/page.tsx` (placeholder)
- `app/blog/[slug]/page.tsx` (placeholder)
- `app/contact/page.tsx` (placeholder)
- `app/api/health/route.ts`
- `lib/sanity.client.ts`
- `lib/sanity-queries.ts`
- `lib/supabase.ts`
- `sanity/schema.ts` (empty export)
- `next.config.ts`
- `.env.example`
- `.eslintrc.json`
- `.prettierrc`
- `tailwind.css`

## Implementation Steps

1. **Bootstrap Next.js 15 project**
   ```bash
   npx create-next-app@latest . \
     --typescript \
     --tailwind \
     --app \
     --src-dir=false \
     --import-alias="@/*"
   ```

2. **Install core dependencies**
   ```bash
   npm install next-sanity@^5 sanity@^3 @sanity/codegen \
     @supabase/supabase-js @supabase/ssr \
     resend
   npm install -D @types/node typescript@5 \
     eslint eslint-config-next prettier \
     husky lint-staged @playwright/test
   ```

3. **Install Magic UI Pro**
   - Follow Magic UI Pro docs (user has license)
   - Verify components work with Next.js 15 App Router
   - Create `components/ui/` wrappers that add `'use client'` boundary

4. **Configure TypeScript** — `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "target": "ES2022",
       "paths": { "@/*": ["./*"] }
     }
   }
   ```

5. **Configure Next.js** — `next.config.ts`:
   ```typescript
   import type { NextConfig } from 'next'

   const config: NextConfig = {
     experimental: {
       dynamicIO: true,   // enables 'use cache' directive
     },
     images: {
       remotePatterns: [
         { protocol: 'https', hostname: 'cdn.sanity.io' },
       ],
     },
   }

   export default config
   ```

6. **Stub Sanity client** — `lib/sanity.client.ts`:
   ```typescript
   import { createClient } from 'next-sanity'

   export const client = createClient({
     projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
     dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
     apiVersion: '2024-01-01',
     useCdn: process.env.NODE_ENV === 'production',
   })

   export async function sanityFetch<T>({
     query,
     params = {},
     isDraft = false,
   }: {
     query: string
     params?: Record<string, unknown>
     isDraft?: boolean
   }): Promise<T> {
     return client.fetch<T>(query, params, {
       token: isDraft ? process.env.SANITY_API_READ_TOKEN : undefined,
       perspective: isDraft ? 'previewDrafts' : 'published',
     })
   }
   ```

7. **Stub Supabase client** — `lib/supabase.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   import type { Database } from '@/types/supabase.types'

   export const supabase = createClient<Database>(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
   )
   ```

8. **Health endpoint** — `app/api/health/route.ts`:
   ```typescript
   export async function GET() {
     return Response.json({ status: 'ok', ts: Date.now() })
   }
   ```

9. **Create `.env.example`** (all vars, no values):
   ```env
   # Sanity
   NEXT_PUBLIC_SANITY_PROJECT_ID=
   NEXT_PUBLIC_SANITY_DATASET=
   SANITY_API_READ_TOKEN=
   SANITY_REVALIDATE_SECRET=

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=

   # Email (Resend)
   RESEND_API_KEY=

   # Cloudflare (CI only)
   CF_API_TOKEN=
   CF_ZONE_ID=

   # Vercel (CI only)
   VERCEL_TOKEN=
   VERCEL_ORG_ID=
   VERCEL_PROJECT_ID=
   ```

10. **Set up Husky + lint-staged**:
    ```bash
    npx husky init
    # .husky/pre-commit
    echo "npx lint-staged" > .husky/pre-commit
    ```
    `package.json`:
    ```json
    "lint-staged": {
      "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
      "*.{json,md,css}": ["prettier --write"]
    }
    ```

11. **Initialize Supabase CLI**:
    ```bash
    supabase init
    ```
    Creates `supabase/` directory. Connect to dev project in Phase 3.

12. **Verify build**:
    ```bash
    npm run lint
    npm run build
    ```

## Todo List

- [ ] Bootstrap Next.js 15 with create-next-app
- [ ] Install all npm dependencies
- [ ] Install and configure Magic UI Pro
- [ ] Configure TypeScript strict + path aliases
- [ ] Configure next.config.ts with `dynamicIO: true`
- [ ] Create lib/sanity.client.ts stub
- [ ] Create lib/supabase.ts stub
- [ ] Create app/api/health/route.ts
- [ ] Create all placeholder page routes (home, about, projects, blog, contact)
- [ ] Create .env.example with all variable names
- [ ] Configure ESLint + Prettier
- [ ] Set up Husky pre-commit hooks
- [ ] Initialize Supabase CLI (`supabase init`)
- [ ] Verify `npm run build` passes with zero errors

## Success Criteria

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` produces zero TS/lint errors
- [ ] All placeholder routes return 200 in browser
- [ ] `/api/health` returns `{ status: 'ok' }`
- [ ] `.env.example` lists every required env var
- [ ] Husky pre-commit hook runs lint on staged files

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Magic UI Pro + Tailwind v4 incompatibility | Medium | Test one component immediately; fallback to manual Tailwind classes |
| `dynamicIO: true` breaks existing patterns | Low | Experimental flag — only affects `'use cache'` code paths |
| Supabase CLI version mismatch | Low | Pin `supabase@1.168.5` in devDependencies |

## Security Considerations

- `.env.local` in `.gitignore` — never commit real credentials
- `SUPABASE_SERVICE_ROLE_KEY` only used server-side
- `SANITY_API_READ_TOKEN` safe to use server-side for preview; never expose write token

## Next Steps

- Phase 2: Add Sanity schema, GROQ queries, Presentation preview, ISR webhook
- Phase 3: Create Supabase migrations, RLS policies, type generation
