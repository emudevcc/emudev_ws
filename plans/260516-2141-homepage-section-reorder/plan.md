---
title: "Reorder Homepage Sections — Strengths/Social/Contact to Bottom"
description: "Reorder JSX blocks in app/[locale]/page.tsx so StrengthsCard, SocialPostsGrid, ContactSection appear directly above FooterSection."
status: complete
priority: P3
branch: "development"
tags: []
blockedBy: []
blocks: []
created: "2026-05-17T03:44:18.057Z"
createdBy: "ck:plan"
source: skill
---

# Reorder Homepage Sections — Strengths/Social/Contact to Bottom

## Overview

Move StrengthsCard, SocialPostsGrid, ContactSection to the bottom of the homepage directly above FooterSection. Single-file JSX reorder — no logic, no imports, no data-fetching changes.

**New order:** Hero → About → Experience → Projects → Skills → Credentials → Writing → **Strengths → Social → Contact** → Footer

## Outcome

Implemented the JSX-only section reorder in `app/[locale]/page.tsx`. Data fetching, imports, and component props were left unchanged.

Verification:

- `npx tsc --noEmit` passed

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Reorder sections in page.tsx](./phase-01-reorder-sections-in-page-tsx.md) | Complete |

## Dependencies

None.
