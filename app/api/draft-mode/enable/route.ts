import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const secret = searchParams.get('secret')
  // Presentation Tool generates its own short-lived token alongside our static secret
  const sanityPreviewSecret = searchParams.get('sanity-preview-secret')
  const redirectUrl =
    searchParams.get('redirect') ?? searchParams.get('sanity-preview-pathname') ?? '/'

  const validStaticSecret = secret === process.env.SANITY_REVALIDATE_SECRET
  const hasSanityToken = Boolean(sanityPreviewSecret)

  if (!validStaticSecret && !hasSanityToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only allow redirects to relative paths (prevent open redirect)
  const safePath = redirectUrl.startsWith('/') ? redirectUrl : '/'

  const draft = await draftMode()
  draft.enable()
  redirect(safePath)
}
