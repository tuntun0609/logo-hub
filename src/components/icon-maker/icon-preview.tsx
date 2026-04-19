'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { getLucideIconSvgDataUrl } from './icon-to-svg'
import type { FillStyles, IconMakerState } from './types'

const SIZE = 512

function addRoundRectSubpath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const cr = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.moveTo(x + cr, y)
  ctx.lineTo(x + w - cr, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + cr)
  ctx.lineTo(x + w, y + h - cr)
  ctx.quadraticCurveTo(x + w, y + h, x + w - cr, y + h)
  ctx.lineTo(x + cr, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - cr)
  ctx.lineTo(x, y + cr)
  ctx.quadraticCurveTo(x, y, x + cr, y)
  ctx.closePath()
}

function drawRoundRectPath(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath()
  addRoundRectSubpath(ctx, 0, 0, SIZE, SIZE, r)
}

function drawGradient(
  ctx: CanvasRenderingContext2D,
  fill: FillStyles,
  radius: number
) {
  const { fillType, primaryColor, secondaryColor, angle } = fill
  drawRoundRectPath(ctx, radius)
  if (fillType === 'solid') {
    ctx.fillStyle = primaryColor
    ctx.fill()
    return
  }
  const rad = (angle * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const cx = SIZE / 2
  const cy = SIZE / 2
  const dist = Math.sqrt(SIZE * SIZE + SIZE * SIZE) / 2
  const x0 = cx - cos * dist
  const y0 = cy - sin * dist
  const x1 = cx + cos * dist
  const y1 = cy + sin * dist
  if (fillType === 'linear') {
    const grad = ctx.createLinearGradient(x0, y0, x1, y1)
    grad.addColorStop(0, primaryColor)
    grad.addColorStop(1, secondaryColor)
    ctx.fillStyle = grad
  } else {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, dist)
    grad.addColorStop(0, primaryColor)
    grad.addColorStop(1, secondaryColor)
    ctx.fillStyle = grad
  }
  ctx.fill()
}

function drawRadialGlare(ctx: CanvasRenderingContext2D, radius: number) {
  const cx = SIZE / 2
  const cy = SIZE / 2
  const r = SIZE * 0.6
  const grad = ctx.createRadialGradient(cx, cy - r * 0.3, 0, cx, cy, r)
  grad.addColorStop(0, 'rgba(255,255,255,0.35)')
  grad.addColorStop(0.5, 'rgba(255,255,255,0.08)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.save()
  drawRoundRectPath(ctx, radius)
  ctx.clip()
  ctx.fillStyle = grad
  ctx.fill()
  ctx.restore()
}

function drawNoise(
  ctx: CanvasRenderingContext2D,
  radius: number,
  opacity: number
) {
  if (opacity <= 0) {
    return
  }
  const imageData = ctx.getImageData(0, 0, SIZE, SIZE)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.floor(Math.random() * 256)
    data[i] += (v - data[i]) * opacity
    data[i + 1] += (v - data[i + 1]) * opacity
    data[i + 2] += (v - data[i + 2]) * opacity
  }
  ctx.save()
  drawRoundRectPath(ctx, radius)
  ctx.clip()
  ctx.putImageData(imageData, 0, 0)
  ctx.restore()
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  radius: number,
  strokeSize: number,
  strokeColor: string,
  strokeOpacity: number
) {
  if (strokeSize <= 0) {
    return
  }
  const inner = SIZE - 2 * strokeSize
  if (inner <= 0) {
    return
  }
  ctx.save()
  ctx.globalAlpha = strokeOpacity / 100
  ctx.fillStyle = strokeColor
  ctx.beginPath()
  addRoundRectSubpath(ctx, 0, 0, SIZE, SIZE, radius)
  addRoundRectSubpath(ctx, strokeSize, strokeSize, inner, inner, radius)
  ctx.fill('evenodd')
  ctx.restore()
}

interface IconPreviewProps {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>
  className?: string
  state: IconMakerState
}

export function IconPreview({ state, className, canvasRef }: IconPreviewProps) {
  const internalRef = useRef<HTMLCanvasElement>(null)
  const ref = canvasRef ?? internalRef
  const [iconImage, setIconImage] = useState<HTMLImageElement | null>(null)
  const [iconError, setIconError] = useState(false)

  const {
    iconId,
    iconSourceType,
    customText,
    uploadedSvgUrl,
    fillStyles,
    background,
    iconStyles,
  } = state

  useEffect(() => {
    if (iconSourceType === 'upload' && uploadedSvgUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => setIconImage(img)
      img.onerror = () => setIconError(true)
      img.src = uploadedSvgUrl
      return () => {
        img.onload = null
        img.onerror = null
      }
    }
    if (iconSourceType === 'text') {
      setIconImage(null)
      setIconError(false)
      return
    }
    if (iconSourceType === 'lucide' && iconId) {
      setIconError(false)
      getLucideIconSvgDataUrl(iconId, iconStyles.color).then((dataUrl) => {
        const img = new Image()
        img.onload = () => setIconImage(img)
        img.onerror = () => setIconError(true)
        img.src = dataUrl
      })
      return
    }
    setIconImage(null)
    setIconError(false)
  }, [iconSourceType, iconId, uploadedSvgUrl, iconStyles.color])

  const draw = useCallback(() => {
    const canvas = ref.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    const r = background.radius
    ctx.clearRect(0, 0, SIZE, SIZE)

    drawGradient(ctx, fillStyles, r)

    if (background.radialGlare) {
      drawRadialGlare(ctx, r)
    }

    if (background.noiseTexture && background.noiseOpacity > 0) {
      drawNoise(ctx, r, background.noiseOpacity / 100)
    }

    if (background.strokeSize > 0) {
      drawStroke(
        ctx,
        r,
        background.strokeSize,
        background.strokeColor,
        background.strokeOpacity
      )
    }

    const iconSize = iconStyles.size
    const xOff = iconStyles.xOffset
    const yOff = iconStyles.yOffset
    const cx = SIZE / 2 + xOff
    const cy = SIZE / 2 + yOff

    if (iconSourceType === 'text' && customText) {
      ctx.save()
      ctx.fillStyle = iconStyles.color
      ctx.font = `bold ${Math.min(iconSize * 1.2, SIZE * 0.6)}px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(customText.slice(0, 2), cx, cy)
      ctx.restore()
    } else if (iconImage?.complete && !iconError) {
      const s = iconSize
      ctx.drawImage(iconImage, cx - s / 2, cy - s / 2, s, s)
    }
  }, [
    ref,
    state,
    fillStyles,
    background,
    iconStyles,
    iconSourceType,
    customText,
    iconImage,
    iconError,
  ])

  useEffect(() => {
    draw()
  }, [draw])

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col items-center gap-2',
        className
      )}
    >
      <div className="relative flex aspect-square w-full max-w-[552px] items-center justify-center overflow-hidden rounded-lg border border-border p-3 sm:p-4 md:p-5">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
              linear-gradient(-45deg, #e5e5e5 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
              linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)
            `,
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
            backgroundColor: '#d4d4d4',
          }}
        />
        <canvas
          className="relative block aspect-square w-full max-w-[512px]"
          height={SIZE}
          ref={ref}
          width={SIZE}
        />
      </div>
      <p className="text-muted-foreground text-xs">
        {SIZE} × {SIZE}
      </p>
    </div>
  )
}
