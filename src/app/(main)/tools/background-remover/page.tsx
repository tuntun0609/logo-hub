'use client'

import { Download, Eraser, GripVertical, Loader2, Upload } from 'lucide-react'
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
  const [sliderPos, setSliderPos] = useState(50)
  const isDraggingSliderRef = useRef(false)
  const comparisonRef = useRef<HTMLDivElement>(null)

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
      // 避免触摸被当成页面滚动，且需在首帧 move 前同步标记拖动（state 会晚一拍）
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
    (e: React.PointerEvent) => {
      endSliderDrag(e)
    },
    [endSliderDrag]
  )

  const handleSliderPointerCancel = useCallback(
    (e: React.PointerEvent) => {
      endSliderDrag(e)
    },
    [endSliderDrag]
  )

  const handleSliderLostPointerCapture = useCallback(() => {
    isDraggingSliderRef.current = false
  }, [])

  return (
    <ToolPageShell>
      <ToolHeader
        description="纯浏览器端 AI 一键移除图片背景，保留透明通道并支持前后对比。"
        meta={['AI 抠图', '前后对比', 'PNG 导出']}
        title="Background Remover"
      />

      <ToolWorkspace className="py-4 sm:py-6" size="md">
        {error && <ToolAlert>{error}</ToolAlert>}

        {!sourceFile && (
          <ToolUploadZone
            description="自动抠除主体背景，完成后可直接下载透明背景 PNG。"
            formats={['PNG', 'JPG', 'SVG']}
            icon={Upload}
            isDragging={isDragging}
            note="首次处理会下载模型文件，请稍等片刻。"
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

        {sourceFile && !resultUrl && (
          <ToolPanel className="flex flex-col items-center gap-8 p-5 sm:p-6">
            <div
              className="relative w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-border/70"
              style={CHECKERBOARD_STYLE}
            >
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
              {isProcessing && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                  <div
                    className="absolute inset-y-0 w-[60%] animate-[sweep_2s_ease-in-out_infinite]"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.08) 80%, transparent 100%)',
                    }}
                  />
                </div>
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
                  className="relative w-full min-w-[200px] overflow-hidden sm:w-auto"
                  disabled={isProcessing}
                  onClick={handleRemoveBackground}
                  size="lg"
                >
                  {isProcessing && (
                    <div
                      className="absolute inset-0 bg-primary-foreground/15 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    {isProcessing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Eraser className="size-4" />
                    )}
                    {isProcessing
                      ? `${progressStage || '处理中...'} ${progress}%`
                      : '移除背景'}
                  </span>
                </Button>
              </div>
              {!isProcessing && (
                <p className="text-center text-muted-foreground text-xs">
                  首次使用需下载约 45MB 模型文件
                </p>
              )}
            </div>
          </ToolPanel>
        )}

        {resultUrl && previewUrl && (
          <ToolPanel className="flex flex-col items-center gap-6 p-5 sm:p-6">
            <div className="flex w-full flex-col gap-3">
              <h2 className="text-center font-medium text-sm">对比预览</h2>
              <div
                className="relative w-full cursor-col-resize touch-none select-none overflow-hidden rounded-[1.5rem] border border-border/70"
                onLostPointerCapture={handleSliderLostPointerCapture}
                onPointerCancel={handleSliderPointerCancel}
                onPointerDown={handleSliderPointerDown}
                onPointerMove={handleSliderPointerMove}
                onPointerUp={handleSliderPointerUp}
                ref={comparisonRef}
                style={CHECKERBOARD_STYLE}
              >
                {/* Result (bottom layer, full width) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="去除背景效果"
                  className="block max-h-[500px] w-full object-contain"
                  draggable={false}
                  height={sourceImage?.naturalHeight ?? 1}
                  src={resultUrl}
                  width={sourceImage?.naturalWidth ?? 1}
                />

                {/* Original (top layer, clipped by slider) */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                  }}
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

                {/* Slider handle */}
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

                {/* Labels */}
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
