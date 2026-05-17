'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { MagicCard } from '@/components/ui/magic-card'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import type { SiteSettings } from '@/lib/sanity-queries'

type ContactSectionProps = {
  settings: SiteSettings | null
}

type FormState = 'idle' | 'sending' | 'sent' | 'error'

export function ContactSection({ settings }: ContactSectionProps) {
  const t = useTranslations('contactHome')
  const [state, setState] = useState<FormState>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('sending')

    const form = event.currentTarget
    const payload = Object.fromEntries(new FormData(form))
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => null)

    setState(res?.ok ? 'sent' : 'error')
    if (res?.ok) form.reset()
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-5 py-24">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">{t('eyebrow')}</p>
      <h2 className="text-4xl font-bold tracking-tight">{t('title')}</h2>
      <p className="mt-3 max-w-2xl text-muted-foreground">{t('subtitle')}</p>

      <MagicCard className="mt-8 rounded-lg border-border/70 p-5 sm:p-8" gradientOpacity={0.05}>
        {state === 'sent' ? (
          <div className="py-8 text-center text-muted-foreground">{t('sent')}</div>
        ) : (
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
        )}
      </MagicCard>
    </section>
  )
}

function Field({
  name,
  label,
  type = 'text',
  required,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-ring"
      />
    </label>
  )
}

function Textarea({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <textarea
        name={name}
        required={required}
        rows={4}
        className="resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring"
      />
    </label>
  )
}
