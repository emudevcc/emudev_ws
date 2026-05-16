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
            className={`h-8 rounded-full border px-3 font-mono text-[11px] uppercase tracking-[0.04em] transition-colors ${
              active === null
                ? 'border-accent bg-accent text-white'
                : 'border-hairline text-muted-foreground hover:border-accent/60 hover:text-foreground'
            }`}
          >
            All
          </button>
          {allSkills.map((skill) => (
            <button
              key={skill._id}
              onClick={() => setActive(active === skill._id ? null : skill._id)}
              className={`h-8 rounded-full border px-3 font-mono text-[11px] uppercase tracking-[0.04em] transition-colors ${
                active === skill._id
                  ? 'border-accent bg-accent text-white'
                  : 'border-hairline text-muted-foreground hover:border-accent/60 hover:text-foreground'
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
