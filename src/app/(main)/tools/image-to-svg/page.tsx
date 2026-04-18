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
import {
  ToolAlert,
  ToolPageShell,
  ToolUploadZone,
  ToolWorkspace,
} from '@/components/tool-shell'
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

const FILE_EXTENSION_REGEX = /\.[^.]+$/

/** 限制长边，避免主线程长时间卡顿或内存过大 */
const MAX_TRACE_SIDE = 1600

type Engine = 'imagetracer' | 'potrace'

const ENGINES: { value: Engine; label: string; description: string }[] = [
  {
    value: 'imagetracer',
    label: 'ImageTracer',
    description: '彩色描摹，多种预设',
  },
  {
    value: 'potrace',
    label: 'Potrace',
    description: '经典矢量化算法，支持黑白/彩色',
  },
]

const IMAGETRACER_PRESETS: {
  value: string
  label: string
  description: string
}[] = [
  { value: 'default', label: '默认', description: '通用平衡' },
  {
    value: 'posterized2',
    label: '海报色（4 色）',
    description: '色块少、边缘柔和',
  },
  { value: 'curvy', label: '曲线', description: '更圆润的路径' },
  { value: 'sharp', label: '锐利', description: '更利落的转角' },
  { value: 'detailed', label: '精细', description: '更多颜色与细节' },
  { value: 'grayscale', label: '灰度', description: '黑白灰分层' },
  { value: 'artistic1', label: '艺术 1', description: '描边 + 模糊感' },
]

const POTRACE_PRESETS: { value: string; label: string; description: string }[] =
  [
    { value: 'bw', label: '黑白', description: '经典双色矢量化' },
    { value: 'color-2', label: '彩色（2 层）', description: '简洁色块' },
    { value: 'color-4', label: '彩色（4 层）', description: '中等色阶' },
    { value: 'color-6', label: '彩色（6 层）', description: '丰富色彩' },
    { value: 'color-8', label: '彩色（8 层）', description: '高还原度' },
  ]

