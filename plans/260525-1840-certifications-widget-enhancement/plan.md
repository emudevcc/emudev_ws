---
title: "Certifications Widget Enhancement"
description: ""
status: completed
priority: P2
branch: "development"
tags: []
blockedBy: []
blocks: []
created: "2026-05-26T00:41:25.333Z"
createdBy: "ck:plan"
source: skill
---

# Certifications Widget Enhancement

## Overview

Enhance the certifications widget in `CredentialsSection` to make each cert row clickable (linking to `credentialUrl`) and display the `credentialId` beneath the issuer/year line. Data is already fetched — pure UI change, single file.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Enhance CredentialsSection](./phase-01-enhance-credentialssection.md) | Completed |

## Dependencies

<!-- Cross-plan dependencies -->

## Completion Notes

- Certification rows with `credentialUrl` now render as external links.
- Linked rows show an `ExternalLink` icon next to the title.
- Certification rows with `credentialId` now show `#<credentialId>` below the issuer/year line.
- Education and language rows remain unchanged.
- Verified with typecheck, lint, smoke contracts, and production build.
