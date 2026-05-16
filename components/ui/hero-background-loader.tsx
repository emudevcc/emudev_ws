'use client'

import dynamic from 'next/dynamic'

// Client-boundary shim: `ssr: false` is only valid inside Client Components.
// HeroSection is a Server Component, so the dynamic import lives here instead.
export const HeroBackground = dynamic(
  () => import('@/components/ui/hero-background').then((m) => m.HeroBackground),
  { ssr: false }
)
