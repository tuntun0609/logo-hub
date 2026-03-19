'use client'

import { Download, Eraser, ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ToolHeader } from '@/components/tool-header'
import { Button } from '@/components/ui/button'
import { loadImageFromFile, validateImageFile } from '@/lib/canvas-utils'
import { cn } from '@/lib/utils'

const FILE_EXTENSION_REGEX = /\.[^.]+$/

const CHECKERBOARD_STYLE = {
  backgroundImage: [
    'linear-gradient(45deg, #e0e0e0 25%, transparent 25%)',
    'linear-gradient(-45deg, #e0e0e0 25%, transparent 25%)',
    'linear-gradient(45deg, transparent 75%, #e0e0e0 75%)',
    'linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)',
  ].join(', '),
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
}

export default function BackgroundRemoverPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressStage, setProgressStage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cleanup object URLs on unmount
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
      // Reset previous result
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

  const handleRemoveBackground = useCallback(async () => {
    if (!sourceFile) {
      return
    }
    setIsProcessing(true)
    setProgress(0)
    setProgressStage('初始化...')
    setError(null)

    try {
      const { removeBackground } = await import('@imgly/background-removal')
      const blob = await removeBackground(sourceFile, {
        progress: (key: string, current: number, total: number) => {
          const pct = Math.round((current / total) * 100)
          setProgress(pct)
          if (key.includes('fetch')) {
            setProgressStage('加载模型中...')
          } else if (key.includes('compute')) {
            setProgressStage('处理图片中...')
          }
        },
      })
      const url = URL.createObjectURL(blob)
      setResultBlob(blob)
      setResultUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev)
        }
        return url
      })
    } catch {
      setError('背景移除失败，请尝试其他图片')
    } finally {
      setIsProcessing(false)
    }
  }, [sourceFile])

  const handleDownload = useCallback(() => {
    if (!(resultBlob && sourceFile)) {
      return
    }
    const url = URL.createObjectURL(resultBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = sourceFile.name.replace(FILE_EXTENSION_REGEX, '-nobg.png')
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
    setProgress(0)
    setProgressStage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <ToolHeader title="Background Remover" />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
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
              disabled={isProcessing}
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

        {/* Action button */}
        {sourceFile && !resultUrl && (
          <div className="flex flex-col gap-2">
            <Button
              className="w-full sm:w-auto sm:self-start"
              disabled={isProcessing}
              onClick={handleRemoveBackground}
            >
              {isProcessing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Eraser className="size-4" />
              )}
              {isProcessing ? progressStage || '处理中...' : '移除背景'}
            </Button>
            {!isProcessing && (
              <p className="text-muted-foreground text-xs">
                首次使用需下载约 45MB 模型文件
              </p>
            )}
          </div>
        )}

        {/* Progress bar */}
        {isProcessing && (
          <div className="flex flex-col gap-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-muted-foreground text-xs">
              {progressStage} {progress}%
            </p>
          </div>
        )}

        {/* Before / After comparison */}
        {resultUrl && previewUrl && (
          <div className="flex flex-col gap-3">
            <h2 className="font-medium text-sm">对比预览</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs">原图</span>
                <div className="overflow-hidden rounded-lg border bg-muted/20 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="原图"
                    className="max-h-64 w-full object-contain"
                    height={sourceImage?.naturalHeight ?? 1}
                    src={previewUrl}
                    width={sourceImage?.naturalWidth ?? 1}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-xs">效果</span>
                <div
                  className="overflow-hidden rounded-lg border p-2"
                  style={CHECKERBOARD_STYLE}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="去除背景效果"
                    className="max-h-64 w-full object-contain"
                    height={sourceImage?.naturalHeight ?? 1}
                    src={resultUrl}
                    width={sourceImage?.naturalWidth ?? 1}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Download */}
        {resultUrl && (
          <Button
            className="w-full sm:w-auto sm:self-start"
            onClick={handleDownload}
          >
            <Download className="size-4" />
            下载 PNG
          </Button>
        )}
      </div>
    </div>
  )
}
