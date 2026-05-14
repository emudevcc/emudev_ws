---
phase: 1
title: "Wire heroIntro into HeroSection"
status: pending
priority: P1
effort: "15m"
dependencies: []
---

# Phase 1: Wire heroIntro into HeroSection

## Overview
`siteSettings.heroIntro` is a localized PortableText field fetched by `getSiteSettings()` and present in the `SiteSettings` type, but `HeroSection` ignores it — rendering only `settings.tagline` instead. When `tagline` is empty in Sanity Studio the component falls through to the hardcoded i18n string `t('fallbackTagline')`. This phase wires `heroIntro` into the rendered intro paragraph using the existing `richTextToParagraphs` helper.

## Requirements
- Functional: If `heroIntro` has content, render it as the hero intro text. Fall back to `tagline ?? description ?? t('fallbackTagline')` if empty/null.
- Non-functional: No new deps. Plain-text extraction only (no PortableText markup needed in the hero).

## Architecture

```
getSiteSettings(locale)
  └── settings.heroIntro  ← PortableText array (localized)
        ↓  richTextToParagraphs()
        ↓  joins to plain text string
HeroSection <p> intro paragraph
  └── heroIntroText || settings.tagline || settings.description || t('fallbackTagline')
```

`richTextToParagraphs` already handles: null/undefined → returns fallback; plain strings → returns as-is; PortableText blocks → extracts text.

The hero renders a single `<p>` tag for the intro. Joining multiple paragraphs with a space gives natural readable text without restructuring the component layout.

## Related Code Files
- Modify: `components/sections/HeroSection.tsx`

## Implementation Steps

### 1. Import `richTextToParagraphs` from `lib/content`

```typescript
import { richTextToParagraphs } from '@/lib/content'
```

### 2. Derive `introText` from `heroIntro`, falling back gracefully

Inside the component body, before the `return`:

```typescript
const heroIntroParagraphs = richTextToParagraphs(settings?.heroIntro)
const introText =
  heroIntroParagraphs.length > 0
    ? heroIntroParagraphs.join(' ')
    : (settings?.tagline ?? settings?.description ?? t('fallbackTagline'))
```

### 3. Replace the inline fallback expression in JSX

Current (line 69):
```tsx
{settings?.tagline ?? settings?.description ?? t('fallbackTagline')}
```

Updated:
```tsx
{introText}
```

### 4. Verify TypeScript compiles clean

```bash
npx tsc --noEmit
```

## Success Criteria
- [ ] `heroIntro` Sanity rich text renders in the hero when set
- [ ] Falls back to `tagline` → `description` → i18n string when `heroIntro` is null/empty
- [ ] `npx tsc --noEmit` passes
- [ ] No new dependencies added

## Risk Assessment
- **Multi-paragraph `heroIntro`**: Joining with `' '` merges blocks into one sentence. If the author uses multiple paragraphs for distinct ideas, joining may read oddly. Mitigated by authoring convention (one paragraph in Studio for the hero); a newline join is an easy future tweak.
- **`heroIntro` already set to `tagline` text**: No visual change — functionally equivalent.
