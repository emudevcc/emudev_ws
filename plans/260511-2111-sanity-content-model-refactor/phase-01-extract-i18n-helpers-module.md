---
phase: 1
title: 'Extract i18n Helpers Module'
status: completed
priority: P1
effort: '2h'
dependencies: []
---

# Phase 1: Extract i18n Helpers Module

## Overview

Eliminate the duplicate `localizedString` / `localizedText` / `localizedSlug` / `localizedContent` definitions copy-pasted across 5 schema files. Extract to a shared module and add two new helpers (`localizedRichText`, `localizedArray`) needed by upcoming phases. Pure refactor — no runtime behavior change, no schema field shape change.

## Requirements

**Functional**

- All existing schemas import localized field factories from a single source
- Public helper signatures match current usage (no caller changes besides the import line)
- New helpers (`localizedRichText`, `localizedArray`) available for Phase 2+
- TypeScript compiles; `npm run sanity:types` regenerates identical output (no schema diff)

**Non-functional**

- Module is the canonical home for bilingual field shapes; future schemas import from here
- Each helper returns a `defineField` result so the call site stays identical

## Architecture

`sanity/lib/i18n-helpers.ts` exports six factory functions:

```ts
localizedString(name, title, required?: boolean): FieldDefinition
localizedText(name, title, rows: number): FieldDefinition
localizedSlug(sourceField?: string): FieldDefinition  // defaults sourceField='title'
localizedContent(name?: string): FieldDefinition       // defaults name='content', PortableText + image
localizedRichText(name, title): FieldDefinition        // PortableText without inline images (paragraphs/about)
localizedArray(name, title): FieldDefinition           // { en: string[], es: string[] } for funFacts/highlights
```

Internal shape mirrors existing definitions exactly so type-gen output is stable.

## Related Code Files

**Create**

- `sanity/lib/i18n-helpers.ts`

**Modify** (replace local helper defs with imports)

- `sanity/schemas/site-settings-type.ts`
- `sanity/schemas/project-type.ts`
- `sanity/schemas/post-type.ts`
- `sanity/schemas/author-type.ts`
- `sanity/schemas/tag-type.ts`

**Delete**

- None

## Implementation Steps

1. Create `sanity/lib/` directory if it doesn't exist.
2. Create `sanity/lib/i18n-helpers.ts` with six exported factory functions. Use `defineField` from `'sanity'`. Match existing field shapes byte-for-byte:
   - `localizedString`: object with `{ en: string, es: string }`; `en` gets `validation: (rule) => rule.required()` only when `required === true`.
   - `localizedText`: object with `{ en: text(rows), es: text(rows) }`.
   - `localizedSlug(sourceField = 'title')`: object with `{ en: slug, es: slug }`; `options.source` = `${sourceField}.en` / `${sourceField}.es`.
   - `localizedContent(name = 'content')`: object with `{ en: array<block|image>, es: array<block|image> }`; `image` has `options: { hotspot: true }`.
   - `localizedRichText(name, title)`: object with `{ en: array<block>, es: array<block> }` — no image type in `of[]`.
   - `localizedArray(name, title)`: object with `{ en: array<string>, es: array<string> }`.
3. Edit `sanity/schemas/site-settings-type.ts`: delete inline `localizedString` / `localizedText`, add `import { localizedString, localizedText } from '../lib/i18n-helpers'`. Field calls stay identical.
4. Repeat step 3 for `project-type.ts` (uses 4 helpers), `post-type.ts` (uses 4 helpers), `author-type.ts` (uses 2 helpers), `tag-type.ts` (uses 2 helpers).
5. Run `npm run typecheck` — must pass.
6. Run `npm run sanity:types` — diff `types/sanity.types.ts`; expect zero change.
7. Run `npm run lint` to confirm no unused imports.

## Todo List

- [x] Create `sanity/lib/i18n-helpers.ts` with 6 factories
- [x] Refactor `site-settings-type.ts` to use imports
- [x] Refactor `project-type.ts` to use imports
- [x] Refactor `post-type.ts` to use imports
- [x] Refactor `author-type.ts` to use imports
- [x] Refactor `tag-type.ts` to use imports
- [x] `npm run typecheck` passes
- [x] `npm run sanity:types` produces no diff
- [x] `npm run lint` passes

## Success Criteria

- [x] `sanity/lib/i18n-helpers.ts` exists and exports all 6 helpers
- [x] Zero local copies of `localizedString` / `localizedText` / `localizedSlug` / `localizedContent` remain in `sanity/schemas/*`
- [x] `git diff types/sanity.types.ts` is empty after regeneration
- [x] `npm run build` succeeds
- [x] Sanity Studio loads (`/studio`) without schema-validation errors

## Risk Assessment

| Risk                                    | Likelihood | Impact | Mitigation                                                                                    |
| --------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------------------------- |
| Slight shape drift causes type-gen diff | Low        | Low    | Copy existing helper code verbatim into module; diff before/after                             |
| Circular import (`lib` ↔ `schemas`)     | Very Low   | Low    | `lib/` is a leaf module; no imports from `schemas/`                                           |
| Missed call site after refactor         | Low        | Low    | Lint catches unused imports; grep `localizedString = (` should return zero hits in `schemas/` |

## Rollback

Revert the 6 modified files via `git checkout sanity/`. The new file `sanity/lib/i18n-helpers.ts` can be left orphaned or deleted; no Studio config references it.
