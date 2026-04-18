import { NextResponse } from 'next/server'
import { getSites } from '@/lib/data/sites'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? undefined
  const sites = await getSites(category || undefined)
  return NextResponse.json(sites)
}
