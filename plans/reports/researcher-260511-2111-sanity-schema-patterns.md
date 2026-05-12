# Sanity v3 Schema Patterns for Complex Portfolio Models

**Date:** 2026-05-11 | **Status:** Production-tested patterns extracted from emudev portfolio

---

## 1. Shared Field Definitions (DRY Pattern)

**Recommended approach:** Factory functions with `defineField()`.

Your project uses this proven pattern:

```typescript
// sanity/schemas/project-type.ts
const localizedString = (name: string, title: string, required = false) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      {
        name: 'en',
        title: 'English',
        type: 'string',
        validation: required ? (rule) => rule.required() : undefined,
      },
      { name: 'es', title: 'Spanish', type: 'string' },
    ],
  })

// Reuse across types
export const projectType = defineType({
  name: 'project',
  type: 'document',
  fields: [
    localizedString('title', 'Title', true),
    localizedText('description', 'Description', 3),
    // ...
  ],
})
```

**Why this works:**
- **Simple:** Factory functions are easier to maintain than shared modules
- **Composable:** Each field factory returns a `FieldDefinition` compatible with `defineField()`
- **Consistent:** Forces same structure across all schema types
- **Type-safe:** TypeScript validates field shapes at compile time

**Avoid:** Creating named types via `defineType` for every reusable field — use factories instead. Named types are for documents or objects you want to reuse across multiple unrelated contexts.

---

## 2. Singleton Documents

**Pattern:** No special API; enforce at Studio + app layer.

Sanity v3 does not have built-in singleton enforcement. Implement with:

```typescript
// sanity/schemas/site-settings-type.ts
export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    localizedString('siteName', 'Site Name'),
    localizedText('description', 'Description', 3),
    // ...
  ],
})
```

**Enforcement layers:**

1. **Studio UI** (optional): Use preview actions or role-based permissions
   - Editors can only edit the one existing document
   - Only admins can create additional siteSettings docs

2. **GROQ Query** (recommended):
   ```groq
   *[_type == "siteSettings"][0]  // Always fetch first, prevent multiple
   ```

3. **Schema validation** (future):
   ```typescript
   validate: (doc) => {
     if (!doc._id) return true // During creation
     return doc._id === 'siteSettings' ? true : 'Only one allowed'
   }
   ```

4. **Data migration**: If multiple exist, merge manually then delete duplicates.

Your project correctly queries singletons:
```typescript
export const getSiteSettings = (locale?: string) =>
  sanityFetch<SiteSettings | null>({
    query: groq`*[_type == "siteSettings"][0] { ... }`,
    params: { locale: safeLocale },
  })
```

---

## 3. Cross-Document References with Ordering

**Pattern:** Array of references + `order()` in GROQ.

Correctly implemented in your project:

```typescript
// Schema: project-type.ts
defineField({
  name: 'tags',
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'tag' }] }],
})

// Query: sanity-queries.ts
groq`*[_type == "project"] | order(publishedAt desc) {
  "tags": tags[]->{ _id, "title": coalesce(title[$locale], title.en) },
}`
```

**For tech/skill references with manual ordering:**

```typescript
// Schema with position field
defineField({
  name: 'tech',
  type: 'array',
  of: [
    {
      type: 'object',
      fields: [
        { name: 'skill', type: 'reference', to: [{ type: 'skill' }] },
        { name: 'order', type: 'number', hidden: true }, // For sorting
      ],
    },
  ],
})

// GROQ projection
groq`{
  "tech": tech | sort(order) | map({
    "name": skill->title,
    "category": skill->category,
    "icon": skill->icon.asset->url,
  }),
}`
```

**Why no dedicated ordering plugin:** Sanity's array field automatically preserves insertion order. For explicit control, add an `order` field and sort in GROQ.

---

## 4. Inline vs. Named Objects

**Rule of thumb:**

| Scenario | Pattern | Example |
|----------|---------|---------|
| Used in ONE type | **Inline** | `socialLinks` in siteSettings |
| Used in 2+ types | **Named type** | metrics, contact info |
| Complex (5+ fields) | **Named type** | reduces visual clutter |
| Simple (1-3 fields) | **Inline** | URL + label |

**Your code (correct):**

```typescript
// Inline: used only in siteSettings, simple (2 fields)
defineField({
  name: 'socialLinks',
  type: 'array',
  of: [
    {
      type: 'object',
      fields: [
        { name: 'platform', type: 'string', title: 'Platform' },
        { name: 'url', type: 'url', title: 'URL' },
      ],
    },
  ],
})
```

**If socialLinks were reused:**

