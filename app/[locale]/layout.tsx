import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SanityVisualEditing } from '@/components/sanity-visual-editing'
import { SiteNav } from '@/components/site-nav'
import { routing } from '@/i18n/routing'
import { getSiteSettings } from '@/lib/sanity-queries'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

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
    openGraph: { siteName, type: 'website' },
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound()

  const messages = await getMessages()
  const { isEnabled: isDraft } = await draftMode()

  return (
    <html lang={locale}>
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <NextIntlClientProvider messages={messages}>
          <SiteNav />
          <main>{children}</main>
          {isDraft && <SanityVisualEditing />}
          <SpeedInsights />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
