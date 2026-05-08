# Phase 4: Portfolio UI Pages — Clean Build, Smart Component Extraction

**Date**: 2026-05-08 14:40
**Severity**: Low
**Component**: Frontend / Next.js App Router
**Status**: Completed

## What Happened

Phase 4 delivered all portfolio pages with zero TypeScript errors and proper component composition. Built cleanly with ISR/pre-rendering on 16 routes. Three new components extracted, two pages refactored to use them.

## The Brutal Truth

This phase was *easy* because Phases 1–3 got the foundations right. Once Sanity schema, GROQ queries, and auth were solid, UI layers snapped together without firefighting. That's how it should work, but it's rare. Worth noting because it validates the upfront investment in schema design and type generation.

## Technical Details

**New components:**
- `TagFilter` (client) — Deduplicates tags from projects, toggleable active state, no server double-fetch
- `PostCard` — Date, title, excerpt, author; reused across blog list and blog detail contexts
- Edge OG image generators (1200×630 dark gradient) for project and blog routes via `ImageResponse`

**Build output:** Zero errors. All routes pre-rendered or ISR-cached as planned.

**Key constraint:** Supabase blocks direct `ALTER DATABASE` for RLS policy setup—admin email hardcoded during migration. Noted for future sessions but not blocking; authentication works with email allow-list gate.

## What Went Right

Tag filter avoids hydration mismatch by computing dedup on client. OG images generate at edge—no external service, no build-time overhead. Component granularity is clean: `PostCard` doesn't know about page context, works anywhere.

## Lessons Learned

Extraction doesn't have to be perfect on first pass. Both `PostCard` and `TagFilter` are simple enough that future refactoring is low-risk. The win here is *consistency*—blog and project lists now use matching patterns, making onboarding easier for future changes.

## Next Steps

Phase 5 (testing + e2e) will validate these components in integration. No blockers. Codebase is in good shape for test coverage.
