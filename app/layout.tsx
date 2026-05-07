import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SiteNav } from '@/components/site-nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'emudev', template: '%s | emudev' },
  description: 'Software engineer portfolio — Esteban Montero',
  openGraph: {
    siteName: 'emudev',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <SiteNav />
        <main>{children}</main>
      </body>
    </html>
  )
}
