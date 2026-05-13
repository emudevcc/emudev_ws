import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'

export function localeAlternates(
  pathname = '',
  locale: string = routing.defaultLocale
): Metadata['alternates'] {
  const normalizedPath = pathname ? `/${pathname.replace(/^\/+/, '')}` : ''
  const defaultPath = `/${routing.defaultLocale}${normalizedPath}`

  return {
    canonical: `/${locale}${normalizedPath}`,
    languages: {
      ...Object.fromEntries(
        routing.locales.map((locale) => [locale, `/${locale}${normalizedPath}`])
      ),
      'x-default': defaultPath,
    },
  }
}
