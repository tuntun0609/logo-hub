'use client'

import type { UploadHookControl } from '@better-upload/client'
import { Loader2, Upload } from 'lucide-react'
import { useId } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'

type UploadDropzoneProps = {
  control: UploadHookControl<true>
  accept?: string
  metadata?: Record<string, unknown>
  description?:
    | {
        fileTypes?: string
        maxFileSize?: string
        maxFiles?: number
      }
    | string
}

export function UploadDropzone({
  control: { upload, isPending },
  accept,
  metadata,
  description,
}: UploadDropzoneProps) {
  const id = useId()

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: (files) => {
      if (files.length > 0 && !isPending) {
        upload(files, { metadata })
      }
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    noClick: true,
  })

  return (
    <div
      className={cn(
        'relative rounded-lg border border-dashed border-input text-foreground transition-colors',
        isDragActive && 'border-primary/80'
      )}
    >
      <label
        {...getRootProps()}
        className={cn(
          'flex w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-transparent px-2 py-10 transition-colors dark:bg-input/10',
          isPending
            ? 'cursor-not-allowed text-muted-foreground'
            : 'hover:bg-accent dark:hover:bg-accent/40',
          isDragActive && 'opacity-0'
        )}
        htmlFor={id}
      >
        <div className="my-2">
          {isPending ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <Upload className="size-6" />
          )}
        </div>

        <div className="mt-3 space-y-1 text-center">
          <p className="font-semibold text-sm">拖拽文件到此处上传</p>
          <p className="max-w-64 text-muted-foreground text-xs">
            {typeof description === 'string' ? (
              description
            ) : (
              <>
                {description?.maxFiles &&
                  `最多 ${description.maxFiles} 个文件。`}{' '}
                {description?.maxFileSize &&
                  `单个文件不超过 ${description.maxFileSize}。`}{' '}
                {description?.fileTypes &&
                  `支持 ${description.fileTypes} 格式。`}
              </>
            )}
          </p>
        </div>

        <input
          {...getInputProps()}
          accept={accept}
          disabled={isPending}
          id={id}
          multiple
          type="file"
        />
      </label>

      {isDragActive && (
        <div className="pointer-events-none absolute inset-0 rounded-lg">
          <div className="flex size-full flex-col items-center justify-center rounded-lg bg-accent dark:bg-accent/40">
            <div className="my-2">
              <Upload className="size-6" />
            </div>
            <p className="mt-3 font-semibold text-sm">松开以上传文件</p>
          </div>
        </div>
      )}
    </div>
  )
}
