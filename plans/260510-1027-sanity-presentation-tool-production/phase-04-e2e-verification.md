---
phase: 4
title: "E2E Verification"
status: pending
priority: P1
effort: "30m"
dependencies: [1, 2, 3]
---

# Phase 4: E2E Verification

## Overview

Validate that the full live-preview flow works end-to-end in production: studio opens, Presentation Tool frames the site, draft mode enables correctly, and draft content is visible in the preview pane.

## Requirements

- Functional: Presentation Tool frames `https://emudev.cc` from `https://emudev.cc/studio`
- Functional: Clicking "Preview" in studio enables draft mode and shows draft content
- Functional: Editing a document in studio updates the preview pane in real time
- Non-functional: No CSP errors in browser console

## Verification Checklist

### A. Header verification (curl)

```bash
# Confirm frame-ancestors header is correct in production
curl -sI https://emudev.cc | grep -i "content-security-policy\|x-frame-options"
# Expected: content-security-policy: frame-ancestors 'self'
# Must NOT see: x-frame-options: DENY
```

### B. Env var verification (Vercel CLI)

```bash
vercel env ls --environment=production | grep -i sanity
# Expected output includes:
#   SANITY_STUDIO_PREVIEW_URL
#   SANITY_STUDIO_REVALIDATE_SECRET
#   SANITY_API_READ_TOKEN
#   SANITY_REVALIDATE_SECRET   (pre-existing)
```

### C. Studio build verification

```bash
# Confirm the studio bundle has the correct preview URL baked in
# Open https://emudev.cc/studio in browser → DevTools → Network
# Filter for "sanity.config" or studio JS bundle
# Inspect bundle: should contain "https://emudev.cc" (not "http://localhost:3000")
```

### D. Presentation Tool manual test

1. Open `https://emudev.cc/studio` → log in
2. Open **Presentation** tool (side panel icon)
3. Verify the preview pane loads `https://emudev.cc` (not an error or blank)
4. No CSP errors in browser console (`Refused to frame...` messages indicate Phase 1 failed)
5. Navigate to a blog post or project in the studio → verify URL in preview pane updates

### E. Draft mode test

1. In Presentation Tool, click the "Open preview" / share link button
2. Verify you are redirected to `https://emudev.cc/...` with draft mode active
3. Check: `document.cookie` in browser console should contain `__prerender_bypass` or Next.js draft mode cookie
4. Edit a draft document in studio → verify preview pane reflects the change within a few seconds

### F. Draft content test

1. Create a new (unpublished) blog post in Sanity studio
2. Open Presentation Tool → navigate to `/blog`
3. Verify the unpublished post appears in the preview (requires `SANITY_API_READ_TOKEN` + `previewDrafts` perspective)
4. The post should NOT appear on the public `https://emudev.cc/blog` page

### G. Revalidate webhook test (bonus)

```bash
# Confirm the Sanity webhook still works after Phase 3 changes
curl -X POST https://emudev.cc/api/revalidate-tag \
  -H "x-sanity-webhook-secret: <SANITY_REVALIDATE_SECRET>" \
  -H "content-type: application/json" \
  -d '{"_type": "post"}'
# Expected: {"revalidated":true,"tags":["posts"],"type":"post"}
```

## Success Criteria

- [ ] `curl https://emudev.cc` shows `content-security-policy: frame-ancestors 'self'` header (no `x-frame-options: DENY`)
- [ ] `vercel env ls` confirms all 3 new env vars present in production
- [ ] Studio preview pane loads `emudev.cc` without CSP errors
- [ ] Navigating studio documents updates the preview pane URL
- [ ] Draft mode cookie is set when opening preview link
- [ ] Unpublished draft content visible in preview, not on public site
- [ ] `/api/revalidate-tag` still returns 200 with correct secret

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Studio bundle still has localhost URL (old deploy) | High | Confirm deploy timestamp is after env vars were set |
| `SANITY_REVALIDATE_SECRET` ≠ `SANITY_STUDIO_REVALIDATE_SECRET` | High | Compare values in Vercel dashboard |
| Sanity viewer token expired or revoked | Medium | Regenerate at sanity.io/manage if `validatePreviewUrl` returns 401 |
| Draft content not appearing (wrong perspective) | Medium | Verify `SANITY_API_READ_TOKEN` has dataset viewer access for `zziqxayh/production` |
