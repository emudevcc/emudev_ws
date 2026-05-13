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
import { cn } from '@/lib/utils'

const items = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'about', icon: UserRound, label: 'About' },
  { id: 'experience', icon: BriefcaseBusiness, label: 'Experience' },
  { id: 'projects', icon: Code2, label: 'Projects' },
  { id: 'skills', icon: GitBranch, label: 'Skills' },
  { id: 'social', icon: MessageSquareText, label: 'Social' },
  { id: 'credentials', icon: IdCard, label: 'Credentials' },
  { id: 'strengths', icon: Sparkles, label: 'Strengths' },
  { id: 'writing', icon: FileText, label: 'Writing' },
  { id: 'contact', icon: Contact, label: 'Contact' },
] as const

type DockNavProps = {
  locale: string
}

export function DockNav({ locale }: DockNavProps) {
  const ids = useMemo(() => items.map((item) => item.id), [])
  const active = useActiveSection(ids)

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
    <div className="fixed inset-x-0 bottom-4 z-50 hidden justify-center px-4 md:flex">
      <Dock className="mt-0 bg-background/75" iconSize={38} iconMagnification={56}>
        {items.map(({ id, icon: Icon, label }) => (
          <DockIcon key={id} className="bg-background/80" title={label}>
            <button
              type="button"
              onClick={() => goTo(id)}
              className={cn(
                'inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground',
                active === id && 'bg-primary text-primary-foreground hover:text-primary-foreground'
              )}
              aria-label={label}
            >
              <Icon size={16} />
            </button>
          </DockIcon>
        ))}
      </Dock>
    </div>
  )
}
