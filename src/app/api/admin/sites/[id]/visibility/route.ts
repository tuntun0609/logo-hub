import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { curatedSites } from '@/db/schema'
import { requireAdmin } from '@/lib/api/auth'
import { toggleSiteVisibilityRecord } from '@/lib/data/sites'

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
    .select({ visible: curatedSites.visible })
    .from(curatedSites)
    .where(eq(curatedSites.id, id))
    .limit(1)
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await toggleSiteVisibilityRecord(id, rows[0].visible)
  return NextResponse.json({ ok: true })
}
