---
phase: 7
title: "Contact, Footer, and API"
status: pending
priority: P1
effort: "4h"
dependencies: [2, 3]
---

# Phase 7: Contact, Footer, and API

## Overview

Build `ContactSection` (MagicCard form wrapper + ShimmerButton submit), `FooterSection` (centered mono line), and the `app/api/contact/route.ts` POST handler that sends emails via Resend. This is the last section added to `page.tsx`.

## Requirements

**Functional:**
- `ContactSection` renders a 2-col responsive form with 8 fields; submit via `ShimmerButton`; handles loading/sent/error states
- Footer renders centered mono "Built with care · {year}"
- `app/api/contact/route.ts` accepts POST, validates body, sends email via Resend; returns 200/400/500
- Social icon links from `getSiteSettings.socials` shown below form

**Non-functional:**
- Section ID: `id="contact"`
- Form collapses to 1-col on mobile
- `RESEND_API_KEY` + `CONTACT_TO_EMAIL` must be in Vercel env vars (not `NEXT_PUBLIC_`)
- API route validates required fields server-side

## Related Code Files

- Create: `components/sections/ContactSection.tsx`
- Create: `components/sections/FooterSection.tsx`
- Create: `app/api/contact/route.ts`
- Modify: `app/[locale]/page.tsx` (add both sections)

## Implementation Steps

### Step 1: Add to `app/[locale]/page.tsx`

```tsx
import { ContactSection } from '@/components/sections/ContactSection'
import { FooterSection } from '@/components/sections/FooterSection'

// In JSX after WritingList:
<ContactSection settings={settings} />
<FooterSection />
```

### Step 2: Create `app/api/contact/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const TO = process.env.CONTACT_TO_EMAIL ?? ''

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || !body.name || !body.email || !body.message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { name, email, company, oppType, budget, timeline, message, foundVia } = body

  try {
    await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: TO,
      replyTo: email,
      subject: `New contact: ${name}${company ? ` @ ${company}` : ''}`,
      text: [
        `From: ${name} <${email}>`,
        company ? `Company: ${company}` : '',
        oppType ? `Opportunity: ${oppType}` : '',
        budget ? `Budget: ${budget}` : '',
        timeline ? `Timeline: ${timeline}` : '',
        foundVia ? `Found via: ${foundVia}` : '',
        '',
        message,
      ].filter(Boolean).join('\n'),
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Resend error:', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
```

Install Resend: `npm install resend`.

Add to `.env.local` + Vercel:
```
RESEND_API_KEY=re_xxx
CONTACT_TO_EMAIL=you@example.com
```

### Step 3: Create `components/sections/ContactSection.tsx`

```tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MagicCard } from '@/components/ui/magic-card'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { Github, Linkedin, Twitter } from 'lucide-react'
import type { SiteSettings } from '@/lib/sanity/types'

interface ContactSectionProps { settings: SiteSettings | null }

type FormState = 'idle' | 'sending' | 'sent' | 'error'

