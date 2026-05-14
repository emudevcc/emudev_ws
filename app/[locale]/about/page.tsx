import type { Metadata } from 'next'
import { localeAlternates } from '@/lib/metadata'
import { getAbout, getSiteSettings } from '@/lib/sanity-queries'
import { richTextToParagraphs } from '@/lib/content'
import { Chip } from '@/components/ui/chip'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const settings = await getSiteSettings(locale)

  return {
    title: 'About',
    description: settings?.description ?? 'About Esteban Montero — software engineer',
    alternates: localeAlternates('/about', locale),
  }
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const [settings, about] = await Promise.all([getSiteSettings(locale), getAbout(locale)])

  const paragraphs = richTextToParagraphs(about?.paragraphs, [
    settings?.description ?? 'Software engineer passionate about building great products.',
  ])

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="mb-3 font-mono text-xs text-muted-foreground">README.md</p>
      <h1 className="mb-10 text-4xl font-bold tracking-tight">About</h1>

      <div className="space-y-5">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-base leading-8 text-muted-foreground">
            {paragraph}
          </p>
        ))}
      </div>

      {(about?.funFacts?.length || settings?.location) && (
        <div className="mt-8 flex flex-wrap gap-2">
          <Chip label={settings?.location} />
          <Chip label={settings?.timezone} />
          <Chip label={settings?.email} />
          {about?.funFacts?.map((fact) => (
            <Chip key={fact} label={fact} />
          ))}
        </div>
      )}

      {about?.photoCaption && (
        <p className="mt-6 font-mono text-xs text-muted-foreground">{about.photoCaption}</p>
      )}
    </section>
  )
}
