---
phase: 3
title: "Frontend Wiring & Cleanup"
status: complete
priority: P2
effort: "1h"
dependencies: [phase-01-schema-query, phase-02-adapter-layer]
---

# Phase 3: Frontend Wiring & Cleanup

## Overview

Wire the real Sanity data into `SocialPostsGrid`, apply the adapter, add an empty state, make filter tabs dynamic (only show platforms with actual items), and delete the dummy data file.

## Requirements

- Functional:
  - `SocialPostsGrid` uses the real `posts` prop instead of `SOCIAL_DUMMY_ITEMS`
  - `adaptSocialPosts()` called in the section component (server side) before passing items to `SocialFeedGrid`
  - Empty state rendered when no posts exist in Sanity
  - Filter tabs in `SocialFeedGrid` only show platforms present in the current item set
  - `lib/social-dummy-data.ts` deleted
- Non-functional:
  - No new client JS — adapter runs in the Server Component
  - `SocialFeedGrid` prop type unchanged (`items: SocialItem[]`)

## Architecture

```
app/[locale]/page.tsx
  getSocialPosts(locale)          ← already fetches from Sanity
       │ SocialPost[]
       ▼
components/sections/SocialPostsGrid.tsx   ← Server Component
  adaptSocialPosts(posts)
       │ SocialItem[]
       ▼
components/ui/social-feed-grid.tsx        ← Client Component
  dynamic TABS from item platforms
  filter + paginate
```

## Related Code Files

- Modify: `components/sections/SocialPostsGrid.tsx`
- Modify: `components/ui/social-feed-grid.tsx`
- Delete: `lib/social-dummy-data.ts`

## Implementation Steps

1. **Update `SocialPostsGrid`** (`components/sections/SocialPostsGrid.tsx`):

```tsx
import { adaptSocialPosts } from '@/lib/social-adapters'
import type { SocialPost } from '@/lib/sanity-queries'

export function SocialPostsGrid({ posts }: { posts: SocialPost[] }) {
  const t = useTranslations('social')
  const items = adaptSocialPosts(posts)

  return (
    <section id="social" className="mx-auto max-w-6xl px-5 py-24">
      <BlurFade delay={0}>
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
          {t('eyebrow')}
        </p>
        <h2 className="mb-10 text-4xl font-bold tracking-tight">{t('title')}</h2>
      </BlurFade>

      {items.length === 0 ? (
        <BlurFade delay={0.08}>
          <p className="font-mono text-sm text-fg-3">{t('empty')}</p>
        </BlurFade>
      ) : (
        <BlurFade delay={0.08}>
          <SocialFeedGrid items={items} />
        </BlurFade>
      )}
    </section>
  )
}
```

Remove the `SOCIAL_DUMMY_ITEMS` import entirely.

2. **Add `empty` i18n key** to `messages/en.json` and `messages/es.json`:
   ```json
   "social": {
     "eyebrow": "...",
     "title": "...",
     "empty": "No posts yet — check back soon."
   }
   ```
   Spanish: `"empty": "Aún no hay publicaciones — vuelve pronto."`

3. **Make filter tabs dynamic** in `SocialFeedGrid` (`components/ui/social-feed-grid.tsx`):

   Replace the static `TABS` constant with a derived list computed from the items:

   ```ts
   // Before (static):
   const TABS: { id: FilterId; label: string }[] = [
     { id: 'all', label: 'All' },
     { id: 'youtube', label: 'YouTube' },
     ...
   ]

   // After (dynamic — inside the component):
   const PLATFORM_LABELS: Record<SocialItem['platform'], string> = {
     youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram',
     reddit: 'Reddit', x: 'X', threads: 'Threads',
   }

   const activePlatforms = useMemo(
     () => [...new Set(items.map((i) => i.platform))].sort(),
     [items]
   )

   const tabs = useMemo<{ id: FilterId; label: string }[]>(
     () => [
       { id: 'all', label: 'All' },
       ...activePlatforms.map((p) => ({ id: p, label: PLATFORM_LABELS[p] })),
     ],
     [activePlatforms]
   )
   ```

   Replace `TABS` with `tabs` in the JSX render loop. The static `TABS` constant is deleted.

   Also reset `active` to `'all'` when `items` changes (guards against stale filter after locale switch):
   ```ts
   useEffect(() => { setActive('all'); setPage(1) }, [items])
   ```

4. **Delete `lib/social-dummy-data.ts`** — no longer needed.

5. **Run typecheck**: `npm run typecheck` — verify no errors.

## Success Criteria

- [x] `SocialPostsGrid` uses `posts` prop (real Sanity data), `SOCIAL_DUMMY_ITEMS` import removed
- [x] Empty state message renders when `posts` is empty
- [x] Filter tabs only show platforms present in actual data (e.g. only "All / X / Reddit" for real posts)
- [x] `lib/social-dummy-data.ts` deleted
- [x] `messages/en.json` and `messages/es.json` have `social.empty` key
- [x] `npm run typecheck` passes
- [x] Smoke test `message namespaces and keys match` still passes

## Verification

- Updated `components/sections/SocialPostsGrid.tsx` to adapt and render real Sanity posts.
- Updated `components/ui/social-feed-grid.tsx` to derive filter tabs from the current item set.
- Deleted `lib/social-dummy-data.ts`.
- Added `social.empty` to `messages/en.json` and `messages/es.json`.
- Ran `npm run typecheck`, `npm run lint`, `npx playwright test tests/smoke/i18n-bilingual.spec.ts --reporter=list`, and `npm run build` successfully.

## Risk Assessment

- **Smoke test**: `i18n-bilingual.spec.ts` checks that en/es message keys match. Adding `social.empty` to both files keeps it green.
- **Empty `items` array**: `SocialFeedGrid` pagination (`Math.ceil(0/9) === 0`) and filter logic handle this gracefully — confirmed in the pagination plan.
- **`useEffect` on `items`**: Items reference changes on every server render if passed as a new array, but since `SocialFeedGrid` is a Client Component hydrated once, this only fires on locale navigation — correct behavior.
