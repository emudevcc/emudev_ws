import { unstable_cache } from 'next/cache'
import { groq } from 'next-sanity'
import { sanityFetch } from './sanity-client'

type Locale = 'en' | 'es'

type LocalizedSlug = {
  current?: string
}

export type SkillSummary = {
  _id: string
  name?: string
  slug?: { current?: string }
  category?: string
  iconImage?: string
  iconSlug?: string
  level?: string
  yearsExperience?: number
  order?: number
}

export type ProjectSummary = {
  _id: string
  title?: string
  slug?: LocalizedSlug
  description?: string
  tagline?: string
  cover?: string
  tech?: SkillSummary[]
  liveUrl?: string
  repoUrl?: string
  publishedAt?: string
  featured?: boolean
  order?: number
  _createdAt: string
}

export type ProjectDetail = ProjectSummary & {
  content?: unknown[]
  role?: string
  year?: number
  status?: string
  caseStudyUrl?: string
  gallery?: string[]
  metrics?: Array<{ label?: string; value?: string }>
}

export type PostSummary = {
  _id: string
  title?: string
  slug?: LocalizedSlug
  excerpt?: string
  cover?: string
  publishedAt?: string
  readingMinutes?: number
  status?: string
  _createdAt: string
  author?: { name?: string; image?: string }
  tags?: Array<{ _id: string; title?: string }>
}

export type PostDetail = PostSummary & {
  content?: unknown[]
  author?: { name?: string; image?: string }
  authorOverride?: { name?: string; image?: string }
  tags?: Array<{ _id: string; title?: string }>
  canonicalUrl?: string
}

export type SiteSettings = {
  fullName?: string
  shortName?: string
  role?: string
  tagline?: string
  heroIntro?: unknown[]
  siteName?: string
  description?: string
  logo?: string
  avatar?: string
  resumePdfEn?: string
  resumePdfEs?: string
  location?: string
  timezone?: string
  availableForWork?: boolean
  availabilityNote?: string
  calComUrl?: string
  email?: string
  defaultLocale?: string
  socialLinks?: Array<{ platform?: string; handle?: string; url?: string; visible?: boolean }>
}

export type About = {
  paragraphs?: unknown[]
  funFacts?: string[]
  photoCaption?: string
}

export type Experience = {
  _id: string
  role?: string
  company?: string
  companyUrl?: string
  companyLogo?: string
  location?: string
  employmentType?: string
  startDate?: string
  endDate?: string
  summary?: unknown[]
  highlights?: string[]
  tech?: SkillSummary[]
  clients?: string[]
  order?: number
}

export type Certification = {
  _id: string
  name?: string
  issuer?: string
  issuerLogo?: string
  issueDate?: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
  badgeImage?: string
  skills?: SkillSummary[]
}

export type Education = {
  _id: string
  institution?: string
  degree?: string
  field?: string
  startYear?: number
  endYear?: number
  location?: string
  notes?: string
}

export type Language = {
  _id: string
  name?: string
  code?: string
  proficiency?: string
  cefr?: string
}

export type Strength = {
  _id: string
  name?: string
  rank?: number
  domain?: string
  description?: unknown[]
}

export type SocialPost = {
  _id: string
  platform?: string
  handle?: string
  subreddit?: string
  body?: unknown[]
  postedAt?: string
  permalink?: string
  stats?: { likes?: number; replies?: number; reposts?: number }
  featured?: boolean
}

export type Testimonial = {
  _id: string
  quote?: string
  author?: string
  authorRole?: string
  authorCompany?: string
  authorAvatar?: string
  relatedExperience?: { _id: string; role?: string; company?: string }
}

const normalizeLocale = (locale?: string): Locale => (locale === 'es' ? 'es' : 'en')
const cacheVersion = 'localized-v4'

