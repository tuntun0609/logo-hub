import { AdminSitesContent } from '@/components/admin/curated-sites'
import { getAllCategories } from '@/lib/actions/admin/categories'

export default async function AdminSitesPage() {
  const categories = await getAllCategories()

  return <AdminSitesContent categories={categories} />
}
