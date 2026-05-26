---
phase: 1
title: "Enhance CredentialsSection"
status: completed
priority: P2
effort: "30m"
dependencies: []
---

# Phase 1: Enhance CredentialsSection

## Overview
Add clickable links (→ credential URL) and visible credential ID to each certification row. All data is already fetched — this is a pure UI change to one file.

## Requirements
- Functional:
  - Cert rows with `credentialUrl` → entire row is an `<a>` link (new tab)
  - Cert rows with `credentialId` → show `#<id>` below the issuer/year meta line
  - Visual affordance: `ExternalLink` icon (13px) next to cert title when link present
  - Rows without `credentialUrl` remain non-interactive (same as today)
- Non-functional:
  - No layout shift — credential ID line reuses existing mono/muted style
  - Hover state matches design system (text-foreground, icon accent)
  - `aria-label` on link for screen readers

## Architecture

The `CredentialRow` component receives two new optional props: `href` and `credentialId`.

Extended props:
```tsx
function CredentialRow({
  title, meta, href, credentialId,
}: {
  title?: string; meta?: string; href?: string; credentialId?: string
})
```

When `href` defined → wrap row in `<a target="_blank" rel="noopener noreferrer">`.
When `credentialId` defined → add `#{credentialId}` mono line below meta.
Title row gains `<ExternalLink size={13}>` icon when `href` present.

Cert mapping passes two new props:
```tsx
href={cert.credentialUrl}
credentialId={cert.credentialId}
```

## Related Code Files
- Modify: `components/sections/CredentialsSection.tsx`
- No Sanity schema changes — `credentialId` + `credentialUrl` already queried
- No i18n changes needed

## Implementation Steps
1. Add `ExternalLink` to lucide-react import
2. Extend `CredentialRow` props: `href?: string`, `credentialId?: string`
3. Conditionally wrap row content in `<a>` (href) or keep `<div>` (no href)
4. Add `ExternalLink` icon in title `<p>` when `href` present
5. Add `#{credentialId}` line below `meta` when `credentialId` present
6. Pass `href={cert.credentialUrl}` and `credentialId={cert.credentialId}` in certs map
7. Run `npx tsc --noEmit` to verify no type errors

## Success Criteria
- [x] Cert rows with `credentialUrl` are clickable → open in new tab
- [x] `ExternalLink` icon visible for linked certs
- [x] `#<credentialId>` shown below issuer line when present
- [x] Non-linked certs render identically to today
- [x] `npx tsc --noEmit` passes
- [x] No layout shift introduced

## Completion Notes

- Implemented the requested UI-only enhancement in `CredentialsSection`.
- Manual browser click-through was not run in this environment.

## Risk Assessment
Low risk. No data layer changes. Single isolated component. Education/Language rows unaffected.
