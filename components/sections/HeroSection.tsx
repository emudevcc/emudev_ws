import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ArrowDown, ArrowRight, Calendar, FileText } from 'lucide-react'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { BlurFade } from '@/components/ui/blur-fade'
import { HeroBackground } from '@/components/ui/hero-background-loader'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import { NumberTicker } from '@/components/ui/number-ticker'
import { richTextToPlainText } from '@/lib/content'
import type { SiteSettings } from '@/lib/sanity-queries'

type HeroSectionProps = {
  settings: SiteSettings | null
  yearsOfExperience: number
  skillCount: number
  certificationCount: number
  postCount: number
  languageCount: number
}

export function HeroSection({
  settings,
  yearsOfExperience,
  skillCount,
  certificationCount,
  postCount,
  languageCount,
}: HeroSectionProps) {
  const t = useTranslations('hero')
  const name = settings?.shortName ?? settings?.siteName ?? 'Esteban Montero'
  const role = settings?.role ?? 'Software Engineer'
  const resume = settings?.resumePdfEn ?? settings?.resumePdfEs
  const intro = richTextToPlainText(settings?.heroIntro)
  const avatarBlurDataUrl = settings?.avatar
    ? `${settings.avatar}${settings.avatar.includes('?') ? '&' : '?'}w=20&blur=50&q=10&auto=format`
    : undefined
  const stats = [
    { value: yearsOfExperience, label: t('statExperience'), href: '#experience' },
    { value: skillCount, label: t('statSkills'), href: '#skills' },
    { value: certificationCount, label: t('statCredentials'), href: '#credentials' },
    { value: postCount, label: t('statPosts'), href: '#writing' },
    { value: languageCount, label: t('statLanguages'), href: '#credentials' },
    { value: settings?.socialLinks?.length ?? 0, label: t('statLinks'), href: '#social' },
  ]

  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col justify-center px-5 pb-20 pt-28"
    >
      <HeroBackground />
      <div className="relative mx-auto w-full max-w-6xl">
        {/* Theme-adaptive scrim: dark canvas in dark mode, white canvas in light mode */}
        <div
          className="pointer-events-none absolute -inset-x-6 -inset-y-8 rounded-[2rem] bg-canvas/60 backdrop-blur-md"
          aria-hidden="true"
        />
        <BlurFade delay={0}>
          <div className="mb-8 flex items-center gap-4">
            <div className="relative size-20 overflow-hidden rounded-full border border-border bg-muted">
              {settings?.avatar ? (
                <Image
                  src={settings.avatar}
                  alt={name}
                  fill
                  className="object-cover"
                  priority
                  placeholder={avatarBlurDataUrl ? 'blur' : undefined}
                  blurDataURL={avatarBlurDataUrl}
                />
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
            {intro || settings?.tagline || settings?.description || t('fallbackTagline')}
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
          <div className="mt-16 grid max-w-4xl grid-cols-3 gap-5 sm:grid-cols-6">
            {stats.map((stat) => (
              <a
                key={stat.label}
                href={stat.href}
                className="group block border-l-2 border-accent/50 pl-4 transition-all duration-200 hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <NumberTicker
                  value={stat.value}
                  className="text-4xl font-bold tabular-nums transition-colors duration-200 group-hover:text-foreground"
                />
                <div className="mt-1 flex items-center gap-1.5">
                  <p className="font-mono text-xs text-muted-foreground transition-colors duration-200 group-hover:text-foreground/70">
                    {stat.label}
                  </p>
                  <ArrowRight
                    size={10}
                    className="text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100"
                  />
                </div>
              </a>
            ))}
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
