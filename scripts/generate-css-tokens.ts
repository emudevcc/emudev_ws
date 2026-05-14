import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { cssVars } from '../lib/design-tokens'

const CSS_PATH = resolve(process.cwd(), 'app/globals.css')
const INDENT = '  '

function renderVars(vars: Record<string, string>) {
  return Object.entries(vars)
    .map(([prop, value]) => `${INDENT}${prop}: ${value};`)
    .join('\n')
}

function replaceSection(css: string, startMarker: string, endMarker: string, content: string) {
  const start = css.indexOf(startMarker)
  const end = css.indexOf(endMarker)

  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Markers not found or invalid: ${startMarker} ... ${endMarker}`)
  }

  return css.slice(0, start + startMarker.length) + '\n' + content + '\n' + INDENT + css.slice(end)
}

const css = readFileSync(CSS_PATH, 'utf-8')
const nextCss = replaceSection(
  replaceSection(css, '/* [tokens:start] */', '/* [tokens:end] */', renderVars(cssVars.root)),
  '/* [tokens-light:start] */',
  '/* [tokens-light:end] */',
  renderVars(cssVars.light)
)

if (nextCss !== css) {
  writeFileSync(CSS_PATH, nextCss, 'utf-8')
}

console.log(`[tokens] globals.css updated - ${new Date().toLocaleTimeString()}`)
