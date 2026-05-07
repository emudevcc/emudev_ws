import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/sanity-queries'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Esteban Montero — software engineer',
}

export default async function AboutPage() {
  const settings = await getSiteSettings()

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">About</h1>
      <p className="text-lg leading-relaxed text-muted-foreground">
        {settings?.description ?? 'Software engineer passionate about building great products.'}
      </p>
    </section>
  )
}
