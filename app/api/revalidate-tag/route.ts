import { revalidateTag } from 'next/cache'
import { type NextRequest } from 'next/server'

const TAG_MAP: Record<string, string[]> = {
  project: ['projects'],
  post: ['posts'],
  siteSettings: ['site-settings'],
  author: ['site-settings'],
  tag: ['projects', 'posts'],
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const type = body._type as string
  const tags = TAG_MAP[type] ?? []

  for (const tag of tags) {
    revalidateTag(tag)
  }

  return Response.json({ revalidated: true, tags, type })
}
