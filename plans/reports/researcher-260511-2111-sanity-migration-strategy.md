# Sanity v3 Schema Expansion Strategy: Backward Compatibility & Migration Safety

**Research Date:** May 11, 2026 | **Status:** Complete  
**Context:** Next.js 15 + Sanity v3 (sanity@^3.99.0) + next-sanity@^5.5.11

---

## Executive Summary

Your existing Sanity v3 setup (using bilingual {en, es} field pattern and locale-aware GROQ queries) is production-stable and can safely expand from 5 document types to 13+ without data migration or query rewrites. The key is understanding Sanity's **schema-as-code** model: schema changes don't require migrations—only data migrations matter. Optional fields are always safe; deprecating `author` type requires careful reference handling.

**Ranked Recommendation:**
1. **Add new document types freely** — no migration cost
2. **Run typegen after each schema change** — on-demand, not per-commit
3. **Migrate existing references lazily** — deprecate `author` via schema-level guidance over 1-2 cycles
4. **Cache tag strategy** — create new tags following existing pattern; existing tags unchanged
5. **GROQ safety** — queries auto-ignore missing optional fields; projected fields must exist in schema

---

## 1. Additive Schema Changes (Safe to Add Optional Fields)

### What's Guaranteed Safe
**No data migration required** when:
- Adding new **optional fields** (no `validation: required()`)
- Adding new **document types** (entirely new types)
- Adding new **array fields** (e.g., `tags`, `gallery`)
- Adding **reference fields** (soft pointers; dangling refs are fine)

**Why:** Sanity stores documents as JSON. A missing optional field = `null` or `undefined`. Your GROQ queries already handle this pattern:
```groq
"title": coalesce(title[$locale], title.en)  // Falls back if title is null
"featuredImage": featuredImage.asset->url     // Returns null if field missing
```

### What Requires Care
- **Changing field type** (e.g., `slug` from `string` → `object`) — requires data transformation
- **Adding `required` validation** to existing optional fields — affects existing docs
- **Removing fields from schema** — data persists; remove only from Studio by deleting field definition

### Recommendations
1. **Always make new fields optional** in your expansion (experience, skill, certification all have optional fields)
2. **After adding fields**, run `npm run sanity:types` to update `types/sanity.types.ts` (immediate, not after commit)
3. **No data migration scripts needed** — Sanity handles schema drift automatically
4. **If deprecating existing optional fields**: Leave in schema for backward compat; remove from UI via `hidden: true` option

---

## 2. Deprecating `author` Document Type Safely

Current state: `post.author → reference → author` document.  
Goal: Move to `siteSettings.about` singleton (single author profile).

### Deprecation Strategy (Recommended: 2-Phase Over 2 Cycles)

**Phase A (This Cycle):**
1. Add `about` singleton to `siteSettings` with author fields (name, bio, image, social)
2. Add new optional field to `post`: `authorOverride?: reference` (for guest posts; leave empty for main author)
3. Keep existing `author` reference intact—**do not delete schema definition**
4. Update GROQ queries to prefer `authorOverride`, fallback to siteSettings.about:
   ```groq
   "author": coalesce(
     authorOverride->{ name, image },
     *[_type == "siteSettings"][0].about.profile
   )
   ```
5. Publish posts with new author pattern without forcing existing posts to relink

**Phase B (Next Cycle after team confirms):**
1. Run Sanity data transfer tool: migrate all `post.author` refs to inline `about` in siteSettings
2. Remove `author` reference field from `post` schema
3. Clean up queries (Phase A GROQ stays backward compatible either way)
4. Archive `author` document type (keep in schema definition but `hidden: true` in studio)

### Why This Approach
- **Zero downtime**: Posts continue rendering during Phase A
- **Reversible**: If Migration Phase B breaks something, revert schema; queries still work
- **Data integrity**: Sanity's reference expansion ensures dangling refs just return `null`
- **Next.js caching unaffected**: Cache tags stay same; data changes trigger webhook revalidation

---

## 3. TypeScript Types Regeneration Workflow

### When to Run `npm run sanity:types`
**After every schema addition/modification**, in this order:
1. Add field to schema file (e.g., `experience-type.ts`)
2. Update `sanity/schema.ts` to export new type
3. Run `npm run sanity:types` immediately
4. Verify TypeScript compiles: `npm run typecheck`
5. Commit both schema and generated types together

