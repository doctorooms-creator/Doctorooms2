'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Quote,
  BadgeCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────────────────

interface ReviewItem {
  id: string
  star: number
  review: string
  createdAt: string
  wouldRecommend: boolean
  isAnonymous: boolean
  patientName: string
}

interface ReviewsSummary {
  average: number
  total: number
  distribution: Record<string, number>
  wouldRecommendPercent: number
}

interface ReviewsResponse {
  summary: ReviewsSummary
  reviews: ReviewItem[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function StarRow({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  )
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// ── Component ────────────────────────────────────────────────────────────────

export function ReviewsSection({
  doctorId,
  doctorName,
}: {
  doctorId: string
  doctorName: string
}) {
  const [data, setData] = useState<ReviewsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/doctors/${doctorId}/reviews`)
        if (!res.ok) throw new Error('Failed to fetch reviews')
        const json: ReviewsResponse = await res.json()
        if (!cancelled) setData(json)
      } catch {
        if (!cancelled) setFailed(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (doctorId) fetchReviews()
    return () => {
      cancelled = true
    }
  }, [doctorId])

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-44" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (failed || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Patient Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            Unable to load reviews right now. Please try again later.
          </p>
        </CardContent>
      </Card>
    )
  }

  const { summary, reviews } = data

  // ── Empty state (no ratings yet) ──────────────────────────────────────────
  if (summary.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Patient Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border-2 border-dashed border-teal-200 bg-teal-50/50 p-8 text-center dark:border-teal-800 dark:bg-teal-950/20 sm:p-10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40">
              <MessageSquare className="h-6 w-6 text-teal-500" />
            </div>
            <p className="font-medium">No reviews yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first to share your experience with {doctorName}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── Main section ──────────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Patient Reviews
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <StarRow value={summary.average} />
            <span className="text-sm font-semibold">
              {summary.average.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              · based on {summary.total} review{summary.total !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* ── Summary card row: average + distribution + recommend % ──────── */}
        <div className="mb-6 rounded-xl border bg-muted/20 p-4 dark:bg-muted/10 sm:p-5">
          <div className="grid gap-5 sm:grid-cols-[170px_1fr] sm:gap-8">
            {/* Average big number */}
            <div className="text-center sm:text-left">
              <p className="text-5xl font-bold text-foreground">
                {summary.average.toFixed(1)}
              </p>
              <StarRow value={summary.average} className="mt-2 justify-center sm:justify-start" />
              <p className="mt-1 text-sm text-muted-foreground">out of 5</p>
            </div>

            <div>
              {/* Star distribution bars (5 → 1, teal) */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = Number(summary.distribution[String(star)] ?? 0)
                  const pct =
                    summary.total > 0 ? (count / summary.total) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-3 text-right font-medium text-muted-foreground">
                        {star}
                      </span>
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-teal-500 transition-all duration-500 dark:bg-teal-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Would-recommend badge */}
              <div className="mt-4">
                <Badge className="gap-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {summary.wouldRecommendPercent}% would recommend
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* ── Reviews list ────────────────────────────────────────────────── */}
        {reviews.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Detailed reviews are not available yet.
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(index, 5) * 0.08,
                  ease: 'easeOut',
                }}
                className="rounded-xl border p-4 transition-colors hover:bg-muted/30 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 text-sm font-semibold text-teal-700 dark:from-teal-900/40 dark:to-emerald-900/40 dark:text-teal-300">
                      {review.isAnonymous ? '?' : getInitials(review.patientName)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{review.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(review.createdAt), 'MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-3.5 w-3.5',
                          i < review.star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex gap-2.5">
                  <Quote className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {review.review}
                  </p>
                </div>

                <div className="mt-3">
                  {review.wouldRecommend ? (
                    <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <ThumbsUp className="h-3 w-3" />
                      Would recommend
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1 border-teal-300 text-teal-700 dark:border-teal-700 dark:text-teal-300"
                    >
                      <BadgeCheck className="h-3 w-3" />
                      Verified patient
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
