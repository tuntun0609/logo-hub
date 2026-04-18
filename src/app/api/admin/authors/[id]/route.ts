import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { authors } from '@/db/schema'
import { requireAdmin } from '@/lib/api/auth'
import { deleteAuthorRecord, updateAuthorRecord } from '@/lib/data/authors'

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
    await updateAuthorRecord(id, body)
    return NextResponse.json({ ok: true })
  } catch {
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
    .select({ id: authors.id })
    .from(authors)
    .where(eq(authors.id, id))
    .limit(1)
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await deleteAuthorRecord(id)
  return NextResponse.json({ ok: true })
}
