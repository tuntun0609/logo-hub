import { NextResponse } from 'next/server'
import { getVisibleAuthors } from '@/lib/data/authors'

export async function GET() {
  const authors = await getVisibleAuthors()
  return NextResponse.json(authors)
}
