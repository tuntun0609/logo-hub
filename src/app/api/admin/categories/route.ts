import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { createCategoryRecord, getAllCategories } from '@/lib/data/categories'

export async function GET() {
  const forbidden = await requireAdmin()
  if (forbidden) {
    return forbidden
  }
  const categories = await getAllCategories()
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const forbidden = await requireAdmin()
  if (forbidden) {
    return forbidden
  }

  try {
    const body = (await request.json()) as { name: string; order?: number }
    await createCategoryRecord(body)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
