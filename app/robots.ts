import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emudev.cc'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot', 'anthropic-ai', 'cohere-ai'],
        disallow: '/',
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
