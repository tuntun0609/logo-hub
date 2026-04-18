'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { AuthorWithParsed } from '@/lib/data/authors'
import { queryKeys } from '@/lib/query/keys'

interface AuthorInput {
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

interface SeedAuthor {
  avatar?: string
  bio?: string
  featured?: boolean
  featuredWorks?: { title: string; url: string }[]
  name: string
  specialty?: string[]
  websiteUrl?: string
}

export function useAdminAuthors() {
  return useQuery({
    queryKey: queryKeys.admin.authors,
    queryFn: () => apiFetch<AuthorWithParsed[]>('/api/admin/authors'),
  })
}

export function useCreateAuthor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: AuthorInput) =>
      apiFetch<{ ok: true }>('/api/admin/authors', {
        method: 'POST',
        json: body,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.admin.authors })
      await qc.invalidateQueries({ queryKey: queryKeys.authors.all })
    },
  })
}

export function useUpdateAuthor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { body: AuthorInput; id: number }) =>
      apiFetch<{ ok: true }>(`/api/admin/authors/${id}`, {
        method: 'PATCH',
        json: body,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.admin.authors })
      await qc.invalidateQueries({ queryKey: queryKeys.authors.all })
    },
  })
}

export function useDeleteAuthor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ ok: true }>(`/api/admin/authors/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.admin.authors })
      await qc.invalidateQueries({ queryKey: queryKeys.authors.all })
    },
  })
}

export function useToggleAuthorVisibility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ ok: true }>(`/api/admin/authors/${id}/visibility`, {
        method: 'POST',
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.admin.authors })
      await qc.invalidateQueries({ queryKey: queryKeys.authors.all })
    },
  })
}

export function useToggleAuthorFeatured() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ ok: true }>(`/api/admin/authors/${id}/featured`, {
        method: 'POST',
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.admin.authors })
      await qc.invalidateQueries({ queryKey: queryKeys.authors.all })
    },
  })
}

export function useSeedAuthors() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (items: SeedAuthor[]) =>
      apiFetch<{ inserted: number; skipped: string[] }>(
        '/api/admin/authors/seed',
        {
          method: 'POST',
          json: { items },
        }
      ),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.admin.authors })
      await qc.invalidateQueries({ queryKey: queryKeys.authors.all })
    },
  })
}
