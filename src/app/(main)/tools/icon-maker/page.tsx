'use client'

import { Download, Redo2, Shuffle, Undo2 } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { IconPicker } from '@/components/icon-maker/icon-picker'
import { IconPreview } from '@/components/icon-maker/icon-preview'
import { IconSettings } from '@/components/icon-maker/icon-settings'
import { useIconMaker } from '@/components/icon-maker/use-icon-maker'
import { ToolHeader } from '@/components/tool-header'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function IconMakerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const {
    state,
    setState,
    setFillStyles,
    setBackground,
    setIconStyles,
    applyPreset,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useIconMaker()

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        return
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'icon.png'
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [])

  const handleCopyImage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        return
      }
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    }, 'image/png')
  }, [])

  const handleCopyUrl = useCallback(() => {
    const params = new URLSearchParams()
    params.set('icon', state.iconId ?? '')
    params.set('fill', state.fillStyles.fillType)
    params.set('primary', state.fillStyles.primaryColor)
    params.set('secondary', state.fillStyles.secondaryColor)
    params.set('angle', String(state.fillStyles.angle))
    params.set('radius', String(state.background.radius))
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/tools/icon-maker?${params.toString()}`
    navigator.clipboard.writeText(url)
  }, [state])

  const handleRandomIcon = useCallback(() => {
    import('lucide-react/dynamicIconImports').then((mod) => {
      const names = Object.keys(mod.default)
      const name = names[Math.floor(Math.random() * names.length)]
      setState({
        iconSourceType: 'lucide',
        iconId: name,
        uploadedSvgUrl: null,
      })
    })
  }, [setState])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 md:h-[calc(100svh-3rem)] md:flex-none md:overflow-hidden">
      <ToolHeader
        actions={
          <div className="flex flex-wrap items-center justify-end gap-1">
            <Button
              aria-label="Undo"
              disabled={!canUndo}
              onClick={undo}
              size="icon-sm"
              variant="ghost"
            >
              <Undo2 className="size-4" />
            </Button>
            <Button
              aria-label="Redo"
              disabled={!canRedo}
              onClick={redo}
              size="icon-sm"
              variant="ghost"
            >
              <Redo2 className="size-4" />
            </Button>
            <Button
              aria-label="Random icon"
              onClick={handleRandomIcon}
              size="icon-sm"
              variant="ghost"
            >
              <Shuffle className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={(triggerProps) => (
                  <Button size="sm" {...triggerProps}>
                    <Download className="size-4" />
                    Export icon
                  </Button>
                )}
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload}>
                  Download PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyImage}>
                  Copy Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyUrl}>
                  Copy URL
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
        description="选择图标、自定义渐变与背景，导出 PNG"
        meta={['图标生成', '渐变背景', 'PNG 导出']}
        title="Icon Maker"
        variant="compact"
      />

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-visible md:flex-row md:overflow-hidden">
        {/* Left: Icon picker */}
        <aside className="flex h-[min(68svh,30rem)] min-h-72 w-full shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-muted/30 md:h-auto md:min-h-0 md:w-56">
          <div className="min-h-0 flex-1 p-2">
            <IconPicker
              customText={state.customText}
              iconId={state.iconId}
              iconSourceType={state.iconSourceType}
              onCustomTextChange={(customText) => setState({ customText })}
              onSelectIcon={(iconId) =>
                setState({
                  iconId,
                  iconSourceType: 'lucide',
                  uploadedSvgUrl: null,
                })
              }
              onSourceTypeChange={(iconSourceType) =>
                setState({ iconSourceType })
              }
              onUploadSvg={(url) =>
                setState({
                  iconSourceType: 'upload',
                  uploadedSvgUrl: url,
                  iconId: null,
                })
              }
            />
          </div>
        </aside>

        {/* Center: Preview */}
        <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-auto rounded-lg border border-border bg-muted/20 p-3 md:border-0 md:bg-transparent md:p-4">
          <IconPreview canvasRef={canvasRef} state={state} />
        </main>

        {/* Right: Settings */}
        <aside className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-muted/30 p-3 md:w-64">
          <IconSettings
            onBackgroundChange={setBackground}
            onFillStylesChange={setFillStyles}
            onIconStylesChange={setIconStyles}
            onPresetSelect={applyPreset}
            state={state}
          />
        </aside>
      </div>
    </div>
  )
}
