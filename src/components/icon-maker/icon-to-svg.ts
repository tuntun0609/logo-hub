/**
 * Build SVG string from Lucide icon node for canvas rendering.
 */

type IconNode = [elementName: string, attrs: Record<string, string>][]

const SVG_NS = 'http://www.w3.org/2000/svg'
const VIEWBOX = '0 0 24 24'

function attrsToString(attrs: Record<string, string>): string {
  return Object.entries(attrs)
    .filter(([k]) => k !== 'key')
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`)
    .join(' ')
}

function iconNodeToSvgString(iconNode: IconNode, color: string): string {
  const children = iconNode
    .map(([tag, attrs]) => `<${tag} ${attrsToString(attrs)}/>`)
    .join('')
  return `<svg xmlns="${SVG_NS}" width="24" height="24" viewBox="${VIEWBOX}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`
}

export async function getLucideIconSvgDataUrl(
  iconName: string,
  color: string
): Promise<string> {
  const dynamicImports = (await import('lucide-react/dynamicIconImports')) as {
    default: Record<
      string,
      () => Promise<{ __iconNode?: IconNode; default?: unknown }>
    >
  }
  const loader = dynamicImports.default[iconName]
  if (!loader) {
    return ''
  }
  const mod = await loader()
  const node = (mod as { __iconNode?: IconNode }).__iconNode
  if (!node) {
    return ''
  }
  const svg = iconNodeToSvgString(node, color)
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
