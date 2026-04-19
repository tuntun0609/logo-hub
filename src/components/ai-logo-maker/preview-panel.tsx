import { Image, Maximize2, Minus, Plus } from 'lucide-react'
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
        <div className="flex h-full items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[1.5rem] border border-border/70 border-dashed bg-muted/20 px-8 py-10 text-center">
            <Image className="mx-auto mb-4 size-14 text-muted-foreground/55" />
            <p className="font-medium text-sm">生成后这里会显示 SVG 成品</p>
            <p className="mt-2 text-muted-foreground text-sm leading-6">
              支持切换背景、缩放检查细节，也能直接进入代码模式修改路径与颜色。
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-background/80 px-3 py-1 text-muted-foreground text-xs">
                实时预览
              </span>
              <span className="rounded-full bg-background/80 px-3 py-1 text-muted-foreground text-xs">
                代码编辑
              </span>
              <span className="rounded-full bg-background/80 px-3 py-1 text-muted-foreground text-xs">
                SVG / PNG 导出
              </span>
            </div>
          </div>
        </div>
      )
    }

    if (editMode) {
      return <SvgCodeEditor code={svgCode} onChange={onSvgChange} />
    }

    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-2 border-border/70 border-b px-4 py-3">
          <span className="mr-1 text-muted-foreground text-xs">背景</span>
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
          <div className="mx-1 hidden h-4 w-px bg-border sm:block" />
          <span className="text-muted-foreground text-xs">缩放</span>
          <Button
            onClick={() => setScale(Math.max(0.5, scale - 0.25))}
            size="icon-sm"
            variant="outline"
          >
            <Minus className="size-3.5" />
          </Button>
          <span className="min-w-12 text-center font-mono text-muted-foreground text-xs">
            {Math.round(scale * 100)}%
          </span>
          <Button
            onClick={() => setScale(Math.min(3, scale + 0.25))}
            size="icon-sm"
            variant="outline"
          >
            <Plus className="size-3.5" />
          </Button>
          <Button onClick={() => setScale(1)} size="icon-sm" variant="ghost">
            <Maximize2 className="size-3.5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 p-4">
          <div
            className={cn(
              'flex h-full min-h-[24rem] items-center justify-center overflow-hidden rounded-[1.5rem] border border-border/60 p-8',
              bgColor === 'checkerboard' && 'bg-checkerboard',
              bgColor === 'white' && 'bg-white',
              bgColor === 'black' && 'bg-black'
            )}
          >
            <SvgMarkup
              className="origin-center transition-transform duration-200 ease-out [&_svg]:block [&_svg]:h-auto [&_svg]:max-h-[min(60vh,32rem)] [&_svg]:w-auto [&_svg]:max-w-full"
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
      <div className="border-border/70 border-b bg-muted/20 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
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
