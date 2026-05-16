'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitContact } from '@/app/actions/contact'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-[var(--r-btn)] bg-accent px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? 'Sending…' : 'Send Message'}
    </button>
  )
}

export function ContactForm() {
  const [state, action] = useActionState(submitContact, null)

  if (state?.success) {
    return (
      <div className="rounded-lg border border-status-ok/30 bg-status-ok/10 p-6 text-status-ok">
        Message sent! I&apos;ll get back to you soon.
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>
      )}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={100}
          placeholder="Your name"
          className="h-10 w-full rounded-md border border-hairline bg-surface-input px-3 text-sm outline-none transition-colors focus:border-ring"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="h-10 w-full rounded-md border border-hairline bg-surface-input px-3 text-sm outline-none transition-colors focus:border-ring"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          maxLength={2000}
          placeholder="Tell me about your project…"
          className="w-full resize-none rounded-md border border-hairline bg-surface-input px-3 py-2 text-sm outline-none transition-colors focus:border-ring"
        />
      </div>

      <SubmitButton />
    </form>
  )
}
