import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/auth'
import { seedSitesRecord } from '@/lib/data/sites'

export async function POST(request: Request) {
  const forbidden = await requireAdmin()
  if (forbidden) {
    return forbidden
  }

  try {
    const body = (await request.json()) as {
      sites: Array<{
        category: string
        description: string
        href: string
        name: string
        notes?: string
        tags?: string[]
      }>
    }
    const result = await seedSitesRecord(body.sites)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
