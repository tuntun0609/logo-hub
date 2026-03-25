import { LogoDetail } from '@/components/platform/logo-detail'

interface LogoDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function LogoDetailPage({ params }: LogoDetailPageProps) {
  const { id } = await params

  return <LogoDetail id={id} />
}
