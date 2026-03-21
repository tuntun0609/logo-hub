import format from 'xml-formatter'

const VIEWBOX_SPLIT_RE = /[\s,]+/
const SVG_OPEN_TAG_RE = /<svg([^>]*)>/
const CLASS_ATTR_RE = /\bclass=/g
const FOR_ATTR_RE = /\bfor=/g
const TABINDEX_ATTR_RE = /\btabindex=/g
const XMLNS_XLINK_RE = /\s+xmlns:xlink="[^"]*"/g
const XMLNS_RE = /\s+xmlns="[^"]*"/g
const CLASSNAME_RE = /\s+className="[^"]*"/g
const WHITESPACE_RE = /\s+/g

// Pre-build regex map for SVG attribute conversion
const SVG_ATTR_REGEX_MAP: { jsx: string; regex: RegExp }[] = []

/** 格式化 SVG 代码 */
export function prettifySvg(svg: string): string {
  try {
    return format(svg, {
      collapseContent: true,
      indentation: '  ',
      lineSeparator: '\n',
    })
  } catch {
    return svg
  }
}

/** 获取 SVG 的 width/height（从 viewBox 或 width/height 属性） */
export function parseSvgDimensions(svg: string): {
  width: number
  height: number
} {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svg, 'image/svg+xml')
  const el = doc.querySelector('svg')
  if (!el) {
    return { width: 300, height: 150 }
  }

  const w = Number.parseFloat(el.getAttribute('width') || '0')
  const h = Number.parseFloat(el.getAttribute('height') || '0')
  if (w > 0 && h > 0) {
    return { width: w, height: h }
  }

  const vb = el.getAttribute('viewBox')
  if (vb) {
    const parts = vb.trim().split(VIEWBOX_SPLIT_RE)
    const vw = Number.parseFloat(parts[2])
    const vh = Number.parseFloat(parts[3])
    if (vw > 0 && vh > 0) {
      return { width: vw, height: vh }
    }
  }

  return { width: 300, height: 150 }
}

/** 获取字符串字节大小 */
export function getByteSize(str: string): number {
  return new Blob([str]).size
}

