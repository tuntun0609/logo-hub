'use client'

import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { ScreenshotResult } from '@/lib/data/screenshot'

interface CapturePayload {
  options?: {
    devicePixelRatio?: number
    fullPage?: boolean
    height?: number
    uploadToR2?: boolean
    width?: number
  }
  url: string
}

export function useCaptureScreenshot() {
  return useMutation({
    mutationFn: (payload: CapturePayload) =>
      apiFetch<ScreenshotResult>('/api/admin/screenshot', {
        method: 'POST',
        json: payload,
      }),
  })
}
