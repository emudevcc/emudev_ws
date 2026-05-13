import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProjects, getProjectBySlug } from '@/lib/sanity-queries'
import { PortableTextRenderer } from '@/components/portable-text-renderer'
import { routing } from '@/i18n/routing'
import { localeAlternates } from '@/lib/metadata'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const projectsByLocale = await Promise.all(
    routing.locales.map(async (locale) => ({
      locale,
      projects: (await getProjects(locale)) ?? [],
    }))
  )

  return projectsByLocale.flatMap(({ locale, projects }) =>
    projects.flatMap((project) => {
      const slug = project.slug?.current
      return slug ? [{ locale, slug }] : []
    })
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const project = await getProjectBySlug(slug, locale)
  if (!project) return {}
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.cover ? [{ url: project.cover }] : [],
    },
    alternates: localeAlternates(`/projects/${slug}`, locale),
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const project = await getProjectBySlug(slug, locale)
  if (!project) notFound()

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-4 text-4xl font-bold tracking-tight">{project.title}</h1>
      {project.description && (
        <p className="mb-8 text-lg text-muted-foreground">{project.description}</p>
      )}

      <div className="mb-8 flex gap-4">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-foreground px-4 py-2 text-sm text-background"
          >
            Live site ↗
          </a>
        )}
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border px-4 py-2 text-sm"
          >
            Repository ↗
          </a>
        )}
      </div>

      {project.tech && project.tech.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {project.tech.map((skill) => (
            <span key={skill._id} className="rounded-full bg-muted px-3 py-1 text-xs">
              {skill.name}
            </span>
          ))}
        </div>
      )}

      {project.content && (
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <PortableTextRenderer
            content={project.content as Parameters<typeof PortableTextRenderer>[0]['content']}
          />
        </div>
      )}
    </article>
  )
}
