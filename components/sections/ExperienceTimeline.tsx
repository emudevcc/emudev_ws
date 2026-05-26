import { useTranslations } from 'next-intl'
import { BlurFade } from '@/components/ui/blur-fade'
import { ExperienceCard } from '@/components/ui/experience-card'
import { MagicCard } from '@/components/ui/magic-card'
import type { Experience } from '@/lib/sanity-queries'

export function ExperienceTimeline({ experiences }: { experiences: Experience[] }) {
  const t = useTranslations('experience')

  return (
    <section id="experience" className="mx-auto max-w-6xl px-5 py-24 scroll-mt-16">
      <BlurFade delay={0}>
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
          {t('eyebrow')}
        </p>
        <h2 className="mb-12 text-4xl font-bold tracking-tight">{t('title')}</h2>
      </BlurFade>

      <div className="relative">
        <div className="absolute bottom-0 left-0 top-0 w-px bg-accent/20" />
        <div className="space-y-5">
          {experiences.map((experience, index) => (
            <BlurFade key={experience._id} delay={0.05 + index * 0.08}>
              <MagicCard className="rounded-lg border-border/70 p-5" gradientOpacity={0.08}>
                <ExperienceCard experience={experience} />
              </MagicCard>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
