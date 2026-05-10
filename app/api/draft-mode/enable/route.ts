import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { sanityClient } from '@/lib/sanity-client'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const secret = searchParams.get('secret')
  const redirectUrl =
    searchParams.get('redirect') ?? searchParams.get('sanity-preview-pathname') ?? '/'

  // Path 1: static secret (manual testing / webhooks)
  if (secret) {
    if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const safePath = redirectUrl.startsWith('/') ? redirectUrl : '/'
    const draft = await draftMode()
    draft.enable()
    redirect(safePath)
  }

  // Path 2: Sanity Presentation Tool short-lived token (validates against Sanity dataset)
  const { isValid, redirectTo } = await validatePreviewUrl(
    sanityClient.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
    req.url
  )
  if (!isValid) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const destination = redirectTo ?? redirectUrl
  const safePath = destination.startsWith('/') ? destination : '/'
  const draft = await draftMode()
  draft.enable()
  redirect(safePath)
}
