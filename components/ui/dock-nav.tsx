'use client'

import {
  BriefcaseBusiness,
  Code2,
  Contact,
  FileText,
  GitBranch,
  Home,
  IdCard,
  MessageSquareText,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { useMemo } from 'react'
import { Dock, DockIcon } from '@/components/ui/dock'
import { useActiveSection } from '@/hooks/use-active-section'
import { useScrollVisibility } from '@/hooks/use-scroll-visibility'
import { cn } from '@/lib/utils'

const items = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'about', icon: UserRound, label: 'About' },
  { id: 'experience', icon: BriefcaseBusiness, label: 'Experience' },
  { id: 'projects', icon: Code2, label: 'Projects' },
  { id: 'skills', icon: GitBranch, label: 'Skills' },
  { id: 'credentials', icon: IdCard, label: 'Credentials' },
  { id: 'writing', icon: FileText, label: 'Writing' },
  { id: 'strengths', icon: Sparkles, label: 'Strengths' },
  { id: 'social', icon: MessageSquareText, label: 'Social' },
  { id: 'contact', icon: Contact, label: 'Contact' },
] as const

type DockNavProps = {
  locale: string
}

export function DockNav({ locale }: DockNavProps) {
  const ids = useMemo(() => items.map((item) => item.id), [])
  const active = useActiveSection(ids)
  const dockVisible = useScrollVisibility()

  function goTo(id: string) {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      history.replaceState(null, '', `#${id}`)
      return
    }

    window.location.assign(`/${locale}#${id}`)
  }

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-4 z-50 hidden justify-center px-4 md:flex',
        'transition-all duration-300 ease-out',
        dockVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      )}
    >
      <div className="rounded-2xl" style={{ background: 'var(--dock-bg)' }}>
        <Dock className="mt-0 bg-transparent" iconSize={38} iconMagnification={56}>
          {items.map(({ id, icon: Icon, label }) => (
            <DockIcon key={id} className="bg-background/80" title={label}>
              <a
                href={`/${locale}#${id}`}
                onClick={(event) => {
                  event.preventDefault()
                  goTo(id)
                }}
                className={cn(
                  'inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground',
                  active === id &&
                    'bg-primary text-primary-foreground hover:text-primary-foreground'
                )}
                aria-label={label}
              >
                <Icon size={16} />
              </a>
            </DockIcon>
          ))}
        </Dock>
      </div>
    </div>
  )
}
