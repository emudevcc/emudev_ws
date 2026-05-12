---
phase: 2
title: "Set Vercel Environment Variables"
status: completed
priority: P1
effort: "30m"
dependencies: []
---

# Phase 2: Set Vercel Environment Variables

## Overview

Three env vars are missing from the Vercel production deployment, causing the studio to use localhost defaults and draft content to be unfetchable. All three must be set for the Presentation Tool live preview to work end-to-end.

## Requirements

- Functional: Studio builds with correct preview URL and shared secret baked in
- Functional: `sanityFetch` can fetch `previewDrafts` perspective in draft mode
- Non-functional: Secrets must NOT be prefixed `NEXT_PUBLIC_` — they're inlined at build time, not exposed via `__NEXT_DATA__`

## Architecture

```
Vercel Build (server + client bundles)
  ├── SANITY_STUDIO_PREVIEW_URL       → inlined into /studio client bundle
  │     used in: sanity/sanity.config.ts → presentationTool.previewUrl.origin
  ├── SANITY_STUDIO_REVALIDATE_SECRET → inlined into /studio client bundle
  │     used in: sanity/sanity.config.ts → presentationTool.previewUrl.previewMode.enable URL
  └── SANITY_API_READ_TOKEN           → runtime server secret (never reaches client)
        used in: lib/sanity-client.ts → sanityFetch({ isDraft: true })
```

Note: `SANITY_STUDIO_PREVIEW_URL` and `SANITY_STUDIO_REVALIDATE_SECRET` are baked into the studio JS bundle at build time (Next.js inlines all `process.env.*` accesses during bundling). A new deploy is required after setting them.

`SANITY_REVALIDATE_SECRET` is already set in the Vercel `production` environment (per Phase 6 plan). `SANITY_STUDIO_REVALIDATE_SECRET` must equal `SANITY_REVALIDATE_SECRET`.

## Related Code Files

- Read: `sanity/sanity.config.ts` (to confirm env var names used)
- Read: `lib/sanity-client.ts` (to confirm `SANITY_API_READ_TOKEN` usage)
- No code changes — config only

## Implementation Steps

### 1. Get the existing `SANITY_REVALIDATE_SECRET` value

```bash
vercel env pull .env.vercel.local --environment=production
# or check Vercel dashboard → emudev-ws → Settings → Environment Variables
```

### 2. Set `SANITY_STUDIO_PREVIEW_URL`

```bash
vercel env add SANITY_STUDIO_PREVIEW_URL production
# Value: https://emudev.cc
```

### 3. Set `SANITY_STUDIO_REVALIDATE_SECRET`

```bash
vercel env add SANITY_STUDIO_REVALIDATE_SECRET production
# Value: <same value as SANITY_REVALIDATE_SECRET>
```

### 4. Create Sanity API Read Token

Go to [sanity.io/manage](https://sanity.io/manage) → project `zziqxayh` → API → Tokens:
- Name: `vercel-preview-read`
- Permissions: **Viewer** (read-only access to drafts)
- Click **Add token** → copy the value

```bash
vercel env add SANITY_API_READ_TOKEN production
# Value: <token from sanity.io/manage>
```

### 5. (Optional) Set same vars for Preview environments

Preview deployments (from `development` branch) also benefit from live preview:

```bash
vercel env add SANITY_STUDIO_PREVIEW_URL preview
# Value: leave blank or set to the Vercel preview URL pattern
# Note: preview URLs are dynamic so SANITY_STUDIO_PREVIEW_URL can be omitted for preview
# The studio will fall back to localhost:3000 for preview — acceptable for development use

vercel env add SANITY_STUDIO_REVALIDATE_SECRET preview
# Value: same as production (or a different secret for preview isolation)

vercel env add SANITY_API_READ_TOKEN preview
# Value: same token as production (viewer-only, safe to share across envs)
```

### 6. Trigger a new production deploy

The `SANITY_STUDIO_*` vars are baked in at build time — the running production deployment won't pick them up until a redeploy.

```bash
# Option A: push a commit to main (triggers Vercel git integration)
# Option B: redeploy from Vercel dashboard → emudev-ws → Deployments → Redeploy
```

## Environment Variable Summary

| Variable | Value | Scope | Sensitive |
|----------|-------|-------|-----------|
| `SANITY_STUDIO_PREVIEW_URL` | `https://emudev.cc` | Production | No |
| `SANITY_STUDIO_REVALIDATE_SECRET` | `= SANITY_REVALIDATE_SECRET` | Production | Yes |
| `SANITY_API_READ_TOKEN` | Sanity viewer token | Production | Yes |

## Success Criteria

- [x] `SANITY_STUDIO_PREVIEW_URL` set to `https://emudev.cc` in Vercel production env
- [x] `SANITY_STUDIO_REVALIDATE_SECRET` set (same value as `SANITY_REVALIDATE_SECRET`) in Vercel production env
- [x] `SANITY_API_READ_TOKEN` set in Vercel production env with Sanity Viewer permissions
- [x] New production deploy triggered (to bake build-time vars into studio bundle)
- [x] `vercel env ls` confirms all three vars present in production

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `SANITY_STUDIO_REVALIDATE_SECRET` ≠ `SANITY_REVALIDATE_SECRET` | High | Copy-paste both values from Vercel dashboard to verify match |
| API token has write access | High | Create with **Viewer** role only |
| Forgetting to redeploy after setting vars | Medium | Studio will keep serving old bundle with localhost URL until redeployed |
