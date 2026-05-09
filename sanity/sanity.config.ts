import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { presentationTool } from 'sanity/presentation'
import { schema } from './schema'

export default defineConfig({
  name: 'emudev-portfolio',
  title: 'Portfolio CMS',
  projectId: 'zziqxayh',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  plugins: [
    structureTool(),
    visionTool(),
    presentationTool({
      previewUrl: {
        previewMode: { enable: '/api/draft-mode/enable' },
      },
    }),
  ],
  schema,
})
