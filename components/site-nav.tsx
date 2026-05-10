import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { LocaleSwitcher } from './locale-switcher'

export async function SiteNav() {
  const t = await getTranslations('nav')

  const links = [
    { href: '/' as const, label: t('home') },
    { href: '/projects' as const, label: t('projects') },
    { href: '/blog' as const, label: t('blog') },
    { href: '/about' as const, label: t('about') },
    { href: '/contact' as const, label: t('contact') },
  ]

  return (
    <nav className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          emudev
        </Link>
        <ul className="flex gap-6 text-sm text-muted-foreground">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="transition-colors hover:text-foreground">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <LocaleSwitcher />
      </div>
    </nav>
  )
}
