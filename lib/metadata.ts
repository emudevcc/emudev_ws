import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'

export function localeAlternates(
  pathname = '',
  locale: string = routing.defaultLocale
): Metadata['alternates'] {
  const normalizedPath = pathname ? `/${pathname.replace(/^\/+/, '')}` : ''

  function localePath(l: string) {
    return `/${l}${normalizedPath}`
  }

  return {
    canonical: localePath(locale),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, localePath(l)])),
      'x-default': localePath(routing.defaultLocale),
    },
  }
}
