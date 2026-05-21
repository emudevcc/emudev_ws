import { Link } from '@/i18n/navigation'

type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbProps = {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex min-w-0 items-center gap-1.5 font-mono text-xs text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {index > 0 && <span aria-hidden="true">&middot;</span>}
              {isLast || !item.href ? (
                <span aria-current={isLast ? 'page' : undefined} className="max-w-60 truncate">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="transition-colors hover:text-accent">
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
