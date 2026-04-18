import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { createSiteRecord, searchSites } from '@/lib/data/sites'

export async function GET(request: Request) {
  const forbidden = await requireAdmin()
  if (forbidden) {
    return forbidden
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? undefined
  const visibilityRaw = searchParams.get('visibility')
  let visibility: '' | 'hidden' | 'visible' | undefined
  if (visibilityRaw === 'visible') {
    visibility = 'visible'
  } else if (visibilityRaw === 'hidden') {
    visibility = 'hidden'
  } else {
    visibility = undefined
  }
  const page = Number(searchParams.get('page') ?? '1') || 1
  const pageSize = Number(searchParams.get('pageSize') ?? '20') || 20

  const result = await searchSites({
    search: search || undefined,
    category,
    visibility,
    page,
    pageSize,
  })
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const forbidden = await requireAdmin()
  if (forbidden) {
    return forbidden
  }

  try {
    const body = (await request.json()) as {
      category: string
      description: string
      href: string
      image?: string
      name: string
      notes?: string
      order?: number
      tags?: string[]
      visible: boolean
    }
    await createSiteRecord(body)
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof Error && e.message === 'duplicate_name') {
      return NextResponse.json({ error: 'duplicate_name' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