**Why immediate, not deferred:**
- Your `lib/sanity-queries.ts` and `types/sanity.types.ts` are source of truth for query parameters
- CI will fail if types drift from schema without regenerating
- Typegen is **fast** (<1s); safe to run anytime

### How Typegen Works
```bash
npm run sanity:types
  ├─ sanity schema extract              # Reads all /sanity/schemas/*.ts
  ├─ Builds schema.json (Sanity API format)
  ├─ sanity typegen generate             # Generates TypeScript defs
  └─ mv sanity.types.ts types/           # Moves to project types dir
```

Result: Auto-generated `types/sanity.types.ts` contains ALL document types + field unions.  
**Warning:** Don't hand-edit this file; regenerate instead.

### Gotchas After Adding 13+ Types
- **File size grows**: sanity.types.ts will reach ~800-1200 lines (still acceptable)
- **Import overhead**: If adding many types, ensure each has proper naming and preview
- **Circular references**: If `post` refs `experience` and `experience` refs `post`, Sanity resolves naturally (no issue)

---

## 4. Cache Tag Strategy for New Document Types

### Current Pattern (Your Project)
```typescript
// sanity-queries.ts
unstable_cache(
  async () => sanityFetch(...),
  [`${cacheVersion}-projects-${safeLocale}`],
  { tags: ['projects'], revalidate: 3600 }
)
```

**For new collections, replicate this pattern:**

```typescript
// New: Get all experiences
export const getExperiences = (locale?: string) => {
  const safeLocale = normalizeLocale(locale)
  return unstable_cache(
    async () => sanityFetch<ExperienceSummary[]>({ ... }),
    [`${cacheVersion}-experiences-${safeLocale}`],
    { tags: ['experiences'], revalidate: 3600 }
  )()
}

// New: Get single experience by slug
export const getExperienceBySlug = (slug: string, locale?: string) => {
  const safeLocale = normalizeLocale(locale)
  return unstable_cache(
    async () => sanityFetch<ExperienceDetail | null>({ ... }),
    [`${cacheVersion}-experience-${slug}-${safeLocale}`],
    { tags: ['experiences', `experience:${slug}`], revalidate: 3600 }
  )()
}
```

### Tag Naming Convention
- **Collection tags** (lowercase plural): `['experiences']`, `['skills']`, `['certifications']`
- **Item tags** (type:slug): `['experience:aws-architect']`, `['skill:typescript']`
- **Webhook revalidation** (in your `api/revalidate-tag` handler): Map Sanity `_type` → cache tag
  ```typescript
  const typeToTag: Record<string, string[]> = {
    experience: ['experiences'],
    skill: ['skills'],
    certification: ['certifications'],
    project: ['projects'],   // existing
    post: ['posts'],         // existing
  }
  ```

### No Changes to Existing Tags
- `['projects']`, `['posts']`, `['site-settings']` remain unchanged
- New types get new tags; no collision risk
- Webhook secret & endpoint stay same; just add new type mappings

---

## 5. GROQ Query Safety: Field Projection & Missing Fields

### What Happens if Schema Changes but Query Doesn't

**Scenario A: Add optional field, don't update query**
```typescript
// Schema now has: experience with optional tagline field
// Query still projects without tagline:
*[_type == "experience"] { title, description }

// Result: ✅ Works fine. Tagline simply not included in response.
```

**Scenario B: Project field that doesn't exist in some docs**
```typescript
// Query tries to project missing field:
*[_type == "experience"] { title, tagline, order }

// Result: ✅ Works. Returns null for docs without tagline/order.
```

**Scenario C: Reference to removed document type**
```typescript
// Schema removed "author" type, but query still tries:
"author": author->{ name }

// Result: ⚠️ Returns null if reference is broken; 
// but no query error. Just `author: null` in response.
```

### Rule: GROQ Projections Are Lazy
- Missing fields return `null` or `undefined` — no error
- Reference resolution silently returns `null` if ref broken
- Only **required GROQ functions** (like `select` with no fallback) fail if field missing

### Recommendation
1. **Update queries alongside schema changes** (best practice, not required)
2. **Use `coalesce()` for optional chains**: `coalesce(field1, field2, "default")`
3. **Test query in Sanity Vision tool** before deploying

---

## 6. Sanity Studio Desk Structure for 13+ Document Types

### Current Setup
Your `sanity/sanity.config.ts` uses default structure (structureTool plugin). For 12+ types, sidebar gets crowded.

### Recommended Customization

