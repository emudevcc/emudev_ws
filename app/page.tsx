import { getProjects, getSiteSettings } from '@/lib/sanity-queries'
import { ProjectCard } from '@/components/project-card'
import { HeroSection } from '@/components/ui/hero-section'

export default async function HomePage() {
  const [projects, settings] = await Promise.all([getProjects(), getSiteSettings()])
  const featured = (projects ?? []).slice(0, 3)

  return (
    <>
      <HeroSection
        name={settings?.siteName ?? 'Esteban Montero'}
        bio={settings?.description ?? 'Software Engineer'}
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-10 text-2xl font-bold tracking-tight">Featured Projects</h2>
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featured.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No projects yet — check back soon.</p>
        )}
      </section>
    </>
  )
}
