'use client'

import { Download, GripVertical, Loader2, Sparkles, Upload } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ToolHeader } from '@/components/tool-header'
import {
  ToolAlert,
  ToolPageShell,
  ToolPanel,
  ToolUploadZone,
  ToolWorkspace,
} from '@/components/tool-shell'
import { Button } from '@/components/ui/button'
import { loadImageFromFile, validateImageFile } from '@/lib/canvas-utils'
import { removeWatermark } from '@/lib/watermark-engine'

const FILE_EXTENSION_REGEX = /\.[^.]+$/

export default function WatermarkRemoverPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [sliderPos, setSliderPos] = useState(50)
  const isDraggingSliderRef = useRef(false)
  const comparisonRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl)
      }
    }
  }, [previewUrl, resultUrl])

  const handleFile = useCallback(async (file: File) => {
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
      const url = URL.createObjectURL(file)
      setPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev)
        }
        return url
      })
      setResultBlob(null)
      setResultUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev)
        }
        return null
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

  const handleRemoveWatermark = useCallback(async () => {
    if (!sourceImage) {
      return
    }
    setIsProcessing(true)
    setError(null)
    try {
      const blob = await removeWatermark(sourceImage)
      const url = URL.createObjectURL(blob)
      setResultBlob(blob)
      setResultUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev)
        }
        return url
      })
    } catch {
      setError('水印去除失败，请尝试其他图片')
    } finally {
      setIsProcessing(false)
    }
  }, [sourceImage])

  const handleDownload = useCallback(() => {
    if (!(resultBlob && sourceFile)) {
      return
    }
    const url = URL.createObjectURL(resultBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = sourceFile.name.replace(FILE_EXTENSION_REGEX, '-nowm.png')
    a.click()
    URL.revokeObjectURL(url)
  }, [resultBlob, sourceFile])

  const handleClear = useCallback(() => {
    setSourceFile(null)
    setSourceImage(null)
    setPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev)
      }
      return null
    })
    setResultBlob(null)
    setResultUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev)
      }
      return null
    })
    setError(null)
    setSliderPos(50)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const updateSliderPos = useCallback((clientX: number) => {
    const rect = comparisonRef.current?.getBoundingClientRect()
    if (!rect) {
      return
    }
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setSliderPos((x / rect.width) * 100)
  }, [])

  const endSliderDrag = useCallback((e: React.PointerEvent) => {
    isDraggingSliderRef.current = false
    const el = comparisonRef.current
    if (el?.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId)
    }
  }, [])

  const handleSliderPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      isDraggingSliderRef.current = true
      comparisonRef.current?.setPointerCapture(e.pointerId)
      updateSliderPos(e.clientX)
    },
    [updateSliderPos]
  )

  const handleSliderPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingSliderRef.current) {
        return
      }
      updateSliderPos(e.clientX)
    },
    [updateSliderPos]
  )

  const handleSliderPointerUp = useCallback(
    (e: React.PointerEvent) => endSliderDrag(e),
    [endSliderDrag]
  )

  const handleSliderPointerCancel = useCallback(
    (e: React.PointerEvent) => endSliderDrag(e),
    [endSliderDrag]
  )

  const handleSliderLostPointerCapture = useCallback(() => {
    isDraggingSliderRef.current = false
  }, [])

  return (
    <ToolPageShell>
      <ToolHeader
        description="针对 Gemini 生成图片的 nanobanana 水印做快速清理，并支持前后拖拽对比。"
        meta={['图片清理', '前后对比', 'PNG 导出']}
        title="Watermark Remover"
      />

      <ToolWorkspace className="py-4 sm:py-6" size="md">
        {error && <ToolAlert>{error}</ToolAlert>}

        {!sourceFile && (
          <ToolUploadZone
            description="一键移除图片水印，并可立即查看前后对比。"
            formats={['PNG', 'JPG', 'WEBP']}
            icon={Upload}
            isDragging={isDragging}
            note="更适合处理边角清晰、背景相对干净的图片。"
            onClick={() => fileInputRef.current?.click()}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            title="拖拽图片到此处，或点击上传"
          />
        )}

        <input
          accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={handleFileInput}
          ref={fileInputRef}
          type="file"
        />

        {sourceFile && !resultUrl && (
          <ToolPanel className="flex flex-col items-center gap-8 p-5 sm:p-6">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-border/70 bg-muted/30">
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="原图预览"
                  className="max-h-[500px] w-full object-contain"
                  height={sourceImage?.naturalHeight ?? 1}
                  src={previewUrl}
                  width={sourceImage?.naturalWidth ?? 1}
                />
              )}
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                className="w-full sm:w-auto"
                disabled={isProcessing}
                onClick={handleClear}
                size="lg"
                variant="outline"
              >
                重新选择
              </Button>
              <Button
                className="w-full min-w-[200px] sm:w-auto"
                disabled={isProcessing}
                onClick={handleRemoveWatermark}
                size="lg"
              >
                <span className="flex items-center gap-2">
                  {isProcessing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  {isProcessing ? '处理中...' : '去除水印'}
                </span>
              </Button>
            </div>
          </ToolPanel>
        )}

        {resultUrl && previewUrl && (
          <ToolPanel className="flex flex-col items-center gap-6 p-5 sm:p-6">
            <div className="flex w-full flex-col">
              <div
                className="relative w-full cursor-col-resize touch-none select-none overflow-hidden rounded-[1.5rem] border border-border/70 bg-muted/30"
                onLostPointerCapture={handleSliderLostPointerCapture}
                onPointerCancel={handleSliderPointerCancel}
                onPointerDown={handleSliderPointerDown}
                onPointerMove={handleSliderPointerMove}
                onPointerUp={handleSliderPointerUp}
                ref={comparisonRef}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="去除水印效果"
                  className="block max-h-[500px] w-full object-contain"
                  draggable={false}
                  height={sourceImage?.naturalHeight ?? 1}
                  src={resultUrl}
                  width={sourceImage?.naturalWidth ?? 1}
                />

                <div
                  className="absolute inset-0"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="原图"
                    className="block max-h-[500px] w-full object-contain"
                    draggable={false}
                    height={sourceImage?.naturalHeight ?? 1}
                    src={previewUrl}
                    width={sourceImage?.naturalWidth ?? 1}
                  />
                </div>

                <div
                  className="absolute inset-y-0"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute inset-y-0 -translate-x-1/2">
                    <div className="h-full w-0.5 bg-white shadow-[0_0_4px_rgba(0,0,0,0.4)]" />
                  </div>
                  <div className="absolute top-1/2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white/90 shadow-lg backdrop-blur-sm">
                    <GripVertical className="size-3.5 text-muted-foreground" />
                  </div>
                </div>

                <span className="absolute top-3 left-3 rounded-full bg-black/50 px-2.5 py-1 font-medium text-white text-xs backdrop-blur-sm">
                  原图
                </span>
                <span className="absolute top-3 right-3 rounded-full bg-black/50 px-2.5 py-1 font-medium text-white text-xs backdrop-blur-sm">
                  效果
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                className="w-full sm:w-auto"
                onClick={handleClear}
                size="lg"
                variant="outline"
              >
                处理新图片
              </Button>
              <Button
                className="w-full min-w-[160px] sm:w-auto"
                onClick={handleDownload}
                size="lg"
              >
                <Download className="size-4" />
                下载 PNG
              </Button>
            </div>
          </ToolPanel>
        )}
      </ToolWorkspace>
    </ToolPageShell>
  )
}