Create `sanity/structure.ts`:
```typescript
import { defineStructure } from 'sanity/structure'

export const structure = defineStructure(() =>
  S.list()
    .title('Content')
    .items([
      // Singletons
      S.documentListItem()
        .schemaType('siteSettings')
        .title('Site Settings'),

      S.divider(),

      // Portfolio Content
      S.listItem()
        .title('Portfolio')
        .child(
          S.list()
            .title('Portfolio Items')
            .items([
              S.documentListItem().schemaType('project').title('Projects'),
              S.documentListItem().schemaType('experience').title('Experience'),
              S.documentListItem().schemaType('education').title('Education'),
            ])
        ),

      S.divider(),

      // Blog
      S.listItem()
        .title('Blog')
        .child(
          S.list().title('Blog Items').items([
            S.documentListItem().schemaType('post').title('Posts'),
            S.documentListItem().schemaType('tag').title('Tags'),
          ])
        ),

      S.divider(),

      // Skills & Certifications
      S.listItem()
        .title('Skills & Certs')
        .child(
          S.list().title('Skills').items([
            S.documentListItem().schemaType('skill'),
            S.documentListItem().schemaType('certification'),
            S.documentListItem().schemaType('language'),
          ])
        ),
    ])
)
```

Update `sanity/sanity.config.ts`:
```typescript
import { structure } from './structure'

export default defineConfig({
  // ... existing config ...
  plugins: [
    structureTool({ structure }),  // ← Pass custom structure
    visionTool(),
    presentationTool({ ... }),
  ],
})
```

### Alternative: Groups (Simpler)
If you prefer no nesting, use `group` option:
```typescript
export const experienceType = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  group: 'portfolio',  // ← Groups in sidebar
  fields: [ ... ],
})
```

Then studio auto-organizes by group.

---

## 7. Backward Compatibility Checklist Before Expansion

- [ ] **Schema**: No required fields on new types (all optional)
- [ ] **Queries**: Use `coalesce()` for fallback; no strict null checks
- [ ] **Cache**: Existing tags unchanged; new tags follow naming pattern
- [ ] **TypeScript**: Run `npm run sanity:types` after each schema edit; commit both files
- [ ] **Webhook**: Add new type → tag mappings in revalidation handler
- [ ] **Author deprecation**: Phase A only—add `about` to siteSettings, keep `author` schema
- [ ] **Desk structure**: (Optional) Group 13+ types in sidebar for UX

---

## 8. Unresolved Questions

1. **Data migration timing for author → siteSettings**: Should Phase B happen in next sprint or after observing Phase A metrics? (Team decision)
2. **New fields in Project/Post expansion**: Will you add optional fields (gallery, tech array, featured flag, order)? Affects query updates.
3. **Rich text (PortableText) in new types**: Use existing `localizedContent` helper or create new variant?
4. **Image assets**: Will new types use same Sanity image CDN or different source? (Affects query `.asset->url` pattern)
5. **Locale strategy for new types**: All bilingual {en, es}, or some English-only (skill names, cert dates)? Affects schema design.

---

## Migration Execution Order (Recommended)

1. **Schema expansion round 1**: experience, education, skill, certification (non-breaking, optional fields only)
2. **Run typegen + typecheck** → commit
3. **Add GROQ queries** for new types → add cache tags to webhook handler
4. **Add desk structure groups** (optional but recommended for UX)
5. **Author deprecation Phase A**: Add `about` to siteSettings, optional `authorOverride` to post
6. **Smoke tests**: Verify no queries break; existing content still renders
7. **Deploy to dev → staging → production**
8. **Monitor webhook revalidation** for 1 week
9. **Author Phase B** (next cycle): Migrate references after confirming Phase A stable

---

## Key Sources & References

- **Sanity v3 Schema Guide**: Your project uses `defineType` + `defineField` (recommended pattern for v3)
- **next-sanity @^5.5.11**: Supports `unstable_cache` with per-locale tags and webhook validation
- **GROQ Coalesce**: Handles null fallback gracefully; no query errors on missing optional fields
- **Bilingual Pattern**: Your existing {en, es} object fields are production-proven; replicate for new types
- **Typegen Workflow**: `sanity schema extract && sanity typegen generate` works offline; safe to run anytime

---

**Status: READY FOR IMPLEMENTATION**  
This research validates your schema expansion approach. No blocking issues identified. Proceed with Phase 1 schema addition (experience, skill, education, etc.) using the patterns and checks documented above.
