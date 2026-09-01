'use client'

import { useEffect, useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Lightbulb, Check, X, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'
import { usePrescriptionStore, type ComplaintWithCategory, type CustomSuggestion } from '@/lib/prescription-store'

// Draft-input key for the "General Advice" section (advice not tied to a complaint)
const GENERAL_KEY = '__general__'

const genId = () => Math.random().toString(36).substring(2, 9)

export function Step5Suggestions() {
  const prescriptionId = usePrescriptionStore((s) => s.prescriptionId)
  const selectedComplaintIds = usePrescriptionStore((s) => s.selectedComplaintIds)
  const selectedSuggestionIds = usePrescriptionStore((s) => s.selectedSuggestionIds)
  const toggleSuggestion = usePrescriptionStore((s) => s.toggleSuggestion)
  const customSuggestions = usePrescriptionStore((s) => s.customSuggestions)
  const addCustomSuggestion = usePrescriptionStore((s) => s.addCustomSuggestion)
  const removeCustomSuggestion = usePrescriptionStore((s) => s.removeCustomSuggestion)
  const isSaving = usePrescriptionStore((s) => s.isSaving)
  const setIsSaving = usePrescriptionStore((s) => s.setIsSaving)
  const markStepCompleted = usePrescriptionStore((s) => s.markStepCompleted)
  const goToNext = usePrescriptionStore((s) => s.goToNext)
  const goToPrev = usePrescriptionStore((s) => s.goToPrev)
  const queryClient = useQueryClient()

  // Custom-advice draft text per section: key = complaint coId or GENERAL_KEY
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  // Complaint names — reuses the same queryKey as Step 1 (already warm via
  // the stepper's init-time prefetch).
  const { data: complaintsData } = useQuery<{ complaints: ComplaintWithCategory[] }>({
    queryKey: ['rx-complaints'],
    queryFn: () =>
      fetch('/api/dashboard/doctor/prescription-settings/complaints?status=Active').then((r) => r.json()),
  })
  const allComplaints = complaintsData?.complaints || []

  // Fetch questions linked to selected complaints
  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['rx-questions-for-complaints', selectedComplaintIds],
    queryFn: async () => {
      if (selectedComplaintIds.length === 0) return { questions: [] }
      const res = await fetch(
        `/api/dashboard/doctor/prescription-settings/questions?status=Active&coId=${selectedComplaintIds.join(',')}`
      )
      return res.json()
    },
    enabled: selectedComplaintIds.length > 0,
  })

  const questions = (questionsData?.questions || []) as Array<{
    id: string
    question: string
    questionEn: string
    coId: string | null
    co: { id: string; coDetail: string; coDetailEn: string } | null
  }>

  // Fetch suggestions for all questions
  const questionIds = questions.map((q) => q.id)
  const { data: suggestionsData } = useQuery({
    queryKey: ['rx-suggestions-for-questions', questionIds],
    queryFn: async () => {
      if (questionIds.length === 0) return { suggestions: [] }
      // Fetch all suggestions; filter client-side
      const res = await fetch(`/api/dashboard/doctor/prescription-settings/suggestions?status=Active`)
      const data = await res.json()
      return {
        suggestions: data.suggestions.filter((s: { questionId: string }) =>
          questionIds.includes(s.questionId)
        ),
      }
    },
    enabled: questionIds.length > 0,
  })

  const allSuggestions = (suggestionsData?.suggestions || []) as Array<{
    id: string
    questionId: string
    suggestions: string
    suggestionsEn: string
  }>

  // questionId -> preset suggestions
  const suggestionsByQuestion = useMemo(() => {
    const map = new Map<string, typeof allSuggestions>()
    for (const s of allSuggestions) {
      if (!map.has(s.questionId)) map.set(s.questionId, [])
      map.get(s.questionId)!.push(s)
    }
    return map
  }, [allSuggestions])

  // coId -> { coDetail, coDetailEn } — from complaints master, falling back
  // to the questions' own co relation for any complaint missing there.
  const coNameMap = useMemo(() => {
    const map = new Map<string, { coDetail: string; coDetailEn: string }>()
    for (const c of allComplaints) {
      map.set(c.id, { coDetail: c.coDetail, coDetailEn: c.coDetailEn })
    }
    for (const q of questions) {
      if (q.coId && q.co && !map.has(q.coId)) {
        map.set(q.coId, { coDetail: q.co.coDetail, coDetailEn: q.co.coDetailEn })
      }
    }
    return map
  }, [allComplaints, questions])

  // One section per SELECTED complaint (kept in store selection order)
  const sections = useMemo(
    () =>
      selectedComplaintIds.map((coId) => {
        const names = coNameMap.get(coId)
        return {
          coId,
          coDetail: names?.coDetail || 'Complaint',
          coDetailEn: names?.coDetailEn || '',
          questions: questions.filter((q) => q.coId === coId),
        }
      }),
    [selectedComplaintIds, coNameMap, questions]
  )

  // Load existing suggestions from prescription
  useEffect(() => {
    if (!prescriptionId) return
    fetch(`/api/prescription/${prescriptionId}`)
      .then((r) => r.json())
      .then((data) => {
        const ps = data.prescription?.suggestions || []
        if (ps.length > 0) {
          // For existing linked suggestions, we match by text content since we don't store suggestionId in PSuggestion
          // Custom suggestions are handled separately
          usePrescriptionStore.getState().setSelectedSuggestionIds([])
        }
      })
      .catch(() => {})
  }, [prescriptionId])

  const setDraft = (key: string, value: string) =>
    setDrafts((prev) => ({ ...prev, [key]: value }))

  const addDraft = (key: string, coId: string | null) => {
    const text = (drafts[key] || '').trim()
    if (!text) {
      toast.error('Advice text is required')
      return
    }
    addCustomSuggestion({
      id: genId(),
      question: '',
      questionEn: '',
      suggestions: text,
      suggestionsEn: '',
      coId,
    })
    setDraft(key, '')
  }

  // Custom advices belonging to a complaint (null = general advice)
  const customFor = (coId: string | null) =>
    customSuggestions
      .map((cs, i) => ({ cs, i }))
      .filter(({ cs }) => (coId === null ? !cs.coId : cs.coId === coId))

  // Save mutation — payload passed in explicitly so auto-flushed drafts
  // (added below in handleSave) are never lost to a stale closure.
  const saveMutation = useMutation({
    mutationFn: (payload: { suggestionIds: string[]; customSuggestions: CustomSuggestion[] }) =>
      fetch(`/api/prescription/${prescriptionId}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rx-prescription-data'] })
      markStepCompleted(5)
      toast.success('Suggestions saved')
      goToNext()
    },
    onError: () => toast.error('Failed to save suggestions'),
  })

  const handleSave = () => {
    // ── DATA-LOSS FIX ──
    // Auto-flush any typed-but-not-added advice so the doctor's text can
    // never be silently discarded by clicking "Save & Continue" directly.
    const flushed: CustomSuggestion[] = []
    for (const [key, text] of Object.entries(drafts)) {
      const t = text.trim()
      if (!t) continue
      flushed.push({
        id: genId(),
        question: '',
        questionEn: '',
        suggestions: t,
        suggestionsEn: '',
        coId: key === GENERAL_KEY ? null : key,
      })
    }
    if (flushed.length > 0) {
      flushed.forEach(addCustomSuggestion)
      setDrafts({})
      toast.success(`${flushed.length} typed advice auto-added`)
    }

    setIsSaving(true)
    saveMutation.mutate(
      {
        suggestionIds: selectedSuggestionIds,
        customSuggestions: [...customSuggestions, ...flushed],
      },
      { onSettled: () => setIsSaving(false) }
    )
  }

  const totalSelected = selectedSuggestionIds.length + customSuggestions.length
  const showSkeleton =
    isLoading || (selectedComplaintIds.length > 0 && complaintsData === undefined)

  const renderCustomAdviceRow = (key: string, coId: string | null, placeholder: string) => (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Input
        value={drafts[key] || ''}
        onChange={(e) => setDraft(key, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addDraft(key, coId)
          }
        }}
        placeholder={placeholder}
        className="h-8 flex-1 text-sm min-w-0"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addDraft(key, coId)}
        className="h-8 shrink-0 border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-800/60 dark:text-amber-300 dark:hover:bg-amber-950/40"
      >
        <Plus className="h-3.5 w-3.5" /> Add
      </Button>
    </div>
  )

  const renderCustomChips = (coId: string | null) => {
    const items = customFor(coId)
    if (items.length === 0) return null
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map(({ cs, i }) => (
          <span
            key={cs.id}
            className="inline-flex max-w-full items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200"
          >
            <span className="min-w-0 break-words">{cs.suggestions}</span>
            <button
              type="button"
              aria-label="Remove advice"
              onClick={() => removeCustomSuggestion(i)}
              className="shrink-0 rounded-full p-0.5 text-amber-500 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/50 dark:hover:text-amber-300"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {selectedComplaintIds.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No complaints selected in Step 1. Go back to select complaints to see auto-suggestions.</p>
        </div>
      ) : showSkeleton ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <>
          {totalSelected > 0 && (
            <Badge variant="secondary" className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
              {totalSelected} selected
            </Badge>
          )}

          <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-1">
            <AnimatePresence mode="popLayout">
              {/* ── One card per selected complaint ── */}
              {sections.map((sec) => {
                const secQuestionIds = new Set(sec.questions.map((q) => q.id))
                const secCount =
                  allSuggestions.filter(
                    (s) => secQuestionIds.has(s.questionId) && selectedSuggestionIds.includes(s.id)
                  ).length + customFor(sec.coId).length
                return (
                  <motion.div
                    key={sec.coId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="overflow-hidden">
                      <CardHeader className="border-b border-teal-100 bg-teal-50/60 pb-2.5 dark:border-teal-900/50 dark:bg-teal-950/20">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                            <Stethoscope className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 break-words">{sec.coDetail}</span>
                          {sec.coDetailEn && (
                            <span className="font-normal text-xs text-muted-foreground">({sec.coDetailEn})</span>
                          )}
                          {secCount > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-auto shrink-0 bg-teal-100 text-[10px] text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                            >
                              {secCount}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-3">
                        {sec.questions.length === 0 && (
                          <p className="text-xs text-muted-foreground">
                            No preset suggestions configured for this complaint — add your own advice below.
                          </p>
                        )}
                        {sec.questions.map((q) => {
                          const items = suggestionsByQuestion.get(q.id) || []
                          return (
                            <div key={q.id}>
                              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                                {q.question}
                                {q.questionEn && q.questionEn !== q.question && (
                                  <span className="font-normal"> ({q.questionEn})</span>
                                )}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {items.map((item) => {
                                  const isSelected = selectedSuggestionIds.includes(item.id)
                                  return (
                                    <motion.button
                                      key={item.id}
                                      type="button"
                                      whileTap={{ scale: 0.97 }}
                                      onClick={() => toggleSuggestion(item.id)}
                                      className={
                                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ' +
                                        (isSelected
                                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                          : 'bg-card border-border hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30')
                                      }
                                    >
                                      {isSelected && <Check className="h-3 w-3 shrink-0" />}
                                      <span>{item.suggestions}</span>
                                      {item.suggestionsEn && (
                                        <span className={isSelected ? 'text-teal-100 text-xs' : 'text-muted-foreground text-xs'}>
                                          ({item.suggestionsEn})
                                        </span>
                                      )}
                                    </motion.button>
                                  )
                                })}
                                {items.length === 0 && (
                                  <p className="text-xs text-muted-foreground">—</p>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        {renderCustomChips(sec.coId)}
                        {renderCustomAdviceRow(
                          sec.coId,
                          sec.coId,
                          `Custom advice for ${sec.coDetailEn || sec.coDetail}...`
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}

              {/* ── General Advice (not tied to any complaint) ── */}
              <motion.div
                key={GENERAL_KEY}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="border-b border-amber-100 bg-amber-50/60 pb-2.5 dark:border-amber-900/50 dark:bg-amber-950/20">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                        <Lightbulb className="h-3.5 w-3.5" />
                      </span>
                      <span>General Advice</span>
                      <span className="font-normal text-xs text-muted-foreground">(not tied to a complaint)</span>
                      {customFor(null).length > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-auto shrink-0 bg-amber-100 text-[10px] text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        >
                          {customFor(null).length}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-3">
                    {renderCustomChips(null)}
                    {renderCustomAdviceRow(GENERAL_KEY, null, 'General advice (e.g. follow up in 5 days)...')}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={goToPrev}>Back</Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || saveMutation.isPending}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {isSaving || saveMutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </span>
          ) : (
            <>Save & Continue</>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
