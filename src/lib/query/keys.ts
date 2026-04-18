export interface AdminSitesListParams {
  category: string
  page: number
  pageSize: number
  search: string
  visibility: 'all' | 'hidden' | 'visible'
}

export const queryKeys = {
  authors: {
    all: ['authors'] as const,
    detail: (id: number) => ['authors', 'detail', id] as const,
    visible: ['authors', 'visible'] as const,
  },
  categories: {
    all: ['siteCategories'] as const,
    detail: (id: number) => ['siteCategories', 'detail', id] as const,
  },
  admin: {
    authors: ['admin', 'authors'] as const,
    categories: ['admin', 'categories'] as const,
    sites: (params: AdminSitesListParams) =>
      [
        'admin',
        'sites',
        params.search,
        params.category,
        params.visibility,
        params.page,
        params.pageSize,
      ] as const,
  },
  sites: {
    all: ['sites'] as const,
    list: (category?: string) => ['sites', 'list', category ?? 'all'] as const,
  },
}