export function ContactSection({ settings }: ContactSectionProps) {
  const t = useTranslations('contactHome')
  const [state, setState] = useState<FormState>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setState('sending')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setState(res.ok ? 'sent' : 'error')
  }

  return (
    <section id="contact" className="py-24">
      <p className="font-mono text-xs text-muted-foreground mb-3">{t('eyebrow')}</p>
      <h2 className="text-[38px] font-bold tracking-tight mb-2">{t('title')}</h2>
      <p className="text-muted-foreground mb-8">{t('subtitle')}</p>

      <MagicCard className="rounded-xl border border-border/60 p-6 sm:p-8" gradientOpacity={0.05}>
        {state === 'sent' ? (
          <p className="text-center py-8 text-muted-foreground">{t('sent')}</p>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field name="name"    label={t('fieldName')}    required />
            <Field name="email"   label={t('fieldEmail')}   type="email" required />
            <Field name="company" label={t('fieldCompany')} />
            <SelectField name="oppType" label={t('fieldOppType')} options={[
              { value: 'fulltime',    label: t('oppFulltime') },
              { value: 'freelance',   label: t('oppFreelance') },
              { value: 'consulting',  label: t('oppConsulting') },
              { value: 'other',       label: t('oppOther') },
            ]} />
            <SelectField name="budget" label={t('fieldBudget')} options={[
              { value: 'sub5k',    label: t('budgetSub5k') },
              { value: '5to20k',   label: t('budget5to20k') },
              { value: '20kplus',  label: t('budget20kPlus') },
              { value: 'na',       label: t('budgetNA') },
            ]} />
            <SelectField name="timeline" label={t('fieldTimeline')} options={[
              { value: 'asap',     label: t('timelineAsap') },
              { value: '1to3',     label: t('timeline1to3') },
              { value: '3to6',     label: t('timeline3to6') },
              { value: 'flexible', label: t('timelineFlexible') },
            ]} />
            <div className="sm:col-span-2">
              <Textarea name="message" label={t('fieldMessage')} required />
            </div>
            <SelectField name="foundVia" label={t('fieldFoundVia')} options={[
              { value: 'google',   label: t('foundGoogle') },
              { value: 'github',   label: t('foundGitHub') },
              { value: 'linkedin', label: t('foundLinkedIn') },
              { value: 'referral', label: t('foundReferral') },
              { value: 'other',    label: t('foundOther') },
            ]} />
            <div className="sm:col-span-2 flex items-center justify-between pt-2">
              <span className="font-mono text-xs text-muted-foreground">
                {t('basedIn')} {settings?.location}
              </span>
              <ShimmerButton type="submit" disabled={state === 'sending'}>
                {state === 'sending' ? t('sending') : t('submit')}
              </ShimmerButton>
            </div>
          </form>
        )}
      </MagicCard>

      {/* Social icons */}
      {settings?.socials && (
        <div className="flex gap-4 mt-6">
          {settings.socials.map(s => (
            <a key={s.platform} href={s.url} target="_blank" rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors">
              <SocialIcon platform={s.platform} size={18} />
            </a>
          ))}
        </div>
      )}
    </section>
  )
}

// Inline field primitives (kept small; extract if >200 lines)
function Field({ name, label, type = 'text', required = false }: {
  name: string; label: string; type?: string; required?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-mono text-muted-foreground">{label}</span>
      <input name={name} type={type} required={required}
        className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
    </label>
  )
}

function SelectField({ name, label, options }: {
  name: string; label: string; options: { value: string; label: string }[]
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-mono text-muted-foreground">{label}</span>
      <select name={name}
        className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}

function Textarea({ name, label, required = false }: {
  name: string; label: string; required?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-mono text-muted-foreground">{label}</span>
      <textarea name={name} required={required} rows={4}
        className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
    </label>
  )
}

function SocialIcon({ platform, size }: { platform: string; size: number }) {
  if (platform === 'github')   return <Github size={size} />
  if (platform === 'linkedin') return <Linkedin size={size} />
  if (platform === 'twitter')  return <Twitter size={size} />
  return null
}
```

### Step 4: Create `components/sections/FooterSection.tsx`

```tsx
import { useTranslations } from 'next-intl'

export function FooterSection() {
  const t = useTranslations('footer')
  return (
    <footer className="py-12 text-center">
      <p className="font-mono text-xs text-muted-foreground">
        {t('built')} {new Date().getFullYear()}
      </p>
    </footer>
  )
}
```

### Step 5: Verify

```bash
npm install resend
npm run typecheck && npm run build
# Test form submission with curl:
curl -X POST http://localhost:3000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"t@t.com","message":"Hello"}'
# Should return {"ok":true} (or 503 if RESEND_API_KEY missing)
```

## Todo List

- [ ] Install `resend` package
- [ ] Create `app/api/contact/route.ts`
- [ ] Add `RESEND_API_KEY` + `CONTACT_TO_EMAIL` to `.env.local` and Vercel env vars
- [ ] Create `components/sections/ContactSection.tsx`
- [ ] Create `components/sections/FooterSection.tsx`
- [ ] Add both sections to `app/[locale]/page.tsx`
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run build` — passes
- [ ] Visual: form submits, ShimmerButton animates, sent state shows confirmation

## Success Criteria

- [ ] `ContactSection` renders all 8 form fields
- [ ] `ShimmerButton` submit triggers POST to `/api/contact`
- [ ] Sent state shows confirmation message from i18n
- [ ] Footer renders "Built with care · 2026" (or current year)
- [ ] Social icons below form link to correct URLs from SiteSettings
- [ ] `npm run build` passes

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `RESEND_API_KEY` missing in staging | Medium | Low | Return 503; ContactSection shows generic error message |
| Form `FormData` doesn't serialize `select` values | Very Low | Low | `Object.fromEntries(new FormData(...))` handles select elements natively |
| `SocialIcon` platform keys don't match Sanity enum | Low | Low | Check Sanity `social.platform` field enum values; add icons as needed |
