import DOMPurify from 'dompurify'

const SVG_MARKDOWN_FENCE_REGEX =
  /```(?:svg|xml)?\s*([\s\S]*?<svg[\s\S]*?<\/svg>)\s*```/i
const DIRECT_SVG_REGEX = /<svg[\s\S]*?<\/svg>/i
const VIEW_BOX_REGEX = /viewBox=["']([^"']+)["']/
const WHITESPACE_SPLIT_REGEX = /\s+/
const WIDTH_ATTR_REGEX = /width=["'](\d+)["']/
const HEIGHT_ATTR_REGEX = /height=["'](\d+)["']/

/**
 * Sanitize SVG content to remove dangerous elements
 */
export function sanitizeSvg(svg: string): string {
  if (typeof window === 'undefined') {
    // Server-side: basic sanitization
    return svg
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
  }

  // Client-side: use DOMPurify
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['use'],
  })
}

/**
 * Validate if string is valid SVG
 */
export function validateSvg(svg: string): boolean {
  if (!svg || typeof svg !== 'string') {
    return false
  }

  const trimmed = svg.trim()
  if (!(trimmed.startsWith('<svg') && trimmed.endsWith('</svg>'))) {
    return false
  }

  try {
    if (typeof window !== 'undefined') {
      const parser = new DOMParser()
      const doc = parser.parseFromString(trimmed, 'image/svg+xml')
      const parserError = doc.querySelector('parsererror')
      return !parserError
    }
    return true
  } catch {
    return false
  }
}

/**
 * Extract SVG code from markdown code block
 */
export function extractSvgFromMarkdown(text: string): string | null {
  const svgMatch = text.match(SVG_MARKDOWN_FENCE_REGEX)
  if (svgMatch?.[1]) {
    return svgMatch[1].trim()
  }

  // Try direct SVG
  const directMatch = text.match(DIRECT_SVG_REGEX)
  if (directMatch?.[0]) {
    return directMatch[0].trim()
  }

  return null
}

/**
 * Parse SVG dimensions
 */
export function parseSvgDimensions(
  svg: string
): { width: number; height: number } | null {
  const viewBoxMatch = svg.match(VIEW_BOX_REGEX)
  if (viewBoxMatch) {
    const [, , , width, height] = viewBoxMatch[1]
      .split(WHITESPACE_SPLIT_REGEX)
      .map(Number)
    if (width && height) {
      return { width, height }
    }
  }

  const widthMatch = svg.match(WIDTH_ATTR_REGEX)
  const heightMatch = svg.match(HEIGHT_ATTR_REGEX)
  if (widthMatch && heightMatch) {
    return { width: Number(widthMatch[1]), height: Number(heightMatch[1]) }
  }

  return null
}
