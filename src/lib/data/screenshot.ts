import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { Browser } from 'playwright-core'
import { chromium } from 'playwright-core'

const TRAILING_SLASH_REGEX = /\/$/

export interface ScreenshotResult {
  error?: string
  imageData?: string
  success: boolean
  url?: string
}

async function getBrowser(): Promise<Browser> {
  const isServerless =
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME

  if (isServerless) {
    const playwrightAwsLambda = await import('playwright-aws-lambda')
    return await playwrightAwsLambda.default.launchChromium()
  }

  return await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  })
}

export async function captureScreenshot(
  url: string,
  options?: {
    devicePixelRatio?: number
    fullPage?: boolean
    height?: number
    uploadToR2?: boolean
    width?: number
  }
): Promise<ScreenshotResult> {
  let browser: Browser | null = null

  try {
    const urlObj = new URL(url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { success: false, error: '仅支持 HTTP/HTTPS 协议' }
    }

    const width = options?.width || 1920
    const height = options?.height || 1080
    const deviceScaleFactor = options?.devicePixelRatio || 2

    browser = await getBrowser()

    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor,
    })

    const page = await context.newPage()

    try {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 15_000,
      })
    } catch {
      await page.goto(url, {
        waitUntil: 'load',
        timeout: 30_000,
      })
      await page.waitForTimeout(2000)
    }

    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: options?.fullPage ?? false,
    })

    await browser.close()

    if (options?.uploadToR2) {
      if (
        !(
          process.env.R2_ACCOUNT_ID &&
          process.env.R2_ACCESS_KEY_ID &&
          process.env.R2_SECRET_ACCESS_KEY &&
          process.env.R2_BUCKET_NAME
        )
      ) {
        return { success: false, error: '缺少 R2 配置' }
      }

      const timestamp = Date.now()
      const key = `screenshots/screenshot-${timestamp}.png`

      const s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      })

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          Body: screenshot,
          ContentType: 'image/png',
        })
      )

      const publicUrl =
        process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''
      const r2Url = publicUrl
        ? `${publicUrl.replace(TRAILING_SLASH_REGEX, '')}/${key}`
        : key

      return { success: true, url: r2Url }
    }

    const imageData = `data:image/png;base64,${screenshot.toString('base64')}`

    return { success: true, imageData }
  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {
        // ignore
      })
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : '截图失败',
    }
  }
}
