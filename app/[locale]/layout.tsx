import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ClassicShell } from '@/components/classic-shell'
import { LayoutWidgets } from '@/components/layout-widgets'
import { FooterSection } from '@/components/sections/FooterSection'
import { ThemeProvider } from '@/components/theme-provider'
import { PageTransition } from '@/components/ui/page-transition'
import { routing } from '@/i18n/routing'
import { localeAlternates } from '@/lib/metadata'
import { getSiteSettings } from '@/lib/sanity-queries'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type LayoutProps = { children: ReactNode; params: Promise<{ locale: string }> }
type MetadataProps = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { locale } = await params
  const settings = await getSiteSettings(locale)
  const siteName = settings?.siteName ?? 'emudev'
  const description = settings?.description ?? 'Software engineer portfolio - Esteban Montero'

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: { default: siteName, template: `%s | ${siteName}` },
    description,
    alternates: localeAlternates('', locale),
    openGraph: { siteName, type: 'website' },
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound()

  const messages = await getMessages()
  const { isEnabled: isDraft } = await draftMode()
  const settings = await getSiteSettings(locale)

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <LayoutWidgets showVisualEditing={isDraft} avatarUrl={settings?.avatar ?? undefined} />
            <ClassicShell locale={locale} settings={settings} />
            <PageTransition>{children}</PageTransition>
            <FooterSection settings={settings} />
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
