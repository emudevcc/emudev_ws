import { useTranslations } from 'next-intl'
import { BlurFade } from '@/components/ui/blur-fade'
import { richTextToPlainText } from '@/lib/content'
import type { Strength } from '@/lib/sanity-queries'

export function StrengthsCard({ strengths }: { strengths: Strength[] }) {
  const t = useTranslations('strengths')

  return (
    <section id="strengths" className="mx-auto max-w-6xl px-5 py-16">
      <BlurFade delay={0}>
        <p className="mb-3 font-mono text-xs text-muted-foreground">{t('eyebrow')}</p>
        <h2 className="mb-10 text-4xl font-bold tracking-tight">{t('title')}</h2>
      </BlurFade>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {strengths.slice(0, 5).map((strength, index) => (
          <BlurFade key={strength._id} delay={0.05 + index * 0.07}>
            <div className="h-full rounded-lg border border-border/70 bg-card p-4">
              <span className="font-mono text-xs text-primary">
                {String(strength.rank ?? index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 font-semibold">{strength.name}</h3>
              <p className="mt-3 line-clamp-5 font-mono text-[11px] leading-6 text-muted-foreground">
                {richTextToPlainText(strength.description, strength.domain ?? '')}
              </p>
            </div>
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
