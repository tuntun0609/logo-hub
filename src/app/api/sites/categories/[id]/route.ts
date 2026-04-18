import { NextResponse } from 'next/server'
import { getCategoryById } from '@/lib/data/sites'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: raw } = await params
  const id = Number(raw)
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const category = await getCategoryById(id)
  if (!category) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(category)
}
