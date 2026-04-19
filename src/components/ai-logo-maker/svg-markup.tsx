import { type CSSProperties, useLayoutEffect, useRef } from 'react'

interface SvgMarkupProps {
  className?: string
  style?: CSSProperties
  svgCode: string
}

export function SvgMarkup({ className, style, svgCode }: SvgMarkupProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    element.innerHTML = svgCode

    const svg = element.querySelector('svg')
    if (svg) {
      svg.setAttribute('width', svg.getAttribute('width') || '100%')
      svg.setAttribute('height', svg.getAttribute('height') || '100%')
      svg.style.display = 'block'
      svg.style.maxWidth = '100%'
      svg.style.maxHeight = '100%'
      svg.style.width = svg.style.width || '100%'
      svg.style.height = svg.style.height || '100%'
    }
  }, [svgCode])

  return <div className={className} ref={ref} style={style} />
}
