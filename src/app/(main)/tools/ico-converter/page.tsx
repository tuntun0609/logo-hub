'use client'

import { Download, ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { ToolHeader } from '@/components/tool-header'
import { Button } from '@/components/ui/button'
import {
  canvasToBlob,
  loadImageFromFile,
  resizeToCanvas,
  validateImageFile,
} from '@/lib/canvas-utils'
import { encodeIco } from '@/lib/ico-encoder'
import { cn } from '@/lib/utils'

const ALL_SIZES = [16, 24, 32, 48, 64, 128, 256] as const
const FAVICON_SIZES = new Set([16, 32, 48])
const DEFAULT_SIZES = new Set([16, 32, 48])
const FILE_EXTENSION_REGEX = /\.[^.]+$/

export default function IcoConverterPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null)
  const [selectedSizes, setSelectedSizes] = useState<Set<number>>(
    () => new Set(DEFAULT_SIZES)
  )
  const [previews, setPreviews] = useState<Map<number, string>>(new Map())
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const generatePreviews = useCallback(
    (img: HTMLImageElement, sizes: Set<number>) => {
      const newPreviews = new Map<number, string>()
      for (const size of sizes) {
        const canvas = resizeToCanvas(img, size)
        newPreviews.set(size, canvas.toDataURL('image/png'))
      }
      setPreviews(newPreviews)
    },
    []
  )

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
        generatePreviews(img, selectedSizes)
      } catch {
        setError('无法加载此图片文件')
      }
    },
    [selectedSizes, generatePreviews]
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

  const toggleSize = useCallback(
    (size: number) => {
      setSelectedSizes((prev) => {
        const next = new Set(prev)
        if (next.has(size)) {
          next.delete(size)
        } else {
          next.add(size)
        }
        if (sourceImage) {
          generatePreviews(sourceImage, next)
        }
        return next
      })
    },
    [sourceImage, generatePreviews]
  )

  const selectAll = useCallback(() => {
    const all = new Set(ALL_SIZES as unknown as number[])
    setSelectedSizes(all)
    if (sourceImage) {
      generatePreviews(sourceImage, all)
    }
  }, [sourceImage, generatePreviews])

  const selectFavicon = useCallback(() => {
    const fav = new Set(FAVICON_SIZES)
    setSelectedSizes(fav)
    if (sourceImage) {
      generatePreviews(sourceImage, fav)
    }
  }, [sourceImage, generatePreviews])

  const handleDownload = useCallback(async () => {
    if (!sourceImage || selectedSizes.size === 0) {
      return
    }

    setIsProcessing(true)
    try {
      const entries = await Promise.all(
        [...selectedSizes]
          .sort((a, b) => a - b)
          .map(async (size) => {
            const canvas = resizeToCanvas(sourceImage, size)
            const pngBlob = await canvasToBlob(canvas)
            return { size, pngBlob }
          })
      )

      const icoBlob = await encodeIco(entries)
      const url = URL.createObjectURL(icoBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = sourceFile
        ? sourceFile.name.replace(FILE_EXTENSION_REGEX, '.ico')
        : 'favicon.ico'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('生成 ICO 文件失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }, [sourceImage, sourceFile, selectedSizes])

  const handleClear = useCallback(() => {
    setSourceFile(null)
    setSourceImage(null)
    setPreviews(new Map())
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <ToolHeader
        description="将图片转换为多尺寸 ICO 图标文件"
        title="ICO Converter"
      />

      {/* Error */}
      {error && (
        <div
          aria-live="polite"
          className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive text-sm"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column: Upload + Size selector */}
        <div className="flex flex-col gap-6 rounded-xl border bg-muted/20 p-5">
          {/* Upload zone */}
          {sourceFile ? (
            <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
              <ImageIcon className="size-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">
                  {sourceFile.name}
                </p>
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

          {/* Size selector */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-sm">选择分辨率</h2>
              <div className="flex gap-1.5">
                <Button onClick={selectFavicon} size="xs" variant="ghost">
                  常用 Favicon
                </Button>
                <Button onClick={selectAll} size="xs" variant="ghost">
                  全选
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((size) => (
                <button
                  aria-label={`${size}×${size} 像素`}
                  aria-pressed={selectedSizes.has(size)}
                  className={cn(
                    'inline-flex h-8 items-center rounded-lg border px-3 font-medium text-sm transition-colors',
                    selectedSizes.has(size)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:bg-muted'
                  )}
                  key={size}
                  onClick={() => toggleSize(size)}
                  type="button"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Preview + Download */}
        <div className="flex flex-col gap-6 rounded-xl border bg-muted/20 p-5">
          {previews.size > 0 ? (
            <>
              <div className="flex flex-col gap-3">
                <h2 className="font-medium text-sm">预览</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {[...previews.entries()]
                    .sort(([a], [b]) => a - b)
                    .map(([size, dataUrl]) => (
                      <div
                        className="flex flex-col items-center gap-2 rounded-lg border bg-muted/20 p-4"
                        key={size}
                      >
                        <div className="flex h-20 items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={`${size}×${size} 预览`}
                            className="image-rendering-pixelated"
                            height={Math.min(size, 80)}
                            src={dataUrl}
                            style={{
                              imageRendering: size <= 48 ? 'pixelated' : 'auto',
                            }}
                            width={Math.min(size, 80)}
                          />
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {size} × {size}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <Button
                className="w-full"
                disabled={selectedSizes.size === 0 || isProcessing}
                onClick={handleDownload}
              >
                {isProcessing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                {isProcessing ? '生成中...' : '下载 .ico'}
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-muted-foreground">
              <ImageIcon className="size-8" />
              <p className="text-sm">上传图片后预览将显示在这里</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
