import LabPartnerDetailClient from './client'

export const metadata = {
  title: 'Lab Partner Detail | Admin',
}

export default async function LabPartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <LabPartnerDetailClient id={id} />
}
