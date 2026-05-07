import Link from 'next/link'

const links = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          emudev
        </Link>
        <ul className="flex gap-6 text-sm text-muted-foreground">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="transition-colors hover:text-foreground">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
