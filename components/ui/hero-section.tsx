'use client'

import Link from 'next/link'

interface HeroSectionProps {
  name: string
  bio: string
}

export function HeroSection({ name, bio }: HeroSectionProps) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-7xl">{name}</h1>

      <p className="mb-10 max-w-xl text-lg text-muted-foreground">{bio}</p>

      <div className="flex gap-4">
        <Link
          href="/projects"
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
        >
          View Projects
        </Link>
        <Link
          href="/contact"
          className="rounded-full border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          Get in Touch
        </Link>
      </div>
    </section>
  )
}
