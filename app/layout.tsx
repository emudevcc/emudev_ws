import type { ReactNode } from 'react'

// html/body shell lives in app/[locale]/layout.tsx so lang can be dynamic
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
