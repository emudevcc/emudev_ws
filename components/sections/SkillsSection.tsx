import { useTranslations } from 'next-intl'
import { BlurFade } from '@/components/ui/blur-fade'
import { Chip } from '@/components/ui/chip'
import { ContributionsCard } from '@/components/sections/ContributionsCard'
import type { SkillSummary } from '@/lib/sanity-queries'

const categories = ['platform', 'language', 'framework', 'tool'] as const

export function SkillsSection({ skills }: { skills: SkillSummary[] }) {
  const t = useTranslations('skills')
  const grouped = categories.map((category) => ({
    category,
    items: skills
      .filter((skill) => skill.category === category)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
  }))

  return (
    <section id="skills" className="mx-auto max-w-6xl px-5 py-24 scroll-mt-16">
      <BlurFade delay={0}>
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
          {t('eyebrow')}
        </p>
        <h2 className="mb-10 text-4xl font-bold tracking-tight">{t('title')}</h2>
      </BlurFade>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {grouped.map(({ category, items }, index) => (
          <BlurFade key={category} delay={0.05 + index * 0.07}>
            <div className="rounded-lg border border-border/70 bg-card p-5">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
                {t(`category.${category}`)}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((skill) => (
                  <Chip key={skill._id} label={skill.name} />
                ))}
              </div>
            </div>
          </BlurFade>
        ))}
      </div>

      <BlurFade delay={0.36}>
        <ContributionsCard />
      </BlurFade>
    </section>
  )
}
