'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth'
import { adminApi, type Question as ApiQuestion } from '@/lib/api'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileJson,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

interface Subject {
  id: string
  name: string
  exam_type: string
}

interface Topic {
  id: string
  name: string
  subject_id: string
}

interface Question {
  id: string
  exam_type: string
  subject_id: string
  topic_id?: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  explanation?: string
  difficulty: string
  is_active: boolean
  created_at: string
  updated_at: string
  status?: string
}

interface ImportResult {
  total: number
  success: number
  failed: number
  errors: { row: number; reason: string }[]
}

const DIFFICULTY_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  easy: 'default',
  medium: 'secondary',
  hard: 'destructive',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  draft: 'outline',
  archived: 'secondary',
}

export default function QuestionsPage() {
  const { token } = useAuthStore()

  const [questions, setQuestions] = useState<(ApiQuestion & { status: string })[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [exams, setExams] = useState<{ id: string; name: string; slug: string }[]>([])
  const [loading, setLoading] = useState(true)

  const [examTypeFilter, setExamTypeFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [showQuestionDialog, setShowQuestionDialog] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [questionForm, setQuestionForm] = useState({
    exam_type: '',
    subject_id: '',
    topic_id: '',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: '',
    difficulty: 'medium',
  })
  const [formSubjects, setFormSubjects] = useState<Subject[]>([])
  const [formTopics, setFormTopics] = useState<Topic[]>([])
  const [saving, setSaving] = useState(false)

  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importTab, setImportTab] = useState<'csv' | 'json'>('csv')
  const [csvData, setCsvData] = useState('')
  const [jsonData, setJsonData] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await adminApi.listQuestions(token!, {
        page: currentPage,
        limit: pageSize,
        exam_type: examTypeFilter || undefined,
        subject_id: subjectFilter || undefined,
        difficulty: difficultyFilter || undefined,
        search: searchQuery || undefined,
      })
      setQuestions(
        (response.questions || []).map((q) => ({ ...q, status: q.is_active ? 'active' : 'draft' }))
      )
      setTotalCount(response.total || 0)
      setSelectedIds(new Set())
    } catch {
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const examsRes = await adminApi.listExams(token!)
      const allSubjects: Subject[] = []
      for (const exam of examsRes.exams || []) {
        const subsRes = await adminApi.listSubjects(token!, exam.id)
        for (const sub of subsRes.subjects || []) {
          allSubjects.push({ ...sub, exam_type: exam.slug || exam.name })
        }
      }
      setSubjects(allSubjects)
    } catch {
      toast.error('Failed to load subjects')
    }
  }

  useEffect(() => {
    fetchQuestions()
    fetchSubjects()
  }, [examTypeFilter, subjectFilter, difficultyFilter, searchQuery, currentPage])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!token) return
    adminApi.listExams(token).then(res => setExams(res.exams)).catch(() => {})
  }, [token])

  const fetchTopics = async (subjectId: string) => {
    try {
      const topicsRes = await adminApi.listTopics(token!, subjectId)
      setFormTopics(topicsRes.topics || [])
    } catch {
      setFormTopics([])
    }
  }

  const handleOpenCreate = () => {
    setEditingQuestion(null)
    setQuestionForm({
      exam_type: '',
      subject_id: '',
      topic_id: '',
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      explanation: '',
      difficulty: 'medium',
    })
    setFormSubjects([])
    setFormTopics([])
    setShowQuestionDialog(true)
  }

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q)
    setQuestionForm({
      exam_type: q.exam_type,
      subject_id: q.subject_id,
      topic_id: q.topic_id || '',
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
      difficulty: q.difficulty,
    })
    const filtered = subjects.filter((s) => s.exam_type === q.exam_type)
    setFormSubjects(filtered)
    if (q.subject_id) fetchTopics(q.subject_id)
    setShowQuestionDialog(true)
  }

  const handleExamTypeChange = (examType: string) => {
    setQuestionForm((prev) => ({ ...prev, exam_type: examType, subject_id: '', topic_id: '' }))
    const filtered = subjects.filter((s) => s.exam_type === examType)
    setFormSubjects(filtered)
    setFormTopics([])
  }

  const handleSubjectChange = (subjectId: string) => {
    setQuestionForm((prev) => ({ ...prev, subject_id: subjectId, topic_id: '' }))
    if (subjectId) fetchTopics(subjectId)
    else setFormTopics([])
  }

  const handleSaveQuestion = async () => {
    if (!questionForm.question_text.trim()) {
      toast.error('Question text is required')
      return
    }
    if (!questionForm.option_a || !questionForm.option_b) {
      toast.error('At least options A and B are required')
      return
    }

    try {
      setSaving(true)
      const payload = {
        ...questionForm,
        topic_id: questionForm.topic_id || undefined,
        explanation: questionForm.explanation || undefined,
      }

      if (editingQuestion) {
        await adminApi.updateQuestion(token!, editingQuestion.id, payload)
        toast.success('Question updated')
      } else {
        await adminApi.createQuestion(token!, payload)
        toast.success('Question created')
      }
      setShowQuestionDialog(false)
      fetchQuestions()
    } catch {
      toast.error('Failed to save question')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    try {
      await adminApi.deleteQuestion(token!, id)
      toast.success('Question deleted')
      fetchQuestions()
    } catch {
      toast.error('Failed to delete question')
    }
  }

  const handleMassDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} questions?`)) return
    try {
      for (const id of selectedIds) {
        await adminApi.deleteQuestion(token!, id)
      }
      toast.success(`${selectedIds.size} questions deleted`)
      setSelectedIds(new Set())
      fetchQuestions()
    } catch {
      toast.error('Failed to delete questions')
    }
  }

  const handleImport = async () => {
    const data = importTab === 'csv' ? csvData.trim() : jsonData.trim()
    if (!data) {
      toast.error('Please paste data to import')
      return
    }

    try {
      setImporting(true)
      setImportResult(null)

      let result
      if (importTab === 'csv') {
        result = await adminApi.importCsv(token!, { csv: data })
      } else {
        const parsed = JSON.parse(data)
        if (!Array.isArray(parsed)) {
          toast.error('JSON data must be an array of questions')
          setImporting(false)
          return
        }
        result = await adminApi.importJson(token!, { questions: parsed })
      }
      setImportResult(result)
      if (result.failed === 0) {
        toast.success(`All ${result.success} questions imported successfully`)
      } else {
        toast.success(`Imported ${result.success} of ${result.total} questions`)
      }
      fetchQuestions()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Import failed'
      toast.error(message)
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    setShowExportMenu(false)
    try {
      await adminApi.exportQuestions(token!, format)
      toast.success(`Exported as ${format.toUpperCase()}`)
    } catch {
      toast.error('Failed to export questions')
    }
  }

  const handleDownloadErrorLog = () => {
    if (!importResult?.errors.length) return
    const content = importResult.errors
      .map((e) => `Row ${e.row}: ${e.reason}`)
      .join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'import-errors.log'
    link.click()
    URL.revokeObjectURL(url)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + '...' : text

  const filteredSubjects = subjects.filter((s) => {
    if (!examTypeFilter) return true
    return s.exam_type === examTypeFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Questions</h1>
          <p className="mt-1 text-sm text-muted-foreground">{totalCount} questions total</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setImportResult(null)
              setCsvData('')
              setJsonData('')
              setShowImportDialog(true)
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <div className="relative" ref={exportRef}>
            <Button variant="outline" onClick={() => setShowExportMenu(!showExportMenu)}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                <button
                  onClick={() => handleExport('csv')}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                >
                  <FileText className="h-4 w-4" />
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                >
                  <FileJson className="h-4 w-4" />
                  Export as JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <Card>
          <CardContent className="flex items-center justify-between py-3">
            <p className="text-sm text-muted-foreground">
              {selectedIds.size} question{selectedIds.size !== 1 ? 's' : ''} selected
            </p>
            <Button variant="destructive" size="sm" onClick={handleMassDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={examTypeFilter}
          onValueChange={(v) => {
            setExamTypeFilter(v === 'all' ? '' : v)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Exams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exams</SelectItem>
            {exams.map((exam) => (
              <SelectItem key={exam.id} value={exam.slug}>
                {exam.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={subjectFilter}
          onValueChange={(v) => {
            setSubjectFilter(v === 'all' ? '' : v)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {filteredSubjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={difficultyFilter}
          onValueChange={(v) => {
            setDifficultyFilter(v === 'all' ? '' : v)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={questions.length > 0 && selectedIds.size === questions.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No questions found
                </TableCell>
              </TableRow>
            ) : (
              questions.map((q) => {
                const subject = subjects.find((s) => s.id === q.subject_id)
                return (
                  <TableRow key={q.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(q.id)}
                        onCheckedChange={() => toggleSelect(q.id)}
                      />
                    </TableCell>
                    <TableCell className="max-w-xs font-medium">
                      {truncate(q.question_text, 60)}
                    </TableCell>
                    <TableCell className="uppercase text-muted-foreground">
                      {q.exam_type}
                    </TableCell>
                    <TableCell>{subject?.name ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={DIFFICULTY_VARIANT[q.difficulty] ?? 'outline'}>
                        {q.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[q.status] ?? 'outline'}>
                        {q.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(q)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(q.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page: number
              if (totalPages <= 5) {
                page = i + 1
              } else if (currentPage <= 3) {
                page = i + 1
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i
              } else {
                page = currentPage - 2 + i
              }
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle>
            <DialogDescription>
              {editingQuestion
                ? 'Update the question details below.'
                : 'Fill in the details to create a new question.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Exam Type</Label>
                <Select
                  value={questionForm.exam_type}
                  onValueChange={handleExamTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.slug}>
                        {exam.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select
                  value={questionForm.subject_id}
                  onValueChange={handleSubjectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {formSubjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Topic <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Select
                  value={questionForm.topic_id}
                  onValueChange={(v) =>
                    setQuestionForm((prev) => ({ ...prev, topic_id: v === 'none' ? '' : v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {formTopics.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No topics available
                      </SelectItem>
                    ) : (
                      formTopics.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={questionForm.difficulty}
                  onValueChange={(v) =>
                    setQuestionForm((prev) => ({ ...prev, difficulty: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question Text</Label>
              <textarea
                rows={4}
                value={questionForm.question_text}
                onChange={(e) =>
                  setQuestionForm((prev) => ({ ...prev, question_text: e.target.value }))
                }
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter the question..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Option A</Label>
                <Input
                  value={questionForm.option_a}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({ ...prev, option_a: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Option B</Label>
                <Input
                  value={questionForm.option_b}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({ ...prev, option_b: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Option C</Label>
                <Input
                  value={questionForm.option_c}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({ ...prev, option_c: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Option D</Label>
                <Input
                  value={questionForm.option_d}
                  onChange={(e) =>
                    setQuestionForm((prev) => ({ ...prev, option_d: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <div className="flex gap-4">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="correct_answer"
                      value={opt}
                      checked={questionForm.correct_answer === opt}
                      onChange={(e) =>
                        setQuestionForm((prev) => ({ ...prev, correct_answer: e.target.value }))
                      }
                      className="h-4 w-4"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Explanation <span className="text-muted-foreground">(optional)</span>
              </Label>
              <textarea
                rows={3}
                value={questionForm.explanation}
                onChange={(e) =>
                  setQuestionForm((prev) => ({ ...prev, explanation: e.target.value }))
                }
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Explanation for the correct answer..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion} disabled={saving}>
              {saving ? 'Saving...' : 'Save Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Questions</DialogTitle>
            <DialogDescription>
              Paste your CSV or JSON data below to bulk import questions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex gap-1 rounded-md bg-muted p-1">
              <button
                onClick={() => {
                  setImportTab('csv')
                  setImportResult(null)
                }}
                className={cn(
                  'flex-1 rounded-sm px-4 py-2 text-sm font-medium transition',
                  importTab === 'csv'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                CSV
              </button>
              <button
                onClick={() => {
                  setImportTab('json')
                  setImportResult(null)
                }}
                className={cn(
                  'flex-1 rounded-sm px-4 py-2 text-sm font-medium transition',
                  importTab === 'json'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                JSON
              </button>
            </div>

            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              {importTab === 'csv' ? (
                <div>
                  <p className="mb-2 font-medium">Expected CSV format:</p>
                  <code className="block rounded bg-blue-100 p-2 text-xs dark:bg-blue-900">
                    exam_type,subject,question_text,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty
                    <br />
                    jee,Physics,What is 2+2?,2,3,4,5,C,Basic addition,medium
                  </code>
                </div>
              ) : (
                <div>
                  <p className="mb-2 font-medium">Expected JSON format:</p>
                  <code className="block rounded bg-blue-100 p-2 text-xs dark:bg-blue-900">
                    {`[
  {
    "exam_type": "jee",
    "subject": "Physics",
    "question_text": "What is 2+2?",
    "option_a": "2",
    "option_b": "3",
    "option_c": "4",
    "option_d": "5",
    "correct_answer": "C",
    "explanation": "Basic addition",
    "difficulty": "medium"
  }
]`}
                  </code>
                </div>
              )}
            </div>

            {importTab === 'csv' ? (
              <textarea
                rows={10}
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Paste your CSV data here..."
              />
            ) : (
              <textarea
                rows={10}
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Paste your JSON array here..."
              />
            )}

            {importResult && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-md bg-muted p-3 text-center">
                    <p className="text-2xl font-bold">{importResult.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="rounded-md bg-green-50 p-3 text-center dark:bg-green-950">
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {importResult.success}
                    </p>
                    <p className="text-xs text-muted-foreground">Success</p>
                  </div>
                  <div className="rounded-md bg-red-50 p-3 text-center dark:bg-red-950">
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {importResult.failed}
                    </p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="max-h-40 overflow-y-auto rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
                    <p className="mb-2 text-sm font-medium text-red-800 dark:text-red-200">
                      Errors:
                    </p>
                    <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                      {importResult.errors.map((err, i) => (
                        <li key={i}>
                          Row {err.row}: {err.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {importResult.errors.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleDownloadErrorLog}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Error Log
                  </Button>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Close
            </Button>
            <Button onClick={handleImport} disabled={importing}>
              {importing ? 'Importing...' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
