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
      className="w-full rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity disabled:opacity-60"
    >
      {pending ? 'Sending…' : 'Send Message'}
    </button>
  )
}

export function ContactForm() {
  const [state, action] = useActionState(submitContact, null)

  if (state?.success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
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
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
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
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
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
          className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>

      <SubmitButton />
    </form>
  )
}
