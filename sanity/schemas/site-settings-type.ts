import { defineType, defineField } from 'sanity'
import { localizedRichText, localizedString, localizedText } from '../lib/i18n-helpers'

const SOCIAL_PLATFORMS = [
  { title: 'GitHub', value: 'github' },
  { title: 'LinkedIn', value: 'linkedin' },
  { title: 'Twitter', value: 'twitter' },
  { title: 'X', value: 'x' },
  { title: 'YouTube', value: 'youtube' },
  { title: 'Instagram', value: 'instagram' },
  { title: 'Reddit', value: 'reddit' },
  { title: 'Spotify', value: 'spotify' },
  { title: 'Email', value: 'email' },
]

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fieldsets: [
    { name: 'identity', title: 'Identity' },
    { name: 'intro', title: 'Intro' },
    { name: 'availability', title: 'Availability' },
    { name: 'contact', title: 'Contact' },
    { name: 'assets', title: 'Assets' },
    { name: 'config', title: 'Config' },
  ],
  fields: [
    localizedString('siteName', 'Site Name'),
    localizedText('description', 'Description', 3),
    defineField({ name: 'fullName', type: 'string', fieldset: 'identity' }),
    defineField({ name: 'shortName', type: 'string', fieldset: 'identity' }),
    { ...localizedString('role', 'Role / Job Title'), fieldset: 'identity' },
    { ...localizedString('tagline', 'Tagline'), fieldset: 'identity' },
    { ...localizedRichText('heroIntro', 'Hero Intro'), fieldset: 'intro' },
    defineField({
      name: 'avatar',
      type: 'image',
      options: { hotspot: true },
      fieldset: 'identity',
    }),
    defineField({ name: 'logo', type: 'image', options: { hotspot: true }, fieldset: 'assets' }),
    defineField({
      name: 'resumePdfEn',
      title: 'Resume PDF (English)',
      type: 'file',
      options: { accept: 'application/pdf' },
      fieldset: 'assets',
    }),
    defineField({
      name: 'resumePdfEs',
      title: 'Resume PDF (Spanish)',
      type: 'file',
      options: { accept: 'application/pdf' },
      fieldset: 'assets',
    }),
    defineField({ name: 'location', type: 'string', fieldset: 'availability' }),
    defineField({ name: 'timezone', type: 'string', fieldset: 'availability' }),
    defineField({
      name: 'availableForWork',
      type: 'boolean',
      initialValue: false,
      fieldset: 'availability',
    }),
    { ...localizedString('availabilityNote', 'Availability Note'), fieldset: 'availability' },
    defineField({ name: 'calComUrl', type: 'url', fieldset: 'contact' }),
    defineField({ name: 'email', type: 'email', fieldset: 'contact' }),
    defineField({
      name: 'defaultLocale',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'Spanish', value: 'es' },
        ],
      },
      initialValue: 'en',
      fieldset: 'config',
    }),
    defineField({
      name: 'socialLinks',
      type: 'array',
      fieldset: 'contact',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'platform', type: 'string', options: { list: SOCIAL_PLATFORMS } },
            { name: 'handle', type: 'string' },
            { name: 'url', type: 'url' },
            { name: 'visible', type: 'boolean', initialValue: true },
          ],
          preview: { select: { title: 'platform', subtitle: 'handle' } },
        },
      ],
    }),
  ],
  preview: { select: { title: 'fullName', subtitle: 'role.en', media: 'avatar' } },
})
