import { type Router, route } from '@better-upload/server'
import { toRouteHandler } from '@better-upload/server/adapters/next'
import { cloudflare } from '@better-upload/server/clients'

/** 自定义域名 / R2 公共访问基址（与 .env 中 R2_PUBLIC_URL 一致） */
const R2_PUBLIC_URL =
  process.env.R2_PUBLIC_URL ?? process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ''

const router: Router = {
  client: cloudflare({
    accountId: process.env.R2_ACCOUNT_ID!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  }),
  bucketName: process.env.R2_BUCKET_NAME!,
  routes: {
    logos: route({
      fileTypes: ['image/*'],
      multipleFiles: true,
      maxFiles: 20,
      maxFileSize: 1024 * 1024 * 10, // 10MB
      onBeforeUpload() {
        return {
          generateObjectInfo: ({ file }) => ({
            key: `logos/${Date.now()}-${file.name}`,
          }),
        }
      },
      onAfterSignedUrl() {
        return {
          metadata: {
            r2PublicUrl: R2_PUBLIC_URL,
          },
        }
      },
    }),
  },
}

export const { POST } = toRouteHandler(router)
