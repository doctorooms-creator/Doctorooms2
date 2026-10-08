import PackReviewDetailClient from './client'

export const metadata = { title: 'Pack Dose Review' }

export default async function PackReviewDetailPage({
  params,
}: {
  params: Promise<{ packCode: string }>
}) {
  const { packCode } = await params
  return <PackReviewDetailClient packCode={packCode} />
}
