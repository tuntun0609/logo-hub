'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SiteCategory } from '@/db/schema'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'

export function useAdminCategories() {
  return useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: () => apiFetch<SiteCategory[]>('/api/admin/categories'),
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; order?: number }) =>
      apiFetch<{ ok: true }>('/api/admin/categories', {
        method: 'POST',
        json: body,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.admin.categories })
      await qc.invalidateQueries({ queryKey: queryKeys.categories.all })
      await qc.invalidateQueries({ queryKey: queryKeys.sites.all })
    },
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      body: { name: string; order?: number }
      id: number
    }) =>
      apiFetch<{ ok: true }>(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        json: body,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.admin.categories })
      await qc.invalidateQueries({ queryKey: queryKeys.categories.all })
      await qc.invalidateQueries({ queryKey: queryKeys.sites.all })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ ok: true }>(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.admin.categories })
      await qc.invalidateQueries({ queryKey: queryKeys.categories.all })
      await qc.invalidateQueries({ queryKey: queryKeys.sites.all })
    },
  })
}

export function useSeedCategories() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (categories: Array<{ name: string; order?: number }>) =>
      apiFetch<{ ok: true }>('/api/admin/categories/seed', {
        method: 'POST',
        json: { categories },
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.admin.categories })
      await qc.invalidateQueries({ queryKey: queryKeys.categories.all })
      await qc.invalidateQueries({ queryKey: queryKeys.sites.all })
    },
  })
}
