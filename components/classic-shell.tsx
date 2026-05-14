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
  const links = [
    { href: '/' as const, label: labels.home },
    { href: '/projects' as const, label: labels.projects },
    { href: '/blog' as const, label: labels.blog },
    { href: '/about' as const, label: labels.about },
    { href: '/contact' as const, label: labels.contact },
  ]

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/75 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
            {settings?.siteName ?? 'emudev'}
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
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
