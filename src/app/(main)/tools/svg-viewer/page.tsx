'use client'

import {
  Check,
  Code2,
  Copy,
  Download,
  Eraser,
  Loader2,
  Redo2,
  Sparkles,
  Undo2,
  Upload,
} from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { optimize } from 'svgo/browser'
import { OutputTabs } from '@/components/svg-viewer/output-tabs'
import {
  SvgEditor,
  type SvgEditorHandle,
} from '@/components/svg-viewer/svg-editor'
import { ToolHeader } from '@/components/tool-header'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatBytes, getByteSize, prettifySvg } from '@/lib/svg-utils'
import { cn } from '@/lib/utils'

type BgMode = 'checkerboard' | 'dark' | 'white'

export default function SvgViewerPage() {
  const [svgCode, setSvgCode] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState<number | null>(null)
  const [optimizedSize, setOptimizedSize] = useState<number | null>(null)
  const [optimizing, setOptimizing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [bgMode, setBgMode] = useState<BgMode>('checkerboard')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<SvgEditorHandle>(null)

  const showEditor = editorOpen || svgCode.trim().length > 0
  const hasSvg = svgCode.trim().length > 0

  // ─── File upload ─────────────────────────────────────────

  const loadSvgFile = useCallback((file: File) => {
    if (file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) {
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setSvgCode(text)
      setFileName(file.name)
      setOriginalSize(getByteSize(text))
      setOptimizedSize(null)
      setEditorOpen(true)
    }
    reader.readAsText(file)
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        loadSvgFile(file)
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [loadSvgFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) {
        loadSvgFile(file)
      }
    },
    [loadSvgFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  // ─── Actions ──────────────────────────────────────────────

  const handleCodeChange = useCallback((value: string) => {
    setSvgCode(value)
    setOriginalSize((prev) => prev ?? getByteSize(value))
    setOptimizedSize(null)
  }, [])

  const handleOptimize = useCallback(() => {
    if (!svgCode.trim()) {
      return
    }
    setOptimizing(true)
    try {
      const before = getByteSize(svgCode)
      const result = optimize(svgCode, { multipass: true })
      const after = getByteSize(result.data)
      setSvgCode(result.data)
      setOriginalSize(before)
      setOptimizedSize(after)
    } catch {
      // Optimization failed — keep original
    } finally {
      setOptimizing(false)
    }
  }, [svgCode])

  const handlePrettify = useCallback(() => {
    if (!svgCode.trim()) {
      return
    }
    setSvgCode(prettifySvg(svgCode))
  }, [svgCode])

  const handleClean = useCallback(() => {
    if (!svgCode.trim()) {
      return
    }
    try {
      const result = optimize(svgCode, {
        multipass: false,
        plugins: [
          'removeComments',
          'removeMetadata',
          'removeEditorsNSData',
          'removeEmptyAttrs',
          'removeEmptyContainers',
          'removeHiddenElems',
          'removeUselessDefs',
          'removeUselessStrokeAndFill',
          'cleanupIds',
          'removeDesc',
          'removeTitle',
        ],
      })
      setSvgCode(result.data)
    } catch {
      // Clean failed — keep original
    }
  }, [svgCode])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(svgCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [svgCode])

  const handleDownload = useCallback(() => {
    if (!svgCode.trim()) {
      return
    }
    const blob = new Blob([svgCode], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || 'image.svg'
    a.click()
    URL.revokeObjectURL(url)
  }, [svgCode, fileName])

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden md:h-[calc(100svh-2rem)] md:flex-none md:gap-3">
      {/* Header row */}
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <ToolHeader
          description="浏览、编辑、优化 SVG 并转换为多种格式"
          title="SVG Viewer"
        />
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:justify-start">
          <input
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
          <Button
            aria-label="上传 SVG"
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="ghost"
          >
            <Upload className="size-3.5" />
            上传
          </Button>
          <Button
            disabled={!hasSvg}
            onClick={handleCopy}
            size="sm"
            variant="ghost"
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? '已复制' : '复制'}
          </Button>
          <Button
            disabled={!hasSvg}
            onClick={handleDownload}
            size="sm"
            variant="outline"
          >
            <Download className="size-3.5" />
            下载
          </Button>
        </div>
      </div>

      {/* Main content — stacked on narrow screens, two columns on md+ */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden md:flex-row md:gap-2 md:overflow-hidden">
        {/* Left: Code editor */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: drag-drop zone */}
        {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: drag-drop zone */}
        <section
          className={cn(
            'relative flex h-[min(max(36svh,160px),260px)] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-muted/30 md:h-auto md:min-h-0 md:w-1/2 md:flex-1',
            isDragging && 'border-primary bg-primary/5'
          )}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {showEditor ? (
            <>
              {/* Editor toolbar */}
              <div className="-mx-px flex shrink-0 items-center gap-0.5 overflow-x-auto overflow-y-hidden border-border border-b px-1.5 py-1 [-webkit-overflow-scrolling:touch]">
                {/* Edit group */}
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

                {/* Optimize group */}
                <Button
                  disabled={!hasSvg || optimizing}
                  onClick={handleOptimize}
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
                  onClick={handlePrettify}
                  size="xs"
                  variant="ghost"
                >
                  <Code2 className="size-3.5" />
                  格式化
                </Button>
                <Button
                  disabled={!hasSvg}
                  onClick={handleClean}
                  size="xs"
                  variant="ghost"
                >
                  <Eraser className="size-3.5" />
                  清理
                </Button>
              </div>
              <SvgEditor
                onChange={handleCodeChange}
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
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    点击上传
                  </button>
                  ，也可以直接在编辑器中粘贴 SVG 代码
                </p>
              </div>
              <Button
                onClick={() => setEditorOpen(true)}
                size="sm"
                variant="outline"
              >
                <Code2 className="size-3.5" />
                打开编辑器
              </Button>
            </div>
          )}

          {/* Drag overlay */}
          {isDragging && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-primary/10">
              <p className="font-medium text-primary text-sm">释放以加载 SVG</p>
            </div>
          )}
        </section>
        <div className="flex h-[min(max(36svh,160px),260px)] min-w-0 shrink-0 flex-col md:h-auto md:min-h-0 md:w-1/2 md:flex-1">
          <OutputTabs
            bgMode={bgMode}
            onBgModeChange={setBgMode}
            svg={svgCode}
          />
        </div>
      </div>

      {/* Status bar */}
      {hasSvg && (
        <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-2 py-1.5 text-muted-foreground text-xs sm:px-3">
          {fileName && <span className="font-medium">{fileName}</span>}
          {fileName && <span>·</span>}
          <span>
            {originalSize !== null
              ? `原始 ${formatBytes(originalSize)}`
              : `${formatBytes(getByteSize(svgCode))}`}
          </span>
          {optimizedSize !== null && originalSize !== null && (
            <>
              <span>→</span>
              <span>优化后 {formatBytes(optimizedSize)}</span>
              <span className="text-green-600 dark:text-green-400">
                （节省{' '}
                {Math.round(
                  ((originalSize - optimizedSize) / originalSize) * 100
                )}
                %）
              </span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
