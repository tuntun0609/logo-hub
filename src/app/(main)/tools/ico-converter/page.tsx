'use client'

import { Download, ImageIcon, Loader2, Upload } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { ToolHeader } from '@/components/tool-header'
import {
  ToolAlert,
  ToolFileSummary,
  ToolPageShell,
  ToolPanel,
  ToolUploadZone,
  ToolWorkspace,
} from '@/components/tool-shell'
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
      const nextPreviews = new Map<number, string>()
      for (const size of sizes) {
        const canvas = resizeToCanvas(img, size)
        nextPreviews.set(size, canvas.toDataURL('image/png'))
      }
      setPreviews(nextPreviews)
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
    [generatePreviews, selectedSizes]
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
    [generatePreviews, sourceImage]
  )

  const selectAll = useCallback(() => {
    const all = new Set(ALL_SIZES as unknown as number[])
    setSelectedSizes(all)
    if (sourceImage) {
      generatePreviews(sourceImage, all)
    }
  }, [generatePreviews, sourceImage])

  const selectFavicon = useCallback(() => {
    const favicon = new Set(FAVICON_SIZES)
    setSelectedSizes(favicon)
    if (sourceImage) {
      generatePreviews(sourceImage, favicon)
    }
  }, [generatePreviews, sourceImage])

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
            return { pngBlob, size }
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
  }, [selectedSizes, sourceFile, sourceImage])

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
    <ToolPageShell>
      <ToolHeader
        description="将图片转换为多尺寸 ICO 图标文件"
        meta={['ICO 导出', '多尺寸', '本地处理']}
        title="ICO Converter"
      />

      <ToolWorkspace size="lg">
        {error && <ToolAlert>{error}</ToolAlert>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ToolPanel className="flex flex-col gap-6">
            {sourceFile ? (
              <ToolFileSummary
                icon={ImageIcon}
                meta={
                  <>
                    {sourceImage &&
                      `${sourceImage.naturalWidth} × ${sourceImage.naturalHeight}`}
                    {' · '}
                    {(sourceFile.size / 1024).toFixed(1)} KB
                  </>
                }
                name={sourceFile.name}
                onClear={handleClear}
              />
            ) : (
              <ToolUploadZone
                description="快速导出 favicon 或完整 ICO 尺寸集合。"
                formats={['PNG', 'JPG', 'SVG', 'WEBP', 'GIF']}
                icon={Upload}
                isDragging={isDragging}
                maxSize="≤ 10MB"
                note="建议上传方形 Logo 或高对比图标，生成效果更稳定。"
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
                      'inline-flex h-8 items-center rounded-full border px-3 font-medium text-sm transition-colors',
                      selectedSizes.has(size)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border/70 bg-background/80 hover:bg-muted'
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
          </ToolPanel>

          <ToolPanel className="flex flex-col gap-6">
            {previews.size > 0 ? (
              <>
                <div className="flex flex-col gap-3">
                  <h2 className="font-medium text-sm">预览</h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {[...previews.entries()]
                      .sort(([a], [b]) => a - b)
                      .map(([size, dataUrl]) => (
                        <div
                          className="flex flex-col items-center gap-2 rounded-[1.2rem] border border-border/70 bg-muted/20 p-4"
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
                                imageRendering:
                                  size <= 48 ? 'pixelated' : 'auto',
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
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-[1.35rem] border border-border/70 border-dashed bg-muted/15 p-10 text-center text-muted-foreground">
                <ImageIcon className="size-8" />
                <p className="text-sm">上传图片后，这里会生成各尺寸预览</p>
              </div>
            )}
          </ToolPanel>
        </div>
      </ToolWorkspace>
    </ToolPageShell>
  )
}
