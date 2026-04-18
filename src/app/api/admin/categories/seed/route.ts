import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { seedCategoriesRecord } from '@/lib/data/categories'

export async function POST(request: Request) {
  const forbidden = await requireAdmin()
  if (forbidden) {
    return forbidden
  }

  try {
    const body = (await request.json()) as {
      categories: Array<{ name: string; order?: number }>
    }
    await seedCategoriesRecord(body.categories)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
