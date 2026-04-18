'use client'

import { useQuery } from '@tanstack/react-query'
import type { SiteCategory } from '@/db/schema'
import { apiFetch } from '@/lib/api/client'
import type { CuratedSiteWithTags } from '@/lib/data/sites'
import { queryKeys } from '@/lib/query/keys'

export function useSitesList(category?: string) {
  return useQuery({
    queryKey: queryKeys.sites.list(category),
    queryFn: () => {
      const qs = category ? `?category=${encodeURIComponent(category)}` : ''
      return apiFetch<CuratedSiteWithTags[]>(`/api/sites${qs}`)
    },
  })
}

export function useSiteCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => apiFetch<SiteCategory[]>('/api/sites/categories'),
  })
}

export function useSiteCategoryById(id: number) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => apiFetch<SiteCategory>(`/api/sites/categories/${id}`),
    enabled: Number.isFinite(id) && id > 0,
  })
}
