import { unstable_cache } from 'next/cache'
import { groq } from 'next-sanity'
import { sanityFetch } from './sanity-client'

type Locale = 'en' | 'es'

type LocalizedSlug = {
  current?: string
}

type ProjectSummary = {
  _id: string
  title?: string
  slug?: LocalizedSlug
  description?: string
  featuredImage?: string
  tags?: Array<{ _id: string; title?: string }>
  liveUrl?: string
  repoUrl?: string
  publishedAt?: string
  _createdAt: string
}

type ProjectDetail = ProjectSummary & {
  content?: unknown[]
}

type PostSummary = {
  _id: string
  title?: string
  slug?: LocalizedSlug
  excerpt?: string
  publishedAt?: string
  _createdAt: string
  author?: { name?: string }
}

type PostDetail = PostSummary & {
  content?: unknown[]
  author?: { name?: string; image?: string }
  tags?: Array<{ _id: string; title?: string }>
}

type SiteSettings = {
  siteName?: string
  description?: string
  logo?: string
  socialLinks?: Array<{ platform?: string; url?: string }>
}

const normalizeLocale = (locale?: string): Locale => (locale === 'es' ? 'es' : 'en')
const cacheVersion = 'localized-v2'

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const getProjects = (locale?: string) => {
  const safeLocale = normalizeLocale(locale)

  return unstable_cache(
    async () =>
      sanityFetch<ProjectSummary[]>({
        query: groq`*[_type == "project"] | order(publishedAt desc) {
          _id,
          "title": coalesce(title[$locale], title.en),
          "slug": { "current": coalesce(slug[$locale].current, slug.en.current) },
          "description": coalesce(description[$locale], description.en),
          "featuredImage": featuredImage.asset->url,
          "tags": tags[]->{ _id, "title": coalesce(title[$locale], title.en) },
          liveUrl,
          repoUrl,
          publishedAt,
          _createdAt
        }`,
        params: { locale: safeLocale },
      }),
    [`${cacheVersion}-projects-${safeLocale}`],
    { tags: ['projects'], revalidate: 3600 }
  )()
}

export const getProjectBySlug = (slug: string, locale?: string) => {
  const safeLocale = normalizeLocale(locale)

  return unstable_cache(
    async () =>
      sanityFetch<ProjectDetail | null>({
        query: groq`*[
          _type == "project" &&
          (slug.en.current == $slug || slug.es.current == $slug)
        ][0] {
          _id,
          "title": coalesce(title[$locale], title.en),
          "slug": { "current": coalesce(slug[$locale].current, slug.en.current) },
          "description": coalesce(description[$locale], description.en),
          "content": coalesce(content[$locale], content.en),
          "featuredImage": featuredImage.asset->url,
          "tags": tags[]->{ _id, "title": coalesce(title[$locale], title.en) },
          liveUrl,
          repoUrl,
          publishedAt,
          _createdAt
        }`,
        params: { slug, locale: safeLocale },
      }),
    [`${cacheVersion}-project-${slug}-${safeLocale}`],
    { tags: ['projects', `project:${slug}`], revalidate: 3600 }
  )()
}

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------

export const getPosts = (locale?: string) => {
  const safeLocale = normalizeLocale(locale)

  return unstable_cache(
    async () =>
      sanityFetch<PostSummary[]>({
        query: groq`*[_type == "post"] | order(publishedAt desc) {
          _id,
          "title": coalesce(title[$locale], title.en),
          "slug": { "current": coalesce(slug[$locale].current, slug.en.current) },
          "excerpt": coalesce(excerpt[$locale], excerpt.en),
          publishedAt,
          _createdAt,
          "author": author->{ "name": coalesce(name[$locale], name.en) }
        }`,
        params: { locale: safeLocale },
      }),
    [`${cacheVersion}-posts-${safeLocale}`],
    { tags: ['posts'], revalidate: 3600 }
  )()
}

export const getPostBySlug = (slug: string, locale?: string) => {
  const safeLocale = normalizeLocale(locale)

  return unstable_cache(
    async () =>
      sanityFetch<PostDetail | null>({
        query: groq`*[
          _type == "post" &&
          (slug.en.current == $slug || slug.es.current == $slug)
        ][0] {
          _id,
          "title": coalesce(title[$locale], title.en),
          "slug": { "current": coalesce(slug[$locale].current, slug.en.current) },
          "excerpt": coalesce(excerpt[$locale], excerpt.en),
          "content": coalesce(content[$locale], content.en),
          publishedAt,
          _createdAt,
          "author": author->{
            "name": coalesce(name[$locale], name.en),
            "image": image.asset->url
          },
          "tags": tags[]->{ _id, "title": coalesce(title[$locale], title.en) }
        }`,
        params: { slug, locale: safeLocale },
      }),
    [`${cacheVersion}-post-${slug}-${safeLocale}`],
    { tags: ['posts', `post:${slug}`], revalidate: 3600 }
  )()
}

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------

export const getSiteSettings = (locale?: string) => {
  const safeLocale = normalizeLocale(locale)

  return unstable_cache(
    async () =>
      sanityFetch<SiteSettings | null>({
        query: groq`*[_type == "siteSettings"][0] {
          "siteName": coalesce(siteName[$locale], siteName.en),
          "description": coalesce(description[$locale], description.en),
          "logo": logo.asset->url,
          socialLinks
        }`,
        params: { locale: safeLocale },
      }),
    [`${cacheVersion}-site-settings-${safeLocale}`],
    { tags: ['site-settings'], revalidate: 3600 }
  )()
}
