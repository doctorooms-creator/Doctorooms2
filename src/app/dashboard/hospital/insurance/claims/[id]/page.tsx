import { ClaimDetailClient } from './client'
export default function ClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ClaimDetailClient params={params} />
}
