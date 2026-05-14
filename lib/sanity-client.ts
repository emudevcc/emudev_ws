import { createClient } from 'next-sanity'

const envValue = (value: string | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const projectId = envValue(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) ?? 'zziqxayh'
const dataset = envValue(process.env.NEXT_PUBLIC_SANITY_DATASET) ?? 'production'

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
})

export async function sanityFetch<T>({
  query,
  params = {},
  isDraft = false,
}: {
  query: string
  params?: Record<string, unknown>
  isDraft?: boolean
}): Promise<T> {
  return sanityClient.fetch<T>(query, params, {
    token: isDraft ? process.env.SANITY_API_READ_TOKEN : undefined,
    perspective: isDraft ? 'previewDrafts' : 'published',
  })
}
