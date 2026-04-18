import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { curatedSites } from '@/db/schema'
import { requireAdmin } from '@/lib/api/auth'
import { deleteSiteRecord, updateSiteRecord } from '@/lib/data/sites'

export async function PATCH(
  request: Request,
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
    await updateSiteRecord(id, body)
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof Error && e.message === 'duplicate_name') {
      return NextResponse.json({ error: 'duplicate_name' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

export async function DELETE(
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
    .select({ id: curatedSites.id })
    .from(curatedSites)
    .where(eq(curatedSites.id, id))
    .limit(1)
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await deleteSiteRecord(id)
  return NextResponse.json({ ok: true })
}
