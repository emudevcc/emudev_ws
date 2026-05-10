import type { MetadataRoute } from 'next'
import { getProjects, getPosts } from '@/lib/sanity-queries'
import { routing } from '@/i18n/routing'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emudev.cc'
  const contentByLocale = await Promise.all(
    routing.locales.map(async (locale) => {
      const [projects, posts] = await Promise.all([getProjects(locale), getPosts(locale)])
      return { locale, projects: projects ?? [], posts: posts ?? [] }
    })
  )

  return contentByLocale.flatMap(({ locale, projects, posts }) => [
    { url: `${base}/${locale}`, lastModified: new Date(), priority: 1.0 },
    { url: `${base}/${locale}/about`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/${locale}/projects`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/${locale}/blog`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/${locale}/contact`, lastModified: new Date(), priority: 0.7 },
    ...projects.flatMap((project) => {
      const slug = project.slug?.current
      return slug
        ? [
            {
              url: `${base}/${locale}/projects/${slug}`,
              lastModified: new Date(project.publishedAt ?? project._createdAt),
              priority: 0.8 as const,
            },
          ]
        : []
    }),
    ...posts.flatMap((post) => {
      const slug = post.slug?.current
      return slug
        ? [
            {
              url: `${base}/${locale}/blog/${slug}`,
              lastModified: new Date(post.publishedAt ?? post._createdAt),
              priority: 0.7 as const,
            },
          ]
        : []
    }),
  ])
}
