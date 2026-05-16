import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export function InteractiveHoverButton({
  children,
  className,
  href,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string }) {
  const classNames = cn(
    'group bg-background relative inline-flex w-auto cursor-pointer overflow-hidden rounded-full border p-2 px-6 text-center font-semibold',
    className
  )

  const content = (
    <>
      <div className="flex items-center justify-center gap-2">
        <div className="bg-accent h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-[100.8]"></div>
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-white opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
        <span>{children}</span>
        <ArrowRight />
      </div>
    </>
  )

  if (href) {
    return (
      <a href={href} className={classNames}>
        {content}
      </a>
    )
  }

  return (
    <button className={classNames} {...props}>
      {content}
    </button>
  )
}
