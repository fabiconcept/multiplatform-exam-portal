'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { adminApi } from '@/lib/api'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, ChevronRight } from 'lucide-react'

interface Exam {
  id: string
  name: string
  slug: string
  icon_url?: string
}

interface ExamWithCount extends Exam {
  question_count: number
  subject_count: number
}

export default function QuestionsIndexPage() {
  const { token } = useAuthStore()
  const [exams, setExams] = useState<ExamWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    adminApi.listExams(token)
      .then(async (res) => {
        const examList = res.exams || []
        const withCounts: ExamWithCount[] = await Promise.all(
          examList.map(async (exam) => {
            try {
              const subsRes = await adminApi.listSubjects(token, exam.id)
              const subjects = subsRes.subjects || []
              let questionCount = 0
              for (const sub of subjects) {
                try {
                  const qRes = await adminApi.listQuestions(token, { subject_id: sub.id, limit: 1 })
                  questionCount += qRes.total || 0
                } catch {}
              }
              return { ...exam, question_count: questionCount, subject_count: subjects.length }
            } catch {
              return { ...exam, question_count: 0, subject_count: 0 }
            }
          })
        )
        setExams(withCounts)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const totalQuestions = exams.reduce((sum, e) => sum + e.question_count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Questions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select an exam to manage its questions
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : exams.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No exams found</p>
          </div>
        ) : (
          exams.map((exam) => (
            <Link key={exam.id} href={`/dashboard/questions/${exam.slug}`}>
              <Card className="group cursor-pointer transition-colors hover:bg-accent/50 hover:border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {exam.icon_url ? (
                      <img
                        src={exam.icon_url}
                        alt={exam.name}
                        className="h-12 w-12 rounded-xl object-contain"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
                        {exam.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{exam.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {exam.question_count} questions
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {exam.subject_count} subjects
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {!loading && exams.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {totalQuestions} total questions across {exams.length} exams
        </p>
      )}
    </div>
  )
}
