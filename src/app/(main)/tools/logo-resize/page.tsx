'use client'

import { Download, ImageIcon, RotateCcw, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Area } from 'react-easy-crop'
import Cropper from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { ToolHeader } from '@/components/tool-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { loadImageFromFile, validateImageFile } from '@/lib/canvas-utils'
import {
  canvasToBlobWithFormat,
  type ExportImageFormat,
  getCroppedCanvas,
  scaleCanvasToSize,
} from '@/lib/crop-image'
import { cn } from '@/lib/utils'

type CropMode = 'fixed-ratio' | 'free' | 'fixed-size'

const MODE_TABS: { id: CropMode; label: string }[] = [
  { id: 'fixed-ratio', label: '固定比例' },
  { id: 'free', label: '自由比例' },
  { id: 'fixed-size', label: '固定大小' },
]

const ASPECT_PRESETS: { label: string; value: number }[] = [
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
  { label: '16:9', value: 16 / 9 },
  { label: '2:3', value: 2 / 3 },
  { label: '9:16', value: 9 / 16 },
]

const STRIP_EXTENSION_RE = /\.[^.]+$/

const EXPORT_FORMATS: {
  value: ExportImageFormat
  label: string
  ext: string
}[] = [
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg' },
  { value: 'image/webp', label: 'WEBP', ext: 'webp' },
]

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function sliderFirst(
  value: number | readonly number[],
  fallback: number
): number {
  if (typeof value === 'number') {
    return value
  }
  return value[0] ?? fallback
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function LogoResizePage() {
  const [mode, setMode] = useState<CropMode>('fixed-ratio')
  const [aspectValue, setAspectValue] = useState(1)
  const [freeWidthPct, setFreeWidthPct] = useState(85)
  const [freeHeightPct, setFreeHeightPct] = useState(85)
  const [targetWidth, setTargetWidth] = useState(512)
  const [targetHeight, setTargetHeight] = useState(512)

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const [exportFormat, setExportFormat] =
    useState<ExportImageFormat>('image/png')
  const [exportQuality, setExportQuality] = useState(90)

  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [cropPixelArea, setCropPixelArea] = useState<Area | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const cropPixelRef = useRef<Area | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cropContainerRef = useRef<HTMLDivElement>(null)

  const previewUrl = useMemo(
    () => (sourceFile ? URL.createObjectURL(sourceFile) : null),
    [sourceFile]
  )

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  useEffect(() => {
    const el = cropContainerRef.current
    if (!el) {
      return
    }
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect
      if (cr) {
        setContainerSize({
          width: Math.floor(cr.width),
          height: Math.floor(cr.height),
        })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [previewUrl])

  const cropSize = useMemo(() => {
    if (mode !== 'free') {
      return undefined
    }
    if (containerSize.width < 32 || containerSize.height < 32) {
      return undefined
    }
    const w = Math.round((containerSize.width * freeWidthPct) / 100)
    const h = Math.round((containerSize.height * freeHeightPct) / 100)
    return {
      width: Math.max(64, Math.min(w, containerSize.width)),
      height: Math.max(64, Math.min(h, containerSize.height)),
    }
  }, [mode, containerSize, freeWidthPct, freeHeightPct])

  const aspectForCropper = useMemo(() => {
    if (mode === 'fixed-ratio') {
      return aspectValue
    }
    if (mode === 'fixed-size') {
      return targetWidth / Math.max(1, targetHeight)
    }
    return 1
  }, [mode, aspectValue, targetWidth, targetHeight])

  const onCropAreaChange = useCallback((_area: Area, areaPixels: Area) => {
    cropPixelRef.current = areaPixels
    setCropPixelArea(areaPixels)
  }, [])

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    if (file.type === 'image/svg+xml') {
      setError('SVG 矢量图无法在画布中裁切，请使用 PNG、JPG、WEBP 或 GIF')
      return
    }

    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      const img = await loadImageFromFile(file)
      setSourceFile(file)
      setSourceImage(img)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setRotation(0)
      setCropPixelArea(null)
      cropPixelRef.current = null
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

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
      e.target.value = ''
    },
    [handleFile]
  )

  const handleClear = useCallback(() => {
    setSourceFile(null)
    setSourceImage(null)
    setError(null)
    setCropPixelArea(null)
    cropPixelRef.current = null
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
  }, [])

  const handleResetView = useCallback(() => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
  }, [])

  const handleDownload = useCallback(async () => {
    const imageSrc = previewUrl
    const pixels = cropPixelRef.current ?? cropPixelArea
    if (!(imageSrc && pixels)) {
      setError('请先上传图片并调整裁切区域')
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      let canvas = await getCroppedCanvas(imageSrc, pixels, rotation)
      if (mode === 'fixed-size') {
        const tw = clampInt(targetWidth, 1, 4096)
        const th = clampInt(targetHeight, 1, 4096)
        canvas = scaleCanvasToSize(canvas, tw, th)
      }

      const q = exportQuality / 100
      const blob = await canvasToBlobWithFormat(canvas, exportFormat, q)
      const fmt = EXPORT_FORMATS.find((f) => f.value === exportFormat)
      const ext = fmt?.ext ?? 'png'
      const base =
        sourceFile?.name.replace(STRIP_EXTENSION_RE, '') || 'logo-cropped'
      triggerDownload(blob, `${base}.${ext}`)
    } catch {
      setError('导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }, [
    cropPixelArea,
    exportFormat,
    exportQuality,
    mode,
    previewUrl,
    rotation,
    sourceFile?.name,
    targetHeight,
    targetWidth,
  ])

  const exportSizeLabel = useMemo(() => {
    if (!cropPixelArea) {
      return '—'
    }
    if (mode === 'fixed-size') {
      return `${clampInt(targetWidth, 1, 4096)} × ${clampInt(targetHeight, 1, 4096)}`
    }
    return `${cropPixelArea.width} × ${cropPixelArea.height}`
  }, [cropPixelArea, mode, targetHeight, targetWidth])

  const showQualitySlider =
    exportFormat === 'image/jpeg' || exportFormat === 'image/webp'

  const cropperReady =
    Boolean(previewUrl) && (mode !== 'free' || cropSize !== undefined)

  return (
    <div className="flex flex-col gap-6 p-2">
      <ToolHeader
        description="固定比例、自由比例或固定像素尺寸裁切并导出"
        title="Logo Resize"
      />

      <input
        accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"
        className="hidden"
        onChange={handleFileInput}
        ref={fileInputRef}
        type="file"
      />

      {error && (
        <div
          aria-live="polite"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {previewUrl ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-medium text-sm">裁切预览</h2>
              <Button
                className="shrink-0"
                onClick={handleClear}
                size="sm"
                type="button"
                variant="ghost"
              >
                <X className="mr-1 size-3.5" />
                移除图片
              </Button>
            </div>
            <div
              className="relative w-full overflow-hidden rounded-xl border bg-muted/30"
              ref={cropContainerRef}
              style={{ height: 'clamp(320px, 65vh, 640px)' }}
            >
              {cropperReady ? (
                <Cropper
                  aspect={aspectForCropper}
                  crop={crop}
                  cropSize={cropSize}
                  image={previewUrl}
                  maxZoom={3}
                  minZoom={1}
                  objectFit="contain"
                  onCropAreaChange={onCropAreaChange}
                  onCropChange={setCrop}
                  onRotationChange={setRotation}
                  onZoomChange={setZoom}
                  rotation={rotation}
                  zoom={zoom}
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground text-sm">
                  正在准备裁切区域…
                </div>
              )}
            </div>
            {sourceImage && (
              <p className="text-muted-foreground text-xs">
                原图尺寸：{sourceImage.naturalWidth} ×{' '}
                {sourceImage.naturalHeight} · 导出尺寸：{exportSizeLabel}
              </p>
            )}
          </div>

          <div className="flex w-full shrink-0 flex-col gap-5 lg:w-80">
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground text-xs">裁切模式</span>
              <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/30 p-1">
                {MODE_TABS.map((tab) => (
                  <button
                    className={cn(
                      'rounded-md px-2.5 py-1.5 text-xs transition-colors',
                      mode === tab.id
                        ? 'bg-background font-medium text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    key={tab.id}
                    onClick={() => setMode(tab.id)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'fixed-ratio' && (
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs">比例</span>
                <div className="flex flex-wrap gap-1.5">
                  {ASPECT_PRESETS.map((p) => (
                    <Button
                      key={p.label}
                      onClick={() => setAspectValue(p.value)}
                      size="sm"
                      type="button"
                      variant={aspectValue === p.value ? 'default' : 'outline'}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {mode === 'free' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      裁切框宽度
                    </span>
                    <span className="font-mono text-muted-foreground text-xs">
                      {freeWidthPct}%
                    </span>
                  </div>
                  <Slider
                    max={100}
                    min={30}
                    onValueChange={(v) => setFreeWidthPct(sliderFirst(v, 85))}
                    step={1}
                    value={[freeWidthPct]}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      裁切框高度
                    </span>
                    <span className="font-mono text-muted-foreground text-xs">
                      {freeHeightPct}%
                    </span>
                  </div>
                  <Slider
                    max={100}
                    min={30}
                    onValueChange={(v) => setFreeHeightPct(sliderFirst(v, 85))}
                    step={1}
                    value={[freeHeightPct]}
                  />
                </div>
              </div>
            )}

            {mode === 'fixed-size' && (
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs">
                  目标输出尺寸（像素）
                </span>
                <div className="flex items-center gap-2">
                  <Input
                    aria-label="目标宽度"
                    className="font-mono"
                    max={4096}
                    min={1}
                    onChange={(e) =>
                      setTargetWidth(
                        clampInt(Number(e.target.value) || 1, 1, 4096)
                      )
                    }
                    type="number"
                    value={targetWidth}
                  />
                  <span className="text-muted-foreground text-sm">×</span>
                  <Input
                    aria-label="目标高度"
                    className="font-mono"
                    max={4096}
                    min={1}
                    onChange={(e) =>
                      setTargetHeight(
                        clampInt(Number(e.target.value) || 1, 1, 4096)
                      )
                    }
                    type="number"
                    value={targetHeight}
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  裁切框比例与输出尺寸一致，导出时会缩放到上述宽高。
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">缩放</span>
                <span className="font-mono text-muted-foreground text-xs">
                  {zoom.toFixed(2)}×
                </span>
              </div>
              <Slider
                max={300}
                min={100}
                onValueChange={(v) => setZoom(sliderFirst(v, 100) / 100)}
                step={1}
                value={[Math.round(zoom * 100)]}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">旋转</span>
                <span className="font-mono text-muted-foreground text-xs">
                  {rotation}°
                </span>
              </div>
              <Slider
                max={360}
                min={0}
                onValueChange={(v) => setRotation(sliderFirst(v, 0))}
                step={1}
                value={[rotation]}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="text-muted-foreground text-xs"
                htmlFor="export-format"
              >
                导出格式
              </label>
              <Select
                onValueChange={(v) => setExportFormat(v as ExportImageFormat)}
                value={exportFormat}
              >
                <SelectTrigger className="w-full" id="export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_FORMATS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showQualitySlider && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    压缩质量
                  </span>
                  <span className="font-mono text-muted-foreground text-xs">
                    {exportQuality}%
                  </span>
                </div>
                <Slider
                  max={100}
                  min={10}
                  onValueChange={(v) => setExportQuality(sliderFirst(v, 90))}
                  step={1}
                  value={[exportQuality]}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                className="flex-1"
                disabled={!cropPixelArea || isExporting}
                onClick={handleDownload}
                type="button"
              >
                <Download className="mr-1.5 size-4" />
                {isExporting ? '导出中…' : '下载裁切结果'}
              </Button>
              <Button onClick={handleResetView} type="button" variant="outline">
                <RotateCcw className="mr-1.5 size-4" />
                重置视图
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          className={cn(
            'flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30'
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          type="button"
        >
          <Upload className="size-8 text-muted-foreground" />
          <span className="font-medium text-sm">点击或拖拽上传图片</span>
          <span className="text-muted-foreground text-xs">
            支持 PNG、JPG、WEBP、GIF，最大 10MB
          </span>
        </button>
      )}

      <div className="flex items-start gap-2 rounded-lg border bg-muted/20 p-3 text-muted-foreground text-xs">
        <ImageIcon className="mt-0.5 size-4 shrink-0" />
        <p>
          使用 <span className="font-medium text-foreground">固定比例</span>{' '}
          快速对齐常见画幅；{' '}
          <span className="font-medium text-foreground">自由比例</span>{' '}
          通过调整裁切框宽高占比实现任意比例；{' '}
          <span className="font-medium text-foreground">固定大小</span>{' '}
          在锁定比例后将结果缩放为指定像素尺寸。
        </p>
      </div>
    </div>
  )
}