```typescript
// Extract to named type
const socialLink = defineType({
  name: 'socialLink',
  type: 'object',
  fields: [
    { name: 'platform', type: 'string', title: 'Platform' },
    { name: 'url', type: 'url', title: 'URL' },
  ],
})

// Reuse
defineField({
  name: 'socialLinks',
  type: 'array',
  of: [{ type: 'socialLink' }],
})
```

**Studio UI implication:** Inline objects show fields inline during array editing. Named types open in modals. Inline = better UX for small fields; named = better UX for complex ones.

---

## 5. Enumeration Fields

**Pattern:** Use `options.list` with defineField for Sanity v3.

```typescript
defineField({
  name: 'status',
  type: 'string',
  title: 'Status',
  options: {
    list: [
      { title: 'Live', value: 'live' },
      { title: 'Archived', value: 'archived' },
      { title: 'WIP', value: 'wip' },
    ],
  },
  validation: (rule) => rule.required(),
})

defineField({
  name: 'category',
  type: 'string',
  title: 'Skill Category',
  options: {
    list: [
      { title: 'Language', value: 'language' },
      { title: 'Framework', value: 'framework' },
      { title: 'Tool', value: 'tool' },
    ],
  },
})
```

**Avoid:** Custom validation rules for enum-like logic — `options.list` is built for this and provides Studio dropdown UI.

**Type-safe TypeScript:**

```typescript
type SkillCategory = 'language' | 'framework' | 'tool'

const skillCategories = [
  { title: 'Language', value: 'language' as const },
  { title: 'Framework', value: 'framework' as const },
  { title: 'Tool', value: 'tool' as const },
]

defineField({
  name: 'category',
  type: 'string',
  options: { list: skillCategories },
})
```

---

## 6. File Fields

**Pattern:** Use `file` type for PDFs and documents.

```typescript
defineField({
  name: 'resumePdf',
  type: 'file',
  title: 'Resume (PDF)',
  options: {
    accept: 'application/pdf', // Restrict to PDF
  },
})

// For localized resume:
const localizedFile = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      {
        name: 'en',
        type: 'file',
        options: { accept: 'application/pdf' },
      },
      {
        name: 'es',
        type: 'file',
        options: { accept: 'application/pdf' },
      },
    ],
  })

// Usage
defineType({
  name: 'siteSettings',
  type: 'document',
  fields: [
    localizedFile('resume', 'Resume'),
  ],
})

// GROQ projection
groq`{
  "resumeEn": resume.en.asset->url,
  "resumeEs": resume.es.asset->url,
}`
```

**File asset URL:** Always access via `.asset->url` in GROQ, never raw path.

---

## 7. GROQ Projection Patterns

### Singleton document:
```groq
*[_type == "siteSettings"][0] {
  "siteName": coalesce(siteName[$locale], siteName.en),
  "description": coalesce(description[$locale], description.en),
  "logo": logo.asset->url,
  socialLinks
}
```

### Ordered collection:
```groq
*[_type == "project"] | order(publishedAt desc) {
  _id,
  "title": coalesce(title[$locale], title.en),
  "slug": { "current": coalesce(slug[$locale].current, slug.en.current) },
  publishedAt,
}
```

### Cross-references with expansion:
```groq
*[_type == "project"] {
  title,
  "tags": tags[]->{ 
    _id, 
    "title": coalesce(title[$locale], title.en) 
  },
}
```

### Localized with fallback (coalesce):
```groq
*[_type == "post"] {
  "title": coalesce(title[$locale], title.en),
  "author": author->{
    "name": coalesce(name[$locale], name.en),
    "image": image.asset->url
  },
}
```

Your project's implementation is production-correct: use `coalesce()` before array dereference (`->`) to prevent null errors.

---

## Key Takeaways

1. **Factories over modules:** Use function factories for reusable field definitions (proven in your codebase).
2. **Singleton enforcement:** Use `[0]` in GROQ; add validation at app layer if needed.
3. **References + GROQ:** Array references handle ordering; expand with `->` and map fields.
4. **Inline vs named:** Inline for <2 reuses and <5 fields; extract to named types otherwise.
5. **Enums:** Always use `options.list`; TypeScript `as const` for type safety.
6. **Files:** Always `.asset->url` in GROQ; use `accept` option for type restriction.
7. **Localization:** `coalesce(field[$locale], field.en)` — your pattern is correct.

**Unresolved questions:**
- Do you need versioning for rich-text blocks (content arrays)? Sanity doesn't version natively — use `_createdAt` + manual snapshots if needed.
- Should Experience/Skill types be added as new document types with cross-references, or inline in Project?
