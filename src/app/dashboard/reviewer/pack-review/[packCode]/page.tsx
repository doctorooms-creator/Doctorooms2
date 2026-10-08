import PackReviewDetailClient from '@/app/dashboard/admin/pack-review/[packCode]/client'

export const metadata = { title: 'Pack Dose Review' }

/**
 * Reviewer-scoped pack detail (P3-BATCH5).
 * Reuses the admin detail client; back-link returns to the reviewer console.
 */
export default async function ReviewerPackReviewDetailPage({
  params,
}: {
  params: Promise<{ packCode: string }>
}) {
  const { packCode } = await params
  return (
    <PackReviewDetailClient
      packCode={packCode}
      basePath="/dashboard/reviewer/pack-review"
    />
  )
}
