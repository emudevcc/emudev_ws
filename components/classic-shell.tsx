import { Link } from '@/i18n/navigation'
import type { SiteSettings } from '@/lib/sanity-queries'
import { DockNav } from '@/components/ui/dock-nav'
import { LangThemeToggle } from '@/components/ui/lang-theme-toggle'
import { StatusPill } from '@/components/ui/status-pill'

type ClassicShellProps = {
  locale: string
  settings: SiteSettings | null
}

export function ClassicShell({ locale, settings }: ClassicShellProps) {
  const labels =
    locale === 'es'
      ? {
          home: 'Inicio',
          projects: 'Proyectos',
          blog: 'Blog',
          about: 'Sobre mí',
          contact: 'Contacto',
        }
      : { home: 'Home', projects: 'Projects', blog: 'Blog', about: 'About', contact: 'Contact' }
  const navLinkClass = 'transition-colors hover:text-foreground'

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/75 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
            {settings?.siteName ?? 'emudev'}
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            <Link href="/" className={navLinkClass}>
              {labels.home}
            </Link>
            <a href={`/${locale}#about`} className={navLinkClass}>
              {labels.about}
            </a>
            <Link href="/projects" className={navLinkClass}>
              {labels.projects}
            </Link>
            <Link href="/blog" className={navLinkClass}>
              {labels.blog}
            </Link>
            <a href={`/${locale}#contact`} className={navLinkClass}>
              {labels.contact}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <StatusPill
              available={settings?.availableForWork}
              label={settings?.availabilityNote ?? undefined}
            />
            <LangThemeToggle />
          </div>
        </div>
      </header>
      <DockNav locale={locale} />
    </>
  )
}
