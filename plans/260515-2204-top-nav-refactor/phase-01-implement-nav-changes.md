---
phase: 1
title: "Implement nav changes"
status: pending
priority: P2
effort: "15m"
dependencies: []
---

# Phase 1: Implement nav changes

## Overview

Single-file edit to `components/classic-shell.tsx`: remove Projects, reorder About to position 2, switch About + Contact to homepage hash anchors.

## Related Code Files

- Modify: `components/classic-shell.tsx`

## Architecture

`ClassicShell` builds a `links` array from hardcoded labels + hrefs, then renders them via next-intl `Link`. Hash-anchor hrefs (`/#about`, `/#contact`) are valid next-intl Link values — the locale prefix applies to the pathname portion only, so `/en/#about` resolves correctly.

**Current order:** Home → Projects → Blog → About → Contact

**Target order:** Home → About → Blog → Contact

| Item | Current href | New href |
|------|-------------|---------|
| Projects | `/projects` | **removed** |
| About | `/about` | `/#about` (second slot) |
| Blog | `/blog` | `/blog` (unchanged, third) |
| Contact | `/contact` | `/#contact` |

## Implementation Steps

1. In the `labels` object (both `es` and `en` branches) — remove the `projects` key.
2. Rewrite the `links` array:
   ```tsx
   const links = [
     { href: '/' as const, label: labels.home },
     { href: '/#about', label: labels.about },
     { href: '/blog' as const, label: labels.blog },
     { href: '/#contact', label: labels.contact },
   ]
   ```
3. In the `links.map(...)`, change `key={link.href}` → `key={link.label}` (href is no longer always a plain string, using label is safe and unique).

## Success Criteria

- [ ] "Projects" no longer appears in the desktop nav
- [ ] "About" is the second nav item, links to `/#about`
- [ ] "Blog" is the third nav item, link unchanged
- [ ] "Contact" links to `/#contact`
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] No console warnings about invalid React keys

## Risk Assessment

Low. Single file, no external deps, no i18n message keys involved (labels are inline strings). Hash anchors require the homepage to have `id="about"` and `id="contact"` on the corresponding sections — verify these exist.
