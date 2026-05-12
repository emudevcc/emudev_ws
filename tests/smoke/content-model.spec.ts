import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

function readText(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

test.describe('content model static contracts', () => {
  test('sanity/lib/i18n-helpers.ts exports all 6 helper factories', () => {
    const helpers = readText('sanity/lib/i18n-helpers.ts')

    for (const name of [
      'localizedString',
      'localizedText',
      'localizedSlug',
      'localizedContent',
      'localizedRichText',
      'localizedArray',
    ]) {
      expect(helpers, `${name} should be exported`).toContain(`export const ${name}`)
    }
  })

  test('sanity/schema.ts registers all 14 document types', () => {
    const schema = readText('sanity/schema.ts')

    for (const typeName of [
      'projectType',
      'postType',
      'authorType',
      'tagType',
      'siteSettingsType',
      'aboutType',
      'experienceType',
      'skillType',
      'certificationType',
      'educationType',
      'languageType',
      'strengthType',
      'socialPostType',
      'testimonialType',
    ]) {
      expect(schema, `${typeName} should be in schema.ts`).toContain(typeName)
    }
  })

  test('all 9 new schema files exist', () => {
    for (const file of [
      'sanity/schemas/about-type.ts',
      'sanity/schemas/experience-type.ts',
      'sanity/schemas/skill-type.ts',
      'sanity/schemas/certification-type.ts',
      'sanity/schemas/education-type.ts',
      'sanity/schemas/language-type.ts',
      'sanity/schemas/strength-type.ts',
      'sanity/schemas/social-post-type.ts',
      'sanity/schemas/testimonial-type.ts',
    ]) {
      expect(fs.existsSync(path.join(process.cwd(), file)), `${file} should exist`).toBe(true)
    }
  })

  test('sanity-queries.ts defines query functions for all new types', () => {
    const queries = readText('lib/sanity-queries.ts')

    for (const fn of [
      'getExperiences',
      'getSkills',
      'getAbout',
      'getCertifications',
      'getEducation',
      'getLanguages',
      'getStrengths',
      'getSocialPosts',
      'getTestimonials',
    ]) {
      expect(queries, `${fn} should be exported`).toContain(`export const ${fn}`)
    }
  })

  test('sanity-queries.ts uses updated cache version localized-v3', () => {
    const queries = readText('lib/sanity-queries.ts')
    expect(queries).toContain("cacheVersion = 'localized-v3'")
  })

  test('new type queries use locale coalesce fallback for localized fields', () => {
    const queries = readText('lib/sanity-queries.ts')

    for (const field of ['tagline', 'role', 'summary']) {
      expect(queries, `${field} should use coalesce locale fallback`).toContain(
        `coalesce(${field}[$locale], ${field}.en)`
      )
    }
  })
})
