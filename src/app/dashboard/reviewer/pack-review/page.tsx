import PackReviewClient from '@/app/dashboard/admin/pack-review/client'

export const metadata = { title: 'Pack Dose Reviews' }

/**
 * Reviewer-scoped pack-review console (P3-BATCH5).
 * Reuses the admin list client with a reviewer basePath so all in-page links
 * stay under /dashboard/reviewer/... — APIs are shared (admin + reviewer).
 */
export default function ReviewerPackReviewPage() {
  return <PackReviewClient basePath="/dashboard/reviewer/pack-review" />
}
