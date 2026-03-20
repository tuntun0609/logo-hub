'use client'

import type { ImageTracerOptions } from 'imagetracerjs'
import ImageTracer from 'imagetracerjs'
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Loader2,
  Sparkles,
  Upload,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ToolHeader } from '@/components/tool-header'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { loadImageFromFile, validateImageFile } from '@/lib/canvas-utils'
import { cn } from '@/lib/utils'

const FILE_EXTENSION_REGEX = /\.[^.]+$/

/** 限制长边，避免主线程长时间卡顿或内存过大 */
const MAX_TRACE_SIDE = 1600

const PRESETS: { id: string; label: string; description: string }[] = [
  { id: 'default', label: '默认', description: '通用平衡' },
  {
    id: 'posterized2',
    label: '海报色（4 色）',
    description: '色块少、边缘柔和',
  },
  { id: 'curvy', label: '曲线', description: '更圆润的路径' },
  { id: 'sharp', label: '锐利', description: '更利落的转角' },
  { id: 'detailed', label: '精细', description: '更多颜色与细节' },
  { id: 'grayscale', label: '灰度', description: '黑白灰分层' },
  { id: 'artistic1', label: '艺术 1', description: '描边 + 模糊感' },
]

function sliderFirst(
  value: number | readonly number[],
  fallback: number
): number {
  if (typeof value === 'number') {
    return value
  }
  return value[0] ?? fallback
}

