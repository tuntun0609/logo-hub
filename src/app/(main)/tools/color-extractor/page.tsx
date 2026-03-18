'use client'

import {
  type Color,
  getColorSync,
  getPaletteSync,
  getSwatchesSync,
  type SwatchMap,
} from 'colorthief'
import { Check, Copy, ImageIcon, Palette, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ToolHeader } from '@/components/tool-header'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { loadImageFromFile, validateImageFile } from '@/lib/canvas-utils'
import { cn } from '@/lib/utils'

type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch'

const COLOR_FORMATS: { value: ColorFormat; label: string }[] = [
  { value: 'hex', label: 'HEX' },
  { value: 'rgb', label: 'RGB' },
  { value: 'hsl', label: 'HSL' },
  { value: 'oklch', label: 'OKLCH' },
]

function formatColor(color: Color, format: ColorFormat): string {
  switch (format) {
    case 'hex':
      return color.hex().toUpperCase()
    case 'rgb': {
      const { r, g, b } = color.rgb()
      return `rgb(${r}, ${g}, ${b})`
    }
    case 'hsl': {
      const { h, s, l } = color.hsl()
      return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
    }
    case 'oklch': {
      const { l, c, h } = color.oklch()
      return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${Math.round(h)})`
    }
    default:
      return color.hex().toUpperCase()
  }
}

const SWATCH_LABELS: Record<string, string> = {
  Vibrant: '鲜艳',
  Muted: '柔和',
  DarkVibrant: '深鲜艳',
  DarkMuted: '深柔和',
  LightVibrant: '浅鲜艳',
  LightMuted: '浅柔和',
}

function ColorFormatSwitcher({
  value,
  onChange,
}: {
  value: ColorFormat
  onChange: (format: ColorFormat) => void
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
      {COLOR_FORMATS.map((fmt) => (
        <button
          className={cn(
            'rounded-md px-2.5 py-1 font-mono text-xs transition-colors',
            value === fmt.value
              ? 'bg-background font-medium text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          key={fmt.value}
          onClick={() => onChange(fmt.value)}
          type="button"
        >
          {fmt.label}
        </button>
      ))}
    </div>
  )
}

function ColorSwatch({
  color,
  copied,
  format,
  onCopy,
}: {
  color: Color
  copied: boolean
  format: ColorFormat
  onCopy: () => void
}) {
  const displayValue = formatColor(color, format)

  return (
    <button
      className="flex flex-col items-center gap-2 rounded-lg border bg-muted/20 p-3 transition-colors hover:bg-muted/50"
      onClick={onCopy}
      type="button"
    >
      <div
        className="h-12 w-full rounded-md border border-border"
        style={{ backgroundColor: color.hex() }}
      />
      <span className="flex h-5 items-center justify-center text-center font-mono text-xs">
        {copied ? (
          <span className="inline-flex items-center gap-1">
            <Check className="size-3.5 shrink-0 text-green-500" />
            Copied!
          </span>
        ) : (
          displayValue
        )}
      </span>
    </button>
  )
}

export default function ColorExtractorPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null)
  const [dominant, setDominant] = useState<Color | null>(null)
  const [palette, setPalette] = useState<Color[]>([])
  const [swatches, setSwatches] = useState<SwatchMap | null>(null)
  const [colorCount, setColorCount] = useState(8)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [colorFormat, setColorFormat] = useState<ColorFormat>('hex')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

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

  const runExtraction = useCallback((img: HTMLImageElement, count: number) => {
    try {
      const d = getColorSync(img)
      setDominant(d)

      const p = getPaletteSync(img, { colorCount: count })
      setPalette(p ?? [])

      const s = getSwatchesSync(img)
      setSwatches(s)
    } catch {
      setError('颜色提取失败，请尝试其他图片')
    }
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)

      const validationError = validateImageFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      try {
        const img = await loadImageFromFile(file)
        setSourceFile(file)
        setSourceImage(img)
        runExtraction(img, colorCount)
      } catch {
        setError('无法加载此图片文件')
      }
    },
    [colorCount, runExtraction]
  )

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

  const handleColorCountChange = useCallback(
    (value: number | readonly number[]) => {
      const count = Array.isArray(value) ? value[0] : value
      setColorCount(count)
      if (sourceImage) {
        runExtraction(sourceImage, count)
      }
    },
    [sourceImage, runExtraction]
  )

  const handleCopy = useCallback(
    (color: Color, key: string) => {
      navigator.clipboard.writeText(formatColor(color, colorFormat))
      setCopiedKey(key)
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current)
      }
      copyTimerRef.current = setTimeout(() => setCopiedKey(null), 1500)
    },
    [colorFormat]
  )

  const handleClear = useCallback(() => {
    setSourceFile(null)
    setSourceImage(null)
    setDominant(null)
    setPalette([])
    setSwatches(null)
    setError(null)
    setCopiedKey(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <ToolHeader
        description="从图片中提取主题配色方案"
        title="Theme Color Extractor"
      />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {/* Error */}
        {error && (
          <div
            aria-live="polite"
            className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive text-sm"
          >
            {error}
          </div>
        )}

        {/* Upload zone */}
        {sourceFile ? (
          <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
            <ImageIcon className="size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">{sourceFile.name}</p>
              <p className="text-muted-foreground text-xs">
                {sourceImage &&
                  `${sourceImage.naturalWidth} × ${sourceImage.naturalHeight}`}
                {' · '}
                {(sourceFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              aria-label="移除图片"
              onClick={handleClear}
              size="icon-sm"
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <button
            aria-label="上传图片文件"
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            type="button"
          >
            <Upload className="size-8 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium text-sm">拖拽图片到此处或点击上传</p>
              <p className="mt-1 text-muted-foreground text-xs">
                支持 PNG, JPG, SVG, WEBP, GIF（≤10MB）
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

        {/* Color count slider */}
        {sourceImage && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-sm">提取颜色数量</h2>
              <span className="font-mono text-muted-foreground text-sm">
                {colorCount}
              </span>
            </div>
            <Slider
              max={12}
              min={2}
              onValueChange={handleColorCountChange}
              step={1}
              value={[colorCount]}
            />
          </div>
        )}

        {/* Image preview + color strip */}
        {previewUrl && palette.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-medium text-sm">预览</h2>
            <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="上传的图片"
                className="max-h-40 max-w-full rounded-md border object-contain sm:max-w-48"
                height={160}
                src={previewUrl}
                width={192}
              />
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex overflow-hidden rounded-md border">
                  {palette.map((c) => (
                    <div
                      className="h-8"
                      key={c.hex()}
                      style={{
                        backgroundColor: c.hex(),
                        flex: c.proportion,
                      }}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground text-xs">
                  颜色占比分布
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Color format switcher + Dominant color */}
        {dominant && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-sm">主色调</h2>
              <ColorFormatSwitcher
                onChange={setColorFormat}
                value={colorFormat}
              />
            </div>
            <button
              className="group flex items-center gap-4 rounded-xl border bg-muted/20 p-4 transition-colors hover:bg-muted/50"
              onClick={() => handleCopy(dominant, 'dominant')}
              type="button"
            >
              <div
                className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-border"
                style={{ backgroundColor: dominant.hex() }}
              >
                {copiedKey === 'dominant' ? (
                  <Check
                    className="size-4"
                    style={{ color: dominant.textColor }}
                  />
                ) : (
                  <Copy
                    className="size-4 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: dominant.textColor }}
                  />
                )}
              </div>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="flex min-h-5 items-center font-medium font-mono text-sm">
                  {copiedKey === 'dominant' ? (
                    <span className="inline-flex items-center gap-1">
                      <Check className="size-3.5 shrink-0 text-green-500" />
                      Copied!
                    </span>
                  ) : (
                    formatColor(dominant, colorFormat)
                  )}
                </span>
                <span className="font-mono text-muted-foreground text-xs">
                  {colorFormat !== 'hex' && dominant.hex().toUpperCase()}
                  {colorFormat === 'hex' &&
                    `rgb(${dominant.rgb().r}, ${dominant.rgb().g}, ${dominant.rgb().b})`}
                </span>
                <span className="text-muted-foreground text-xs">
                  {(dominant.proportion * 100).toFixed(1)}% 占比
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Palette grid */}
        {palette.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Palette className="size-4 text-muted-foreground" />
              <h2 className="font-medium text-sm">调色板</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {palette.map((color, i) => (
                <ColorSwatch
                  color={color}
                  copied={copiedKey === `palette-${i}`}
                  format={colorFormat}
                  key={color.hex()}
                  onCopy={() => handleCopy(color, `palette-${i}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Semantic swatches */}
        {swatches && (
          <div className="flex flex-col gap-3">
            <h2 className="font-medium text-sm">语义色</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(
                Object.keys(SWATCH_LABELS) as Array<keyof typeof SWATCH_LABELS>
              ).map((role) => {
                const swatch = swatches[role as keyof SwatchMap]
                if (!swatch) {
                  return null
                }
                return (
                  <ColorSwatch
                    color={swatch.color}
                    copied={copiedKey === `swatch-${role}`}
                    format={colorFormat}
                    key={role}
                    onCopy={() => handleCopy(swatch.color, `swatch-${role}`)}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
