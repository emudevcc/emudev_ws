---
phase: 2
title: "Verify"
status: completed
priority: P2
effort: "15m"
dependencies: [phase-01-implement]
---

# Phase 2: Verify

## Overview

Type-check and visually verify breadcrumb renders correctly on both blog pages in both locales.

## Implementation Steps

1. `npx tsc --noEmit` — zero errors
2. `npm run dev` → open `http://localhost:3000/en/blog`
   - Breadcrumb visible: `Home · Blog` — "Blog" plain text (no link)
3. Open a post: `http://localhost:3000/en/blog/[any-slug]`
   - Breadcrumb visible: `Home · Blog · {post title}` — "Home" and "Blog" are clickable
   - `← Blog` back link is gone
   - View source / DevTools → confirm JSON-LD `BreadcrumbList` present
4. Switch to `/es/blog` and `/es/blog/[slug]` — labels render in Spanish
5. Click breadcrumb links to confirm locale-prefixed navigation works

## Success Criteria

- [x] `npx tsc --noEmit` — zero errors
- [ ] Blog listing: breadcrumb shows `Home · Blog`, "Blog" is current page (not a link)
- [ ] Blog post: breadcrumb shows `Home · Blog · {title}`, links navigate correctly
- [ ] Spanish locale renders translated labels
- [ ] JSON-LD `BreadcrumbList` in post page source
- [ ] No console errors

## Completion Notes

- Automated checks passed: typecheck, lint, smoke contracts, and production build.
- Manual browser click-through was not run in this environment.
