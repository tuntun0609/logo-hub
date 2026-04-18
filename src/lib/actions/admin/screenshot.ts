'use server'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { Browser } from 'playwright-core'
import { chromium } from 'playwright-core'

const TRAILING_SLASH_REGEX = /\/$/

interface ScreenshotResult {
  error?: string
  imageData?: string
  success: boolean
  url?: string
}

async function getBrowser(): Promise<Browser> {
  // 检测是否在 Vercel 或其他 serverless 环境
  const isServerless =
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME

  if (isServerless) {
    // 在 serverless 环境使用 playwright-aws-lambda
    const playwrightAwsLambda = await import('playwright-aws-lambda')
    return await playwrightAwsLambda.default.launchChromium()
  }

  // 本地环境使用标准 chromium
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
    // 验证 URL
    const urlObj = new URL(url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { success: false, error: '仅支持 HTTP/HTTPS 协议' }
    }

    // 设置视口大小（默认 1920x1080，2x 设备像素比）
    const width = options?.width || 1920
    const height = options?.height || 1080
    const deviceScaleFactor = options?.devicePixelRatio || 2

    // 启动浏览器
    browser = await getBrowser()

    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor,
    })

    const page = await context.newPage()

    // 导航到目标页面
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30_000,
    })

    // 截图
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: options?.fullPage ?? false,
    })

    await browser.close()

    // 如果需要上传到 R2
    if (options?.uploadToR2) {
      // 验证环境变量
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

      // 生成文件名
      const timestamp = Date.now()
      const key = `screenshots/screenshot-${timestamp}.png`

      // 配置 S3 客户端
      const s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      })

      // 上传到 R2
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          Body: screenshot,
          ContentType: 'image/png',
        })
      )

      // 构建公共 URL
      const publicUrl =
        process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''
      const r2Url = publicUrl
        ? `${publicUrl.replace(TRAILING_SLASH_REGEX, '')}/${key}`
        : key

      return { success: true, url: r2Url }
    }

    // 否则返回 base64（仅用于预览小图）
    const imageData = `data:image/png;base64,${screenshot.toString('base64')}`

    return { success: true, imageData }
  } catch (error) {
    // 确保关闭浏览器
    if (browser) {
      await browser.close().catch(() => {
        // 忽略关闭错误
      })
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : '截图失败',
    }
  }
}
