'use client'

import { Camera, Cloud, Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { captureScreenshot } from '@/lib/actions/admin/screenshot'

export default function AdminScreenshotPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [fullPage, setFullPage] = useState(false)

  const handleCapture = async () => {
    if (!url.trim()) {
      toast.error('请输入网址')
      return
    }

    setLoading(true)
    setScreenshot(null)
    setUploadedUrl(null)

    try {
      const result = await captureScreenshot(url, {
        fullPage,
        width: 1920,
        height: 1080,
        devicePixelRatio: 2,
      })

      if (result.success && result.imageData) {
        setScreenshot(result.imageData)
        toast.success('截图成功')
      } else {
        toast.error(result.error || '截图失败')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '截图失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!screenshot) {
      return
    }

    const link = document.createElement('a')
    link.href = screenshot
    link.download = `screenshot-${Date.now()}.png`
    link.click()
  }

  const handleUploadToR2 = async () => {
    if (!url.trim()) {
      toast.error('请输入网址')
      return
    }

    setUploading(true)
    setUploadedUrl(null)

    try {
      const result = await captureScreenshot(url, {
        fullPage,
        width: 1920,
        height: 1080,
        devicePixelRatio: 2,
        uploadToR2: true,
      })

      if (result.success && result.url) {
        setUploadedUrl(result.url)
        toast.success('已转存到 R2')
      } else {
        toast.error(result.error || '上传失败')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '上传失败')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">网页截图</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          输入网址，生成高清网页截图
        </p>
      </div>

      <div className="space-y-4 rounded-lg border p-6">
        <div className="space-y-2">
          <label className="font-medium text-sm" htmlFor="url">
            网址
          </label>
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
            id="url"
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCapture()}
            placeholder="https://example.com"
            type="url"
            value={url}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            checked={fullPage}
            className="size-4 rounded border-gray-300"
            disabled={loading}
            id="fullPage"
            onChange={(e) => setFullPage(e.target.checked)}
            type="checkbox"
          />
          <label className="text-sm" htmlFor="fullPage">
            完整页面截图（包含滚动内容）
          </label>
        </div>

        <Button disabled={loading || !url.trim()} onClick={handleCapture}>
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              截图中...
            </>
          ) : (
            <>
              <Camera className="mr-2 size-4" />
              开始截图
            </>
          )}
        </Button>
      </div>

      {screenshot && (
        <div className="space-y-4 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-lg">截图预览</h2>
            <div className="flex gap-2">
              <Button
                disabled={uploading}
                onClick={handleUploadToR2}
                size="sm"
                variant="outline"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    上传中...
                  </>
                ) : (
                  <>
                    <Cloud className="mr-2 size-4" />
                    转存到 R2
                  </>
                )}
              </Button>
              <Button onClick={handleDownload} size="sm" variant="outline">
                <Download className="mr-2 size-4" />
                下载图片
              </Button>
            </div>
          </div>

          {uploadedUrl && (
            <div className="rounded-lg border bg-muted p-3">
              <p className="mb-1 font-medium text-sm">R2 链接：</p>
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 rounded border bg-background px-2 py-1 font-mono text-xs"
                  readOnly
                  value={uploadedUrl}
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(uploadedUrl)
                    toast.success('已复制链接')
                  }}
                  size="sm"
                  variant="ghost"
                >
                  复制
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-auto rounded-lg border bg-muted">
            <img
              alt="Screenshot"
              className="w-full"
              height={1080}
              src={screenshot}
              style={{ maxHeight: '80vh' }}
              width={1920}
            />
          </div>
        </div>
      )}
    </div>
  )
}
