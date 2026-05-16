import { useTranslations } from 'next-intl'
import { BlurFade } from '@/components/ui/blur-fade'
import { Chip } from '@/components/ui/chip'
import { richTextToParagraphs } from '@/lib/content'
import type { About, SiteSettings } from '@/lib/sanity-queries'

type AboutSectionProps = {
  about: About | null
  settings: SiteSettings | null
}

export function AboutSection({ about, settings }: AboutSectionProps) {
  const t = useTranslations('aboutHome')
  const paragraphs = richTextToParagraphs(about?.paragraphs, [t('fallback')])

  return (
    <section id="about" className="mx-auto max-w-6xl px-5 py-24">
      <BlurFade delay={0}>
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
          {t('eyebrow')}
        </p>
        <h2 className="mb-10 text-4xl font-bold tracking-tight">{t('title')}</h2>
      </BlurFade>

      <div className="max-w-3xl space-y-5">
        {paragraphs.map((paragraph, index) => (
          <BlurFade key={`${paragraph.slice(0, 24)}-${index}`} delay={0.08 + index * 0.06}>
            <p className="text-base leading-8 text-muted-foreground">{paragraph}</p>
          </BlurFade>
        ))}
      </div>

      <BlurFade delay={0.32}>
        <div className="mt-8 flex flex-wrap gap-2">
          <Chip label={settings?.location} />
          <Chip label={settings?.timezone} />
          <Chip label={settings?.email} />
          {about?.funFacts?.map((fact) => (
            <Chip key={fact} label={fact} />
          ))}
        </div>
      </BlurFade>
    </section>
  )
}
