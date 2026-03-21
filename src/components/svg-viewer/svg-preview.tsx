'use client'

import { Maximize, Minus, Plus } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { cn } from '@/lib/utils'

type BgMode = 'checkerboard' | 'dark' | 'white'

interface SvgPreviewProps {
  bgMode: BgMode
  onBgModeChange: (mode: BgMode) => void
  svg: string
}

const BG_OPTIONS: { label: string; value: BgMode }[] = [
  { label: '透明', value: 'checkerboard' },
  { label: '白色', value: 'white' },
  { label: '深色', value: 'dark' },
]

const MIN_ZOOM = 0.05
const MAX_ZOOM = 50
/** +/- 按钮每次缩放比例（略小于 1.15，避免一下跳太多） */
const ZOOM_STEP = 1.08
/** 滚轮：按 deltaY 连续缩放，触控板多次小 delta 不会每下都 × 固定倍数 */
const WHEEL_ZOOM_SENSITIVITY = 0.0012

export function SvgPreview({ bgMode, onBgModeChange, svg }: SvgPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgWrapRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })
  const panOrigin = useRef({ x: 0, y: 0 })
  const hasSvg = svg.trim().length > 0

  // Inject SVG HTML
  useEffect(() => {
    if (svgWrapRef.current) {
      svgWrapRef.current.innerHTML = hasSvg ? svg : ''
    }
  }, [hasSvg, svg])

  // Fit to view when SVG changes
  useLayoutEffect(() => {
    if (!hasSvg) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
      return
    }
    // Small delay to let SVG render
    const timer = setTimeout(() => fitToView(), 30)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSvg, svg])

  const fitToView = useCallback(() => {
    const container = containerRef.current
    const wrap = svgWrapRef.current
    if (!(container && wrap)) {
      return
    }

    const svgEl = wrap.querySelector('svg')
    if (!svgEl) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
      return
    }

    const containerRect = container.getBoundingClientRect()
    const padding = 40

    // Try to get intrinsic SVG size
    let svgW = svgEl.width.baseVal.value || svgEl.getBoundingClientRect().width
    let svgH =
      svgEl.height.baseVal.value || svgEl.getBoundingClientRect().height

    // Fallback to viewBox
    const vb = svgEl.viewBox.baseVal
    if (!(svgW && svgH) && vb && vb.width && vb.height) {
      svgW = vb.width
      svgH = vb.height
    }

    if (!(svgW && svgH)) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
      return
    }

    const availW = containerRect.width - padding * 2
    const availH = containerRect.height - padding * 2
    const scale = Math.min(availW / svgW, availH / svgH, 1)

    setZoom(scale)
    setPan({ x: 0, y: 0 })
  }, [])

  // Wheel zoom — 必须用 passive: false 的原生监听，否则 preventDefault 无法阻止页面滚动
  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = container.getBoundingClientRect()
      const cursorX = e.clientX - rect.left - rect.width / 2
      const cursorY = e.clientY - rect.top - rect.height / 2

      setZoom((prev) => {
        const factor = Math.exp(-e.deltaY * WHEEL_ZOOM_SENSITIVITY)
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev * factor))
        const ratio = 1 - next / prev
        setPan((p) => ({
          x: p.x + (cursorX - p.x) * ratio,
          y: p.y + (cursorY - p.y) * ratio,
        }))
        return next
      })
    }

    container.addEventListener('wheel', onWheel, { passive: false })
    return () => container.removeEventListener('wheel', onWheel)
  }, [])

  // Pan via pointer (mouse + touch)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) {
        return
      }
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      isPanning.current = true
      panStart.current = { x: e.clientX, y: e.clientY }
      panOrigin.current = { ...pan }
    },
    [pan]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isPanning.current) {
        return
      }
      const dx = e.clientX - panStart.current.x
      const dy = e.clientY - panStart.current.y
      setPan({
        x: panOrigin.current.x + dx,
        y: panOrigin.current.y + dy,
      })
    },
    []
  )

  const endPan = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning.current) {
      return
    }
    isPanning.current = false
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // capture may already be released
    }
  }, [])

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z * ZOOM_STEP))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z / ZOOM_STEP))
  }, [])

  const zoomPercent = Math.round(zoom * 100)

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b px-2 py-1.5 sm:px-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          <span className="mr-1 shrink-0 text-muted-foreground text-xs">
            背景
          </span>
          {BG_OPTIONS.map((opt) => (
            <button
              className={cn(
                'rounded-md px-2 py-0.5 text-xs transition-colors',
                bgMode === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
              key={opt.value}
              onClick={() => onBgModeChange(opt.value)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={zoomOut}
            title="缩小"
            type="button"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="min-w-12 text-center font-mono text-muted-foreground text-xs tabular-nums">
            {zoomPercent}%
          </span>
          <button
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={zoomIn}
            title="放大"
            type="button"
          >
            <Plus className="size-3.5" />
          </button>
          <button
            className="ml-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={fitToView}
            title="适应视口"
            type="button"
          >
            <Maximize className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div
        className={cn(
          'relative flex-1 touch-none overflow-hidden overscroll-contain',
          hasSvg && (isPanning.current ? 'cursor-grabbing' : 'cursor-grab'),
          bgMode === 'checkerboard' && 'bg-checkerboard',
          bgMode === 'white' && 'bg-white',
          bgMode === 'dark' && 'bg-neutral-900'
        )}
        onPointerCancel={endPan}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPan}
        ref={containerRef}
      >
        <div
          className={cn(
            'absolute top-1/2 left-1/2 origin-center [&_svg]:block',
            !hasSvg && 'hidden'
          )}
          ref={svgWrapRef}
          style={{
            transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        />
        {!hasSvg && (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground text-sm">暂无预览</p>
          </div>
        )}
      </div>
    </div>
  )
}
