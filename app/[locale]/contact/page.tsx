import type { Metadata } from 'next'
import { localeAlternates } from '@/lib/metadata'
import { ContactForm } from '@/components/contact-form'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Esteban Montero',
  alternates: localeAlternates('/contact'),
}

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-xl px-6 py-20">
      <h1 className="mb-4 text-4xl font-bold tracking-tight">Contact</h1>
      <p className="mb-10 text-muted-foreground">
        Have a project in mind? Send me a message and I&apos;ll get back to you.
      </p>
      <ContactForm />
    </section>
  )
}
