/**
 * FabricColor.description stores each colourway's full marketing copy
 * verbatim (intro paragraph(s), a "Key Features:" list, then a closing
 * paragraph). This splits that raw text into sections for the detail page —
 * it does not alter what's stored in the DB, only how it's laid out.
 */

export interface ParsedFabricDescription {
  intro: string
  features: { title: string; body: string }[]
  outro: string | null
}

const FEATURES_HEADING = /^key features\s*:?$/i
// A bullet's title is short and precedes the colon early on; long prose
// closers ("Transform your living spaces into...") don't match this and end
// the feature list.
const MAX_TITLE_LENGTH = 60

export function parseFabricDescription(description: string): ParsedFabricDescription {
  const paragraphs = description
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  const featuresIndex = paragraphs.findIndex((p) => FEATURES_HEADING.test(p))
  const intro = paragraphs.slice(0, featuresIndex === -1 ? paragraphs.length : featuresIndex).join('\n\n')

  const features: { title: string; body: string }[] = []
  let i = featuresIndex === -1 ? paragraphs.length : featuresIndex + 1
  for (; i < paragraphs.length; i++) {
    const cleaned = paragraphs[i].replace(/^-\s*/, '')
    const colonIndex = cleaned.indexOf(':')
    const looksLikeBullet = colonIndex !== -1 && colonIndex <= MAX_TITLE_LENGTH
    if (!looksLikeBullet) break
    features.push({ title: cleaned.slice(0, colonIndex).trim(), body: cleaned.slice(colonIndex + 1).trim() })
  }

  const outro = paragraphs.slice(i).join('\n\n') || null

  return { intro, features, outro }
}
