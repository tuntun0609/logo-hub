'use client'

import {
  Check,
  Code2,
  Copy,
  Download,
  Loader2,
  Sparkles,
  Upload,
} from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { optimize } from 'svgo/browser'
import { OutputTabs } from '@/components/svg-viewer/output-tabs'
import { SvgEditor } from '@/components/svg-viewer/svg-editor'
import { ToolHeader } from '@/components/tool-header'
import { Button } from '@/components/ui/button'
import { formatBytes, getByteSize, prettifySvg } from '@/lib/svg-utils'
import { cn } from '@/lib/utils'

type BgMode = 'checkerboard' | 'dark' | 'white'

export default function SvgViewerPage() {
  const [svgCode, setSvgCode] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState<number | null>(null)
  const [optimizedSize, setOptimizedSize] = useState<number | null>(null)
  const [optimizing, setOptimizing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [bgMode, setBgMode] = useState<BgMode>('checkerboard')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    <div
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden md:flex-none"
      style={{ height: 'calc(100svh - 2rem)' }}
    >
      {/* Header row */}
      <div className="flex shrink-0 items-center justify-between gap-2">
        <ToolHeader
          description="浏览、编辑、优化 SVG 并转换为多种格式"
          title="SVG Viewer"
        />
        <div className="flex items-center gap-1">
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
            disabled={!hasSvg || optimizing}
            onClick={handleOptimize}
            size="sm"
            variant="ghost"
          >
            {optimizing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            优化
          </Button>
          <Button
            disabled={!hasSvg}
            onClick={handlePrettify}
            size="sm"
            variant="ghost"
          >
            <Code2 className="size-3.5" />
            格式化
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

      {/* Main content — two panels */}
      <div className="flex min-h-0 flex-1 gap-2 overflow-hidden">
        {/* Left: Code editor */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: drag-drop zone */}
        {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: drag-drop zone */}
        <section
          className={cn(
            'relative flex min-h-0 w-1/2 flex-col overflow-hidden rounded-lg border border-border bg-muted/30',
            isDragging && 'border-primary bg-primary/5'
          )}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {hasSvg ? (
            <div className="min-h-0 flex-1">
              <SvgEditor onChange={handleCodeChange} value={svgCode} />
            </div>
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
                onClick={() => {
                  // Switch to editor mode by setting empty string to trigger editor
                  setSvgCode(' ')
                  // Then immediately clear — this just triggers the editor to show
                  requestAnimationFrame(() => setSvgCode(''))
                }}
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
        <div className="min-h-0 w-1/2">
          <OutputTabs
            bgMode={bgMode}
            onBgModeChange={setBgMode}
            svg={svgCode}
          />
        </div>
      </div>

      {/* Status bar */}
      {hasSvg && (
        <div className="flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-muted-foreground text-xs">
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
