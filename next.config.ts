import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true }, // lint runs in CI as a separate step

  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  transpilePackages: ['@sanity/icons', '@sanity/ui'],
}

export default nextConfig
