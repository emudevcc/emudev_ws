---
phase: 3
title: "Supabase Setup"
status: complete
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 3: Supabase Setup

## Overview

Configure 3 isolated Supabase projects (dev/staging/prod), write SQL migrations with RLS policies for the portfolio (public read, admin-only write), set up magic-link auth for the admin dashboard, generate TypeScript types, and wire the Supabase client for both browser and server-side usage in Next.js.

## Key Insights

- **3 isolated projects:** Each environment (dev/staging/prod) gets its own Supabase project — no shared resources. Schema propagates via `supabase db push` in CI.
- **RLS is allow-by-default without policies:** Always enable RLS + write explicit policies. Never rely on "no policies = deny all".
- **Admin auth:** Use Magic Link (OTP) for single-user admin — lower friction than OAuth for a personal site. GitHub OAuth is an acceptable alternative.
- **`supabase db push` requires service_role key**, not anon key. Never use service_role on the client side.
- **Type generation:** `supabase gen types typescript` outputs `src/types/supabase.types.ts`. Run after every schema change.
- **Server-side Supabase:** Use `@supabase/ssr` for Next.js App Router (cookie-based session management). Browser client uses `@supabase/supabase-js`.

## Requirements

**Functional:**
- `supabase/migrations/` contains all schema migrations (versioned in git)
- Tables: `contact_submissions`, `portfolio_projects` (admin cache/override, optional)
- RLS enabled on all tables with explicit policies
- Admin auth via Magic Link (Supabase Auth)
- Supabase browser client and server client configured
- TypeScript types generated and committed

**Non-functional:**
- `supabase db push` applies cleanly to fresh project
- Zero RLS warnings in Supabase dashboard

## Architecture

```
supabase/
├── migrations/
│   ├── 20260507000001_create-contact-submissions.sql
│   └── 20260507000002_create-rls-policies.sql
└── config.toml               ← local dev config (supabase init)

lib/
├── supabase.ts               ← browser client (Phase 1 stub, update here)
└── supabase-server.ts        ← server client (App Router cookies)

types/
└── supabase.types.ts         ← auto-generated via supabase CLI
```

**RLS model:**
```
contact_submissions
  ├── SELECT: admin only (auth.email() = 'admin@...')
  ├── INSERT: public (anon) ← contact form submissions
  └── UPDATE/DELETE: admin only

portfolio_projects (optional admin override table)
  ├── SELECT: public (anyone can read published=true rows)
  └── INSERT/UPDATE/DELETE: admin only
```

## Related Code Files

**Create:**
- `supabase/migrations/20260507000001_create-contact-submissions.sql`
- `supabase/migrations/20260507000002_create-rls-policies.sql`
- `lib/supabase-server.ts`
- `types/supabase.types.ts` (generated)

**Modify:**
- `lib/supabase.ts` — typed with generated Database type

## Implementation Steps

1. **Link to dev Supabase project** (run once per machine):
   ```bash
   supabase login
   supabase link --project-ref {DEV_PROJECT_REF}
   ```

2. **Create contact submissions migration**:
   `supabase/migrations/20260507000001_create-contact-submissions.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS contact_submissions (
     id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name        TEXT NOT NULL,
     email       TEXT NOT NULL,
     message     TEXT NOT NULL,
     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
   );

   ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
   ```

3. **Create RLS policies migration**:
   `supabase/migrations/20260507000002_create-rls-policies.sql`:
   ```sql
   -- contact_submissions: public INSERT (contact form), admin SELECT
   CREATE POLICY "public_insert_contact" ON contact_submissions
     FOR INSERT TO anon WITH CHECK (true);

   CREATE POLICY "admin_read_contact" ON contact_submissions
     FOR SELECT
     USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

   CREATE POLICY "admin_delete_contact" ON contact_submissions
     FOR DELETE
     USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));
   ```

   Set app setting in Supabase dashboard → SQL Editor:
   ```sql
   ALTER DATABASE postgres SET app.admin_email = 'your@email.com';
   ```

4. **Apply migrations to dev**:
   ```bash
   supabase db push
   ```

5. **Configure server client** — `lib/supabase-server.ts`:
   ```typescript
   import { createServerClient } from '@supabase/ssr'
   import { cookies } from 'next/headers'
   import type { Database } from '@/types/supabase.types'

   export async function createSupabaseServerClient() {
     const cookieStore = await cookies()
     return createServerClient<Database>(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           getAll() { return cookieStore.getAll() },
           setAll(cookiesToSet) {
             cookiesToSet.forEach(({ name, value, options }) =>
               cookieStore.set(name, value, options))
           },
         },
       },
     )
   }

   export async function createSupabaseAdminClient() {
     const cookieStore = await cookies()
     return createServerClient<Database>(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.SUPABASE_SERVICE_ROLE_KEY!,
       {
         cookies: {
           getAll() { return cookieStore.getAll() },
           setAll(cookiesToSet) {
             cookiesToSet.forEach(({ name, value, options }) =>
               cookieStore.set(name, value, options))
           },
         },
       },
     )
   }
   ```

