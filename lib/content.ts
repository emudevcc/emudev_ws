import { toPlainText as portableToPlainText } from '@portabletext/react'

type PortableTextLike = Parameters<typeof portableToPlainText>[0]

export function richTextToPlainText(value: unknown, fallback = '') {
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return fallback

  if (value.every((item) => typeof item === 'string')) {
    return value.join('\n\n')
  }

  try {
    return portableToPlainText(value as PortableTextLike)
  } catch {
    return fallback
  }
}

export function richTextToParagraphs(value: unknown, fallback: string[] = []) {
  if (!Array.isArray(value)) return fallback
  if (value.every((item) => typeof item === 'string')) return value

  const text = richTextToPlainText(value)
  return text ? text.split(/\n{2,}/).filter(Boolean) : fallback
}

export function yearLabel(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : String(date.getFullYear())
}