/** 格式化字节数为可读字符串 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── SVG → React JSX ─────────────────────────────────────

const SVG_ATTR_MAP: Record<string, string> = {
  'accent-height': 'accentHeight',
  'alignment-baseline': 'alignmentBaseline',
  'arabic-form': 'arabicForm',
  'baseline-shift': 'baselineShift',
  'cap-height': 'capHeight',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'color-interpolation': 'colorInterpolation',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'color-profile': 'colorProfile',
  'dominant-baseline': 'dominantBaseline',
  'enable-background': 'enableBackground',
  'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-size-adjust': 'fontSizeAdjust',
  'font-stretch': 'fontStretch',
  'font-style': 'fontStyle',
  'font-variant': 'fontVariant',
  'font-weight': 'fontWeight',
  'glyph-name': 'glyphName',
  'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
  'glyph-orientation-vertical': 'glyphOrientationVertical',
  'horiz-adv-x': 'horizAdvX',
  'horiz-origin-x': 'horizOriginX',
  'image-rendering': 'imageRendering',
  'letter-spacing': 'letterSpacing',
  'lighting-color': 'lightingColor',
  'marker-end': 'markerEnd',
  'marker-mid': 'markerMid',
  'marker-start': 'markerStart',
  'overline-position': 'overlinePosition',
  'overline-thickness': 'overlineThickness',
  'paint-order': 'paintOrder',
  'panose-1': 'panose1',
  'pointer-events': 'pointerEvents',
  'rendering-intent': 'renderingIntent',
  'shape-rendering': 'shapeRendering',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'strikethrough-position': 'strikethroughPosition',
  'strikethrough-thickness': 'strikethroughThickness',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'stroke-width': 'strokeWidth',
  'text-anchor': 'textAnchor',
  'text-decoration': 'textDecoration',
  'text-rendering': 'textRendering',
  'underline-position': 'underlinePosition',
  'underline-thickness': 'underlineThickness',
  'unicode-bidi': 'unicodeBidi',
  'unicode-range': 'unicodeRange',
  'units-per-em': 'unitsPerEm',
  'v-alphabetic': 'vAlphabetic',
  'v-hanging': 'vHanging',
  'v-ideographic': 'vIdeographic',
  'v-mathematical': 'vMathematical',
  'vert-adv-y': 'vertAdvY',
  'vert-origin-x': 'vertOriginX',
  'vert-origin-y': 'vertOriginY',
  'word-spacing': 'wordSpacing',
  'writing-mode': 'writingMode',
  'x-height': 'xHeight',
  'xlink:actuate': 'xlinkActuate',
  'xlink:arcrole': 'xlinkArcrole',
  'xlink:href': 'xlinkHref',
  'xlink:role': 'xlinkRole',
  'xlink:show': 'xlinkShow',
  'xlink:title': 'xlinkTitle',
  'xlink:type': 'xlinkType',
  'xml:base': 'xmlBase',
  'xml:lang': 'xmlLang',
  'xml:space': 'xmlSpace',
  'xmlns:xlink': 'xmlnsXlink',
}

// Initialize the pre-built regex map after SVG_ATTR_MAP is defined
for (const [attr, jsx] of Object.entries(SVG_ATTR_MAP)) {
  const escaped = attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  SVG_ATTR_REGEX_MAP.push({ jsx, regex: new RegExp(`\\b${escaped}=`, 'g') })
}

function convertAttributes(svgContent: string): string {
  let result = svgContent

  // class -> className
  result = result.replace(CLASS_ATTR_RE, 'className=')

  // for -> htmlFor
  result = result.replace(FOR_ATTR_RE, 'htmlFor=')

  // tabindex -> tabIndex
  result = result.replace(TABINDEX_ATTR_RE, 'tabIndex=')

  // Convert hyphenated/namespaced attributes to camelCase
  for (const { jsx, regex } of SVG_ATTR_REGEX_MAP) {
    result = result.replace(regex, `${jsx}=`)
  }

  // Remove xmlns:xlink declarations
  result = result.replace(XMLNS_XLINK_RE, '')

  return result
}

/** 提取 <svg> 标签的内部内容（不含 <svg> 标签本身） */
function extractSvgInner(svg: string): {
  attrs: string
  inner: string
} {
  const openMatch = svg.match(SVG_OPEN_TAG_RE)
  if (!openMatch) {
    return { attrs: '', inner: svg }
  }

  const attrs = openMatch[1]
  const startIdx = openMatch.index! + openMatch[0].length
  const endIdx = svg.lastIndexOf('</svg>')
  const inner = endIdx > startIdx ? svg.slice(startIdx, endIdx) : ''

  return { attrs, inner }
}

export function svgToReactJsx(svg: string): string {
  const { attrs, inner } = extractSvgInner(svg.trim())
  const jsxAttrs = convertAttributes(attrs)
  const jsxInner = convertAttributes(inner)

  return `import type { SVGProps } from 'react'

export function SvgIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg${jsxAttrs} {...props}>
${jsxInner
  .split('\n')
  .map((l) => `      ${l}`)
  .join('\n')}
    </svg>
  )
}
`
}

// ─── SVG → React Native ──────────────────────────────────

