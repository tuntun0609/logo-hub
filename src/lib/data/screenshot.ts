import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { Browser } from 'playwright-core'
import { chromium } from 'playwright-core'

const TRAILING_SLASH_REGEX = /\/$/
const TRACKING_DOMAIN_REGEX =
  /doubleclick|googlesyndication|googletagmanager|google-analytics|analytics|clarity|hotjar|facebook\.net|connect\.facebook|segment|mixpanel|intercom|newrelic|sentry|ads/i

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
      locale: 'en-US',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
      extraHTTPHeaders: {
        'accept-language': 'en-US,en;q=0.9',
      },
    })

    const page = await context.newPage()

    await page.route('**/*', (route) => {
      const request = route.request()
      const resourceType = request.resourceType()

      if (
        resourceType === 'media' ||
        resourceType === 'websocket' ||
        TRACKING_DOMAIN_REGEX.test(request.url())
      ) {
        return route.abort()
      }

      return route.continue()
    })

    await page.goto(url, {
      waitUntil: 'commit',
      timeout: 15_000,
    })

    await Promise.race([
      page.waitForSelector('body', {
        timeout: 10_000,
      }),
      page.waitForLoadState('domcontentloaded', {
        timeout: 10_000,
      }),
    ]).catch(async () => {
      await page.waitForTimeout(2000)
    })

    await page
      .waitForLoadState('networkidle', {
        timeout: 3000,
      })
      .catch(() => null)

    await page.waitForTimeout(1500)

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
