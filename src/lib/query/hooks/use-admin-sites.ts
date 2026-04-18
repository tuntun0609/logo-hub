'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { SearchSitesResult } from '@/lib/data/sites'
import { type AdminSitesListParams, queryKeys } from '@/lib/query/keys'

interface SiteInput {
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

interface SeedSite {
  category: string
  description: string
  href: string
  name: string
  notes?: string
  tags?: string[]
}

export function useAdminSites(params: AdminSitesListParams) {
  return useQuery({
    queryKey: queryKeys.admin.sites(params),
    queryFn: () => {
      const sp = new URLSearchParams()
      if (params.search) {
        sp.set('search', params.search)
      }
      if (params.category) {
        sp.set('category', params.category)
      }
      if (params.visibility !== 'all') {
        sp.set('visibility', params.visibility)
      }
      sp.set('page', String(params.page))
      sp.set('pageSize', String(params.pageSize))
      return apiFetch<SearchSitesResult>(`/api/admin/sites?${sp.toString()}`)
    },
  })
}

export function useCreateSite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SiteInput) =>
      apiFetch<{ ok: true }>('/api/admin/sites', {
        method: 'POST',
        json: body,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'sites'] })
      await qc.invalidateQueries({ queryKey: queryKeys.sites.all })
      await qc.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}

export function useUpdateSite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { body: SiteInput; id: number }) =>
      apiFetch<{ ok: true }>(`/api/admin/sites/${id}`, {
        method: 'PATCH',
        json: body,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'sites'] })
      await qc.invalidateQueries({ queryKey: queryKeys.sites.all })
      await qc.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}

export function useDeleteSite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ ok: true }>(`/api/admin/sites/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'sites'] })
      await qc.invalidateQueries({ queryKey: queryKeys.sites.all })
      await qc.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}

export function useToggleSiteVisibility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ ok: true }>(`/api/admin/sites/${id}/visibility`, {
        method: 'POST',
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'sites'] })
      await qc.invalidateQueries({ queryKey: queryKeys.sites.all })
      await qc.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}

export function useSeedSites() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sites: SeedSite[]) =>
      apiFetch<{ inserted: number; skipped: string[] }>(
        '/api/admin/sites/seed',
        {
          method: 'POST',
          json: { sites },
        }
      ),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'sites'] })
      await qc.invalidateQueries({ queryKey: queryKeys.sites.all })
      await qc.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}
