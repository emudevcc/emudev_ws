import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: '#0f0f10',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '32px',
      }}
    >
      <svg width="128" height="128" viewBox="0 0 64 64" fill="none">
        <path
          d="M47 32C47 23.72 40.28 17 32 17S17 23.72 17 32s6.72 15 15 15c4.16 0 7.93-1.69 10.65-4.42"
          stroke="#e34d2a"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M18 32h29" stroke="#e34d2a" strokeWidth="7" strokeLinecap="round" />
        <path
          d="M43.5 21.5 50 15"
          stroke="#ffffff"
          strokeOpacity=".92"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>,
    { ...size }
  )
}