function imageToImageData(img: HTMLImageElement, maxSide: number): ImageData {
  let w = img.naturalWidth
  let h = img.naturalHeight
  const scale = Math.min(1, maxSide / Math.max(w, h))
  w = Math.max(1, Math.round(w * scale))
  h = Math.max(1, Math.round(h * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('无法创建画布上下文')
  }
  ctx.drawImage(img, 0, 0, w, h)
  return ctx.getImageData(0, 0, w, h)
}

export default function ImageToSvgPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [preset, setPreset] = useState<string>('default')
  const [svgString, setSvgString] = useState<string | null>(null)
  const [svgPreviewUrl, setSvgPreviewUrl] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [numberOfColors, setNumberOfColors] = useState(16)
  const [blurRadius, setBlurRadius] = useState(0)
  const [ltres, setLtres] = useState(1)
  const [qtres, setQtres] = useState(1)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
      }
    }
  }, [previewUrl])

  useEffect(() => {
    if (!svgString) {
      setSvgPreviewUrl(null)
      return
    }
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    setSvgPreviewUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [svgString])

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setSvgString(null)

    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      const img = await loadImageFromFile(file)
      setSourceFile(file)
      setSourceImage(img)
      setPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev)
        }
        return URL.createObjectURL(file)
      })
    } catch {
      setError('无法加载此图片文件')
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleConvert = useCallback(async () => {
    if (!sourceImage) {
      return
    }
    setError(null)
    setIsConverting(true)
    // 不清空 svgString：保留上一版预览高度，避免滚动条跳动

    await new Promise<void>((r) => {
      requestAnimationFrame(() => r())
    })

    try {
      const imageData = imageToImageData(sourceImage, MAX_TRACE_SIDE)

      let options: string | ImageTracerOptions = preset
      if (showAdvanced) {
        const base = ImageTracer.checkoptions(preset)
        options = {
          ...base,
          numberofcolors: numberOfColors,
          blurradius: blurRadius,
          ltres,
          qtres,
        }
      }

      const svg = ImageTracer.imagedataToSVG(imageData, options)
      setSvgString(svg)
    } catch {
      setError('转换失败，请尝试其他图片或调整参数')
    } finally {
      setIsConverting(false)
    }
  }, [
    blurRadius,
    ltres,
    numberOfColors,
    preset,
    qtres,
    showAdvanced,
    sourceImage,
  ])

  const handleDownload = useCallback(() => {
    if (!(svgString && sourceFile)) {
      return
    }
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = sourceFile.name.replace(FILE_EXTENSION_REGEX, '.svg')
    a.click()
    URL.revokeObjectURL(url)
  }, [sourceFile, svgString])

  const handleCopySvg = useCallback(async () => {
    if (!svgString) {
      return
    }
    try {
      await navigator.clipboard.writeText(svgString)
      setCopied(true)
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
      }
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('复制失败，请手动选择 SVG 代码')
    }
  }, [svgString])

  const handleClear = useCallback(() => {
    setSourceFile(null)
    setSourceImage(null)
    setSvgString(null)
    setPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev)
      }
      return null
    })
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const syncSlidersFromPreset = useCallback((presetId: string) => {
    const full = ImageTracer.checkoptions(presetId)
    setNumberOfColors(full.numberofcolors ?? 16)
    setBlurRadius(full.blurradius ?? 0)
    setLtres(full.ltres ?? 1)
    setQtres(full.qtres ?? 1)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <ToolHeader
        description="纯浏览器端描摹位图为 SVG，图片不会上传服务器"
        title="Image to SVG"
      />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-12">
        {error && (
          <div
            aria-live="polite"
            className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive text-sm"
          >
            {error}
          </div>
        )}

        {!sourceFile && (
          <button
            aria-label="上传图片文件"
            className={cn(
              'group relative flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-12 py-24 transition-all duration-200 ease-in-out',
              isDragging
                ? 'scale-[0.99] border-primary bg-primary/5'
                : 'border-muted-foreground/20 bg-muted/10 hover:border-muted-foreground/40 hover:bg-muted/20'
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            type="button"
          >
            <div
              className={cn(
                'flex size-12 items-center justify-center rounded-full transition-colors duration-200',
                isDragging
                  ? 'bg-primary/20 text-primary'
                  : 'bg-background text-muted-foreground shadow-sm group-hover:bg-muted/50'
              )}
            >
              <Upload className="size-6" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="font-medium text-base text-foreground">
                点击上传{' '}
                <span className="font-normal text-muted-foreground">
                  或拖拽图片到此处
                </span>
              </p>
              <p className="text-muted-foreground text-sm">
                支持 PNG、JPG、WEBP、GIF、SVG；最大
                10MB。大图会自动缩小后再描摹。
              </p>
            </div>
          </button>
        )}

        <input
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.png,.jpg,.jpeg,.webp,.gif,.svg"
          className="hidden"
          onChange={handleFileInput}
          ref={fileInputRef}
          type="file"
        />

        {sourceFile && sourceImage && previewUrl && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 rounded-2xl border bg-card/30 p-4 sm:p-6">
              <h2 className="font-medium text-sm">原图</h2>
              <div className="overflow-hidden rounded-xl border bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="原图预览"
                  className="max-h-[280px] w-full object-contain"
                  height={sourceImage.naturalHeight}
                  src={previewUrl}
                  width={sourceImage.naturalWidth}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                原始尺寸 {sourceImage.naturalWidth} ×{' '}
                {sourceImage.naturalHeight}
                ，描摹时长边不超过 {MAX_TRACE_SIDE}px
              </p>

              <div className="flex flex-col gap-2">
                <label
                  className="text-muted-foreground text-xs"
                  htmlFor="trace-preset"
                >
                  描摹预设
                </label>
                <Select
                  onValueChange={(v) => {
                    if (v) {
                      setPreset(v)
                      syncSlidersFromPreset(v)
                    }
                  }}
                  value={preset}
                >
                  <SelectTrigger className="w-full" id="trace-preset">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESETS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label} — {p.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  className="w-full justify-between"
                  onClick={() => setShowAdvanced((s) => !s)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <span>高级参数（覆盖预设中的对应项）</span>
                  {showAdvanced ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </Button>

                {showAdvanced && (
                  <div className="flex flex-col gap-4 rounded-lg border border-dashed p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">
                          颜色数量
                        </span>
                        <span className="font-mono text-muted-foreground text-xs">
                          {numberOfColors}
                        </span>
                      </div>
                      <Slider
                        max={64}
                        min={2}
                        onValueChange={(v) =>
                          setNumberOfColors(sliderFirst(v, 16))
                        }
                        step={1}
                        value={[numberOfColors]}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">
                          模糊半径
                        </span>
                        <span className="font-mono text-muted-foreground text-xs">
                          {blurRadius}
                        </span>
                      </div>
                      <Slider
                        max={20}
                        min={0}
                        onValueChange={(v) => setBlurRadius(sliderFirst(v, 0))}
                        step={1}
                        value={[blurRadius]}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">
                          直线拟合精度 (ltres)
                        </span>
                        <span className="font-mono text-muted-foreground text-xs">
                          {ltres.toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        max={2}
                        min={0.01}
                        onValueChange={(v) => setLtres(sliderFirst(v, 1))}
                        step={0.01}
                        value={[ltres]}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">
                          曲线拟合精度 (qtres)
                        </span>
                        <span className="font-mono text-muted-foreground text-xs">
                          {qtres.toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        max={2}
                        min={0.01}
                        onValueChange={(v) => setQtres(sliderFirst(v, 1))}
                        step={0.01}
                        value={[qtres]}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="w-full sm:flex-1"
                  disabled={isConverting}
                  onClick={handleClear}
                  variant="outline"
                >
                  重新选择
                </Button>
                <Button
                  className="w-full sm:flex-1"
                  disabled={isConverting}
                  onClick={handleConvert}
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      转换中…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      转换为 SVG
                    </>
                  )}
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                转换在本地执行，复杂图片可能短暂卡住界面，请稍候。
              </p>
            </div>

            {svgString && svgPreviewUrl && (
              <div className="relative flex flex-col gap-4 rounded-2xl border bg-card/30 p-4 sm:p-6">
                {isConverting && (
                  <div
                    aria-busy="true"
                    aria-live="polite"
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl bg-background/70 backdrop-blur-sm"
                  >
                    <Loader2
                      aria-hidden
                      className="size-8 animate-spin text-muted-foreground"
                    />
                    <span className="text-muted-foreground text-sm">
                      正在重新生成…
                    </span>
                  </div>
                )}
                <h2 className="font-medium text-sm">SVG 预览</h2>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="flex min-h-[200px] items-center justify-center overflow-hidden rounded-xl border bg-muted/10 p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element -- 本地 Blob URL，非远程优化图 */}
                    <img
                      alt="SVG 矢量预览"
                      className="max-h-[320px] max-w-full object-contain"
                      height={512}
                      src={svgPreviewUrl}
                      width={512}
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-3">
                    <Button
                      disabled={isConverting}
                      onClick={handleDownload}
                      size="lg"
                    >
                      <Download className="size-4" />
                      下载 SVG
                    </Button>
                    <Button
                      disabled={isConverting}
                      onClick={handleCopySvg}
                      size="lg"
                      variant="outline"
                    >
                      <Copy className="size-4" />
                      {copied ? '已复制到剪贴板' : '复制 SVG 代码'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
