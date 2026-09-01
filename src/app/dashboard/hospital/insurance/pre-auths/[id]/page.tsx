import { PreAuthDetailClient } from './client'
export default function PreAuthDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <PreAuthDetailClientWrapper params={params} />
}
function PreAuthDetailClientWrapper({ params }: { params: Promise<{ id: string }> }) {
  return <PreAuthDetailClient params={params} />
}
