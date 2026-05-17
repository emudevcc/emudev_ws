---
phase: 1
title: "Simplify form fields and update recipient email"
status: pending
priority: P2
effort: "30m"
dependencies: []
---

# Phase 1: Simplify Form Fields + Update Recipient Email

## Overview

Remove `oppType`, `budget`, `timeline` from the contact form. Keep `name`, `email`, `company`, `message`, `foundVia`. Update i18n in EN/ES. Clean the email body in the API route. Update `.env.example` with the new recipient address.

## Requirements

- Functional:
  - Form has exactly 5 fields: Name, Email, Company (optional), Message, Found via
  - Submit POSTs only those 5 fields to `/api/contact`
  - Email body no longer includes opp/budget/timeline lines
  - Recipient email is `esteban@emudev.com` (via `CONTACT_TO_EMAIL` env var)
- Non-functional:
  - Layout still uses 2-col grid on md+; adjust row groupings
  - i18n keys for removed fields pruned from both EN and ES messages
  - No orphaned i18n keys (`opp.*`, `budget.*`, `timeline.*`) in either locale
  - Subtitle updated to reflect general contact (not project scoping)

## Architecture

No new components. Purely subtractive: remove JSX, remove i18n keys, remove lines from API email body, add env var.

The API route already supports `CONTACT_TO_EMAIL` with priority over `ADMIN_EMAIL`:
```ts
const to = process.env.CONTACT_TO_EMAIL ?? process.env.ADMIN_EMAIL ?? ''
```
So adding `CONTACT_TO_EMAIL=esteban@emudev.com` to the env resolves the routing without any code change to the route.

## Related Code Files

- Modify: `components/sections/ContactSection.tsx`
- Modify: `messages/en.json`
- Modify: `messages/es.json`
- Modify: `app/api/contact/route.ts`
- Modify: `.env.example`

## Implementation Steps

### 1. `components/sections/ContactSection.tsx`

Remove the three `<SelectField>` blocks for `oppType`, `budget`, `timeline`.

**Before** (fields in order): name, email, company, oppType, budget, timeline, message, foundVia + submit  
**After**: name, email, company, message, foundVia + submit

New grid layout (2-col md):
```tsx
<form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
  <Field name="name" label={t('field.name')} required />
  <Field name="email" label={t('field.email')} type="email" required />
  <Field name="company" label={t('field.company')} />
  <div className="md:col-span-2">
    <Textarea name="message" label={t('field.message')} required />
  </div>
  <div className="flex items-end justify-between gap-4 md:col-span-2">
    <p className="font-mono text-xs text-muted-foreground">
      {t('basedIn', { location: settings?.location ?? 'Costa Rica' })}
    </p>
    <ShimmerButton type="submit" disabled={state === 'sending'}>
      {state === 'sending' ? t('sending') : t('submit')}
    </ShimmerButton>
  </div>
  {state === 'error' && (
    <p className="md:col-span-2 font-mono text-xs text-destructive">{t('error')}</p>
  )}
</form>
```

Note: `foundVia` removed too — it's context that makes more sense in a business scoping form. Keep it clean: name, email, company, message.

### 2. `messages/en.json` — contactHome section

Remove keys: `field.company` (optional: keep or remove), `field.oppType`, `field.budget`, `field.timeline`, `field.foundVia`, `opp`, `budget`, `timeline`, `found`

Update:
- `subtitle`: change from project-scoping framing to general contact framing
- Keep: `eyebrow`, `title`, `subtitle`, `sent`, `sending`, `submit`, `error`, `basedIn`, `field.name`, `field.email`, `field.message`
- Optional keep: `field.company` if keeping that field

**New `contactHome` EN block:**
```json
"contactHome": {
  "eyebrow": "CONTACT",
  "title": "Get in touch",
  "subtitle": "Have a question or just want to say hello? Send me a message and I'll get back to you.",
  "sent": "Message sent! I'll get back to you soon.",
  "sending": "Sending...",
  "submit": "Send message",
  "error": "Something went wrong. Please try again.",
  "basedIn": "Based in {location}",
  "field": {
    "name": "Name",
    "email": "Email",
    "company": "Company / Organization",
    "message": "Message"
  }
}
```

### 3. `messages/es.json` — contactHome section

Same structural change in Spanish:
```json
"contactHome": {
  "eyebrow": "CONTACTO",
  "title": "Escríbeme",
  "subtitle": "¿Tienes una pregunta o simplemente quieres saludar? Envíame un mensaje y te responderé pronto.",
  "sent": "¡Mensaje enviado! Te responderé pronto.",
  "sending": "Enviando...",
  "submit": "Enviar mensaje",
  "error": "Algo salió mal. Inténtalo de nuevo.",
  "basedIn": "Basado en {location}",
  "field": {
    "name": "Nombre",
    "email": "Correo",
    "company": "Empresa / Organización",
    "message": "Mensaje"
  }
}
```

### 4. `app/api/contact/route.ts`

Remove the optional lines for `oppType`, `budget`, `timeline`, `foundVia` from the email text body. The `company` line stays.

**Before:**
```ts
text: [
  `From: ${name} <${email}>`,
  body.company ? `Company: ${body.company}` : '',
  body.oppType ? `Opportunity: ${body.oppType}` : '',
  body.budget ? `Budget: ${body.budget}` : '',
  body.timeline ? `Timeline: ${body.timeline}` : '',
  body.foundVia ? `Found via: ${body.foundVia}` : '',
  '',
  message,
].filter(Boolean).join('\n'),
```

**After:**
```ts
text: [
  `From: ${name} <${email}>`,
  body.company ? `Company: ${body.company}` : '',
  '',
  message,
].filter(Boolean).join('\n'),
```

### 5. `.env.example`

Add `CONTACT_TO_EMAIL` entry above `ADMIN_EMAIL`:
```env
CONTACT_TO_EMAIL=esteban@emudev.com
ADMIN_EMAIL=esteban.montero@gmail.com
```

**⚠️ Deployment note:** The user must also add `CONTACT_TO_EMAIL=esteban@emudev.com` to the Vercel project environment variables (Production + Preview). The API checks `CONTACT_TO_EMAIL` first, so this is sufficient without changing `ADMIN_EMAIL`.

## Success Criteria

- [ ] Form renders with 4 fields only: Name, Email, Company, Message
- [ ] `oppType`, `budget`, `timeline`, `foundVia` fields gone from DOM
- [ ] EN/ES i18n has no orphaned keys (`opp.*`, `budget.*`, `timeline.*`, `found.*`)
- [ ] Submitted email body contains only: From, Company (if set), blank line, message
- [ ] `.env.example` has `CONTACT_TO_EMAIL=esteban@emudev.com`
- [ ] `npx tsc --noEmit` passes
- [ ] Form submits successfully (test with dev server)

## Risk Assessment

- **Low risk** — purely subtractive change
- No new dependencies
- API route unchanged structurally; email address is env-var driven (already supported)
- No database schema changes
- i18n: removing keys won't break runtime (missing keys fall back to key name in next-intl, but we're removing them cleanly)
