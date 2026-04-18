import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { authors } from '@/db/schema'
import { requireAdmin } from '@/lib/api/auth'
import { toggleAuthorFeaturedRecord } from '@/lib/data/authors'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = await requireAdmin()
  if (forbidden) {
    return forbidden
  }

  const { id: raw } = await params
  const id = Number(raw)
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const rows = await db
    .select({ featured: authors.featured })
    .from(authors)
    .where(eq(authors.id, id))
    .limit(1)
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await toggleAuthorFeaturedRecord(id, rows[0].featured)
  return NextResponse.json({ ok: true })
}
