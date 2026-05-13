import { ImageResponse } from 'next/og'
import { getSiteSettings } from '@/lib/sanity-queries'

export const runtime = 'edge'
export const alt = 'Portfolio preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage({ params }: { params: { locale: string } }) {
  const settings = await getSiteSettings(params.locale)

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#09090b',
        color: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      {settings?.avatar && (
        <img
          src={settings.avatar}
          alt=""
          width={108}
          height={108}
          style={{ borderRadius: 999, objectFit: 'cover' }}
        />
      )}
      <div style={{ fontSize: 56, fontWeight: 800 }}>
        {settings?.shortName ?? settings?.siteName ?? 'Portfolio'}
      </div>
      <div style={{ fontSize: 26, color: '#a1a1aa' }}>{settings?.role ?? ''}</div>
    </div>,
    size
  )
}
