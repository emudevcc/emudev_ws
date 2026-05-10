import { ImageResponse } from 'next/og'
import { getProjectBySlug } from '@/lib/sanity-queries'

export const runtime = 'edge'
export const alt = 'Project OG image'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const project = await getProjectBySlug(slug, locale)

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        width: '100%',
        height: '100%',
        padding: '60px',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', fontSize: '14px', color: '#888', marginBottom: '16px' }}>
        emudev.cc / projects
      </div>
      <div
        style={{
          fontSize: '52px',
          fontWeight: 700,
          lineHeight: 1.1,
          maxWidth: '900px',
          marginBottom: '20px',
        }}
      >
        {project?.title ?? slug}
      </div>
      {project?.description && (
        <div
          style={{
            fontSize: '22px',
            color: '#aaa',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          {project.description.slice(0, 120)}
          {project.description.length > 120 ? '…' : ''}
        </div>
      )}
    </div>,
    { ...size }
  )
}
