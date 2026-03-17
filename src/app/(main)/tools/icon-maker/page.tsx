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
    <div
      className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden md:flex-none"
      style={{ height: 'calc(100svh - 2rem)' }}
    >
      <div className="flex shrink-0 items-center justify-between gap-2">
        <ToolHeader
          description="选择图标、自定义渐变与背景，导出 PNG"
          title="Icon Maker"
        />
        <div className="flex items-center gap-1">
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
      </div>

      <div className="flex min-h-0 flex-1 gap-2 overflow-hidden">
        {/* Left: Icon picker */}
        <aside className="flex min-h-0 w-56 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-muted/30">
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
        <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-auto p-4">
          <IconPreview canvasRef={canvasRef} state={state} />
        </main>

        {/* Right: Settings */}
        <aside className="flex min-h-0 w-64 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-muted/30 p-3">
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
