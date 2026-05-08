import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/sanity-queries'

export const runtime = 'edge'
export const alt = 'Blog post OG image'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

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
        emudev.cc / blog
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
        {post?.title ?? slug}
      </div>
      {post?.excerpt && (
        <div
          style={{
            fontSize: '22px',
            color: '#aaa',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          {post.excerpt.slice(0, 120)}
          {post.excerpt.length > 120 ? '…' : ''}
        </div>
      )}
      {post?.author?.name && (
        <div style={{ display: 'flex', marginTop: '24px', fontSize: '16px', color: '#666' }}>
          {post.author.name}
        </div>
      )}
    </div>,
    { ...size }
  )
}
