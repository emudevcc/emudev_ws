import { defineType } from 'sanity'
import { localizedArray, localizedRichText, localizedString } from '../lib/i18n-helpers'

export const aboutType = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  fields: [
    localizedRichText('paragraphs', 'Paragraphs'),
    localizedArray('funFacts', 'Fun Facts'),
    localizedString('photoCaption', 'Photo Caption'),
  ],
  preview: { prepare: () => ({ title: 'About Page' }) },
})
