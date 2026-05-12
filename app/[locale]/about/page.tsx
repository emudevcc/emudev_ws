import type { Metadata } from 'next'
import { localeAlternates } from '@/lib/metadata'
import { getSiteSettings } from '@/lib/sanity-queries'

type Props = { params: Promise<{ locale: string }> }

export const metadata: Metadata = {
  title: 'About',
  description: 'About Esteban Montero — software engineer',
  alternates: localeAlternates('/about'),
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const settings = await getSiteSettings(locale)

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">About</h1>
      <p className="text-lg leading-relaxed text-muted-foreground">
        {settings?.description ?? 'Software engineer passionate about building great products.'}
      </p>
    </section>
  )
}
