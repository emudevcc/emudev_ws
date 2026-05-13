import type { Metadata } from 'next'
import { localeAlternates } from '@/lib/metadata'
import { getProjects } from '@/lib/sanity-queries'
import { TagFilter } from '@/components/tag-filter'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  return {
    title: 'Projects',
    description: 'A collection of projects by Esteban Montero',
    alternates: localeAlternates('/projects', locale),
  }
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params
  const projects = (await getProjects(locale)) ?? []

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="mb-10 text-4xl font-bold tracking-tight">Projects</h1>
      {projects.length > 0 ? (
        <TagFilter projects={projects} />
      ) : (
        <p className="text-muted-foreground">No projects yet.</p>
      )}
    </section>
  )
}
