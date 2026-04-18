'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { AuthorWithParsed } from '@/lib/data/authors'
import { queryKeys } from '@/lib/query/keys'

export function useVisibleAuthors() {
  return useQuery({
    queryKey: queryKeys.authors.visible,
    queryFn: () => apiFetch<AuthorWithParsed[]>('/api/authors'),
  })
}

export function useAuthorById(id: number) {
  return useQuery({
    queryKey: queryKeys.authors.detail(id),
    queryFn: () => apiFetch<AuthorWithParsed>(`/api/authors/${id}`),
    enabled: Number.isFinite(id) && id > 0,
  })
}
