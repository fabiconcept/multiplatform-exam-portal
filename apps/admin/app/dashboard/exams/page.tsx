'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth';
import { adminApi, type Exam, type Subject, type Topic } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Clock,
  HelpCircle,
  ChevronRight,
  FolderOpen,
  FileQuestion,
} from 'lucide-react';

export default function ExamsPage() {
  const { token } = useAuthStore();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const [manageExam, setManageExam] = useState<Exam | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [topicsBySubject, setTopicsBySubject] = useState<Record<string, Topic[]>>({});
  const [topicsLoading, setTopicsLoading] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicSubjectId, setNewTopicSubjectId] = useState<string | null>(null);
  const [addingTopic, setAddingTopic] = useState(false);

  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [examForm, setExamForm] = useState({
    name: '',
    description: '',
    total_questions: 20,
    time_limit_minutes: 30,
    icon_url: '',
  });
  const [examSaving, setExamSaving] = useState(false);

  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [subjectDialogExamId, setSubjectDialogExamId] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '' });
  const [subjectSaving, setSubjectSaving] = useState(false);

  const [deleteExamId, setDeleteExamId] = useState<Exam | null>(null);

  const fetchExams = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await adminApi.listExams(token);
      setExams(res.exams);
    } catch {
      toast.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchSubjects = useCallback(
    async (examId: string) => {
      if (!token) return;
      setSubjectsLoading(true);
      try {
        const res = await adminApi.listSubjects(token, examId);
        setSubjects(res.subjects);
      } catch {
        toast.error('Failed to fetch subjects');
      } finally {
        setSubjectsLoading(false);
      }
    },
    [token]
  );

  const fetchTopics = useCallback(
    async (subjectId: string) => {
      if (!token) return;
      setTopicsLoading(subjectId);
      try {
        const res = await adminApi.listTopics(token, subjectId);
        setTopicsBySubject((prev) => ({ ...prev, [subjectId]: res.topics }));
      } catch {
        toast.error('Failed to fetch topics');
      } finally {
        setTopicsLoading(null);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  useEffect(() => {
    if (manageExam) {
      fetchSubjects(manageExam.id);
      setExpandedSubjectId(null);
      setTopicsBySubject({});
    }
  }, [manageExam, fetchSubjects]);

  function handleToggleSubject(subjectId: string) {
    if (expandedSubjectId === subjectId) {
      setExpandedSubjectId(null);
    } else {
      setExpandedSubjectId(subjectId);
      if (!topicsBySubject[subjectId]) {
        fetchTopics(subjectId);
      }
    }
  }

  async function handleAddTopic(subjectId: string) {
    if (!newTopicName.trim() || !token) return;
    setAddingTopic(true);
    try {
      await adminApi.createTopic(token, subjectId, { name: newTopicName.trim() });
      toast.success('Topic added');
      setNewTopicName('');
      setNewTopicSubjectId(null);
      fetchTopics(subjectId);
    } catch {
      toast.error('Failed to add topic');
    } finally {
      setAddingTopic(false);
    }
  }

  function handleCreateExam() {
    setEditingExam(null);
    setExamForm({ name: '', description: '', total_questions: 20, time_limit_minutes: 30, icon_url: '' });
    setExamDialogOpen(true);
  }

  function handleEditExam(exam: Exam) {
    setEditingExam(exam);
    setExamForm({
      name: exam.name,
      description: exam.description || '',
      total_questions: exam.total_questions,
      time_limit_minutes: exam.time_limit_minutes,
      icon_url: exam.icon_url || '',
    });
    setExamDialogOpen(true);
  }

  async function handleExamSave() {
    if (!examForm.name.trim() || !token) return;
    setExamSaving(true);
    try {
      if (editingExam) {
        await adminApi.updateExam(token, editingExam.id, {
          name: examForm.name.trim(),
          description: examForm.description.trim() || undefined,
          total_questions: examForm.total_questions,
          time_limit_minutes: examForm.time_limit_minutes,
          icon_url: examForm.icon_url.trim() || undefined,
        });
        toast.success('Exam updated');
      } else {
        await adminApi.createExam(token, {
          name: examForm.name.trim(),
          description: examForm.description.trim() || undefined,
          total_questions: examForm.total_questions,
          time_limit_minutes: examForm.time_limit_minutes,
          icon_url: examForm.icon_url.trim() || undefined,
        });
        toast.success('Exam created');
      }
      setExamDialogOpen(false);
      fetchExams();
    } catch {
      toast.error(editingExam ? 'Failed to update exam' : 'Failed to create exam');
    } finally {
      setExamSaving(false);
    }
  }

  async function handleDeleteExam() {
    if (!deleteExamId || !token) return;
    try {
      await adminApi.deleteExam(token, deleteExamId.id);
      toast.success('Exam deleted');
      if (manageExam?.id === deleteExamId.id) setManageExam(null);
      setDeleteExamId(null);
      fetchExams();
    } catch {
      toast.error('Failed to delete exam');
    }
  }

  function handleOpenSubjectDialog(examId: string) {
    setSubjectDialogExamId(examId);
    setSubjectForm({ name: '', description: '' });
    setSubjectDialogOpen(true);
  }

  async function handleSubjectSave() {
    if (!subjectDialogExamId || !subjectForm.name.trim() || !token) return;
    setSubjectSaving(true);
    try {
      await adminApi.createSubject(token, subjectDialogExamId, {
        name: subjectForm.name.trim(),
        description: subjectForm.description.trim() || undefined,
      });
      toast.success('Subject created');
      setSubjectDialogOpen(false);
      fetchSubjects(subjectDialogExamId);
    } catch {
      toast.error('Failed to create subject');
    } finally {
      setSubjectSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exams</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage exams, subjects, and topics</p>
        </div>
        <Button onClick={handleCreateExam}>
          <Plus className="h-4 w-4" />
          Add Exam
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter className="gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-16" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No exams yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create your first exam to get started.</p>
          <Button onClick={handleCreateExam} className="mt-4">
            <Plus className="h-4 w-4" />
            Create Exam
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {exam.icon_url ? (
                      <img src={exam.icon_url} alt="" className="w-10 h-10 rounded-lg object-contain shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <CardTitle className="truncate text-lg">{exam.name}</CardTitle>
                      <CardDescription className="truncate">{exam.slug}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={exam.is_active ? 'default' : 'secondary'} className="ml-2 shrink-0">
                    {exam.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    {exam.subject_count ?? 0} subjects
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4" />
                    {exam.question_count ?? 0} questions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {exam.time_limit_minutes} min
                  </span>
                </div>
                {exam.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{exam.description}</p>
                )}
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setManageExam(exam)}
                >
                  <FolderOpen className="h-4 w-4" />
                  Manage
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditExam(exam)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteExamId(exam)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!manageExam} onOpenChange={(open) => { if (!open) setManageExam(null); }}>
        <SheetContent side="right" className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{manageExam?.name}</SheetTitle>
            <SheetDescription>Manage subjects and topics for this exam.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Subjects</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => manageExam && handleOpenSubjectDialog(manageExam.id)}
              >
                <Plus className="h-4 w-4" />
                Add Subject
              </Button>
            </div>

            {subjectsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No subjects yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => manageExam && handleOpenSubjectDialog(manageExam.id)}
                >
                  <Plus className="h-4 w-4" />
                  Add Subject
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <div key={subject.id} className="rounded-lg border">
                    <button
                      type="button"
                      onClick={() => handleToggleSubject(subject.id)}
                      className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 text-muted-foreground transition-transform',
                            expandedSubjectId === subject.id && 'rotate-90'
                          )}
                        />
                        <span className="text-sm font-medium">{subject.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {topicsBySubject[subject.id]?.length ?? 0} topics
                      </Badge>
                    </button>

                    {expandedSubjectId === subject.id && (
                      <div className="border-t px-3 pb-3 pt-2">
                        {topicsLoading === subject.id ? (
                          <div className="space-y-2 py-2">
                            {Array.from({ length: 2 }).map((_, i) => (
                              <Skeleton key={i} className="h-8 w-full" />
                            ))}
                          </div>
                        ) : (
                          <>
                            {topicsBySubject[subject.id] &&
                              topicsBySubject[subject.id].length > 0 && (
                                <div className="space-y-1 pb-2">
                                  {topicsBySubject[subject.id].map((topic) => (
                                    <div
                                      key={topic.id}
                                      className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 text-xs"
                                    >
                                      <FileQuestion className="h-3 w-3 shrink-0 text-muted-foreground" />
                                      {topic.name}
                                    </div>
                                  ))}
                                </div>
                              )}

                            {topicsBySubject[subject.id] &&
                              topicsBySubject[subject.id].length === 0 && (
                                <p className="py-1 text-xs text-muted-foreground">No topics yet.</p>
                              )}

                            <div className="flex items-center gap-2 pt-1">
                              <Input
                                placeholder="New topic name..."
                                value={newTopicSubjectId === subject.id ? newTopicName : ''}
                                onChange={(e) => {
                                  setNewTopicSubjectId(subject.id);
                                  setNewTopicName(e.target.value);
                                }}
                                onFocus={() => setNewTopicSubjectId(subject.id)}
                                className="h-8 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddTopic(subject.id);
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() => handleAddTopic(subject.id)}
                                disabled={addingTopic || !newTopicName.trim() || newTopicSubjectId !== subject.id}
                                className="h-8"
                              >
                                Add
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setManageExam(null)}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={examDialogOpen} onOpenChange={setExamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExam ? 'Edit Exam' : 'Create Exam'}</DialogTitle>
            <DialogDescription>
              {editingExam ? 'Update the exam details below.' : 'Fill in the details to create a new exam.'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto space-y-4 py-2 px-1">
            <div className="space-y-2">
              <Label htmlFor="exam-name">Name</Label>
              <Input
                id="exam-name"
                value={examForm.name}
                onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                placeholder="e.g. JAMB, WAEC, NECO"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-desc">Description</Label>
              <Textarea
                id="exam-desc"
                value={examForm.description}
                onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                placeholder="Optional description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exam-questions">Total Questions</Label>
                <Input
                  id="exam-questions"
                  type="number"
                  min={1}
                  value={examForm.total_questions}
                  onChange={(e) =>
                    setExamForm({ ...examForm, total_questions: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam-time">Time Limit (min)</Label>
                <Input
                  id="exam-time"
                  type="number"
                  min={1}
                  value={examForm.time_limit_minutes}
                  onChange={(e) =>
                    setExamForm({ ...examForm, time_limit_minutes: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-icon">Icon URL</Label>
              <Input
                id="exam-icon"
                value={examForm.icon_url}
                onChange={(e) => setExamForm({ ...examForm, icon_url: e.target.value })}
                placeholder="https://example.com/icon.png"
              />
              {examForm.icon_url && (
                <div className="flex items-center gap-2 mt-2">
                  <img src={examForm.icon_url} alt="Icon preview" className="w-8 h-8 rounded object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  <span className="text-xs text-muted-foreground">Preview</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExamDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExamSave} disabled={examSaving || !examForm.name.trim()}>
              {examSaving ? 'Saving...' : editingExam ? 'Save Changes' : 'Create Exam'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subject</DialogTitle>
            <DialogDescription>Create a new subject for this exam.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="subject-name">Name</Label>
              <Input
                id="subject-name"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                placeholder="e.g. Mathematics, English"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject-desc">Description</Label>
              <Textarea
                id="subject-desc"
                value={subjectForm.description}
                onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                placeholder="Optional description..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubjectSave} disabled={subjectSaving || !subjectForm.name.trim()}>
              {subjectSaving ? 'Creating...' : 'Create Subject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteExamId} onOpenChange={(open) => { if (!open) setDeleteExamId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exam</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteExamId?.name}&rdquo;? This action cannot be undone and will
              remove all associated subjects and topics.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteExamId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteExam}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
