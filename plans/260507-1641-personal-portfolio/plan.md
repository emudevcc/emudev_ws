---
title: "Personal Portfolio — Next.js 15 + Sanity + Supabase + Vercel/CF"
description: "Full-stack personal portfolio with headless CMS, Supabase auth/DB, and a 3-environment CI/CD pipeline (dev → staging → prod) on Vercel + Cloudflare."
status: pending
priority: P1
effort: 25h
branch: "main"
tags: [frontend, backend, infra, cicd, feature]
blockedBy: []
blocks: []
created: "2026-05-07"
createdBy: "ck:plan"
source: skill
---

# Personal Portfolio — Next.js 15 + Sanity + Supabase + Vercel/CF

## Overview

Personal portfolio website built with Next.js 15 App Router (SSG/ISR), Magic UI Pro for animated components, Sanity v3 as headless CMS, and Supabase (Postgres + Auth + RLS) for backend data and admin access. Deployed to 3 isolated environments (dev/staging/prod) via GitHub Actions with manual approval gates, Vercel edge network, and Cloudflare as CDN + WAF.

**Parallel execution:** Phases 2 & 3 run concurrently after Phase 1 completes. Phases 5 & 6 run concurrently. Phase 4 gates on 2 & 3. Phase 7 gates on 4, 5, 6.

## Phases

| Phase | Name | Status | Effort | Depends On |
|-------|------|--------|--------|------------|
| 1 | [Project Scaffold & Tooling](./phase-01-project-scaffold-tooling.md) | Pending | 4h | — |
| 2 | [Sanity CMS Setup](./phase-02-sanity-cms-setup.md) | Pending | 3h | 1 |
| 3 | [Supabase Setup](./phase-03-supabase-setup.md) | Pending | 3h | 1 |
| 4 | [Portfolio UI Pages](./phase-04-portfolio-ui-pages.md) | Pending | 6h | 2, 3 |
| 5 | [GitHub Actions CI/CD Pipeline](./phase-05-github-actions-ci-cd-pipeline.md) | In Progress | 4h | 1 |
| 6 | [Vercel + Cloudflare Infrastructure](./phase-06-vercel-cloudflare-infrastructure.md) | Pending | 3h | 5 |
| 7 | [Smoke Tests & QA](./phase-07-smoke-tests-qa.md) | Pending | 2h | 4, 6 |

## Dependencies

- Node.js 20 LTS
- `ck` CLI v4+ (local)
- `supabase` CLI v1.168.5+
- `vercel` CLI
- Magic UI Pro license (user confirmed access)
- GitHub repo with 3 branches: `develop`, `staging`, `main`
- 3 Vercel projects + 3 Supabase projects + Cloudflare account pre-created externally
