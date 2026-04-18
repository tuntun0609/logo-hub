import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { createAuthorRecord, getAllAuthors } from '@/lib/data/authors'

export async function GET() {
  const forbidden = await requireAdmin()
  if (forbidden) {
    return forbidden
  }
  const authors = await getAllAuthors()
  return NextResponse.json(authors)
}

export async function POST(request: Request) {
  const forbidden = await requireAdmin()
  if (forbidden) {
    return forbidden
  }

  try {
    const body = (await request.json()) as {
      avatar?: string
      bio?: string
      featured: boolean
      featuredWorks?: { title: string; url: string }[]
      name: string
      order?: number
      specialty?: string[]
      visible: boolean
      websiteUrl?: string
    }
    await createAuthorRecord(body)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
