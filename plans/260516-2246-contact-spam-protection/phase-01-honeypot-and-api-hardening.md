---
phase: 1
title: "Honeypot and API Hardening"
status: pending
priority: P2
effort: "45m"
dependencies: []
---

# Phase 1: Honeypot and API Hardening

## Overview

Add a honeypot hidden field and a form-load timestamp to `ContactSection`, then validate both in the API route. Also adds message length capping. Zero new dependencies, fully serverless-compatible.

## Requirements

- Functional:
  - Hidden `<input name="website">` — bots fill it, humans never do; API rejects non-empty value
  - Hidden `<input name="form_loaded_at">` — records client timestamp at form mount; API rejects submissions faster than 1 500 ms (bot timing threshold)
  - API rejects messages longer than 5 000 characters
  - All bot rejections return `400` with a generic error (don't reveal honeypot exists)
- Non-functional:
  - `website` field: visually hidden, `aria-hidden="true"`, `tabIndex={-1}`, `autoComplete="off"` — screen readers and keyboard users never interact with it
  - No new npm dependencies

## Architecture

```
ContactSection (client)
  ├── <input name="website" />       hidden, trap field
  └── <input name="form_loaded_at" /> hidden, timestamp on mount

app/api/contact/route.ts (server)
  ├── if website non-empty → 400
  ├── if form_loaded_at missing or delta < 1500ms → 400
  ├── if message.length > 5000 → 400
  └── continue existing validation + Resend
```

`form_loaded_at` is set via `useEffect` / `useState` in ContactSection — set once on mount, injected as a hidden input value.

## Related Code Files

- Modify: `components/sections/ContactSection.tsx`
- Modify: `app/api/contact/route.ts`

## Implementation Steps

### 1. `components/sections/ContactSection.tsx`

Add `loadedAt` state set once on mount:

```tsx
const [loadedAt, setLoadedAt] = useState('')
useEffect(() => { setLoadedAt(String(Date.now())) }, [])
```

Add both hidden fields inside the `<form>`, before other fields:

```tsx
{/* Honeypot — must stay visually hidden */}
<input
  name="website"
  type="text"
  tabIndex={-1}
  aria-hidden="true"
  autoComplete="off"
  className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden"
/>
<input name="form_loaded_at" type="hidden" value={loadedAt} />
```

No other changes to the form or submit handler — `Object.fromEntries(new FormData(form))` picks them up automatically.

### 2. `app/api/contact/route.ts`

Add checks **before** the existing field validation:

```ts
// Honeypot — bots fill the "website" field; reject silently
if (body.website) {
  return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
}

// Timing — reject submissions faster than 1.5 s (bot speed)
const loadedAt = Number(body.form_loaded_at)
if (!loadedAt || Date.now() - loadedAt < 1500) {
  return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
}

// Length cap — prevent oversized payloads
if (message.length > 5000) {
  return NextResponse.json({ error: 'Message too long' }, { status: 400 })
}
```

Note: `form_loaded_at` should NOT be parsed before `body.name/email/message` extraction — add the checks after extracting `name`, `email`, `message` from body but before the `!name || !email || !message` guard.

## Success Criteria

- [ ] Submitting with `website` field non-empty returns 400
- [ ] Submitting with `form_loaded_at` missing or < 1.5 s ago returns 400
- [ ] Submitting with `message` > 5000 chars returns 400
- [ ] Normal form submission (all fields valid, timing OK) still returns 200
- [ ] `npx tsc --noEmit` passes
- [ ] Honeypot field is not visible, not focusable via Tab, not read by screen readers

## Risk Assessment

- **Low** — purely additive guards, no change to happy path
- Timing check: 1 500 ms is conservative; real users take at minimum 3–5 s to fill the form
- Clock skew between client and server: not a concern since `form_loaded_at` is a client-side `Date.now()` compared to server-side `Date.now()` — both are wall clock, skew negligible
- If `loadedAt` is 0 (SSR before hydration): the `useEffect` only sets it client-side; without JS the form won't submit anyway (it uses `fetch`)
