import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { presentationTool } from 'sanity/presentation'
import { schema } from './schema'

const envValue = (value: string | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export default defineConfig({
  name: 'emudev-portfolio',
  title: 'Portfolio CMS',
  projectId: 'zziqxayh',
  dataset: envValue(process.env.NEXT_PUBLIC_SANITY_DATASET) ?? 'production',
  plugins: [
    structureTool(),
    visionTool(),
    presentationTool({
      previewUrl: {
        origin:
          envValue(process.env.NEXT_PUBLIC_SANITY_STUDIO_PREVIEW_URL) ??
          envValue(process.env.SANITY_STUDIO_PREVIEW_URL) ??
          'http://localhost:3000',
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
  ],
  schema,
})
