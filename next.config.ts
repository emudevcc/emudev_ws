import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const isDev = process.env.NODE_ENV === 'development'

const securityHeaders = [
  // Dev: allow Sanity Studio (localhost:3333) to iframe the frontend for Presentation mode
  // Prod: allow same-origin framing for Sanity Presentation Tool at emudev.cc/studio
  isDev
    ? { key: 'Content-Security-Policy', value: 'frame-ancestors *' }
    : { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://emudev.cc" },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true }, // lint runs in CI as a separate step

  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  transpilePackages: ['@sanity/icons', '@sanity/ui'],

  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default withNextIntl(nextConfig)
