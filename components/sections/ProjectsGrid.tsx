import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { BlurFade } from '@/components/ui/blur-fade'
import { BorderBeam } from '@/components/ui/border-beam'
import { Chip } from '@/components/ui/chip'
import { Lens } from '@/components/ui/lens'
import { MagicCard } from '@/components/ui/magic-card'
import type { ProjectSummary } from '@/lib/sanity-queries'

export function ProjectsGrid({ projects }: { projects: ProjectSummary[] }) {
  const t = useTranslations('projectsHome')

  return (
    <section id="projects" className="mx-auto max-w-6xl px-5 py-24">
      <BlurFade delay={0}>
        <p className="mb-3 font-mono text-xs text-muted-foreground">{t('eyebrow')}</p>
        <h2 className="mb-10 text-4xl font-bold tracking-tight">{t('title')}</h2>
      </BlurFade>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {projects.map((project, index) => (
          <BlurFade key={project._id} delay={0.05 + index * 0.07}>
            <ProjectClassicCard project={project} />
          </BlurFade>
        ))}
      </div>
    </section>
  )
}

function ProjectClassicCard({ project }: { project: ProjectSummary }) {
  const slug = project.slug?.current
  const primaryUrl = project.liveUrl ?? project.repoUrl

  return (
    <MagicCard
      className="relative flex h-full flex-col overflow-hidden rounded-lg border-border/70"
      gradientOpacity={0.06}
    >
      {project.featured && <BorderBeam size={180} duration={9} />}
      {project.cover && (
        <Lens lensSize={150} zoomFactor={1.35}>
          <div className="relative aspect-video bg-muted">
            <Image src={project.cover} alt={project.title ?? ''} fill className="object-cover" />
          </div>
        </Lens>
      )}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          {slug ? (
            <Link href={`/projects/${slug}`} className="text-lg font-semibold hover:text-primary">
              {project.title}
            </Link>
          ) : (
            <h3 className="text-lg font-semibold">{project.title}</h3>
          )}
          <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">
            {project.tagline ?? project.description}
          </p>
        </div>
        {project.tech && project.tech.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tech.map((skill) => (
              <Chip key={skill._id} label={skill.name} />
            ))}
          </div>
        )}
        {primaryUrl && (
          <a
            href={primaryUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-auto inline-flex items-center gap-1 border-t border-border/60 pt-4 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {primaryUrl.replace(/^https?:\/\//, '')}
            <ArrowUpRight size={12} />
          </a>
        )}
      </div>
    </MagicCard>
  )
}
