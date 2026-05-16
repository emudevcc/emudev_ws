import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Chip } from '@/components/ui/chip'
import { MagicCard } from '@/components/ui/magic-card'

interface ProjectCardProps {
  project: {
    _id: string
    title?: string
    slug?: { current?: string }
    description?: string
    cover?: string
    tech?: Array<{ _id: string; name?: string }>
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const slug = project.slug?.current
  if (!slug) return null

  return (
    <MagicCard
      data-testid="project-card"
      className="h-full overflow-hidden rounded-xl border border-hairline bg-surface-1 p-0"
      gradientOpacity={0.06}
    >
      <Link href={`/projects/${slug}`} className="group block h-full">
        {project.cover && (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={project.cover}
              alt={project.title ?? 'Project image'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h2 className="text-base font-semibold leading-snug transition-colors group-hover:text-accent">
            {project.title}
          </h2>
          {project.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
          )}
          {project.tech && project.tech.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
              {project.tech.map((skill) => (
                <Chip key={skill._id} label={skill.name} />
              ))}
            </div>
          )}
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors group-hover:text-accent">
            View project <ArrowUpRight size={11} />
          </span>
        </div>
      </Link>
    </MagicCard>
  )
}
