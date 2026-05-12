import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { sanityClient } from '@/lib/sanity-client'

const envValue = (value: string | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

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
  const readToken = envValue(process.env.SANITY_API_READ_TOKEN)
  if (!readToken) {
    console.error('[draft-mode] SANITY_API_READ_TOKEN is not set')
    return Response.json(
      { error: 'Draft mode is not configured', missing: 'SANITY_API_READ_TOKEN' },
      { status: 503 }
    )
  }

  let validationResult: Awaited<ReturnType<typeof validatePreviewUrl>>
  try {
    validationResult = await validatePreviewUrl(
      sanityClient.withConfig({ token: readToken }),
      req.url
    )
  } catch (error) {
    console.error('[draft-mode] Failed to validate Sanity preview URL', error)
    return Response.json({ error: 'Failed to validate preview URL' }, { status: 502 })
  }

  const { isValid, redirectTo } = validationResult
  if (!isValid) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const destination = redirectTo ?? redirectUrl
  const safePath = destination.startsWith('/') ? destination : '/'
  const draft = await draftMode()
  draft.enable()
  redirect(safePath)
}
