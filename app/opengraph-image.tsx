import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Esteban Montero portfolio preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
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
      <div style={{ fontSize: 58, fontWeight: 800 }}>Esteban Montero</div>
      <div style={{ fontSize: 28, color: '#a1a1aa' }}>
        Adobe Analytics Architect & Software Engineer
      </div>
    </div>,
    size
  )
}
