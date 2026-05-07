'use client'

// Magic UI Pro components are installed via CLI: npx magic-ui@latest add <component>
// Wrap here so pages stay as Server Components.
// TODO: after running `npx magic-ui@latest add shimmer-button animated-gradient-text`,
//       replace the placeholders below with the actual Magic UI imports.

interface HeroSectionProps {
  name: string
  bio: string
}

export function HeroSection({ name, bio }: HeroSectionProps) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
      {/* Replace with Magic UI <AnimatedGradientText> after CLI install */}
      <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-7xl">{name}</h1>

      {/* Replace with Magic UI <TextReveal> or <AnimatedText> after CLI install */}
      <p className="mb-10 max-w-xl text-lg text-muted-foreground">{bio}</p>

      <div className="flex gap-4">
        {/* Replace with Magic UI <ShimmerButton> after CLI install */}
        <a
          href="/projects"
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
        >
          View Projects
        </a>
        <a
          href="/contact"
          className="rounded-full border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          Get in Touch
        </a>
      </div>
    </section>
  )
}
