---
title: "Blog Breadcrumb Navigation"
description: "Add a semantic breadcrumb (Home · Blog · Post Title) to blog listing and blog post pages with JSON-LD BreadcrumbList for SEO"
status: completed
priority: P2
branch: "development"
tags: ["blog", "navigation", "seo"]
blockedBy: []
blocks: []
created: "2026-05-21T00:15:19.714Z"
createdBy: "ck:plan"
source: skill
---

# Blog Breadcrumb Navigation

## Overview

Blog listing (`/blog`) and post pages (`/blog/[slug]`) lack a breadcrumb. The post page has a bare `← Blog` back link (line 53-58 of `blog/[slug]/page.tsx`) which will be replaced. A reusable `Breadcrumb` component will be created in `components/ui/` and added to both pages. JSON-LD `BreadcrumbList` added to the post page for SEO.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Implement](./phase-01-implement.md) | Completed |
| 2 | [Verify](./phase-02-verify.md) | Completed |

## Completion Notes

- Added reusable `Breadcrumb` component.
- Added localized breadcrumbs to blog listing and blog post pages.
- Replaced the blog post back link with semantic breadcrumb navigation.
- Added JSON-LD `BreadcrumbList` to blog post pages.
- Verified with typecheck, lint, smoke contracts, and production build.
