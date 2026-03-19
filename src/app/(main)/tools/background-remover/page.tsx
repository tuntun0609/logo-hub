'use client'

import { Download, Eraser, Loader2, Upload } from 'lucide-react'
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

  const workerRef = useRef<Worker | null>(null)

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const handleWorkerMessage = useCallback(
    (
      resolve: (blob: Blob) => void,
      reject: (err: Error) => void,
      e: MessageEvent
    ) => {
      const { type } = e.data
      if (type === 'progress') {
        const { key, current, total } = e.data
        if (key.includes('fetch')) {
          // fetch 阶段占前 50%，按字节计算
          setProgress(Math.round((current / total) * 50))
          setProgressStage('加载模型中...')
        } else if (key.includes('compute')) {
          // compute 阶段占后 50%，共 4 步 (0/4 → 4/4)
          setProgress(50 + Math.round((current / total) * 50))
          setProgressStage('处理图片中...')
        }
      } else if (type === 'result') {
        resolve(e.data.blob)
      } else if (type === 'error') {
        reject(new Error(e.data.message))
      }
    },
    []
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
      const worker = new Worker(new URL('./worker.ts', import.meta.url), {
        type: 'module',
      })
      workerRef.current?.terminate()
      workerRef.current = worker

      const blob = await new Promise<Blob>((resolve, reject) => {
        worker.onmessage = (e) => handleWorkerMessage(resolve, reject, e)
        worker.onerror = (err) => {
          reject(new Error(err.message || 'Worker 执行失败'))
        }
        worker.postMessage({ file: sourceFile })
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

      <div className={cn('mx-auto my-12 flex w-full max-w-2xl flex-col gap-8')}>
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
                支持 PNG, JPG, SVG
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

        {/* Preview and Action */}
        {sourceFile && !resultUrl && (
          <div className="flex flex-col items-center gap-8">
            <div
              className="w-full max-w-2xl rounded-2xl border p-6"
              style={CHECKERBOARD_STYLE}
            >
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="原图预览"
                  className="max-h-[500px] w-full rounded-xl object-contain"
                  height={sourceImage?.naturalHeight ?? 1}
                  src={previewUrl}
                  width={sourceImage?.naturalWidth ?? 1}
                />
              )}
            </div>

            <div className="flex flex-col items-center gap-3">
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
                  className="w-full min-w-[160px] sm:w-auto"
                  disabled={isProcessing}
                  onClick={handleRemoveBackground}
                  size="lg"
                >
                  {isProcessing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Eraser className="size-4" />
                  )}
                  {isProcessing ? progressStage || '处理中...' : '移除背景'}
                </Button>
              </div>
              {!isProcessing && (
                <p className="text-center text-muted-foreground text-xs">
                  首次使用需下载约 45MB 模型文件
                </p>
              )}
            </div>
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
          <div className="flex flex-col items-center gap-6">
            <div className="flex w-full flex-col gap-3">
              <h2 className="text-center font-medium text-sm">对比预览</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <span className="text-center text-muted-foreground text-xs">
                    原图
                  </span>
                  <div
                    className="rounded-2xl border p-2"
                    style={CHECKERBOARD_STYLE}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="原图"
                      className="max-h-64 w-full rounded-xl object-contain"
                      height={sourceImage?.naturalHeight ?? 1}
                      src={previewUrl}
                      width={sourceImage?.naturalWidth ?? 1}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-center text-muted-foreground text-xs">
                    效果
                  </span>
                  <div
                    className="rounded-2xl border p-2"
                    style={CHECKERBOARD_STYLE}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="去除背景效果"
                      className="max-h-64 w-full rounded-xl object-contain"
                      height={sourceImage?.naturalHeight ?? 1}
                      src={resultUrl}
                      width={sourceImage?.naturalWidth ?? 1}
                    />
                  </div>
                </div>
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
          </div>
        )}
      </div>
    </div>
  )
}