const skillProjection = groq`{
  _id,
  name,
  "slug": { "current": slug.current },
  category,
  "iconImage": iconImage.asset->url,
  iconSlug,
  level,
  yearsExperience,
  order
}`

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const getProjects = (locale?: string) => {
  const safeLocale = normalizeLocale(locale)

  return unstable_cache(
    async () =>
      sanityFetch<ProjectSummary[]>({
        query: groq`*[_type == "project"] | order(coalesce(order, 9999) asc, publishedAt desc) {
          _id,
          "title": coalesce(title[$locale], title.en),
          "slug": { "current": coalesce(slug[$locale].current, slug.en.current) },
          "description": coalesce(description[$locale], description.en),
          "tagline": coalesce(tagline[$locale], tagline.en),
          "cover": coalesce(cover.asset->url, featuredImage.asset->url),
          "tech": tech[]->${skillProjection},
          liveUrl,
          repoUrl,
          publishedAt,
          featured,
          order,
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
          "tagline": coalesce(tagline[$locale], tagline.en),
          "role": coalesce(role[$locale], role.en),
          year,
          status,
          "cover": coalesce(cover.asset->url, featuredImage.asset->url),
          "tech": tech[]->${skillProjection},
          "gallery": gallery[].asset->url,
          "metrics": metrics[]{ "label": coalesce(label[$locale], label.en), value },
          liveUrl,
          repoUrl,
          caseStudyUrl,
          publishedAt,
          featured,
          order,
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
          "cover": cover.asset->url,
          publishedAt,
          readingMinutes,
          status,
          _createdAt,
          "author": author->{
            "name": coalesce(name[$locale], name.en),
            "image": image.asset->url
          },
          "tags": tags[]->{ _id, "title": coalesce(title[$locale], title.en) }
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
          "cover": cover.asset->url,
          publishedAt,
          readingMinutes,
          canonicalUrl,
          status,
          _createdAt,
          "author": author->{
            "name": coalesce(name[$locale], name.en),
            "image": image.asset->url
          },
          "authorOverride": authorOverride->{
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
          fullName,
          shortName,
          "role": coalesce(role[$locale], role.en),
          "tagline": coalesce(tagline[$locale], tagline.en),
          "heroIntro": coalesce(heroIntro[$locale], heroIntro.en),
          "siteName": coalesce(siteName[$locale], siteName.en),
          "description": coalesce(description[$locale], description.en),
          "logo": logo.asset->url,
          "avatar": avatar.asset->url,
          "resumePdfEn": resumePdfEn.asset->url,
          "resumePdfEs": resumePdfEs.asset->url,
          location,
          timezone,
          availableForWork,
          "availabilityNote": coalesce(availabilityNote[$locale], availabilityNote.en),
          calComUrl,
          email,
          defaultLocale,
          "socialLinks": socialLinks[visible != false]{ platform, handle, url, visible }
        }`,
        params: { locale: safeLocale },
      }),
    [`${cacheVersion}-site-settings-${safeLocale}`],
    { tags: ['site-settings'], revalidate: 3600 }
  )()
}

// ---------------------------------------------------------------------------
// Expanded content model
// ---------------------------------------------------------------------------

export const getSkills = () =>
  unstable_cache(
    async () =>
      sanityFetch<SkillSummary[]>({
        query: groq`*[_type == "skill"] | order(order asc, name asc) ${skillProjection}`,
      }),
    [`${cacheVersion}-skills`],
    { tags: ['skills'], revalidate: 3600 }
  )()

export const getAbout = (locale?: string) => {
  const safeLocale = normalizeLocale(locale)

  return unstable_cache(
    async () =>
      sanityFetch<About | null>({
        query: groq`*[_type == "about"][0] {
          "paragraphs": coalesce(paragraphs[$locale], paragraphs.en),
          "funFacts": coalesce(funFacts[$locale], funFacts.en),
          "photoCaption": coalesce(photoCaption[$locale], photoCaption.en)
        }`,
        params: { locale: safeLocale },
      }),
    [`${cacheVersion}-about-${safeLocale}`],
    { tags: ['about'], revalidate: 3600 }
  )()
}

