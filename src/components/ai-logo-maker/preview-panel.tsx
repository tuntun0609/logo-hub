import { Image, Maximize2, Minus, Palette, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { parseSvgDimensions } from '@/lib/svg-validator'
import { cn } from '@/lib/utils'
import { SvgCodeEditor } from './svg-code-editor'
import { SvgMarkup } from './svg-markup'

interface PreviewPanelProps {
  actions?: ReactNode
  editMode: boolean
  onEditModeChange: (mode: boolean) => void
  onSvgChange: (code: string) => void
  svgCode: string
}

const BG_OPTIONS = [
  { label: '透明', value: 'checkerboard' as const },
  { label: '白色', value: 'white' as const },
  { label: '深色', value: 'black' as const },
]

export function PreviewPanel({
  actions,
  svgCode,
  editMode,
  onEditModeChange,
  onSvgChange,
}: PreviewPanelProps) {
  const [bgColor, setBgColor] = useState<'checkerboard' | 'white' | 'black'>(
    'checkerboard'
  )
  const [scale, setScale] = useState(1)

  const dimensions = svgCode ? parseSvgDimensions(svgCode) : null
  const fileSize = svgCode ? new Blob([svgCode]).size : 0

  const renderContent = () => {
    if (!svgCode) {
      return (
        <div className="grid h-full place-items-center p-4 sm:p-5">
          <div className="w-full max-w-xl rounded-[1.45rem] border border-border/70 bg-muted/15 p-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-[1.25rem] border border-border/70 bg-background text-muted-foreground">
              <Image className="size-7" />
            </div>
            <p className="mt-4 font-medium text-base tracking-tight">
              生成后这里会显示 logo 预览
            </p>
            <p className="mt-2 text-muted-foreground text-sm leading-6">
              可以切换背景、缩放查看，或进入代码模式编辑 SVG。
            </p>
          </div>
        </div>
      )
    }

    if (editMode) {
      return (
        <div className="min-h-0 flex-1 bg-muted/15">
          <SvgCodeEditor code={svgCode} onChange={onSvgChange} />
        </div>
      )
    }

    return (
      <div className="flex h-full flex-col">
        <div className="border-border/70 border-b bg-background px-3.5 py-2.5 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-[0.14em]">
                  <Palette className="size-3" />
                  背景
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {BG_OPTIONS.map((option) => (
                    <button
                      className={cn(
                        'rounded-full px-3 py-1.5 text-xs transition',
                        bgColor === option.value
                          ? 'bg-foreground text-background'
                          : 'bg-muted/70 text-muted-foreground hover:text-foreground'
                      )}
                      key={option.value}
                      onClick={() => setBgColor(option.value)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden h-5 w-px bg-border lg:block" />

              <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2 py-0.5">
                <span className="px-1.5 text-muted-foreground text-xs">
                  缩放
                </span>
                <Button
                  onClick={() => setScale(Math.max(0.5, scale - 0.25))}
                  size="icon-sm"
                  variant="ghost"
                >
                  <Minus className="size-3.5" />
                </Button>
                <span className="min-w-12 text-center font-mono text-muted-foreground text-xs">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  onClick={() => setScale(Math.min(3, scale + 0.25))}
                  size="icon-sm"
                  variant="ghost"
                >
                  <Plus className="size-3.5" />
                </Button>
                <Button
                  onClick={() => setScale(1)}
                  size="icon-sm"
                  variant="ghost"
                >
                  <Maximize2 className="size-3.5" />
                </Button>
              </div>
            </div>
            {actions}
          </div>
        </div>

        <div className="min-h-0 flex-1 p-3.5 sm:p-4 lg:p-5">
          <div
            className={cn(
              'relative flex h-full min-h-[28rem] items-center justify-center overflow-hidden rounded-[1.5rem] border border-border/60 p-6 sm:p-8 lg:p-10',
              bgColor === 'checkerboard' && 'bg-checkerboard',
              bgColor === 'white' && 'bg-white',
              bgColor === 'black' && 'bg-black'
            )}
          >
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-foreground/15 to-transparent" />
            <SvgMarkup
              className="origin-center transition-transform duration-200 ease-out [&_svg]:block [&_svg]:h-auto [&_svg]:max-h-[min(70vh,40rem)] [&_svg]:w-auto [&_svg]:max-w-full"
              style={{ transform: `scale(${scale})` }}
              svgCode={svgCode}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border/70 border-b bg-background px-3.5 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-sm">预览</span>
            {dimensions && (
              <span className="rounded-full bg-background/80 px-2.5 py-1 text-muted-foreground text-xs">
                {dimensions.width} × {dimensions.height}
              </span>
            )}
            {svgCode && (
              <span className="rounded-full bg-background/80 px-2.5 py-1 text-muted-foreground text-xs">
                {(fileSize / 1024).toFixed(1)} KB
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <Button
              onClick={() => onEditModeChange(false)}
              size="sm"
              variant={editMode ? 'outline' : 'default'}
            >
              预览
            </Button>
            <Button
              onClick={() => onEditModeChange(true)}
              size="sm"
              variant={editMode ? 'default' : 'outline'}
            >
              代码
            </Button>
            {actions}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">{renderContent()}</div>
    </div>
  )
}
