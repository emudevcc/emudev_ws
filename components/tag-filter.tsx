'use client'

import { useState } from 'react'
import { ProjectCard } from './project-card'

interface Skill {
  _id: string
  name?: string
}

interface Project {
  _id: string
  title?: string
  slug?: { current?: string }
  description?: string
  cover?: string
  tech?: Skill[]
}

interface TagFilterProps {
  projects: Project[]
}

export function TagFilter({ projects }: TagFilterProps) {
  const [active, setActive] = useState<string | null>(null)

  const allSkills = Array.from(
    new Map(
      projects.flatMap((project) => project.tech ?? []).map((skill) => [skill._id, skill])
    ).values()
  )

  const filtered = active
    ? projects.filter((project) => project.tech?.some((skill) => skill._id === active))
    : projects

  return (
    <div>
      {allSkills.length > 0 && (
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
          {allSkills.map((skill) => (
            <button
              key={skill._id}
              onClick={() => setActive(active === skill._id ? null : skill._id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active === skill._id
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {skill.name}
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
