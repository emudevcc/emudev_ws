import { useTranslations } from 'next-intl'
import { BlurFade } from '@/components/ui/blur-fade'
import type { Certification, Education, Language } from '@/lib/sanity-queries'

const levels = ['basic', 'intermediate', 'advanced', 'fluent', 'native']

type CredentialsSectionProps = {
  certs: Certification[]
  education: Education[]
  languages: Language[]
}

export function CredentialsSection({ certs, education, languages }: CredentialsSectionProps) {
  const t = useTranslations('credentials')

  return (
    <section id="credentials" className="mx-auto max-w-6xl px-5 py-24">
      <BlurFade delay={0}>
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
          {t('eyebrow')}
        </p>
        <h2 className="mb-10 text-4xl font-bold tracking-tight">{t('title')}</h2>
      </BlurFade>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <BlurFade delay={0.08}>
          <div>
            <h3 className="mb-5 font-semibold">{t('certifications')}</h3>
            <div className="space-y-4">
              {certs.map((cert) => (
                <CredentialRow
                  key={cert._id}
                  title={cert.name}
                  meta={[cert.issuer, cert.issueDate ? new Date(cert.issueDate).getFullYear() : '']
                    .filter(Boolean)
                    .join(' - ')}
                />
              ))}
            </div>
          </div>
        </BlurFade>

        <div className="space-y-8">
          <BlurFade delay={0.14}>
            <div>
              <h3 className="mb-5 font-semibold">{t('education')}</h3>
              <div className="space-y-4">
                {education.map((item) => (
                  <CredentialRow
                    key={item._id}
                    title={[item.degree, item.field].filter(Boolean).join(', ')}
                    meta={[item.institution, item.startYear, item.endYear]
                      .filter(Boolean)
                      .join(' - ')}
                  />
                ))}
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.2}>
            <div className="border-t border-border/70 pt-8">
              <h3 className="mb-5 font-semibold">{t('languages')}</h3>
              <div className="space-y-3">
                {languages.map((language) => (
                  <div key={language._id} className="flex items-center justify-between gap-4">
                    <span className="text-sm">{language.name}</span>
                    <div className="flex items-center gap-3">
                      <ProficiencyDots level={language.proficiency} />
                      <span className="w-24 text-right font-mono text-[11px] text-muted-foreground">
                        {language.cefr ?? language.proficiency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}

function CredentialRow({ title, meta }: { title?: string; meta?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 size-2 rounded-full bg-accent" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        {meta && <p className="mt-1 font-mono text-[11px] text-muted-foreground">{meta}</p>}
      </div>
    </div>
  )
}

function ProficiencyDots({ level }: { level?: string }) {
  const filled = Math.max(1, levels.indexOf(level ?? '') + 1)

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={
            index < filled ? 'size-1.5 rounded-full bg-accent' : 'size-1.5 rounded-full bg-muted'
          }
        />
      ))}
    </div>
  )
}