const POTRACE_TURN_POLICIES = [
  { value: 0, label: '少数（Minority）' },
  { value: 1, label: '多数（Majority）' },
  { value: 2, label: '随机（Random）' },
  { value: 3, label: '黑色优先' },
  { value: 4, label: '白色优先' },
  { value: 5, label: '右手（Right）' },
  { value: 6, label: '左手（Left）' },
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

function imageToCanvas(
  img: HTMLImageElement,
  maxSide: number
): HTMLCanvasElement {
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
  return canvas
}

function parsePotracePrest(presetId: string) {
  if (presetId === 'bw') {
    return { extractcolors: false, posterizelevel: 1 }
  }
  const level = Number.parseInt(presetId.replace('color-', ''), 10) || 2
  return { extractcolors: true, posterizelevel: level }
}

export default function ImageToSvgPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [svgString, setSvgString] = useState<string | null>(null)
  const [svgPreviewUrl, setSvgPreviewUrl] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [engine, setEngine] = useState<Engine>('imagetracer')

  // ImageTracer state
  const [itPreset, setItPreset] = useState('default')
  const [numberOfColors, setNumberOfColors] = useState(16)
  const [blurRadius, setBlurRadius] = useState(0)
  const [ltres, setLtres] = useState(1)
  const [qtres, setQtres] = useState(1)

  // Potrace state
  const [ptPreset, setPtPreset] = useState('bw')
  const [turdsize, setTurdsize] = useState(2)
  const [alphamax, setAlphamax] = useState(1)
  const [opttolerance, setOpttolerance] = useState(0.2)
  const [turnpolicy, setTurnpolicy] = useState(4)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const potraceRef = useRef<{
    potrace: (
      source: ImageBitmapSource,
      options: Record<string, unknown>
    ) => Promise<string>
    init: () => Promise<void>
    ready: boolean
  } | null>(null)

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

  const initPotrace = useCallback(async () => {
    if (potraceRef.current?.ready) {
      return potraceRef.current
    }
    const mod = await import('esm-potrace-wasm')
    await mod.init()
    const ref = { potrace: mod.potrace, init: mod.init, ready: true }
    potraceRef.current = ref
    return ref
  }, [])

  const traceWithImageTracer = useCallback(
    (img: HTMLImageElement): string => {
      const imageData = imageToImageData(img, MAX_TRACE_SIDE)
      let options: string | ImageTracerOptions = itPreset
      if (showAdvanced) {
        const base = ImageTracer.checkoptions(itPreset)
        options = {
          ...base,
          numberofcolors: numberOfColors,
          blurradius: blurRadius,
          ltres,
          qtres,
        }
      }
      return ImageTracer.imagedataToSVG(imageData, options)
    },
    [blurRadius, itPreset, ltres, numberOfColors, qtres, showAdvanced]
  )

  const traceWithPotrace = useCallback(
    async (img: HTMLImageElement): Promise<string> => {
      const pt = await initPotrace()
      const canvas = imageToCanvas(img, MAX_TRACE_SIDE)
      const presetOpts = parsePotracePrest(ptPreset)
      const options: Record<string, unknown> = {
        turdsize: showAdvanced ? turdsize : 2,
        turnpolicy: showAdvanced ? turnpolicy : 4,
        alphamax: showAdvanced ? alphamax : 1,
        opticurve: 1,
        opttolerance: showAdvanced ? opttolerance : 0.2,
        pathonly: false,
        ...presetOpts,
      }
      return pt.potrace(canvas, options)
    },
    [
      alphamax,
      initPotrace,
      opttolerance,
      ptPreset,
      showAdvanced,
      turdsize,
      turnpolicy,
    ]
  )

  const handleConvert = useCallback(async () => {
    if (!sourceImage) {
      return
    }
    setError(null)
    setIsConverting(true)

    await new Promise<void>((r) => {
      requestAnimationFrame(() => r())
    })

    try {
      const svg =
        engine === 'imagetracer'
          ? traceWithImageTracer(sourceImage)
          : await traceWithPotrace(sourceImage)
      setSvgString(svg)
    } catch {
      setError('转换失败，请尝试其他图片或调整参数')
    } finally {
      setIsConverting(false)
    }
  }, [engine, sourceImage, traceWithImageTracer, traceWithPotrace])

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

  const syncItSlidersFromPreset = useCallback((presetId: string) => {
    const full = ImageTracer.checkoptions(presetId)
    setNumberOfColors(full.numberofcolors ?? 16)
    setBlurRadius(full.blurradius ?? 0)
    setLtres(full.ltres ?? 1)
    setQtres(full.qtres ?? 1)
  }, [])

  return (
    <ToolPageShell>
      <ToolHeader
        description="纯浏览器端描摹位图为 SVG，图片不会上传服务器"
        meta={['SVG 矢量化', '双引擎', '浏览器端']}
        title="Image to SVG"
      />

      <ToolWorkspace className="gap-8 pb-12" size="md">
        {error && <ToolAlert>{error}</ToolAlert>}

        {!sourceFile && (
          <ToolUploadZone
            description="把位图 Logo 描摹为可编辑的 SVG 矢量图。"
            formats={['PNG', 'JPG', 'WEBP', 'GIF', 'SVG']}
            icon={Upload}
            isDragging={isDragging}
            maxSize="≤ 10MB"
            note="大图会自动缩小后再描摹，适合 Logo、图标和高对比图形。"
            onClick={() => fileInputRef.current?.click()}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            title="拖拽图片到此处，或点击上传"
          />
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

              {/* 引擎选择 */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-muted-foreground text-xs"
                  htmlFor="trace-engine"
                >
                  描摹引擎
                </label>
                <Select
                  items={ENGINES}
                  onValueChange={(v) => {
                    if (v) {
                      setEngine(v as Engine)
                      setShowAdvanced(false)
                    }
                  }}
                  value={engine}
                >
                  <SelectTrigger className="w-full" id="trace-engine">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENGINES.map((e) => (
                      <SelectItem key={e.value} label={e.label} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 预设选择 */}
              <div className="flex flex-col gap-2">
                <label
                  className="text-muted-foreground text-xs"
                  htmlFor="trace-preset"
                >
                  描摹预设
                </label>
                {engine === 'imagetracer' ? (
                  <Select
                    items={IMAGETRACER_PRESETS}
                    onValueChange={(v) => {
                      if (v) {
                        setItPreset(v)
                        syncItSlidersFromPreset(v)
                      }
                    }}
                    value={itPreset}
                  >
                    <SelectTrigger className="w-full" id="trace-preset">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {IMAGETRACER_PRESETS.map((p) => (
                        <SelectItem
                          key={p.value}
                          label={p.label}
                          value={p.value}
                        >
                          {p.label} — {p.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    items={POTRACE_PRESETS}
                    onValueChange={(v) => {
                      if (v) {
                        setPtPreset(v)
                      }
                    }}
                    value={ptPreset}
                  >
                    <SelectTrigger className="w-full" id="trace-preset">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POTRACE_PRESETS.map((p) => (
                        <SelectItem
                          key={p.value}
                          label={p.label}
                          value={p.value}
                        >
                          {p.label} — {p.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* 高级参数 */}
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

                {showAdvanced && engine === 'imagetracer' && (
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

                {showAdvanced && engine === 'potrace' && (
                  <div className="flex flex-col gap-4 rounded-lg border border-dashed p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">
                          噪点过滤 (turdsize)
                        </span>
                        <span className="font-mono text-muted-foreground text-xs">
                          {turdsize}
                        </span>
                      </div>
                      <Slider
                        max={100}
                        min={0}
                        onValueChange={(v) => setTurdsize(sliderFirst(v, 2))}
                        step={1}
                        value={[turdsize]}
                      />
                      <p className="text-muted-foreground/70 text-xs">
                        面积小于此值的斑点会被忽略
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">
                          角点平滑 (alphamax)
                        </span>
                        <span className="font-mono text-muted-foreground text-xs">
                          {alphamax.toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        max={1.34}
                        min={0}
                        onValueChange={(v) => setAlphamax(sliderFirst(v, 1))}
                        step={0.01}
                        value={[alphamax]}
                      />
                      <p className="text-muted-foreground/70 text-xs">
                        值越大曲线越平滑，0 = 全锐角
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">
                          曲线优化容差 (opttolerance)
                        </span>
                        <span className="font-mono text-muted-foreground text-xs">
                          {opttolerance.toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        max={1}
                        min={0}
                        onValueChange={(v) =>
                          setOpttolerance(sliderFirst(v, 0.2))
                        }
                        step={0.01}
                        value={[opttolerance]}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        className="text-muted-foreground text-xs"
                        htmlFor="turnpolicy-select"
                      >
                        转向策略 (turnpolicy)
                      </label>
                      <Select
                        items={POTRACE_TURN_POLICIES}
                        onValueChange={(v) => {
                          if (v) {
                            setTurnpolicy(Number(v))
                          }
                        }}
                        value={String(turnpolicy)}
                      >
                        <SelectTrigger
                          className="w-full"
                          id="turnpolicy-select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {POTRACE_TURN_POLICIES.map((p) => (
                            <SelectItem key={p.value} value={String(p.value)}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
      </ToolWorkspace>
    </ToolPageShell>
  )
}
