export const dynamic = 'force-dynamic'

import { AdminSitesContent } from '@/components/admin/curated-sites'
import { getAllCategories } from '@/lib/actions/admin/categories'
import { getAllSites } from '@/lib/actions/admin/sites'

export default async function AdminSitesPage() {
  const [sites, categories] = await Promise.all([
    getAllSites(),
    getAllCategories(),
  ])

  return <AdminSitesContent categories={categories} sites={sites} />
}
