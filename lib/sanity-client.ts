import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

export const sanityClient = createClient({
  projectId: projectId ?? 'placeholder',
  dataset,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
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
  // During build without env vars, return empty data rather than throwing
  if (!projectId) return (Array.isArray([]) ? [] : null) as T

  return sanityClient.fetch<T>(query, params, {
    token: isDraft ? process.env.SANITY_API_READ_TOKEN : undefined,
    perspective: isDraft ? 'previewDrafts' : 'published',
  })
}
