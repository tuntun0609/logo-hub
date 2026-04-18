import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { seedAuthorsRecord } from '@/lib/data/authors'

export async function POST(request: Request) {
  const forbidden = await requireAdmin()
  if (forbidden) {
    return forbidden
  }

  try {
    const body = (await request.json()) as {
      items: Array<{
        avatar?: string
        bio?: string
        featured?: boolean
        featuredWorks?: { title: string; url: string }[]
        name: string
        specialty?: string[]
        websiteUrl?: string
      }>
    }
    const result = await seedAuthorsRecord(body.items)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
