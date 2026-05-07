import { PortableText, type PortableTextBlock } from '@portabletext/react'

interface PortableTextRendererProps {
  content: PortableTextBlock[]
}

export function PortableTextRenderer({ content }: PortableTextRendererProps) {
  return (
    <PortableText
      value={content}
      components={{
        block: {
          h2: ({ children }) => <h2 className="mb-4 mt-10 text-2xl font-bold">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-3 mt-8 text-xl font-semibold">{children}</h3>,
          normal: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-4 pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
        },
        marks: {
          code: ({ children }) => (
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{children}</code>
          ),
          link: ({ value, children }) => (
            <a
              href={value?.href}
              target={value?.blank ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-primary"
            >
              {children}
            </a>
          ),
        },
        list: {
          bullet: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>,
          number: ({ children }) => (
            <ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>
          ),
        },
      }}
    />
  )
}
