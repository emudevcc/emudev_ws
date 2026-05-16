import { getLocale, getTranslations } from 'next-intl/server'
import { ExternalLink } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { SiteSettings } from '@/lib/sanity-queries'

type SocialLink = NonNullable<SiteSettings['socialLinks']>[number]

type FooterSectionProps = {
  settings?: SiteSettings | null
}

export async function FooterSection({ settings }: FooterSectionProps) {
  const t = await getTranslations('footer')
  const locale = await getLocale()
  const year = new Date().getFullYear()

  const name = settings?.siteName ?? 'emudev'
  const tagline = settings?.tagline ?? t('tagline')

  const navColumns = [
    {
      heading: t('navigate'),
      items: [
        { label: t('home'), href: `/${locale}` },
        { label: t('blog'), href: `/${locale}/blog` },
        { label: t('projects'), href: `/${locale}/projects` },
        { label: t('contact'), href: `/${locale}#contact` },
      ],
    },
    {
      heading: t('explore'),
      items: [
        { label: t('about'), href: `/${locale}#about` },
        { label: t('experience'), href: `/${locale}#experience` },
        { label: t('skills'), href: `/${locale}#skills` },
        { label: t('credentials'), href: `/${locale}#credentials` },
      ],
    },
  ]

  return (
    <footer className="border-t border-border/50 px-5 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="font-mono text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-foreground/80"
            >
              {name}
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{tagline}</p>
            {settings?.socialLinks && settings.socialLinks.length > 0 && (
              <div className="flex gap-3 pt-1">
                {settings.socialLinks.map((link: SocialLink) => (
                  <a
                    key={`${link.platform}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={link.platform ?? 'Social link'}
                  >
                    <ExternalLink size={13} aria-hidden />
                    {link.handle ?? link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Nav columns */}
          {navColumns.map((col) => (
            <div key={col.heading}>
              <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                {col.heading}
              </p>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-border/50 pt-6">
          <p className="font-mono text-xs text-muted-foreground">{t('built', { year })}</p>
        </div>
      </div>
    </footer>
  )
}
