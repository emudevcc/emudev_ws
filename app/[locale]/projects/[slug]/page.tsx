import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { getProjects, getProjectBySlug } from '@/lib/sanity-queries'
import { PortableTextRenderer } from '@/components/portable-text-renderer'
import { BlurFade } from '@/components/ui/blur-fade'
import { Chip } from '@/components/ui/chip'
import { routing } from '@/i18n/routing'
import { localeAlternates } from '@/lib/metadata'
import { Breadcrumb } from '@/components/ui/breadcrumb'

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
  const [t, project] = await Promise.all([getTranslations(), getProjectBySlug(slug, locale)])
  if (!project) notFound()

  return (
    <article className="mx-auto max-w-3xl px-5 py-24">
      <BlurFade delay={0.04}>
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: t('nav.home'), href: '/' },
              { label: t('nav.projects'), href: '/projects' },
              { label: project.title ?? '' },
            ]}
          />
        </div>
      </BlurFade>

      <BlurFade delay={0.08}>
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">Project</p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">{project.title}</h1>
        {project.description && (
          <p className="mb-8 text-base leading-8 text-muted-foreground">{project.description}</p>
        )}
      </BlurFade>

      <BlurFade delay={0.12}>
        <div className="mb-8 flex flex-wrap gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-[var(--r-btn)] bg-accent px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Live site <ArrowUpRight size={14} />
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-[var(--r-btn)] border border-hairline bg-surface-1 px-5 text-sm font-medium transition-colors hover:border-accent/60"
            >
              Repository <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </BlurFade>

      {project.tech && project.tech.length > 0 && (
        <BlurFade delay={0.16}>
          <div className="mb-10 flex flex-wrap gap-1.5">
            {project.tech.map((skill) => (
              <Chip key={skill._id} label={skill.name} />
            ))}
          </div>
        </BlurFade>
      )}

      {project.content && (
        <BlurFade delay={0.2}>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <PortableTextRenderer
              content={project.content as Parameters<typeof PortableTextRenderer>[0]['content']}
            />
          </div>
        </BlurFade>
      )}
    </article>
  )
}