const RN_ELEMENT_MAP: Record<string, string> = {
  circle: 'Circle',
  clipPath: 'ClipPath',
  defs: 'Defs',
  ellipse: 'Ellipse',
  feBlend: 'FeBlend',
  feColorMatrix: 'FeColorMatrix',
  feComponentTransfer: 'FeComponentTransfer',
  feComposite: 'FeComposite',
  feConvolveMatrix: 'FeConvolveMatrix',
  feDiffuseLighting: 'FeDiffuseLighting',
  feDisplacementMap: 'FeDisplacementMap',
  feDistantLight: 'FeDistantLight',
  feFlood: 'FeFlood',
  feFuncA: 'FeFuncA',
  feFuncB: 'FeFuncB',
  feFuncG: 'FeFuncG',
  feFuncR: 'FeFuncR',
  feGaussianBlur: 'FeGaussianBlur',
  feImage: 'FeImage',
  feMerge: 'FeMerge',
  feMergeNode: 'FeMergeNode',
  feMorphology: 'FeMorphology',
  feOffset: 'FeOffset',
  fePointLight: 'FePointLight',
  feSpecularLighting: 'FeSpecularLighting',
  feSpotLight: 'FeSpotLight',
  feTile: 'FeTile',
  feTurbulence: 'FeTurbulence',
  filter: 'Filter',
  foreignObject: 'ForeignObject',
  g: 'G',
  image: 'Image',
  line: 'Line',
  linearGradient: 'LinearGradient',
  marker: 'Marker',
  mask: 'Mask',
  path: 'Path',
  pattern: 'Pattern',
  polygon: 'Polygon',
  polyline: 'Polyline',
  radialGradient: 'RadialGradient',
  rect: 'Rect',
  stop: 'Stop',
  svg: 'Svg',
  symbol: 'Symbol',
  text: 'Text',
  textPath: 'TextPath',
  tspan: 'TSpan',
  use: 'Use',
}

// Pre-build regex for RN element replacement
const RN_ELEMENT_REGEX_MAP: {
  closeRegex: RegExp
  openRegex: RegExp
  openReplaceRegex: RegExp
  rnTag: string
  selfCloseReplaceRegex: RegExp
  testRegex: RegExp
}[] = Object.entries(RN_ELEMENT_MAP).map(([tag, rnTag]) => ({
  closeRegex: new RegExp(`</${tag}>`, 'g'),
  openRegex: new RegExp(`<${tag}(\\s|>|/)`, 'g'),
  openReplaceRegex: new RegExp(`<${tag}(\\s|>)`, 'g'),
  rnTag,
  selfCloseReplaceRegex: new RegExp(`<${tag}/`, 'g'),
  testRegex: new RegExp(`</?${tag}[\\s>/]`),
}))

export function svgToReactNative(svg: string): string {
  let result = svg.trim()

  // Collect used elements
  const usedElements = new Set<string>()

  // Replace element names
  for (const entry of RN_ELEMENT_REGEX_MAP) {
    if (entry.testRegex.test(result)) {
      usedElements.add(entry.rnTag)
      result = result.replace(entry.openReplaceRegex, `<${entry.rnTag}$1`)
      result = result.replace(entry.selfCloseReplaceRegex, `<${entry.rnTag}/`)
      result = result.replace(entry.closeRegex, `</${entry.rnTag}>`)
    }
  }

  // Convert attributes
  result = convertAttributes(result)

  // Remove class/className (not supported in RN SVG)
  result = result.replace(CLASSNAME_RE, '')

  // Remove xmlns attributes
  result = result.replace(XMLNS_RE, '')

  // Build imports
  const svgImport = usedElements.has('Svg') ? 'Svg' : ''
  const otherImports = [...usedElements]
    .filter((e) => e !== 'Svg')
    .sort()
    .join(', ')

  const importParts = [svgImport, otherImports].filter(Boolean).join(', ')

  return `import { ${importParts} } from 'react-native-svg'

export function SvgIcon(props) {
  return (
${result
  .split('\n')
  .map((l) => `    ${l}`)
  .join('\n')}
  )
}
`
}

// ─── SVG → Data URI ──────────────────────────────────────

export function svgToDataUri(svg: string): string {
  const encoded = svg
    .replace(WHITESPACE_RE, ' ')
    .replace(/"/g, "'")
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/{/g, '%7B')
    .replace(/}/g, '%7D')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
  return `data:image/svg+xml,${encoded}`
}

export function svgToBase64DataUri(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
}

// ─── SVG → PNG ───────────────────────────────────────────

export function svgToPng(
  svg: string,
  width: number,
  height: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svg], {
      type: 'image/svg+xml;charset=utf-8',
    })
    const url = URL.createObjectURL(svgBlob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('PNG 导出失败'))),
        'image/png'
      )
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('SVG 渲染失败'))
    }
    img.src = url
  })
}
