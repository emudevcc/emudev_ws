import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { presentationTool } from 'sanity/presentation'
import { schema } from './schema'
import { structure } from './structure'

const envValue = (value: string | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const previewOrigin =
  envValue(process.env.NEXT_PUBLIC_SANITY_STUDIO_PREVIEW_URL) ??
  envValue(process.env.SANITY_STUDIO_PREVIEW_URL) ??
  (process.env.NODE_ENV === 'production' ? 'https://www.emudev.cc' : 'http://localhost:3000')

export default defineConfig({
  name: 'emudev-portfolio',
  title: 'Portfolio CMS',
  projectId: 'zziqxayh',
  dataset: envValue(process.env.NEXT_PUBLIC_SANITY_DATASET) ?? 'production',
  plugins: [
    structureTool({ structure }),
    visionTool(),
    presentationTool({
      previewUrl: {
        origin: previewOrigin,
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
  ],
  schema,
})
