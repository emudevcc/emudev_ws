import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ArrowDown, Calendar, FileText } from 'lucide-react'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { BlurFade } from '@/components/ui/blur-fade'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import { NumberTicker } from '@/components/ui/number-ticker'
import type { SiteSettings } from '@/lib/sanity-queries'

type HeroSectionProps = {
  settings: SiteSettings | null
  projectCount: number
  skillCount: number
  certificationCount: number
}

export function HeroSection({
  settings,
  projectCount,
  skillCount,
  certificationCount,
}: HeroSectionProps) {
  const t = useTranslations('hero')
  const name = settings?.shortName ?? settings?.siteName ?? 'Esteban Montero'
  const role = settings?.role ?? 'Software Engineer'
  const resume = settings?.resumePdfEn ?? settings?.resumePdfEs
  const stats = [
    { value: projectCount, label: t('statProjects') },
    { value: skillCount, label: t('statSkills') },
    { value: certificationCount, label: t('statCredentials') },
    { value: settings?.socialLinks?.length ?? 0, label: t('statLinks') },
  ]

  return (
    <section id="home" className="flex min-h-screen flex-col justify-center px-5 pb-20 pt-28">
      <div className="mx-auto w-full max-w-6xl">
        <BlurFade delay={0}>
          <div className="mb-8 flex items-center gap-4">
            <div className="relative size-20 overflow-hidden rounded-full border border-border bg-muted">
              {settings?.avatar ? (
                <Image src={settings.avatar} alt={name} fill className="object-cover" priority />
              ) : (
                <div className="flex size-full items-center justify-center font-mono text-lg">
                  {name.slice(0, 2)}
                </div>
              )}
              <span className="absolute bottom-1 right-1 size-3 rounded-full border-2 border-background bg-emerald-500" />
            </div>
            <div className="space-y-1 font-mono text-xs text-muted-foreground">
              {settings?.location && <p>{settings.location}</p>}
              {settings?.timezone && <p>{settings.timezone}</p>}
              {settings?.email && <p>{settings.email}</p>}
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.08}>
          <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-balance sm:text-7xl">
            <span className="text-muted-foreground">{t('greeting')} </span>
            <AnimatedShinyText className="inline">{name}</AnimatedShinyText>
            <span className="mt-3 block text-2xl font-medium text-muted-foreground sm:text-3xl">
              {role}
            </span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.16}>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            {settings?.tagline ?? settings?.description ?? t('fallbackTagline')}
          </p>
        </BlurFade>

        <BlurFade delay={0.24}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <InteractiveHoverButton href="#contact">
              <span className="inline-flex items-center gap-2">
                {t('ctaContact')} <ArrowDown size={16} />
              </span>
            </InteractiveHoverButton>
            {settings?.calComUrl && (
              <a
                href={settings.calComUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Calendar size={16} /> {t('ctaSchedule')}
              </a>
            )}
            {resume && (
              <a
                href={resume}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <FileText size={16} /> {t('ctaResume')}
              </a>
            )}
          </div>
        </BlurFade>

        <BlurFade delay={0.32}>
          <div className="mt-16 grid max-w-3xl grid-cols-2 gap-5 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="border-l border-border pl-4">
                <NumberTicker value={stat.value} className="text-4xl font-bold tabular-nums" />
                <p className="mt-1 font-mono text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
