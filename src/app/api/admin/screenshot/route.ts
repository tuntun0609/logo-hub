import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { captureScreenshot } from '@/lib/data/screenshot'

export async function POST(request: Request) {
  const forbidden = await requireAdmin()
  if (forbidden) {
    return forbidden
  }

  try {
    const body = (await request.json()) as {
      options?: {
        devicePixelRatio?: number
        fullPage?: boolean
        height?: number
        uploadToR2?: boolean
        width?: number
      }
      url: string
    }
    const result = await captureScreenshot(body.url, body.options)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
