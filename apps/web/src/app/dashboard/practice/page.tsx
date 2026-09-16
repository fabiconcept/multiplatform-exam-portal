'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { authApi, publicExamApi, sessionApi, bookmarkApi, Exam, Subject, SessionQuestion, ExamSession, ExamFilterValues, type UserSettings } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ActivationModal } from '@/components/dashboard/ActivationModal';

function ExamIconSmall({ iconUrl }: { iconUrl?: string }) {
  const [imgError, setImgError] = useState(false);
  if (iconUrl && !imgError) {
    return <img src={iconUrl} alt="" width={20} height={20} className="object-contain" onError={() => setImgError(true)} />;
  }
  return (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function ExamIconMedium({ iconUrl }: { iconUrl?: string }) {
  const [imgError, setImgError] = useState(false);
  if (iconUrl && !imgError) {
    return <img src={iconUrl} alt="" width={28} height={28} className="object-contain" onError={() => setImgError(true)} />;
  }
  return (
    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

// ─── Types ──────────────────────────────────────────────────────────────────
type Step = 'type' | 'subjects' | 'filters' | 'config' | 'practice';
type PracticeMode = 'study' | 'exam';

interface ExamConfig {
  examType: string;
  examId: string;
  subjects: string[];
  questionCount: number;
  duration: number;
  mode: PracticeMode;
  filterValues: Record<string, string | string[]>;
}

// ─── Constants ──────────────────────────────────────────────────────────────
const durations = [
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
];

// ─── Loading Skeletons ──────────────────────────────────────────────────────
const ExamCardSkeleton = () => (
  <div className="p-6 rounded-2xl border-2 border-neutral-200 bg-white animate-pulse">
    <div className="w-10 h-10 bg-neutral-200 rounded-xl mb-3" />
    <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-neutral-100 rounded w-full" />
  </div>
);

const SubjectCardSkeleton = () => (
  <div className="p-4 rounded-2xl border-2 border-neutral-200 bg-white animate-pulse">
    <div className="flex items-center justify-between mb-1">
      <div className="h-4 bg-neutral-200 rounded w-2/3" />
      <div className="w-5 h-5 bg-neutral-200 rounded-full" />
    </div>
    <div className="h-3 bg-neutral-100 rounded w-1/2" />
  </div>
);

// ─── Component ──────────────────────────────────────────────────────────────
export default function PracticePage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [step, setStep] = useState<Step>('type');
  const [config, setConfig] = useState<ExamConfig>({
    examType: 'utme',
    examId: '',
    subjects: [],
    questionCount: 30,
    duration: 60,
    mode: 'study',
    filterValues: {},
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [subjectSearch, setSubjectSearch] = useState('');

  // ─── API Data State ──────────────────────────────────────────────────────
  const [exams, setExams] = useState<Exam[]>([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<ExamFilterValues | null>(null);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(false);

  // ─── Session State ──────────────────────────────────────────────────────
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [questionResults, setQuestionResults] = useState<Record<string, { correct: boolean; correct_answer: string }>>({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // ─── Timer State ──────────────────────────────────────────────────────────
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // ─── Activation / Usage State ──────────────────────────────────────────
  const [usageStatus, setUsageStatus] = useState<{ total_used: number; limit: number; remaining: number; is_activated: boolean } | null>(null);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [blockedQuestion, setBlockedQuestion] = useState(false);
  const trackedQuestionsRef = useRef(new Set<string>());

  // ─── In-progress sessions ─────────────────────────────────────────────
  const [inProgressSessions, setInProgressSessions] = useState<ExamSession[]>([]);

  // ─── Settings State ────────────────────────────────────────────────────
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [timerWarningShown, setTimerWarningShown] = useState(false);

  const isActivated = !user?.is_banned && (user?.is_active || usageStatus?.is_activated || false);

  // ─── Helper: find current exam by slug ─────────────────────────────────
  const currentExam = exams.find(e => e.slug === config.examType);

  const fetchUsageStatus = useCallback(async () => {
    if (!token) return;
    try {
      const status = await authApi.usageStatus(token);
      setUsageStatus(status);
      if (status.remaining === 0 && !status.is_activated) {
        setBlockedQuestion(true);
      }
    } catch {
      // ignore
    }
  }, [token]);

  // ─── Fetch exams on mount ──────────────────────────────────────────────
  useEffect(() => {
    setExamsLoading(true);
    publicExamApi.listExams()
      .then(res => setExams(res.exams || []))
      .catch(() => toast.error('Failed to load exams'))
      .finally(() => setExamsLoading(false));
  }, [token]);

  // ─── Fetch in-progress sessions ─────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    sessionApi.listSessions(token)
      .then(res => setInProgressSessions((res.sessions || []).filter(s => s.status === 'in_progress')))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    fetchUsageStatus();
  }, [fetchUsageStatus]);

  // ─── Load user settings ──────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    authApi.getSettings(token).then(setSettings).catch(() => {});
  }, [token]);

  const trackQuestionUsage = useCallback(async (questionKey: string) => {
    if (!token || isActivated) return true;
    if (trackedQuestionsRef.current.has(questionKey)) return true; // already tracked
    trackedQuestionsRef.current.add(questionKey);
    try {
      const res = await authApi.trackUsage(token, questionKey, config.examType);
      if (res.allowed) {
        setBlockedQuestion(false);
        if (res.remaining !== undefined) {
          setUsageStatus((prev) => prev ? { ...prev, total_used: res.total_used ?? prev.total_used, remaining: res.remaining ?? prev.remaining } : prev);
        }
        return true;
      }
      // Not allowed — block
      setBlockedQuestion(true);
      setCurrentQuestion((prev) => Math.max(0, prev - 1));
      setShowActivationModal(true);
      return false;
    } catch {
      return true;
    }
  }, [token, isActivated, config.examType]);

  useEffect(() => {
    if (step === 'practice' && !isActivated && questions.length > 0) {
      const q = questions[currentQuestion];
      if (q) {
        const qKey = `${config.examType}-${q.id}`;
        trackQuestionUsage(qKey);
      }
      // Also block if free limit is reached
      if (Object.keys(answers).length >= 5) {
        setBlockedQuestion(true);
      }
    }
  }, [step, currentQuestion, isActivated, config.examType, trackQuestionUsage, questions, answers]);

  // ─── Select exam handler ───────────────────────────────────────────────
  const handleSelectExam = (exam: Exam) => {
    setConfig(prev => ({ ...prev, examType: exam.slug, examId: exam.id, subjects: [], filterValues: {} }));
    setFilterOptions(null);
    setSubjectsLoading(true);
    publicExamApi.listExamSubjects(exam.id)
      .then(res => setSubjects(res.subjects || []))
      .catch(() => toast.error('Failed to load subjects'))
      .finally(() => setSubjectsLoading(false));
    setStep('subjects');
  };

  // ─── Proceed to filters or config step ───────────────────────────────
  const handleProceedFromSubjects = () => {
    if (!currentExam || !token) return;
    const configuredFilters: string[] = (() => { try { return JSON.parse(currentExam.filters || '[]'); } catch { return []; } })();
    if (configuredFilters.length === 0) {
      setStep('config');
      return;
    }
    setFilterOptionsLoading(true);
    setStep('filters');
    publicExamApi.getExamFilterValues(currentExam.id)
      .then(res => setFilterOptions(res))
      .catch(() => toast.error('Failed to load filter options'))
      .finally(() => setFilterOptionsLoading(false));
  };

  // ─── Subject filtering & selection ─────────────────────────────────────
  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const minSubjects = currentExam?.min_subjects ?? 1;
  const maxSubjects = currentExam?.max_subjects ?? 0;

  const toggleSubject = (id: string) => {
    setConfig((prev) => {
      const isSelected = prev.subjects.includes(id);
      if (isSelected) {
        return { ...prev, subjects: prev.subjects.filter((s) => s !== id) };
      }
      if (maxSubjects > 0 && prev.subjects.length >= maxSubjects) {
        toast.error(`You can select at most ${maxSubjects} subject${maxSubjects !== 1 ? 's' : ''}`);
        return prev;
      }
      return { ...prev, subjects: [...prev.subjects, id] };
    });
  };

  // ─── Timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!timerActive || step !== 'practice') return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          // Show 00:00 briefly before auto-submitting
          setTimeout(() => {
            setIsExpired(true);
            handleAutoSubmitRef.current();
          }, 500);
          return 0;
        }
        // Timer warning at 5 minutes (300 seconds)
        if (prev <= 301 && prev > 300 && settings?.timer_warning && !timerWarningShown) {
          toast('5 minutes remaining!', { icon: '⏰', duration: 5000 });
          setTimerWarningShown(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, step, settings?.timer_warning, timerWarningShown]);

  // ─── Auto-save session state ──────────────────────────────────────────
  useEffect(() => {
    if (step !== 'practice' || !sessionId || !settings?.auto_save) return;
    const state = { sessionId, currentQuestion, answers, config: { examType: config.examType, mode: config.mode } };
    try {
      localStorage.setItem('Examinery-practice-save', JSON.stringify(state));
    } catch { /* ignore */ }
  }, [sessionId, currentQuestion, answers, step, settings?.auto_save, config.examType, config.mode]);

  // ─── Restore saved session on mount ──────────────────────────────────
  useEffect(() => {
    if (step !== 'type' || !token) return;
    try {
      // Handle "continue" from history page
      const continueId = localStorage.getItem('Examinery-practice-continue');
      if (continueId) {
        localStorage.removeItem('Examinery-practice-continue');
        sessionApi.getSession(token, continueId)
          .then(res => {
            if (res.session.status === 'in_progress') {
              setSessionId(continueId);
              const freeLimit = 5;
              const isUserActivated = !user?.is_banned && (user?.is_active || usageStatus?.is_activated || false);
              const effectiveQuestions = (!isUserActivated && res.questions.length > freeLimit)
                ? res.questions.slice(0, freeLimit)
                : res.questions;
              setQuestions(effectiveQuestions);
              setConfig(prev => ({ ...prev, examType: res.session.exam_type, mode: res.session.mode as PracticeMode }));
              setCurrentQuestion(0);
              setAnswers({});
              setQuestionResults({});
              if (res.session.expires_at) {
                const expiresMs = typeof res.session.expires_at === 'number'
                  ? res.session.expires_at * 1000
                  : new Date(res.session.expires_at).getTime();
                const remaining = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
                setTimeRemaining(remaining);
                setTimerActive(remaining > 0);
                if (remaining <= 0) {
                  toast.error('Session has expired');
                  return;
                }
              } else {
                const totalSeconds = (res.session.duration_minutes || 60) * 60;
                setTimeRemaining(totalSeconds);
                setTimerActive(true);
              }
              setStep('practice');
              toast.success('Resumed your session');
            } else {
              toast.error('Session is no longer in progress');
            }
          })
          .catch(() => toast.error('Could not resume session'));
        return;
      }

      const saved = localStorage.getItem('Examinery-practice-save');
      if (!saved) return;
      const state = JSON.parse(saved);
      if (state.sessionId) {
        sessionApi.getSession(token, state.sessionId)
          .then(res => {
            if (res.session.status === 'in_progress') {
              setSessionId(state.sessionId);
              // Cap questions for free users at the frontend level
              const freeLimit = 5;
              const isUserActivated = !user?.is_banned && (user?.is_active || usageStatus?.is_activated || false);
              const effectiveQuestions = (!isUserActivated && res.questions.length > freeLimit)
                ? res.questions.slice(0, freeLimit)
                : res.questions;
              setQuestions(effectiveQuestions);
              setCurrentQuestion(state.currentQuestion || 0);
              setAnswers(state.answers || {});
              if (res.session.expires_at) {
                const expiresMs = typeof res.session.expires_at === 'number'
                  ? res.session.expires_at * 1000
                  : new Date(res.session.expires_at).getTime();
                const remaining = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
                setTimeRemaining(remaining);
                setTimerActive(remaining > 0);
                if (remaining <= 0) {
                  toast.error('Session has expired');
                  localStorage.removeItem('Examinery-practice-save');
                  setStep('type');
                  return;
                }
              } else {
                const totalSeconds = (res.session.duration_minutes || 60) * 60;
                const startedMs = typeof res.session.started_at === 'number'
                  ? res.session.started_at * 1000
                  : new Date(res.session.started_at).getTime();
                const elapsed = Math.floor((Date.now() - startedMs) / 1000);
                const remaining = Math.max(0, totalSeconds - elapsed);
                setTimeRemaining(remaining);
                setTimerActive(remaining > 0);
              }
              if (state.config) {
                setConfig(prev => ({ ...prev, examType: state.config.examType, mode: state.config.mode }));
              }
              setStep('practice');
              toast.success('Restored your previous practice session');
            } else {
              localStorage.removeItem('Examinery-practice-save');
              if (res.session.status === 'expired') {
                toast.error('Your previous session has expired');
              }
            }
          })
          .catch(() => {
            localStorage.removeItem('Examinery-practice-save');
            toast.error('Could not restore previous session');
          });
      }
    } catch { /* ignore */ }
  }, [step, token]);

  const getExamName = (slug: string) => {
    const exam = exams.find(e => e.slug === slug || e.id === slug);
    return exam?.name || slug;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAutoSubmit = useCallback(async () => {
    if (!token || !sessionId) return;
    setSubmitting(true);
    try {
      const answerPayload = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        question_id: questionId,
        selected_answer: selectedAnswer,
        time_spent_seconds: 0,
      }));
      await sessionApi.submitSession(token, sessionId, { answers: answerPayload, time_spent_seconds: config.duration * 60 });
      toast.success('Time\'s up! Session auto-submitted.');
      router.push(`/dashboard/results?session=${sessionId}`);
    } catch (e: any) {
      if (e?.status === 400 && e?.message?.includes('expired')) {
        toast.error('Session expired. Results will be based on saved answers.');
        router.push(`/dashboard/results?session=${sessionId}`);
      } else {
        toast.error('Failed to submit session');
      }
    } finally {
      setSubmitting(false);
    }
  }, [token, sessionId, answers, config.duration, router]);

  // Keep ref to latest handleAutoSubmit so timer always calls current version
  const handleAutoSubmitRef = useRef(handleAutoSubmit);
  handleAutoSubmitRef.current = handleAutoSubmit;

  // ─── Start session ─────────────────────────────────────────────────────
  const handleStartSession = async (mode: PracticeMode) => {
    if (!token) return;
    // Block free users with no remaining questions
    if (!isActivated && usageStatus?.remaining !== undefined && usageStatus.remaining <= 0) {
      setBlockedQuestion(true);
      setShowActivationModal(true);
      return;
    }
    setConfig(prev => ({ ...prev, mode }));
    setIsExpired(false);
    setSessionLoading(true);
    try {
      const created = await sessionApi.createSession(token, {
        exam_type: config.examType,
        mode,
        subjects: config.subjects,
        question_count: config.questionCount,
        duration_minutes: config.duration,
        filter_values: (() => {
          const cleaned: Record<string, string | string[]> = {};
          for (const [k, v] of Object.entries(config.filterValues)) {
            if (Array.isArray(v)) { if (v.length > 0) cleaned[k] = v; }
            else if (v) cleaned[k] = v;
          }
          return Object.keys(cleaned).length > 0 ? cleaned : undefined;
        })(),
      });
      setSessionId(created.id);

      const res = await sessionApi.getSession(token, created.id);
      // Cap questions for free users at the frontend level
      const freeLimit = 5;
      const isUserActivated = !user?.is_banned && (user?.is_active || usageStatus?.is_activated || false);
      const effectiveQuestions = (!isUserActivated && res.questions.length > freeLimit)
        ? res.questions.slice(0, freeLimit)
        : res.questions;
      setQuestions(effectiveQuestions);
      setCurrentQuestion(0);
      setAnswers({});
      setQuestionResults({});
      setBookmarkedQuestions(new Set());

      if (res.session.expires_at) {
        const expiresMs = typeof res.session.expires_at === 'number'
          ? res.session.expires_at * 1000
          : new Date(res.session.expires_at).getTime();
        const remaining = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
        setTimeRemaining(remaining);
        setTimerActive(remaining > 0);
      } else {
        const totalSeconds = (res.session.duration_minutes || config.duration) * 60;
        setTimeRemaining(totalSeconds);
        setTimerActive(true);
      }
      setStep('practice');
    } catch (e: any) {
      // Rate limited — try to recover an existing in-progress session
      if (e?.status === 429) {
        try {
          const res = await sessionApi.listSessions(token);
          const existing = (res.sessions || []).find(s => s.status === 'in_progress' && s.exam_type === config.examType && s.mode === mode);
          if (existing) {
            const sessionRes = await sessionApi.getSession(token, existing.id);
            setSessionId(existing.id);
            const freeLimit = 5;
            const isUserActivated = !user?.is_banned && (user?.is_active || usageStatus?.is_activated || false);
            const effectiveQuestions = (!isUserActivated && sessionRes.questions.length > freeLimit)
              ? sessionRes.questions.slice(0, freeLimit)
              : sessionRes.questions;
            setQuestions(effectiveQuestions);
            setCurrentQuestion(0);
            setAnswers({});
            setQuestionResults({});
            setBookmarkedQuestions(new Set());
            if (sessionRes.session.expires_at) {
              const expiresMs = typeof sessionRes.session.expires_at === 'number'
                ? sessionRes.session.expires_at * 1000
                : new Date(sessionRes.session.expires_at).getTime();
              const remaining = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
              setTimeRemaining(remaining);
              setTimerActive(remaining > 0);
            } else {
              const totalSeconds = (sessionRes.session.duration_minutes || config.duration) * 60;
              setTimeRemaining(totalSeconds);
              setTimerActive(true);
            }
            setStep('practice');
            toast.success('Resumed existing session (rate limited)');
            return;
          }
        } catch {}
        toast.error('Too many requests. Please wait a moment and try again.');
      } else if (e?.status === 400 && e?.message?.includes('expired')) {
        toast.error('Session expired. Please try again.');
      } else {
        toast.error('Failed to start practice session');
      }
    } finally {
      setSessionLoading(false);
    }
  };

  // ─── Answer handling ────────────────────────────────────────────────────
  const handleAnswerSelect = async (question: SessionQuestion, answer: string) => {
    if (questionResults[question.id]) return;

    // Block if free limit is reached (5 answered questions for non-activated users)
    if (!isActivated) {
      const answeredCount = Object.keys(answers).length;
      if (answeredCount >= 5) {
        setBlockedQuestion(true);
        setShowActivationModal(true);
        return;
      }
    }

    setAnswers((prev) => ({ ...prev, [question.id]: answer }));

    if (!token || !sessionId) return;
    try {
      const result = await sessionApi.submitAnswer(token, sessionId, {
        question_id: question.id,
        selected_answer: answer,
        time_spent_seconds: 0,
      });
      setQuestionResults((prev) => ({ ...prev, [question.id]: result }));
    } catch (e: any) {
      if (e?.status === 400 && e?.message?.includes('expired')) {
        toast.error('Session has expired. Please start a new session.');
        setStep('type');
      } else {
        toast.error('Failed to save answer');
      }
    }
  };

  // ─── Bookmark ────────────────────────────────────────────────────────────
  const handleBookmark = async (questionId: string) => {
    if (!token) return;
    try {
      if (bookmarkedQuestions.has(questionId)) {
        await bookmarkApi.deleteBookmark(token, questionId);
        setBookmarkedQuestions((prev) => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });
        toast.success('Bookmark removed');
      } else {
        await bookmarkApi.createBookmark(token, questionId);
        setBookmarkedQuestions((prev) => new Set(prev).add(questionId));
        toast.success('Question bookmarked');
      }
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  // ─── Submit session ────────────────────────────────────────────────────
  const handleSubmitSession = async () => {
    if (!token || !sessionId) return;
    setSubmitting(true);
    try {
      const answerPayload = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        question_id: questionId,
        selected_answer: selectedAnswer,
        time_spent_seconds: 0,
      }));
      await sessionApi.submitSession(token, sessionId, { answers: answerPayload, time_spent_seconds: config.duration * 60 - timeRemaining });
      localStorage.removeItem('Examinery-practice-save');
      toast.success('Session submitted!');
      router.push(`/dashboard/results?session=${sessionId}`);
    } catch (e: any) {
      if (e?.status === 400 && e?.message?.includes('expired')) {
        toast.error('Session has expired. Results will be based on saved answers.');
        localStorage.removeItem('Examinery-practice-save');
        router.push(`/dashboard/results?session=${sessionId}`);
      } else {
        toast.error('Failed to submit session');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Abandon session ───────────────────────────────────────────────────
  const handleAbandonSession = async () => {
    if (!token || !sessionId) {
      localStorage.removeItem('Examinery-practice-save');
      setStep('type');
      return;
    }
    try {
      await sessionApi.abandonSession(token, sessionId);
      localStorage.removeItem('Examinery-practice-save');
      toast.success('Session abandoned');
    } catch {
      localStorage.removeItem('Examinery-practice-save');
      setStep('type');
    }
    setSessionId(null);
    setQuestions([]);
    setAnswers({});
    setQuestionResults({});
    setCurrentQuestion(0);
    setTimerActive(false);
    setStep('type');
  };

  // ─── Calculator (safe math parser) ──────────────────────────────────────
  const safeCalcEval = (expr: string): number => {
    const sanitized = expr.replace(/[^0-9+\-*/.%()]/g, '');
    if (!sanitized) return NaN;
    const tokens: (number | string)[] = [];
    let num = '';
    for (let i = 0; i < sanitized.length; i++) {
      const ch = sanitized[i];
      if ('+-*/%'.includes(ch) && num) {
        tokens.push(Number(num));
        tokens.push(ch);
        num = '';
      } else {
        num += ch;
      }
    }
    if (num) tokens.push(Number(num));
    if (tokens.length < 2) return Number(tokens[0]) || 0;
    let result = Number(tokens[0]) || 0;
    for (let i = 1; i < tokens.length; i += 2) {
      const op = tokens[i] as string;
      const next = Number(tokens[i + 1]) || 0;
      switch (op) {
        case '+': result += next; break;
        case '-': result -= next; break;
        case '*': result *= next; break;
        case '/': result = next !== 0 ? result / next : NaN; break;
        case '%': result = next !== 0 ? result % next : NaN; break;
      }
    }
    return result;
  };

  const handleCalcInput = (value: string) => {
    if (value === 'C') setCalcDisplay('0');
    else if (value === 'DEL') setCalcDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    else if (value === '=') {
      try {
        const result = safeCalcEval(calcDisplay);
        setCalcDisplay(isNaN(result) ? 'Error' : String(result));
      } catch { setCalcDisplay('Error'); }
    } else setCalcDisplay((prev) => (prev === '0' ? value : prev + value));
  };

  // ─── Keyboard shortcuts ────────────────────────────────────────────────
  const handleKeyPress = useCallback((key: string) => {
    if (step !== 'practice' || questions.length === 0) return;
    const q = questions[currentQuestion];
    if (!q) return;

    const keyMap: Record<string, string> = { a: 'A', b: 'B', c: 'C', d: 'D', p: 'prev', n: 'next' };
    const action = keyMap[key.toLowerCase()];
    if (action === 'prev' && config.mode === 'study') setCurrentQuestion((prev) => Math.max(0, prev - 1));
    else if (action === 'next') setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1));
    else if (['A', 'B', 'C', 'D'].includes(action)) handleAnswerSelect(q, action);
  }, [step, questions, currentQuestion, config.mode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      handleKeyPress(e.key);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKeyPress]);

  // ─── Practice View ──────────────────────────────────────────────────────
  if (step === 'practice') {
    if (sessionLoading) {
      return (
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-600">Loading questions...</p>
          </div>
        </div>
      );
    }

    if (questions.length === 0) {
      return (
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">No Questions Available</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              There are no questions available for this configuration. Please try different subjects or exam types.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('Examinery-practice-save');
                setStep('type');
                setSessionId(null);
                setQuestions([]);
              }}
              className="px-6 py-2.5 rounded-xl bg-primary-500 text-neutral-900 font-medium hover:bg-primary-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    const q = questions[currentQuestion];
    const qResult = q ? questionResults[q.id] : null;
    const hasAnswered = !!qResult;
    const selectedAnswer = q ? answers[q.id] : null;

    return (
      <>
      <div className="p-8" tabIndex={0}>
        {/* Activation Modal */}
        <ActivationModal
          open={showActivationModal}
          onClose={() => setShowActivationModal(false)}
          title="Question Limit Reached"
          subtitle={`You've used all ${usageStatus?.limit || 5} free questions. Activate your account to continue practicing.`}
          showLimit={usageStatus?.limit}
          showUsed={usageStatus?.total_used}
          onActivated={() => fetchUsageStatus()}
        />

        {/* Usage Banner (non-activated users) */}
        {!isActivated && usageStatus && (
          <div className={`rounded-2xl p-4 mb-4 flex items-center justify-between ${
            blockedQuestion ? 'bg-warning-50 border-2 border-warning-300' : 'bg-neutral-50 border border-neutral-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                blockedQuestion ? 'bg-warning-100' : 'bg-neutral-200'
              }`}>
                <svg className={`w-4 h-4 ${blockedQuestion ? 'text-warning-600' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-medium ${blockedQuestion ? 'text-warning-800' : 'text-neutral-700'}`}>
                  {blockedQuestion ? 'Limit reached' : `${usageStatus.remaining} of ${usageStatus.limit} free questions remaining`}
                </p>
                <p className="text-xs text-neutral-500">Activate your account for unlimited access</p>
              </div>
            </div>
            <button
              onClick={() => setShowActivationModal(true)}
              className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-all"
            >
              Activate
            </button>
          </div>
        )}

        {/* Header Bar */}
        <div className="bg-white rounded-2xl p-3 lg:p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 lg:gap-4 min-w-0">
              <button onClick={() => setShowAbandonConfirm(true)} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Exit practice session" disabled={isExpired}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="min-w-0">
                <h2 className="font-semibold text-neutral-900 truncate">
                  <span className="hidden sm:inline">{config.mode === 'exam' ? 'Exam Mode' : 'Study Mode'} — </span>
                  {currentExam?.name || config.examType}
                </h2>
                <p className="text-xs text-neutral-500">
                  Question {currentQuestion + 1} of {questions.length}
                  {config.mode === 'exam' && (
                    <span className="ml-2 text-primary-600 font-medium">
                      ({Object.keys(answers).length} answered)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 lg:gap-6 shrink-0">
              {config.mode === 'exam' && (
                <div className="text-right">
                  <p className="text-xs text-neutral-500 hidden sm:block">Time Remaining</p>
                  <p className={`text-lg lg:text-xl font-bold font-mono ${
                    timeRemaining <= 60 ? 'text-error-600 animate-pulse'
                      : timeRemaining <= 300 ? 'text-warning-600'
                      : 'text-neutral-900'
                  }`}>
                    {formatTime(timeRemaining)}
                  </p>
                  {timeRemaining <= 300 && timeRemaining > 0 && (
                    <p className="text-xs text-warning-600 font-medium mt-0.5 hidden sm:block">5 min warning</p>
                  )}
                </div>
              )}
              <button onClick={() => setShowCalculator(!showCalculator)} className="p-2.5 lg:p-3 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors" title="Calculator" aria-label={showCalculator ? 'Hide calculator' : 'Show calculator'} aria-expanded={showCalculator}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button onClick={() => setShowAbandonConfirm(true)} className="hidden sm:block px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">Exit</button>
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            {blockedQuestion ? (
              <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm mb-4 flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="w-14 h-14 bg-warning-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V9a4 4 0 00-8 0v2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Free Question Limit Reached</h3>
                <p className="text-sm text-neutral-600 mb-5 max-w-xs">You&apos;ve used all {usageStatus?.limit || 5} free questions. Activate your account to continue practicing.</p>
                <button
                  onClick={() => setShowActivationModal(true)}
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-all"
                >
                  Activate Account
                </button>
              </div>
            ) : q && (
              <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm mb-4 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium px-3 py-1 bg-primary-100 text-primary-700 rounded-full shrink-0">Q{currentQuestion + 1}</span>
                    <span className="text-xs text-neutral-500 truncate">{q.subject_name}</span>
                    {q.topic_name && <span className="text-xs text-neutral-400 hidden sm:inline">• {q.topic_name}</span>}
                    <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-full shrink-0">{q.difficulty}</span>
                  </div>
                  <button
                    onClick={() => handleBookmark(q.id)}
                    disabled={isExpired}
                    className={`p-2 rounded-lg transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                      bookmarkedQuestions.has(q.id)
                        ? 'bg-warning-100 text-warning-600'
                        : 'hover:bg-neutral-100 text-neutral-400'
                    }`}
                    title={bookmarkedQuestions.has(q.id) ? 'Remove bookmark' : 'Bookmark question'}
                  >
                    <svg className="w-5 h-5" fill={bookmarkedQuestions.has(q.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
                <h3 className="text-base lg:text-lg text-neutral-900 mb-6 leading-relaxed">{q.question_text}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Answer options">
                  {(['A', 'B', 'C', 'D'] as const).map((option) => {
                    const optionText = option === 'A' ? q.option_a : option === 'B' ? q.option_b : option === 'C' ? q.option_c : q.option_d;
                    const isSelected = selectedAnswer === option;
                    const isCorrect = qResult?.correct_answer === option;
                    const isWrong = isSelected && qResult && !qResult.correct;

                    return (
                      <button
                        key={option}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`Option ${option}: ${optionText}`}
                        onClick={() => handleAnswerSelect(q, option)}
                        disabled={hasAnswered || isExpired}
                        className={`p-3 lg:p-4 rounded-xl border-2 text-left transition-all ${
                          hasAnswered
                            ? config.mode === 'study'
                              ? isCorrect
                                ? 'border-success-500 bg-success-50'
                                : isWrong
                                  ? 'border-error-500 bg-error-50'
                                  : 'border-neutral-200 opacity-50'
                              : 'border-neutral-200 opacity-50'
                            : isSelected
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            hasAnswered
                              ? config.mode === 'study'
                                ? isCorrect
                                  ? 'bg-success-500 text-white'
                                  : isWrong
                                    ? 'bg-error-500 text-white'
                                    : 'bg-neutral-100 text-neutral-600'
                                : isSelected
                                  ? 'bg-primary-500 text-neutral-900'
                                  : 'bg-neutral-100 text-neutral-600'
                              : isSelected
                                ? 'bg-primary-500 text-neutral-900'
                                : 'bg-neutral-100 text-neutral-600'
                          }`}>{option}</span>
                          <span className="text-sm lg:text-base text-neutral-700">{optionText}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Study mode: detailed feedback panel */}
                {config.mode === 'study' && hasAnswered && qResult && (
                  <div className={`mt-6 p-5 rounded-2xl border-2 ${
                    qResult.correct
                      ? 'bg-success-50 border-success-200'
                      : 'bg-error-50 border-error-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      {qResult.correct ? (
                        <>
                          <div className="w-10 h-10 bg-success-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-success-800">Correct!</p>
                            <p className="text-sm text-success-600">You got this one right</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-error-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-error-800">Incorrect</p>
                            <p className="text-sm text-error-600">The correct answer is <span className="font-bold">{qResult.correct_answer}</span></p>
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => { if (currentQuestion < questions.length - 1) setCurrentQuestion((prev) => prev + 1); }}
                      disabled={currentQuestion === questions.length - 1 || isExpired}
                      className="w-full py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {currentQuestion === questions.length - 1 ? 'Finish Session' : 'Next Question →'}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              {config.mode === 'study' ? (
                <button
                  onClick={() => { setCurrentQuestion((prev) => Math.max(0, prev - 1)); }}
                  disabled={currentQuestion === 0 || blockedQuestion || isExpired}
                  aria-label="Go to previous question"
                  className="px-5 py-2.5 border-2 border-neutral-200 rounded-full text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  ← Previous
                </button>
              ) : <div />}
              {!(config.mode === 'study' && hasAnswered && qResult) && (
                <button
                  onClick={() => { if (currentQuestion < questions.length - 1) setCurrentQuestion((prev) => prev + 1); }}
                  disabled={currentQuestion === questions.length - 1 || blockedQuestion || isExpired}
                  aria-label="Go to next question"
                  className="px-5 py-2.5 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Question navigator - horizontal scroll on mobile */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm font-medium text-neutral-700 mb-3">
                {config.mode === 'exam' ? 'Question Map' : 'Questions'}
              </p>
              <div className="grid grid-cols-6 sm:grid-cols-6 gap-2" role="navigation" aria-label="Question navigator">
                {questions.map((q, i) => {
                  const isAnswered = !!answers[q.id];
                  const isCurrent = i === currentQuestion;
                  // Lock questions beyond free limit for non-activated users
                  const isOverFreeLimit = !isActivated && !isCurrent && Object.keys(answers).length >= 5 && i >= 5;
                  const isLocked = isOverFreeLimit || (!isActivated && blockedQuestion && i > currentQuestion) || isExpired;
                  const isFuture = config.mode === 'exam' && i > currentQuestion && !isAnswered;
                  return (
                    <button
                      key={q.id}
                      onClick={() => !isLocked && !isFuture && setCurrentQuestion(i)}
                      disabled={isLocked || isFuture}
                      aria-label={`Question ${i + 1}${isAnswered ? ' (answered)' : ''}${isCurrent ? ' (current)' : ''}${isLocked ? ' (locked)' : ''}${isFuture ? ' (not reached)' : ''}`}
                      className={`w-full aspect-square rounded-lg text-xs font-medium transition-all ${
                        isLocked || isFuture
                          ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                          : isCurrent ? 'bg-primary-500 text-neutral-900' : isAnswered ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-primary-500 rounded" /> Current</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-success-100 rounded" /> Answered</span>
                {config.mode === 'exam' && <span className="flex items-center gap-1"><span className="w-3 h-3 bg-neutral-200 rounded" /> Locked</span>}
              </div>
            </div>

            {/* Keyboard shortcuts - hidden on mobile */}
            <div className="bg-white rounded-2xl p-4 shadow-sm hidden lg:block">
              <p className="text-sm font-medium text-neutral-700 mb-3">Keyboard Shortcuts</p>
              <div className={`grid gap-2 ${config.mode === 'exam' ? 'grid-cols-5' : 'grid-cols-4'}`}>
                {['A', 'B', 'C', 'D', ...(config.mode === 'study' ? ['P'] : []), 'N'].map((key) => (
                  <button key={key} onClick={() => handleKeyPress(key.toLowerCase())}
                    className="py-2 bg-neutral-100 rounded-lg text-sm font-bold hover:bg-neutral-200 transition-colors"
                    title={key === 'P' ? 'Previous' : key === 'N' ? 'Next' : `Option ${key}`}>{key}</button>
                ))}
              </div>
              <div className="mt-2 text-xs text-neutral-500 space-y-0.5">
                <p>A-D: Select answer</p>
                {config.mode === 'study' ? <p>P: Previous | N: Next</p> : <p>N: Next question</p>}
              </div>
            </div>

            {/* Calculator */}
            {showCalculator && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-sm font-medium text-neutral-700 mb-3">Calculator</p>
                <div className="bg-neutral-900 rounded-xl p-3 mb-3">
                  <p className="text-right text-white font-mono text-xl truncate">{calcDisplay}</p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['C', 'DEL', '%', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '=', 'ANS'].map((btn) => (
                    <button key={btn} onClick={() => handleCalcInput(btn)}
                      className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        btn === 'C' || btn === 'DEL' ? 'bg-error-100 text-error-700 hover:bg-error-200'
                          : ['/', '*', '-', '+', '='].includes(btn) ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}>{btn}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                className="w-full py-3 bg-primary-500 text-neutral-900 rounded-xl font-semibold hover:bg-primary-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowSubmitConfirm(true)}
                disabled={submitting || isExpired}
                aria-label={`Submit ${config.mode === 'exam' ? 'exam' : 'practice session'}`}
              >
                {submitting ? 'Submitting...' : `Submit ${config.mode === 'exam' ? 'Exam' : 'Practice'}`}
              </button>
              <button
                className="w-full py-3 bg-error-50 text-error-600 rounded-xl font-medium hover:bg-error-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowAbandonConfirm(true)}
                disabled={isExpired}
                aria-label="Abandon practice session"
              >
                Abandon
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={() => setShowSubmitConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
              config.mode === 'exam' ? 'bg-warning-100' : 'bg-primary-100'
            }`}>
              <svg className={`w-6 h-6 ${config.mode === 'exam' ? 'text-warning-600' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 text-center mb-2">Submit {config.mode === 'exam' ? 'Exam' : 'Practice'}?</h3>
            <p className="text-neutral-500 text-sm text-center mb-4">
              You answered {Object.keys(answers).length} of {questions.length} questions.
            </p>
            {config.mode === 'exam' && Object.keys(answers).length < questions.length && (
              <p className="text-warning-600 text-sm text-center mb-6 font-medium">
                {questions.length - Object.keys(answers).length} question{questions.length - Object.keys(answers).length !== 1 ? 's' : ''} unanswered. They will be marked as incorrect.
              </p>
            )}
            {config.mode === 'study' && (
              <p className="text-neutral-400 text-sm text-center mb-6">Ready to see your results?</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border-2 border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => { setShowSubmitConfirm(false); handleSubmitSession(); }} className="flex-1 px-4 py-2.5 rounded-xl bg-primary-500 text-neutral-900 font-semibold hover:bg-primary-400 transition-colors">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abandon Confirmation Dialog */}
      {showAbandonConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={() => setShowAbandonConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 text-center mb-2">Abandon Session?</h3>
            <p className="text-neutral-500 text-sm text-center mb-6">
              Your progress will be lost. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowAbandonConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border-2 border-neutral-200 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors">
                Keep Practicing
              </button>
              <button onClick={() => { setShowAbandonConfirm(false); handleAbandonSession(); }} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors">
                Abandon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time's Up Modal - blocks all interaction */}
      {isExpired && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Time&apos;s Up!</h2>
            <p className="text-neutral-500 text-sm mb-6">
              Your {config.mode === 'exam' ? 'exam' : 'practice session'} is being auto-submitted.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
              <div className="w-4 h-4 border-2 border-neutral-300 border-t-primary-500 rounded-full animate-spin" />
              <span>Submitting your answers...</span>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }

  // ─── Config Step (Duration + Count) ──────────────────────────────────
  // ─── Filter Selection Step ────────────────────────────────────────────
  if (step === 'filters') {
    const configuredFilters: string[] = (() => { try { return JSON.parse(currentExam?.filters || '[]'); } catch { return []; } })();
    const filterLabels: Record<string, string> = { year: 'Year', topic: 'Topic', year_of_study: 'Class', difficulty: 'Difficulty' };
    const filterDescriptions: Record<string, string> = {
      year: 'Select exam year',
      topic: 'Choose topics to focus on',
      year_of_study: 'Select your class level',
      difficulty: 'Filter by difficulty',
    };

    const orderedFilters = configuredFilters.sort((a, b) => {
      const order = ['year_of_study', 'year', 'topic', 'difficulty'];
      return order.indexOf(a) - order.indexOf(b);
    });

    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <button onClick={() => setStep('subjects')} className="text-sm text-neutral-500 hover:text-neutral-700 mb-2 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to subjects
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">Filter questions</h1>
          <p className="text-neutral-600">Optionally narrow down which questions you practice.</p>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-4 lg:p-6 text-white mb-8">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <ExamIconMedium iconUrl={currentExam?.icon_url} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{currentExam?.name || config.examType}</h2>
              <p className="text-neutral-400">{config.subjects.length} subject{config.subjects.length !== 1 ? 's' : ''} selected</p>
            </div>
          </div>
        </div>

        {filterOptionsLoading ? (
          <div className="space-y-6">
            {orderedFilters.map((f) => (
              <div key={f} className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm animate-pulse">
                <div className="h-5 bg-neutral-200 rounded w-32 mb-4" />
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-neutral-100 rounded-xl w-24" />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {orderedFilters.map((filterType) => {
              if (filterType === 'topic') {
                const topics = filterOptions?.topic || [];
                if (topics.length === 0) return null;
                const selectedTopics = (config.filterValues.topic as string[]) || [];
                return (
                  <div key={filterType} className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">{filterLabels[filterType]}</h3>
                    <p className="text-sm text-neutral-500 mb-4">{filterDescriptions[filterType]}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                      {topics.map((topic) => {
                        const isSelected = selectedTopics.includes(topic.id);
                        return (
                          <button
                            key={topic.id}
                            onClick={() => {
                              const current = selectedTopics;
                              const newTopics = isSelected ? current.filter((t) => t !== topic.id) : [...current, topic.id];
                              setConfig((prev) => ({ ...prev, filterValues: { ...prev.filterValues, topic: newTopics } }));
                            }}
                            className={`p-3 rounded-xl text-left text-sm transition-all ${
                              isSelected ? 'bg-primary-50 border-2 border-primary-500 text-primary-900' : 'bg-neutral-50 border-2 border-transparent text-neutral-700 hover:bg-neutral-100'
                            }`}
                          >
                            {topic.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              if (filterType === 'year_of_study') {
                const options = filterOptions?.year_of_study || [];
                const currentValue = (config.filterValues.year_of_study as string) || '';
                return (
                  <div key={filterType} className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">{filterLabels[filterType]}</h3>
                    <p className="text-sm text-neutral-500 mb-4">{filterDescriptions[filterType]}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      <button
                        onClick={() => setConfig((prev) => ({ ...prev, filterValues: { ...prev.filterValues, year_of_study: '' } }))}
                        className={`p-4 rounded-xl text-center font-medium transition-all ${
                          currentValue === '' ? 'bg-neutral-900 text-white shadow-md' : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-2 border-transparent'
                        }`}
                      >
                        All Classes
                      </button>
                      {options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setConfig((prev) => ({ ...prev, filterValues: { ...prev.filterValues, year_of_study: opt } }))}
                          className={`p-4 rounded-xl text-center font-medium transition-all ${
                            currentValue === opt ? 'bg-neutral-900 text-white shadow-md' : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-2 border-transparent'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {options.length === 0 && <p className="text-sm text-neutral-400">No class levels available</p>}
                  </div>
                );
              }

              if (filterType === 'year') {
                const options = filterOptions?.year || [];
                const currentValue = (config.filterValues.year as string) || '';
                return (
                  <div key={filterType} className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">{filterLabels[filterType]}</h3>
                    <p className="text-sm text-neutral-500 mb-4">{filterDescriptions[filterType]}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setConfig((prev) => ({ ...prev, filterValues: { ...prev.filterValues, year: '' } }))}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                          currentValue === '' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        All Years
                      </button>
                      {options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setConfig((prev) => ({ ...prev, filterValues: { ...prev.filterValues, year: opt } }))}
                          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                            currentValue === opt ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {options.length === 0 && <p className="text-sm text-neutral-400">No years available</p>}
                  </div>
                );
              }

              if (filterType === 'difficulty') {
                const options = filterOptions?.difficulty || [];
                const currentValue = (config.filterValues.difficulty as string) || '';
                const difficultyColors: Record<string, string> = {
                  easy: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
                  medium: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200',
                  hard: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200',
                };
                const difficultySelected: Record<string, string> = {
                  easy: 'bg-emerald-500 text-white border-emerald-500',
                  medium: 'bg-amber-500 text-white border-amber-500',
                  hard: 'bg-red-500 text-white border-red-500',
                };
                return (
                  <div key={filterType} className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">{filterLabels[filterType]}</h3>
                    <p className="text-sm text-neutral-500 mb-4">{filterDescriptions[filterType]}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setConfig((prev) => ({ ...prev, filterValues: { ...prev.filterValues, difficulty: '' } }))}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${
                          currentValue === '' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-transparent'
                        }`}
                      >
                        All Levels
                      </button>
                      {options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setConfig((prev) => ({ ...prev, filterValues: { ...prev.filterValues, difficulty: opt } }))}
                          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${
                            currentValue === opt
                              ? difficultySelected[opt] || 'bg-neutral-900 text-white border-neutral-900'
                              : difficultyColors[opt] || 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-transparent'
                          }`}
                        >
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </button>
                      ))}
                    </div>
                    {options.length === 0 && <p className="text-sm text-neutral-400">No difficulty levels available</p>}
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <button onClick={() => setStep('subjects')} className="w-full sm:w-auto px-6 py-3 border-2 border-neutral-200 rounded-full font-medium text-neutral-700 hover:bg-neutral-50 transition-all text-center">
            Back
          </button>
          <button
            onClick={() => setStep('config')}
            className="w-full sm:w-auto px-8 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 'config') {
    const hasFilters = (() => { try { return JSON.parse(currentExam?.filters || '[]').length > 0; } catch { return false; } })();
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <button onClick={() => setStep(hasFilters ? 'filters' : 'subjects')} className="text-sm text-neutral-500 hover:text-neutral-700 mb-2 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to {hasFilters ? 'filters' : 'subjects'}
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">Build your {currentExam?.name || config.examType} practice exam</h1>
          <p className="text-neutral-600">Set your preferred question count and duration.</p>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-4 lg:p-6 text-white mb-8">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <ExamIconMedium iconUrl={currentExam?.icon_url} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{currentExam?.name || config.examType}</h2>
              <p className="text-neutral-400">{config.subjects.length} subject{config.subjects.length !== 1 ? 's' : ''} selected</p>
              {(() => {
                const activeFilters = Object.entries(config.filterValues).filter(([, v]) => v && (Array.isArray(v) ? v.length > 0 : true));
                if (activeFilters.length === 0) return null;
                const filterLabels: Record<string, string> = { year: 'Year', topic: 'Topic', year_of_study: 'Year of Study', difficulty: 'Difficulty' };
                return (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {activeFilters.map(([key, val]) => (
                      <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-xs text-neutral-300">
                        {filterLabels[key] || key}: {Array.isArray(val) ? `${val.length} selected` : val}
                      </span>
                    ))}
                  </div>
                );
              })()}
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-400">Questions</p>
              <p className="text-2xl font-bold">{config.questionCount}</p>
            </div>
          </div>
        </div>

        {/* Question Count */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">Question Count</h3>
          <p className="text-sm text-neutral-500 mb-4">How many questions do you want to practice?</p>
          <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
            {[10, 20, 30, 40, 50].map((count) => (
              <button key={count} onClick={() => setConfig({ ...config, questionCount: count })}
                className={`w-14 h-14 lg:w-16 lg:h-16 rounded-xl text-lg font-bold transition-all ${
                  config.questionCount === count ? 'bg-primary-500 text-neutral-900' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}>{count}</button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">Practice Duration</h3>
          <p className="text-sm text-neutral-500 mb-4">Set time limit for the practice session</p>
          <div className="flex flex-wrap gap-3">
            {durations.map((d) => (
              <button key={d.value} onClick={() => setConfig({ ...config, duration: d.value })}
                className={`px-4 lg:px-6 py-2.5 lg:py-3 rounded-full font-medium text-sm lg:text-base transition-all ${
                  config.duration === d.value ? 'bg-neutral-900 text-white' : 'bg-white border-2 border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}>{d.label}</button>
            ))}
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-neutral-500">Custom:</span>
              <input type="number" min={5} max={180} value={config.duration}
                onChange={(e) => setConfig({ ...config, duration: Number(e.target.value) || 60 })}
                className="w-20 px-3 py-2 border-2 border-neutral-200 rounded-xl text-center text-sm font-medium focus:border-primary-300 focus:outline-none" />
              <span className="text-sm text-neutral-500">min</span>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">Choose Mode</h3>
          <p className="text-sm text-neutral-500 mb-4">How do you want to practice?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setConfig({ ...config, mode: 'study' })}
              disabled={sessionLoading}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                config.mode === 'study'
                  ? 'border-success-500 bg-success-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.mode === 'study' ? 'bg-success-500' : 'bg-neutral-100'}`}>
                  <svg className={`w-5 h-5 ${config.mode === 'study' ? 'text-white' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Study Mode</p>
                  <p className="text-xs text-success-600 font-medium">Learn as you go</p>
                </div>
              </div>
              <ul className="text-xs text-neutral-500 space-y-1 ml-13">
                <li className="flex items-center gap-1.5"><span className="text-success-500">&#10003;</span> Immediate answer feedback</li>
                <li className="flex items-center gap-1.5"><span className="text-success-500">&#10003;</span> See correct answers instantly</li>
                <li className="flex items-center gap-1.5"><span className="text-success-500">&#10003;</span> Navigate freely between questions</li>
                <li className="flex items-center gap-1.5"><span className="text-success-500">&#10003;</span> No time pressure</li>
              </ul>
            </button>
            <button
              onClick={() => setConfig({ ...config, mode: 'exam' })}
              disabled={sessionLoading}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                config.mode === 'exam'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.mode === 'exam' ? 'bg-primary-500' : 'bg-neutral-100'}`}>
                  <svg className={`w-5 h-5 ${config.mode === 'exam' ? 'text-neutral-900' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Exam Mode</p>
                  <p className="text-xs text-primary-600 font-medium">Simulate real exam</p>
                </div>
              </div>
              <ul className="text-xs text-neutral-500 space-y-1 ml-13">
                <li className="flex items-center gap-1.5"><span className="text-primary-500">&#10003;</span> Countdown timer</li>
                <li className="flex items-center gap-1.5"><span className="text-primary-500">&#10003;</span> Forward-only navigation</li>
                <li className="flex items-center gap-1.5"><span className="text-primary-500">&#10003;</span> Answers locked after selection</li>
                <li className="flex items-center gap-1.5"><span className="text-primary-500">&#10003;</span> Auto-submit when time runs out</li>
              </ul>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button onClick={() => setStep(hasFilters ? 'filters' : 'subjects')} className="w-full sm:w-auto px-6 py-3 border-2 border-neutral-200 rounded-full font-medium text-neutral-700 hover:bg-neutral-50 transition-all text-center">
            Back
          </button>
          <button
            onClick={() => handleStartSession(config.mode)}
            disabled={sessionLoading || (!isActivated && (usageStatus?.remaining ?? 5) <= 0)}
            className="w-full sm:w-auto px-6 lg:px-8 py-3 bg-primary-500 text-neutral-900 rounded-full font-semibold hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {sessionLoading ? 'Starting...' : !isActivated && (usageStatus?.remaining ?? 5) <= 0 ? 'Limit Reached' : config.mode === 'exam' ? 'Start Exam' : 'Start Studying'}
          </button>
        </div>
      </div>
    );
  }

  // ─── Subject Selection Step ────────────────────────────────────────────
  if (step === 'subjects') {
    const selectedCount = config.subjects.length;

    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <button onClick={() => setStep('type')} className="text-sm text-neutral-500 hover:text-neutral-700 mb-2 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to exam types
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">Build your {currentExam?.name || config.examType} practice exam</h1>
          <p className="text-neutral-600">Select subjects to practice.</p>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-4 lg:p-6 text-white mb-8">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <ExamIconMedium iconUrl={currentExam?.icon_url} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{currentExam?.name || config.examType}</h2>
              <p className="text-neutral-400">Continues in the app &middot; Offline practice and full analysis</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-400">Selected</p>
              <p className="text-2xl font-bold">{selectedCount}</p>
            </div>
          </div>
        </div>

        {/* Subject Search */}
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search subjects..."
              value={subjectSearch}
              onChange={(e) => setSubjectSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl text-neutral-900 focus:border-primary-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Subject Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              What do you want to practise?
            </h2>
            <span className="text-sm text-neutral-500">
              {selectedCount} selected
              {maxSubjects > 0 && ` / ${maxSubjects} max`}
            </span>
          </div>

          {subjectsLoading ? (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <SubjectCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {filteredSubjects.map((subject) => {
                const isSelected = config.subjects.includes(subject.id);
                const isMaxed = !isSelected && maxSubjects > 0 && selectedCount >= maxSubjects;
                return (
                  <button
                    key={subject.id}
                    onClick={() => toggleSubject(subject.id)}
                    disabled={isMaxed}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected ? 'border-primary-500 bg-primary-50'
                        : isMaxed ? 'border-neutral-100 bg-neutral-50 opacity-50 cursor-not-allowed'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm text-neutral-900">{subject.name}</h3>
                      {isSelected && (
                        <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {subject.description && (
                      <p className="text-xs text-neutral-500">{subject.description}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary + Continue */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-neutral-600">
              <span className="font-semibold text-neutral-900">{currentExam?.name || config.examType}</span>
              {' • '}
              <span className="font-semibold text-neutral-900">{selectedCount}</span> subjects selected
            </p>
            {minSubjects > 0 && selectedCount < minSubjects && (
              <p className="text-sm text-red-500 mt-1">
                Minimum {minSubjects} subject{minSubjects !== 1 ? 's' : ''} required
              </p>
            )}
          </div>
          <button
            onClick={handleProceedFromSubjects}
            disabled={minSubjects > 0 && selectedCount < minSubjects}
            className="w-full sm:w-auto px-8 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ─── Exam Type Selection (Step 1) ─────────────────────────────────────
  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">Practice</h1>
        <p className="text-neutral-600">Choose your exam type and start practicing</p>
      </div>

      {/* In-progress sessions */}
      {inProgressSessions.length > 0 && (
        <div className="mb-6 bg-primary-50 border border-primary-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-neutral-900 mb-3">Continue where you left off</p>
          <div className="space-y-2">
            {inProgressSessions.map(s => (
              <div
                key={s.id}
                onClick={() => {
                  localStorage.setItem('Examinery-practice-continue', s.id);
                  window.location.reload();
                }}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 cursor-pointer hover:shadow-sm transition-shadow"
              >
                <div>
                  <span className="font-medium text-neutral-900">{getExamName(s.exam_type)}</span>
                  <span className="text-sm text-neutral-500 ml-2">{s.mode} &middot; {s.question_count} questions</span>
                </div>
                <span className="px-4 py-1.5 bg-primary-500 text-neutral-900 rounded-full text-sm font-semibold hover:bg-primary-400 transition-colors">
                  Resume
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {examsLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <ExamCardSkeleton key={i} />
          ))
        ) : (
          exams.map((exam) => {
            const hasQuestions = (exam.question_count ?? 0) > 0;
            return (
            <button
              key={exam.id}
              onClick={() => hasQuestions && handleSelectExam(exam)}
              disabled={!hasQuestions}
              className={`p-5 lg:p-6 rounded-2xl border-2 text-left transition-all bg-white ${hasQuestions ? 'hover:border-neutral-300 hover:shadow-md cursor-pointer' : 'opacity-50 cursor-not-allowed border-neutral-100'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${hasQuestions ? 'bg-primary-500' : 'bg-neutral-300'}`}>
                <ExamIconSmall iconUrl={exam.icon_url} />
              </div>
              <h3 className="font-semibold text-neutral-900 text-lg">{exam.name}</h3>
              <p className="text-sm text-neutral-500 mt-1">{exam.description || `${exam.subject_count || 0} subjects • ${exam.question_count || 0} questions`}</p>
              {!hasQuestions && <p className="text-xs text-neutral-400 mt-2 italic">Coming soon — no questions yet</p>}
            </button>
            );
          })
        )}
        </div>
      </div>
  );
}
