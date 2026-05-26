import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { localeAlternates } from '@/lib/metadata'
import { getProjects } from '@/lib/sanity-queries'
import { BlurFade } from '@/components/ui/blur-fade'
import { TagFilter } from '@/components/tag-filter'
import { Breadcrumb } from '@/components/ui/breadcrumb'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const title = 'Projects'
  const description = 'A collection of projects by Esteban Montero'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${locale}/projects`,
      type: 'website',
    },
    alternates: localeAlternates('/projects', locale),
  }
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params
  const [t, projects] = await Promise.all([getTranslations(), getProjects(locale)])

  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <BlurFade delay={0.02}>
        <div className="mb-8">
          <Breadcrumb items={[{ label: t('nav.home'), href: '/' }, { label: t('nav.projects') }]} />
        </div>
      </BlurFade>
      <BlurFade delay={0.04}>
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">Work</p>
        <h1 className="mb-10 text-4xl font-bold tracking-tight">Projects</h1>
      </BlurFade>
      {projects.length > 0 ? (
        <TagFilter projects={projects} />
      ) : (
        <p className="text-muted-foreground">No projects yet.</p>
      )}
    </section>
  )
}
