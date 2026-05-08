import type { Metadata } from 'next'
import { getProjects } from '@/lib/sanity-queries'
import { ProjectCard } from '@/components/project-card'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'A collection of projects by Esteban Montero',
}

export default async function ProjectsPage() {
  const projects = (await getProjects()) ?? []

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="mb-10 text-4xl font-bold tracking-tight">Projects</h1>
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No projects yet.</p>
      )}
    </section>
  )
}
