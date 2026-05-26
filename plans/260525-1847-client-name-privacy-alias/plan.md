---
title: "Client Name Privacy - Company Alias"
description: ""
status: completed
priority: P2
branch: "development"
tags: []
blockedBy: []
blocks: []
created: "2026-05-26T00:48:30.789Z"
createdBy: "ck:plan"
source: skill
---

# Client Name Privacy - Company Alias

## Overview

Add a `companyAlias` field to the experience schema so client names can be replaced with industry synonyms (e.g. "Global Financial Services Firm") for public display. Uses GROQ `coalesce(companyAlias, company)` — alias takes precedence, real name fallback for entries where disclosure is OK. Real names stay in Sanity Studio, never reach the frontend when an alias is set.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Data Layer: Schema + Query + Types](./phase-01-data-layer-schema-query-types.md) | Completed |
| 2 | [UI Layer: ExperienceCard](./phase-02-ui-layer-experiencecard.md) | Completed |

## Dependencies

<!-- Cross-plan dependencies -->

## ⚠️ Manual Action Required (post-implementation)

**`data/profile.md` must be updated manually** — this file is gitignored (contains PII) and feeds the AI chat widget's system prompt via `lib/chat/system-prompt.ts`. If a user asks the chat "where have you worked?", Gemini will answer using real names from `profile.md` even after the visual alias is applied.

Action: Replace real client/company names in `profile.md` with the same industry aliases you set in `companyAlias` for consistency. The chat responses are public-facing, so this completes the privacy boundary.

## Completion Notes

- Added optional `companyAlias` to the Sanity experience schema.
- Marked real `clients` as internal-only and added `clientAliases` for public-safe labels.
- Updated the experience GROQ projection to return `displayCompany: coalesce(companyAlias, company)`.
- Removed raw `company` and unused raw `clients` from the frontend experience projection.
- Added frontend sanitization for known client names embedded inside Sanity rich-text/string content.
- Replaced tracked seed-data client names with public-safe aliases.
- Updated `ExperienceCard` to render `displayCompany`.
- Verified with typecheck, lint, smoke contracts, and production build.
