import { redirect } from 'next/navigation'

interface LegacyBrandLogoDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function LegacyBrandLogoDetailPage({
  params,
}: LegacyBrandLogoDetailPageProps) {
  const { id } = await params

  redirect(`/logos/${id}`)
}
