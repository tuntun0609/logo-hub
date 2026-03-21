'use client'

import { useEffect, useRef } from 'react'
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

export function SvgPreview({ bgMode, onBgModeChange, svg }: SvgPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = svg || ''
    }
  }, [svg])

  return (
    <div className="flex h-full flex-col">
      {/* Background toggle */}
      <div className="flex shrink-0 items-center gap-1 border-b px-3 py-1.5">
        <span className="mr-1 text-muted-foreground text-xs">背景</span>
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

      {/* SVG render area */}
      <div
        className={cn(
          'flex flex-1 items-center justify-center overflow-auto p-6',
          bgMode === 'checkerboard' && 'bg-checkerboard',
          bgMode === 'white' && 'bg-white',
          bgMode === 'dark' && 'bg-neutral-900'
        )}
      >
        {svg ? (
          <div
            className="max-h-full max-w-full [&_svg]:max-h-[60vh] [&_svg]:max-w-full"
            ref={containerRef}
          />
        ) : (
          <p className="text-muted-foreground text-sm">暂无预览</p>
        )}
      </div>
    </div>
  )
}
