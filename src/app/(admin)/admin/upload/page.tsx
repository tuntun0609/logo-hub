'use client'

import { useUploadFiles } from '@better-upload/client'
import { Check, Copy, ExternalLink, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { UploadDropzone } from '@/components/ui/upload-dropzone'

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''

function stripTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

interface UploadedFile {
  key: string
  name: string
  url: string
}

export default function AdminUploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const { control } = useUploadFiles({
    route: 'logos',
    onUploadComplete: ({ files: uploaded, metadata }) => {
      const base =
        typeof metadata.r2PublicUrl === 'string' && metadata.r2PublicUrl
          ? stripTrailingSlash(metadata.r2PublicUrl)
          : stripTrailingSlash(R2_PUBLIC_URL)
      const newFiles = uploaded.map((f) => ({
        key: f.objectInfo.key,
        name: f.name,
        url: `${base}/${f.objectInfo.key}`,
      }))
      setFiles((prev) => [...newFiles, ...prev])
      toast.success(`已上传 ${uploaded.length} 个文件`)
    },
    onError: (error) => {
      toast.error(error.message || '上传失败')
    },
  })

  const copyUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url)
    setCopiedIndex(index)
    toast.success('已复制链接')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">文件上传</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          上传 Logo 文件到 R2 存储
        </p>
      </div>

      <UploadDropzone
        accept="image/*"
        control={control}
        description={{
          maxFiles: 20,
          maxFileSize: '10MB',
          fileTypes: 'PNG, JPG, SVG, WebP',
        }}
      />

      {files.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-medium text-sm">已上传文件 ({files.length})</h2>
          <div className="divide-y rounded-lg border">
            {files.map((file, index) => (
              <div className="flex items-center gap-3 p-3" key={file.key}>
                <img
                  alt={file.name}
                  className="size-10 shrink-0 rounded border bg-muted object-contain p-1"
                  height={40}
                  src={file.url}
                  width={40}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{file.name}</p>
                  <p className="truncate text-muted-foreground text-xs">
                    {file.url}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    onClick={() => copyUrl(file.url, index)}
                    size="icon-sm"
                    variant="ghost"
                  >
                    {copiedIndex === index ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => window.open(file.url, '_blank')}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                  <Button
                    onClick={() => removeFile(index)}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
