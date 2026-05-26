import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import {
  getAbout,
  getCertifications,
  getEducation,
  getExperiences,
  getLanguages,
  getPosts,
  getProjects,
  getSiteSettings,
  getSkills,
  getSocialPosts,
  getStrengths,
} from '@/lib/sanity-queries'
import { AboutSection } from '@/components/sections/AboutSection'
import { CredentialsSection } from '@/components/sections/CredentialsSection'
import { ExperienceTimeline } from '@/components/sections/ExperienceTimeline'
import { HeroSection } from '@/components/sections/HeroSection'
import { ProjectsGrid } from '@/components/sections/ProjectsGrid'
import { StrengthsCard } from '@/components/sections/StrengthsCard'
import { WritingList } from '@/components/sections/WritingList'
import { localeAlternates } from '@/lib/metadata'

// Defer client JS for below-fold sections with unique heavy Client Component children
const SkillsSection = dynamic(() =>
  import('@/components/sections/SkillsSection').then((m) => ({ default: m.SkillsSection }))
)
const SocialPostsGrid = dynamic(() =>
  import('@/components/sections/SocialPostsGrid').then((m) => ({ default: m.SocialPostsGrid }))
)
// Code-split the below-fold contact form
const ContactSection = dynamic(() =>
  import('@/components/sections/ContactSection').then((m) => ({ default: m.ContactSection }))
)

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const settings = await getSiteSettings(locale)

  return {
    title: settings ? `${settings.shortName ?? settings.siteName} - ${settings.role}` : 'Portfolio',
    description: settings?.tagline ?? settings?.description ?? '',
    openGraph: {
      title: settings?.shortName ?? settings?.siteName ?? 'Portfolio',
      description: settings?.tagline ?? settings?.description ?? '',
      locale,
    },
    alternates: localeAlternates('', locale),
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const [
    settings,
    about,
    experiences,
    projects,
    skills,
    socialPosts,
    certs,
    education,
    languages,
    strengths,
    posts,
  ] = await Promise.all([
    getSiteSettings(locale),
    getAbout(locale),
    getExperiences(locale),
    getProjects(locale),
    getSkills(),
    getSocialPosts(locale),
    getCertifications(),
    getEducation(locale),
    getLanguages(),
    getStrengths(locale),
    getPosts(locale),
  ])

  const thisYear = new Date().getFullYear()
  const earliestYear =
    experiences?.reduce((min, e) => {
      if (!e.startDate) return min
      const y = new Date(e.startDate).getFullYear()
      return y < min ? y : min
    }, thisYear) ?? thisYear
  const yearsOfExperience = thisYear - earliestYear
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emudev.cc'
  const sameAs =
    settings?.socialLinks
      ?.filter((link) => link.url && ['github', 'linkedin'].includes(link.platform ?? ''))
      .map((link) => link.url as string) ?? []
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: settings?.fullName ?? settings?.siteName ?? 'Esteban Montero',
    url: `${siteUrl}/${locale}`,
    jobTitle: settings?.role ?? 'Software Engineer',
    sameAs,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <HeroSection
        settings={settings}
        yearsOfExperience={yearsOfExperience}
        skillCount={skills?.length ?? 0}
        certificationCount={certs?.length ?? 0}
        postCount={posts?.length ?? 0}
        languageCount={languages?.length ?? 0}
      />
      <AboutSection about={about} settings={settings} />
      <ExperienceTimeline experiences={experiences ?? []} />
      <ProjectsGrid projects={projects ?? []} />
      <SkillsSection skills={skills ?? []} />
      <CredentialsSection
        certs={certs ?? []}
        education={education ?? []}
        languages={languages ?? []}
      />
      <WritingList posts={posts ?? []} />
      <StrengthsCard strengths={strengths ?? []} />
      <SocialPostsGrid posts={socialPosts ?? []} />
      <ContactSection settings={settings} />
    </>
  )
}
