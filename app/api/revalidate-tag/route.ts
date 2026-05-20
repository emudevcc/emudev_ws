import { revalidateTag } from 'next/cache'
import { type NextRequest } from 'next/server'

const TAG_MAP: Record<string, string[]> = {
  project: ['projects'],
  post: ['posts'],
  siteSettings: ['site-settings'],
  author: ['site-settings'],
  tag: ['projects', 'posts'],
  about: ['about'],
  skill: ['skills', 'projects', 'experiences', 'certifications'],
  experience: ['experiences', 'testimonials'],
  certification: ['certifications'],
  education: ['educations'],
  language: ['languages'],
  strength: ['strengths'],
  socialPost: ['socialPosts'],
  testimonial: ['testimonials'],
}

export async function POST(req: NextRequest) {
  // Secret must be sent as a header — never in query params (would appear in logs)
  const secret = req.headers.get('x-sanity-webhook-secret')
  const expectedSecret = process.env.SANITY_REVALIDATE_SECRET

  if (!expectedSecret) {
    console.error('[revalidate-tag] SANITY_REVALIDATE_SECRET is not set')
    return Response.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (secret !== expectedSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const type = body._type as string
  const tags = TAG_MAP[type] ?? []

  try {
    for (const tag of tags) {
      revalidateTag(tag)
    }
  } catch {
    return Response.json({ error: 'Revalidation failed' }, { status: 500 })
  }

  return Response.json({ revalidated: true, tags, type })
}
