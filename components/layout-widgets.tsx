'use client'

import dynamic from 'next/dynamic'

// ssr: false is only valid inside Client Components — these widgets don't need
// server-rendered HTML (decorative background + floating chat overlay).
const AIChatWidget = dynamic(
  () => import('@/components/ui/ai-chat-widget').then((m) => ({ default: m.AIChatWidget })),
  { ssr: false }
)

const DotPattern = dynamic(
  () => import('@/components/ui/dot-pattern').then((m) => ({ default: m.DotPattern })),
  { ssr: false }
)

export function LayoutWidgets() {
  return (
    <>
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <DotPattern
          width={28}
          height={28}
          cr={1}
          twinkle
          className="text-muted-foreground [mask-image:linear-gradient(to_bottom,white,transparent_85%)]"
        />
      </div>
      <AIChatWidget />
    </>
  )
}
