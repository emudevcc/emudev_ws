'use client'

import { useState } from 'react'
import { ProjectCard } from './project-card'

interface Tag {
  _id: string
  title?: string
}

interface Project {
  _id: string
  title?: string
  slug?: { current?: string }
  description?: string
  featuredImage?: string
  tags?: Tag[]
}

interface TagFilterProps {
  projects: Project[]
}

export function TagFilter({ projects }: TagFilterProps) {
  const [active, setActive] = useState<string | null>(null)

  const allTags = Array.from(
    new Map(projects.flatMap((p) => p.tags ?? []).map((t) => [t._id, t])).values()
  )

  const filtered = active ? projects.filter((p) => p.tags?.some((t) => t._id === active)) : projects

  return (
    <div>
      {allTags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActive(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              active === null
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag._id}
              onClick={() => setActive(active === tag._id ? null : tag._id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active === tag._id
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tag.title}
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No projects match this filter.</p>
      )}
    </div>
  )
}
