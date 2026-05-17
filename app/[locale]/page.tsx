import type { Metadata } from 'next'
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
import { ContactSection } from '@/components/sections/ContactSection'
import { CredentialsSection } from '@/components/sections/CredentialsSection'
import { ExperienceTimeline } from '@/components/sections/ExperienceTimeline'
import { FooterSection } from '@/components/sections/FooterSection'
import { HeroSection } from '@/components/sections/HeroSection'
import { ProjectsGrid } from '@/components/sections/ProjectsGrid'
import { SkillsSection } from '@/components/sections/SkillsSection'
import { SocialPostsGrid } from '@/components/sections/SocialPostsGrid'
import { StrengthsCard } from '@/components/sections/StrengthsCard'
import { WritingList } from '@/components/sections/WritingList'
import { localeAlternates } from '@/lib/metadata'

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

  return (
    <>
      <HeroSection
        settings={settings}
        projectCount={projects?.length ?? 0}
        skillCount={skills?.length ?? 0}
        certificationCount={certs?.length ?? 0}
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
      <FooterSection settings={settings} />
    </>
  )
}
