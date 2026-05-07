import { unstable_cache } from 'next/cache'
import { groq } from 'next-sanity'
import { sanityFetch } from './sanity-client'

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const getProjects = unstable_cache(
  async () =>
    sanityFetch<
      Array<{
        _id: string
        title: string
        slug: { current: string }
        description: string
        featuredImage: string
        tags: Array<{ _id: string; title: string }>
        liveUrl: string
        repoUrl: string
        publishedAt: string
        _createdAt: string
      }>
    >({
      query: groq`*[_type == "project"] | order(publishedAt desc) {
        _id, title, slug, description,
        "featuredImage": featuredImage.asset->url,
        tags[]->{ _id, title }, liveUrl, repoUrl, publishedAt, _createdAt
      }`,
    }),
  ['projects'],
  { tags: ['projects'], revalidate: 3600 }
)

export const getProjectBySlug = (slug: string) =>
  unstable_cache(
    async () =>
      sanityFetch<{
        _id: string
        title: string
        slug: { current: string }
        description: string
        featuredImage: string
        content: unknown[]
        tags: Array<{ _id: string; title: string }>
        liveUrl: string
        repoUrl: string
        publishedAt: string
        _createdAt: string
      } | null>({
        query: groq`*[_type == "project" && slug.current == $slug][0] {
          ...,
          "featuredImage": featuredImage.asset->url,
          tags[]->{ _id, title }
        }`,
        params: { slug },
      }),
    [`project-${slug}`],
    { tags: ['projects', `project:${slug}`], revalidate: 3600 }
  )()

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------

export const getPosts = unstable_cache(
  async () =>
    sanityFetch<
      Array<{
        _id: string
        title: string
        slug: { current: string }
        excerpt: string
        publishedAt: string
        _createdAt: string
        author: { name: string }
      }>
    >({
      query: groq`*[_type == "post"] | order(publishedAt desc) {
        _id, title, slug, excerpt, publishedAt, _createdAt,
        "author": author->{ name }
      }`,
    }),
  ['posts'],
  { tags: ['posts'], revalidate: 3600 }
)

export const getPostBySlug = (slug: string) =>
  unstable_cache(
    async () =>
      sanityFetch<{
        _id: string
        title: string
        slug: { current: string }
        excerpt: string
        content: unknown[]
        publishedAt: string
        _createdAt: string
        author: { name: string; image: string }
        tags: Array<{ _id: string; title: string }>
      } | null>({
        query: groq`*[_type == "post" && slug.current == $slug][0] {
          ...,
          "author": author->{ name, "image": image.asset->url },
          tags[]->{ _id, title }
        }`,
        params: { slug },
      }),
    [`post-${slug}`],
    { tags: ['posts', `post:${slug}`], revalidate: 3600 }
  )()

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------

export const getSiteSettings = unstable_cache(
  async () =>
    sanityFetch<{
      siteName: string
      description: string
      logo: string
      socialLinks: Array<{ platform: string; url: string }>
    } | null>({
      query: groq`*[_type == "siteSettings"][0] {
        siteName, description,
        "logo": logo.asset->url,
        socialLinks
      }`,
    }),
  ['site-settings'],
  { tags: ['site-settings'], revalidate: 3600 }
)