6. **Update browser client** — `lib/supabase.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   import type { Database } from '@/types/supabase.types'

   export const supabase = createClient<Database>(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
   )
   ```

7. **Set up Magic Link auth** (Supabase dashboard per project):
   - Authentication → Email → Enable Magic Link
   - Set Site URL: `https://{environment-domain}`
   - Add redirect URLs for each env: `http://localhost:3000`, `https://dev.{domain}`, `https://qa.{domain}`, `https://{domain}`

8. **Create admin auth Server Action** — `app/actions/auth.ts`:
   ```typescript
   'use server'
   import { createSupabaseServerClient } from '@/lib/supabase-server'
   import { redirect } from 'next/navigation'

   export async function sendMagicLink(formData: FormData) {
     const email = formData.get('email') as string
     const supabase = await createSupabaseServerClient()
     const { error } = await supabase.auth.signInWithOtp({ email })
     if (error) return { error: error.message }
     return { success: true }
   }

   export async function signOut() {
     const supabase = await createSupabaseServerClient()
     await supabase.auth.signOut()
     redirect('/')
   }
   ```

9. **Generate TypeScript types**:
   ```bash
   # Add to package.json scripts:
   # "supabase:types": "supabase gen types typescript --linked > types/supabase.types.ts"
   npm run supabase:types
   ```
   Commit `types/supabase.types.ts`.

10. **Apply to staging + prod** (done in CI — Phase 5):
    - Dev: auto-applied via `supabase db push` on merge to `develop`
    - Staging: applied in `deploy-staging` job
    - Prod: applied in `deploy-prod` job (with manual approval gate)

11. **Add package.json scripts**:
    ```json
    "supabase:types": "supabase gen types typescript --linked > types/supabase.types.ts",
    "supabase:push": "supabase db push"
    ```

## Todo List

- [ ] Run `supabase link --project-ref {DEV_PROJECT_REF}`
- [ ] Create migration: `contact_submissions` table with RLS enabled
- [ ] Create migration: RLS policies (public INSERT, admin SELECT/DELETE)
- [ ] Set `app.admin_email` in Supabase dashboard SQL editor (all 3 projects)
- [ ] Run `supabase db push` to apply to dev project
- [ ] Create `lib/supabase-server.ts` with server + admin client factories
- [ ] Update `lib/supabase.ts` with typed Database generic
- [ ] Create `app/actions/auth.ts` with magic link + sign-out actions
- [ ] Configure Magic Link + redirect URLs in all 3 Supabase dashboards
- [ ] Run `npm run supabase:types` and commit `types/supabase.types.ts`
- [ ] Verify zero RLS warnings in Supabase dashboard

## Success Criteria

- [ ] `supabase db push` applies migrations cleanly to dev project
- [ ] Contact form can INSERT into `contact_submissions` via anon key
- [ ] Non-admin SELECT on `contact_submissions` returns no rows (RLS blocks)
- [ ] `types/supabase.types.ts` contains `Database` type with all tables
- [ ] Magic link email sends successfully in dev (check Supabase Auth logs)
- [ ] Admin client uses `SUPABASE_SERVICE_ROLE_KEY` (never exposed to browser)

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| RLS policy misconfiguration | Critical | Test public vs. admin access explicitly before Phase 4 |
| Schema drift across 3 projects | High | Always apply via `supabase db push` in CI; never edit schema in dashboard |
| Service role key in browser bundle | Critical | Only import `supabase-server.ts` in Server Components/Actions |
| Magic link redirect misconfigured | Medium | Test all 3 environments; set Site URL per project |

## Security Considerations

- `SUPABASE_SERVICE_ROLE_KEY` — server-only; never in `NEXT_PUBLIC_*` vars
- RLS enabled on every table from day one — no exceptions
- Admin email hardcoded in DB setting (not in env vars exposed to client)
- Magic Link expiry: 1 hour (Supabase default) — acceptable for personal portfolio

## Next Steps

- Phase 4: Use `createSupabaseServerClient()` in contact form Server Action
- Phase 5: CI pipeline applies `supabase db push` to each environment on deploy
