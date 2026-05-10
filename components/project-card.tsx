import Image from 'next/image'
import { Link } from '@/i18n/navigation'

interface ProjectCardProps {
  project: {
    _id: string
    title?: string
    slug?: { current?: string }
    description?: string
    featuredImage?: string
    tags?: Array<{ _id: string; title?: string }>
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const slug = project.slug?.current
  if (!slug) return null

  return (
    <article
      data-testid="project-card"
      className="group flex flex-col rounded-xl border bg-card transition-shadow hover:shadow-md"
    >
      {project.featuredImage && (
        <div className="relative h-48 overflow-hidden rounded-t-xl">
          <Image
            src={project.featuredImage}
            alt={project.title ?? 'Project image'}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/projects/${slug}`} className="mb-2 text-lg font-semibold hover:underline">
          {project.title}
        </Link>
        {project.description && (
          <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
            {project.description}
          </p>
        )}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span key={tag._id} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                {tag.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
