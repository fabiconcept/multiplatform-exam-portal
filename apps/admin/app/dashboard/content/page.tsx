'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { adminApi, type Exam, type Subject, type Topic } from '@/lib/api'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  FileText,
  BookOpen,
  Hash,
  ExternalLink,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface ExamNode extends Exam {
  subjects: SubjectNode[]
  subjectCount: number
  questionCount: number
  expanded: boolean
}

interface SubjectNode extends Subject {
  topics: Topic[]
  topicCount: number
  questionCount: number
  expanded: boolean
}

export default function ContentPage() {
  const { token } = useAuthStore()
  const [exams, setExams] = useState<ExamNode[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'exam' | 'subject' | 'topic'>('exam')
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; description?: string } | null>(null)
  const [parentId, setParentId] = useState<string>('')
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formMinSubjects, setFormMinSubjects] = useState(1)
  const [formMaxSubjects, setFormMaxSubjects] = useState(0)
  const [formIconUrl, setFormIconUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: string; name: string } | null>(null)

  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importSubjectId, setImportSubjectId] = useState('')
  const [importSubjectName, setImportSubjectName] = useState('')
  const [importCsvData, setImportCsvData] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ total: number; success: number; failed: number; errors: { row: number; reason: string }[] } | null>(null)

  useEffect(() => {
    if (!token) return
    loadData()
  }, [token])

  const loadData = async () => {
    if (!token) return
    setLoading(true)
    try {
      const examsRes = await adminApi.listExams(token)
      const examNodes: ExamNode[] = await Promise.all(
        (examsRes.exams || []).map(async (exam) => {
          const subsRes = await adminApi.listSubjects(token, exam.id)
          const subjects: SubjectNode[] = await Promise.all(
            (subsRes.subjects || []).map(async (sub) => {
              const topicsRes = await adminApi.listTopics(token, sub.id)
              let questionCount = 0
              try {
                const qRes = await adminApi.listQuestions(token, { subject_id: sub.id, limit: 1 })
                questionCount = qRes.total || 0
              } catch {}
              return {
                ...sub,
                topics: topicsRes.topics || [],
                topicCount: topicsRes.total || 0,
                questionCount,
                expanded: false,
              }
            })
          )
          const subjectCount = subjects.length
          const questionCount = subjects.reduce((s, sub) => s + sub.questionCount, 0)
          return { ...exam, subjects, subjectCount, questionCount, expanded: false }
        })
      )
      setExams(examNodes)
    } catch {
      toast.error('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const toggleExam = (examId: string) => {
    setExams((prev) =>
      prev.map((e) => (e.id === examId ? { ...e, expanded: !e.expanded } : e))
    )
  }

  const toggleSubject = (examId: string, subjectId: string) => {
    setExams((prev) =>
      prev.map((e) =>
        e.id === examId
          ? {
              ...e,
              subjects: e.subjects.map((s) =>
                s.id === subjectId ? { ...s, expanded: !s.expanded } : s
              ),
            }
          : e
      )
    )
  }

  const openCreateDialog = (type: 'exam' | 'subject' | 'topic', newParentId?: string) => {
    setDialogType(type)
    setEditingItem(null)
    setParentId(newParentId || '')
    setFormName('')
    setFormDescription('')
    setFormMinSubjects(1)
    setFormMaxSubjects(0)
    setFormIconUrl('')
    setDialogOpen(true)
  }

  const openEditDialog = (type: 'exam' | 'subject' | 'topic', item: any) => {
    setDialogType(type)
    setEditingItem(item)
    setParentId('')
    setFormName(item.name)
    setFormDescription(item.description || '')
    setFormMinSubjects(item.min_subjects ?? 1)
    setFormMaxSubjects(item.max_subjects ?? 0)
    setFormIconUrl(item.icon_url || '')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!token || !formName.trim()) return
    setSaving(true)

    try {
      if (dialogType === 'exam') {
        if (editingItem) {
          await adminApi.updateExam(token, editingItem.id, { name: formName.trim(), description: formDescription.trim() || undefined, min_subjects: formMinSubjects, max_subjects: formMaxSubjects, icon_url: formIconUrl.trim() || undefined })
          toast.success('Exam updated')
        } else {
          await adminApi.createExam(token, { name: formName.trim(), description: formDescription.trim() || undefined, min_subjects: formMinSubjects, max_subjects: formMaxSubjects, icon_url: formIconUrl.trim() || undefined })
          toast.success('Exam created')
        }
      } else if (dialogType === 'subject') {
        if (editingItem) {
          await adminApi.updateSubject(token, editingItem.id, { name: formName.trim(), description: formDescription.trim() || undefined })
          toast.success('Subject updated')
        } else {
          await adminApi.createSubject(token, parentId, { name: formName.trim(), description: formDescription.trim() || undefined })
          toast.success('Subject created')
        }
      } else if (dialogType === 'topic') {
        if (editingItem) {
          await adminApi.updateTopic(token, editingItem.id, { name: formName.trim() })
          toast.success('Topic updated')
        } else {
          await adminApi.createTopic(token, parentId, { name: formName.trim() })
          toast.success('Topic created')
        }
      }
      setDialogOpen(false)
      loadData()
    } catch {
      toast.error(`Failed to ${editingItem ? 'update' : 'create'} ${dialogType}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!token || !deleteConfirm) return
    try {
      if (deleteConfirm.type === 'subject') {
        await adminApi.deleteSubject(token, deleteConfirm.id)
      } else if (deleteConfirm.type === 'topic') {
        await adminApi.deleteTopic(token, deleteConfirm.id)
      }
      toast.success(`${deleteConfirm.type} deleted`)
      setDeleteConfirm(null)
      loadData()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleImportTopics = async () => {
    if (!token || !importCsvData.trim() || !importSubjectId) return
    setImporting(true)
    setImportResult(null)
    try {
      const result = await adminApi.importTopicsCsv(token, { csv: importCsvData.trim(), subject_id: importSubjectId })
      setImportResult(result)
      if (result.failed === 0) {
        toast.success(`All ${result.success} topics imported`)
      } else {
        toast.success(`Imported ${result.success} of ${result.total} topics`)
      }
      loadData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Import failed'
      toast.error(message)
    } finally {
      setImporting(false)
    }
  }

  const openImportDialog = (subjectId: string, subjectName: string) => {
    setImportSubjectId(subjectId)
    setImportSubjectName(subjectName)
    setImportCsvData('')
    setImportResult(null)
    setImportDialogOpen(true)
  }

  const totalExams = exams.length
  const totalSubjects = exams.reduce((s, e) => s + e.subjectCount, 0)
  const totalTopics = exams.reduce((s, e) => s + e.subjects.reduce((ss, sub) => ss + sub.topicCount, 0), 0)
  const totalQuestions = exams.reduce((s, e) => s + e.questionCount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content Manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage exams, subjects, and topics in one place
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => openCreateDialog('exam')}>
            <Plus className="mr-2 h-4 w-4" />
            New Exam
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalExams}</p>
                <p className="text-xs text-muted-foreground">Exams</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSubjects}</p>
                <p className="text-xs text-muted-foreground">Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <Hash className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTopics}</p>
                <p className="text-xs text-muted-foreground">Topics</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalQuestions}</p>
                <p className="text-xs text-muted-foreground">Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tree */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No exams yet</p>
          <Button className="mt-4" onClick={() => openCreateDialog('exam')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {exams.map((exam) => (
            <div key={exam.id} className="rounded-xl border bg-card overflow-hidden">
              {/* Exam Row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => toggleExam(exam.id)}
              >
                {exam.expanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                {exam.icon_url ? (
                  <img src={exam.icon_url} alt="" className="h-8 w-8 rounded-lg object-contain" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                    {exam.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{exam.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-xs">{exam.subjectCount} subjects</Badge>
                    <Badge variant="outline" className="text-xs">{exam.questionCount} questions</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => openCreateDialog('subject', exam.id)}
                    title="Add Subject"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => openEditDialog('exam', exam)}
                    title="Edit Exam"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Link
                    href={`/dashboard/questions/${exam.slug}`}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors"
                    title="Manage Questions"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Subjects */}
              {exam.expanded && (
                <div className="border-t bg-muted/30">
                  {exam.subjects.length === 0 ? (
                    <div className="px-4 py-3 pl-11 text-sm text-muted-foreground">
                      No subjects yet
                    </div>
                  ) : (
                    exam.subjects.map((subject) => (
                      <div key={subject.id}>
                        {/* Subject Row */}
                        <div
                          className="flex items-center gap-3 px-4 py-2.5 pl-11 cursor-pointer hover:bg-accent/30 transition-colors"
                          onClick={() => toggleSubject(exam.id, subject.id)}
                        >
                          {subject.expanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                          <BookOpen className="h-4 w-4 text-green-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm">{subject.name}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-xs">{subject.topicCount} topics</Badge>
                              <Badge variant="outline" className="text-xs">{subject.questionCount} questions</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => openImportDialog(subject.id, subject.name)}
                              title="Import Topics"
                            >
                              <Upload className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => openCreateDialog('topic', subject.id)}
                              title="Add Topic"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => openEditDialog('subject', subject)}
                              title="Edit Subject"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => setDeleteConfirm({ id: subject.id, type: 'subject', name: subject.name })}
                              title="Delete Subject"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Topics */}
                        {subject.expanded && (
                          <div className="border-t bg-muted/20">
                            {subject.topics.length === 0 ? (
                              <div className="px-4 py-2 pl-24 text-xs text-muted-foreground">
                                No topics yet
                              </div>
                            ) : (
                              subject.topics.map((topic) => (
                                <div
                                  key={topic.id}
                                  className="flex items-center gap-3 px-4 py-2 pl-24 hover:bg-accent/20 transition-colors"
                                >
                                  <Hash className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                                  <span className="flex-1 text-sm">{topic.name}</span>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => openEditDialog('topic', topic)}
                                      title="Edit Topic"
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:text-destructive"
                                      onClick={() => setDeleteConfirm({ id: topic.id, type: 'topic', name: topic.name })}
                                      title="Delete Topic"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Create'} {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={`Enter ${dialogType} name`}
                autoFocus
              />
            </div>
            {dialogType === 'exam' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Subjects</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formMinSubjects}
                    onChange={(e) => setFormMinSubjects(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">Minimum subjects a user must select (0 = no limit)</p>
                </div>
                <div className="space-y-2">
                  <Label>Max Subjects</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formMaxSubjects}
                    onChange={(e) => setFormMaxSubjects(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">Maximum subjects a user can select (0 = unlimited)</p>
                </div>
              </div>
            )}
            {dialogType === 'exam' && (
              <div className="space-y-2">
                <Label>Icon URL <span className="text-muted-foreground">(optional)</span></Label>
                <Input
                  value={formIconUrl}
                  onChange={(e) => setFormIconUrl(e.target.value)}
                  placeholder="https://example.com/icon.png"
                />
                {formIconUrl && (
                  <div className="flex items-center gap-2 mt-2">
                    <img src={formIconUrl} alt="Icon preview" className="w-8 h-8 rounded object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <span className="text-xs text-muted-foreground">Preview</span>
                  </div>
                )}
              </div>
            )}
            {dialogType !== 'topic' && (
              <div className="space-y-2">
                <Label>Description <span className="text-muted-foreground">(optional)</span></Label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Brief description..."
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formName.trim()}>
              {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {deleteConfirm?.type}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Topics Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Topics to {importSubjectName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <p className="mb-2 font-medium">Expected CSV format:</p>
              <code className="block rounded bg-blue-100 p-2 text-xs dark:bg-blue-900">
                name{'\n'}
                Algebra{'\n'}
                Calculus{'\n'}
                Geometry
              </code>
              <p className="mt-2 text-xs">First column should be the topic name. Header row is optional.</p>
            </div>
            <textarea
              rows={8}
              value={importCsvData}
              onChange={(e) => setImportCsvData(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="name&#10;Algebra&#10;Calculus&#10;Geometry"
            />
            {importResult && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">{importResult.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="rounded-md bg-green-50 p-3 text-center dark:bg-green-950">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{importResult.success}</p>
                  <p className="text-xs text-muted-foreground">Success</p>
                </div>
                <div className="rounded-md bg-red-50 p-3 text-center dark:bg-red-950">
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{importResult.failed}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleImportTopics} disabled={importing || !importCsvData.trim()}>
              {importing ? 'Importing...' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
