import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const secret = searchParams.get('secret')
  const redirectUrl = searchParams.get('redirect') ?? '/'

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only allow redirects to relative paths (prevent open redirect)
  const safePath = redirectUrl.startsWith('/') ? redirectUrl : '/'

  const draft = await draftMode()
  draft.enable()
  redirect(safePath)
}