export const getExperiences = (locale?: string) => {
  const safeLocale = normalizeLocale(locale)

  return unstable_cache(
    async () =>
      sanityFetch<Experience[]>({
        query: groq`*[_type == "experience"] | order(startDate desc) {
          _id,
          "role": coalesce(role[$locale], role.en),
          company,
          companyUrl,
          "companyLogo": companyLogo.asset->url,
          location,
          employmentType,
          startDate,
          endDate,
          "summary": coalesce(summary[$locale], summary.en),
          "highlights": coalesce(highlights[$locale], highlights.en),
          "tech": tech[]->${skillProjection},
          clients,
          order
        }`,
        params: { locale: safeLocale },
      }),
    [`${cacheVersion}-experiences-${safeLocale}`],
    { tags: ['experiences'], revalidate: 3600 }
  )()
}

export const getCertifications = () =>
  unstable_cache(
    async () =>
      sanityFetch<Certification[]>({
        query: groq`*[_type == "certification"] | order(issueDate desc) {
          _id,
          name,
          issuer,
          "issuerLogo": issuerLogo.asset->url,
          issueDate,
          expiryDate,
          credentialId,
          credentialUrl,
          "badgeImage": badgeImage.asset->url,
          "skills": skills[]->${skillProjection}
        }`,
      }),
    [`${cacheVersion}-certifications`],
    { tags: ['certifications'], revalidate: 3600 }
  )()

export const getEducation = (locale?: string) => {
  const safeLocale = normalizeLocale(locale)

  return unstable_cache(
    async () =>
      sanityFetch<Education[]>({
        query: groq`*[_type == "education"] | order(startYear desc) {
          _id,
          institution,
          "degree": coalesce(degree[$locale], degree.en),
          "field": coalesce(field[$locale], field.en),
          startYear,
          endYear,
          location,
          "notes": coalesce(notes[$locale], notes.en)
        }`,
        params: { locale: safeLocale },
      }),
    [`${cacheVersion}-education-${safeLocale}`],
    { tags: ['educations'], revalidate: 3600 }
  )()
}

export const getEducations = getEducation

export const getLanguages = () =>
  unstable_cache(
    async () =>
      sanityFetch<Language[]>({
        query: groq`*[_type == "language"] | order(name asc) {
          _id,
          name,
          code,
          proficiency,
          cefr
        }`,
      }),
    [`${cacheVersion}-languages`],
    { tags: ['languages'], revalidate: 3600 }
  )()

export const getStrengths = (locale?: string) => {
  const safeLocale = normalizeLocale(locale)

  return unstable_cache(
    async () =>
      sanityFetch<Strength[]>({
        query: groq`*[_type == "strength"] | order(rank asc) {
          _id,
          name,
          rank,
          domain,
          "description": coalesce(description[$locale], description.en)
        }`,
        params: { locale: safeLocale },
      }),
    [`${cacheVersion}-strengths-${safeLocale}`],
    { tags: ['strengths'], revalidate: 3600 }
  )()
}

export const getSocialPosts = (locale?: string) => {
  const safeLocale = normalizeLocale(locale)

  return unstable_cache(
    async () =>
      sanityFetch<SocialPost[]>({
        query: groq`*[_type == "socialPost"] | order(postedAt desc) {
          _id,
          platform,
          handle,
          subreddit,
          "body": coalesce(body[$locale], body.en),
          postedAt,
          permalink,
          stats,
          featured
        }`,
        params: { locale: safeLocale },
      }),
    [`${cacheVersion}-social-posts-${safeLocale}`],
    { tags: ['socialPosts'], revalidate: 3600 }
  )()
}

export const getTestimonials = (locale?: string) => {
  const safeLocale = normalizeLocale(locale)

  return unstable_cache(
    async () =>
      sanityFetch<Testimonial[]>({
        query: groq`*[_type == "testimonial"] {
          _id,
          "quote": coalesce(quote[$locale], quote.en),
          author,
          "authorRole": coalesce(authorRole[$locale], authorRole.en),
          authorCompany,
          "authorAvatar": authorAvatar.asset->url,
          "relatedExperience": relatedExperience->{
            _id,
            "role": coalesce(role[$locale], role.en),
            company
          }
        }`,
        params: { locale: safeLocale },
      }),
    [`${cacheVersion}-testimonials-${safeLocale}`],
    { tags: ['testimonials'], revalidate: 3600 }
  )()
}
