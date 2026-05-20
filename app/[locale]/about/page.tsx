import type { Metadata } from 'next'
import { AboutSection } from '@/components/sections/AboutSection'
import { localeAlternates } from '@/lib/metadata'
import { getAbout, getSiteSettings } from '@/lib/sanity-queries'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  return {
    title: locale === 'es' ? 'Sobre mí' : 'About',
    description:
      locale === 'es'
        ? 'Sobre Esteban Montero - ingeniero de software'
        : 'About Esteban Montero - software engineer',
    alternates: localeAlternates('/about', locale),
  }
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const [about, settings] = await Promise.all([getAbout(locale), getSiteSettings(locale)])

  return <AboutSection about={about} settings={settings} />
}
