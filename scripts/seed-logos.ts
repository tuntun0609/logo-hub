import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { AwsClient } from 'aws4fetch'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/_generated/api'

// ── env ─────────────────────────────────────────────────────
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!
const R2_PUBLIC_URL = (
  process.env.R2_PUBLIC_URL ?? process.env.NEXT_PUBLIC_R2_PUBLIC_URL!
).replace(/\/$/, '')

for (const [k, v] of Object.entries({
  NEXT_PUBLIC_CONVEX_URL: CONVEX_URL,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
})) {
  if (!v) {
    console.error(`Missing env var: ${k}`)
    process.exit(1)
  }
}

// ── R2 client (aws4fetch, same as better-upload internally) ─
const r2 = new AwsClient({
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
  region: 'auto',
  service: 's3',
})

const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

async function uploadToR2(key: string, body: Uint8Array, contentType: string) {
  const url = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`
  const res = await r2.fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    // Node Buffer / TS typed-array generics vs DOM BodyInit (ArrayBuffer vs ArrayBufferLike)
    body: body as unknown as BodyInit,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`R2 upload failed for ${key}: ${res.status} ${text}`)
  }
  return `${R2_PUBLIC_URL}/${key}`
}

// ── read local SVGs ─────────────────────────────────────────
const logosDir = join(import.meta.dirname, '../public/logos')
const files = readdirSync(logosDir).filter((f) => f.endsWith('.svg'))

function formatName(filename: string): string {
  return filename
    .replace('.svg', '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ── upload to R2 then seed Convex ───────────────────────────
console.log(`Found ${files.length} SVG files, uploading to R2...`)

const convex = new ConvexHttpClient(CONVEX_URL)
const logos: Array<{
  name: string
  logoSvgUrl: string
  visible: boolean
  order: number
}> = []

for (const [index, file] of files.entries()) {
  const key = `logos/${Date.now()}-${file}`
  const body = readFileSync(join(logosDir, file))
  const publicUrl = await uploadToR2(key, body, 'image/svg+xml')
  console.log(`  [${index + 1}/${files.length}] ${file} → ${publicUrl}`)
  logos.push({
    name: formatName(file),
    logoSvgUrl: publicUrl,
    visible: true,
    order: index,
  })
}

console.log(`\nSeeding ${logos.length} logos to Convex...`)

const BATCH_SIZE = 50
for (let i = 0; i < logos.length; i += BATCH_SIZE) {
  const batch = logos.slice(i, i + BATCH_SIZE)
  const ids = await convex.mutation(api.brandLogos.seed, { logos: batch })
  console.log(
    `  Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${ids.length} logos`
  )
}

console.log('Done!')
