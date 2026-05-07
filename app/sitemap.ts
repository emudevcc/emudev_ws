import type { MetadataRoute } from 'next'
import { getProjects, getPosts } from '@/lib/sanity-queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emudev.cc'
  const [projects, posts] = await Promise.all([getProjects(), getPosts()])

  return [
    { url: base, lastModified: new Date(), priority: 1.0 },
    { url: `${base}/about`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/projects`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/blog`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/contact`, lastModified: new Date(), priority: 0.7 },
    ...projects
      .filter((p) => p.slug?.current)
      .map((p) => ({
        url: `${base}/projects/${p.slug.current}`,
        lastModified: new Date(p.publishedAt ?? p._createdAt),
        priority: 0.8 as const,
      })),
    ...posts
      .filter((p) => p.slug?.current)
      .map((p) => ({
        url: `${base}/blog/${p.slug.current}`,
        lastModified: new Date(p.publishedAt ?? p._createdAt),
        priority: 0.7 as const,
      })),
  ]
}
