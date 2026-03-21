'use client'

import {
  Code2,
  Eraser,
  Loader2,
  Redo2,
  Sparkles,
  Undo2,
  Upload,
} from 'lucide-react'
import type { RefObject } from 'react'
import {
  SvgEditor,
  type SvgEditorHandle,
} from '@/components/svg-viewer/svg-editor'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { CleanOptionsPopover } from './clean-options-popover'
import type { CleanOptions, CleanPluginKey, CleanPresetKey } from './cleaning'

interface SvgViewerEditorPaneProps {
  activeCleanPreset: CleanPresetKey | null
  allCleanEnabled: boolean
  cleanOptions: CleanOptions
  editorRef: RefObject<SvgEditorHandle | null>
  hasSvg: boolean
  isDragging: boolean
  noneCleanEnabled: boolean
  onApplyCleanPreset: (presetKey: CleanPresetKey) => void
  onClean: () => void
  onCodeChange: (value: string) => void
  onDragLeave: () => void
  onDragOver: (event: React.DragEvent<HTMLElement>) => void
  onDrop: (event: React.DragEvent<HTMLElement>) => void
  onOpenEditor: () => void
  onOptimize: () => void
  onOptionChange: (key: CleanPluginKey, checked: boolean) => void
  onPrettify: () => void
  onToggleAllCleanOptions: () => void
  onUploadClick: () => void
  optimizing: boolean
  showEditor: boolean
  svgCode: string
}

export function SvgViewerEditorPane({
  activeCleanPreset,
  allCleanEnabled,
  cleanOptions,
  editorRef,
  hasSvg,
  isDragging,
  noneCleanEnabled,
  onApplyCleanPreset,
  onClean,
  onCodeChange,
  onDragLeave,
  onDragOver,
  onDrop,
  onOpenEditor,
  onOptionChange,
  onOptimize,
  onPrettify,
  onToggleAllCleanOptions,
  onUploadClick,
  optimizing,
  showEditor,
  svgCode,
}: SvgViewerEditorPaneProps) {
  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: SVG 拖放区域 */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: SVG 拖放区域 */}
      <section
        className={cn(
          'relative flex h-[min(max(36svh,160px),260px)] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-muted/30 md:h-auto md:min-h-0 md:w-1/2 md:flex-1',
          isDragging && 'border-primary bg-primary/5'
        )}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {showEditor ? (
          <>
            <div className="-mx-px flex shrink-0 items-center gap-0.5 overflow-x-auto overflow-y-hidden border-border border-b px-1.5 py-1 [-webkit-overflow-scrolling:touch]">
              <Button
                aria-label="撤销"
                disabled={!hasSvg}
                onClick={() => editorRef.current?.undo()}
                size="icon-xs"
                variant="ghost"
              >
                <Undo2 className="size-3.5" />
              </Button>
              <Button
                aria-label="重做"
                disabled={!hasSvg}
                onClick={() => editorRef.current?.redo()}
                size="icon-xs"
                variant="ghost"
              >
                <Redo2 className="size-3.5" />
              </Button>

              <Separator className="mx-1 h-4!" orientation="vertical" />

              <Button
                disabled={!hasSvg || optimizing}
                onClick={onOptimize}
                size="xs"
                variant="ghost"
              >
                {optimizing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                压缩
              </Button>
              <Button
                disabled={!hasSvg}
                onClick={onPrettify}
                size="xs"
                variant="ghost"
              >
                <Code2 className="size-3.5" />
                格式化
              </Button>
              <Button
                className="rounded-r-none pr-1"
                disabled={!hasSvg || noneCleanEnabled}
                onClick={onClean}
                size="xs"
                variant="ghost"
              >
                <Eraser className="size-3.5" />
                清理
              </Button>
              <CleanOptionsPopover
                activeCleanPreset={activeCleanPreset}
                allCleanEnabled={allCleanEnabled}
                cleanOptions={cleanOptions}
                disabled={!hasSvg}
                onApplyCleanPreset={onApplyCleanPreset}
                onOptionChange={onOptionChange}
                onToggleAll={onToggleAllCleanOptions}
              />
            </div>
            <SvgEditor
              onChange={onCodeChange}
              ref={editorRef}
              value={svgCode}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <Upload className="size-10 text-muted-foreground/50" />
            <div>
              <p className="font-medium text-sm">拖拽 SVG 文件到此处</p>
              <p className="mt-1 text-muted-foreground text-xs">
                或{' '}
                <button
                  className="text-primary underline underline-offset-2"
                  onClick={onUploadClick}
                  type="button"
                >
                  点击上传
                </button>
                ，也可以直接在编辑器中粘贴 SVG 代码
              </p>
            </div>
            <Button onClick={onOpenEditor} size="sm" variant="outline">
              <Code2 className="size-3.5" />
              打开编辑器
            </Button>
          </div>
        )}

        {isDragging && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-primary/10">
            <p className="font-medium text-primary text-sm">释放以加载 SVG</p>
          </div>
        )}
      </section>
    </>
  )
}
