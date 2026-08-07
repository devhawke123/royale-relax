/**
 * The `description` column stores each bed's full catalog copy verbatim
 * (intro paragraph(s), a "Premium Features:" list, then a "Why Choose..."
 * closer). This splits that raw text into sections for the detail page —
 * it does not alter what's stored in the DB, only how it's laid out.
 */

export interface ParsedBedDescription {
  intro: string
  features: { title: string; body: string }[]
  whyHeading: string | null
  whyBody: string | null
}

const FEATURES_HEADING = /^(premium (features|details)|premier features|exquisite features)\s*:?$/i
const WHY_HEADING = /^why\b/i
// A bullet's title is short and precedes the colon early on; long prose
// closers ("The Grand Regent Bed isn't just...") don't match this and end
// the feature list.
const MAX_TITLE_LENGTH = 60

export function parseBedDescription(description: string): ParsedBedDescription {
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
    const looksLikeBullet = colonIndex !== -1 && colonIndex <= MAX_TITLE_LENGTH && !WHY_HEADING.test(cleaned)
    if (!looksLikeBullet) break
    features.push({ title: cleaned.slice(0, colonIndex).trim(), body: cleaned.slice(colonIndex + 1).trim() })
  }

  const remaining = paragraphs.slice(i)
  let whyHeading: string | null = null
  let whyBody: string | null = null

  if (remaining.length > 0) {
    // Some entries have the "Why ...!" heading and its paragraph joined by a
    // single newline rather than a blank line — split those apart too.
    const inlineSplit = remaining[0].match(/^(why[^\n]*)\n([\s\S]*)$/i)
    if (inlineSplit) {
      whyHeading = inlineSplit[1].trim()
      whyBody = [inlineSplit[2].trim(), ...remaining.slice(1)].filter(Boolean).join(' ') || null
    } else if (WHY_HEADING.test(remaining[0])) {
      whyHeading = remaining[0]
      whyBody = remaining.slice(1).join(' ') || null
    } else {
      whyBody = remaining.join(' ')
    }
  }

  return { intro, features, whyHeading, whyBody }
}
