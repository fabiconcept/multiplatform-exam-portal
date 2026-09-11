'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { authApi, examApi, Exam, Subject } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

// ─── Types ──────────────────────────────────────────────────────────────────
type Step = 'type' | 'subjects' | 'config' | 'practice';
type PracticeMode = 'study' | 'exam';

interface ExamConfig {
  examType: string;
  subjects: string[];
  session: string;
  questionCount: number;
  duration: number;
  mode: PracticeMode;
}

// ─── Constants ──────────────────────────────────────────────────────────────
const durations = [
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
];

const sessions = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010'];

const sampleQuestions = [
  {
    id: 1,
    subject: 'English Language',
    question: 'Choose the option that best completes the sentence: "The teacher _____ the students to submit their assignments."',
    options: [
      { id: 'A', text: 'told' },
      { id: 'B', text: 'say' },
      { id: 'C', text: 'tells' },
      { id: 'D', text: 'said' },
    ],
    correct: 'A',
    explanation: '"Told" is the correct past tense form of "tell" used with an indirect object (the students).',
  },
  {
    id: 2,
    subject: 'Mathematics',
    question: 'If 3x + 7 = 22, what is the value of x?',
    options: [
      { id: 'A', text: '3' },
      { id: 'B', text: '5' },
      { id: 'C', text: '7' },
      { id: 'D', text: '15' },
    ],
    correct: 'B',
    explanation: 'Subtract 7 from both sides: 3x = 15. Then divide by 3: x = 5.',
  },
  {
    id: 3,
    subject: 'Physics',
    question: 'What is the SI unit of force?',
    options: [
      { id: 'A', text: 'Joule' },
      { id: 'B', text: 'Watt' },
      { id: 'C', text: 'Newton' },
      { id: 'D', text: 'Pascal' },
    ],
    correct: 'C',
    explanation: 'The Newton (N) is the SI unit of force, named after Sir Isaac Newton.',
  },
];

// ─── Default Icon ───────────────────────────────────────────────────────────
const DefaultExamIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

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
  const { token, user } = useAuthStore();
  const [step, setStep] = useState<Step>('type');
  const [config, setConfig] = useState<ExamConfig>({
    examType: 'utme',
    subjects: [],
    session: '',
    questionCount: 30,
    duration: 60,
    mode: 'study',
  });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [subjectSearch, setSubjectSearch] = useState('');

  // ─── API Data State ──────────────────────────────────────────────────────
  const [exams, setExams] = useState<Exam[]>([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  // ─── Activation / Usage State ──────────────────────────────────────────
  const [usageStatus, setUsageStatus] = useState<{ total_used: number; limit: number; remaining: number; is_activated: boolean } | null>(null);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [blockedQuestion, setBlockedQuestion] = useState(false);

  const isActivated = user?.is_active || usageStatus?.is_activated || false;

  // ─── Helper: find current exam by slug ─────────────────────────────────
  const currentExam = exams.find(e => e.slug === config.examType);

  const fetchUsageStatus = useCallback(async () => {
    if (!token) return;
    try {
      const status = await authApi.usageStatus(token);
      setUsageStatus(status);
    } catch {
      // ignore
    }
  }, [token]);

  // ─── Fetch exams on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    setExamsLoading(true);
    examApi.listExams(token)
      .then(res => setExams(res.exams || []))
      .catch(() => toast.error('Failed to load exams'))
      .finally(() => setExamsLoading(false));
  }, [token]);

  useEffect(() => {
    fetchUsageStatus();
  }, [fetchUsageStatus]);

  const trackQuestionUsage = useCallback(async (questionKey: string) => {
    if (!token || isActivated) return;
    try {
      const res = await authApi.trackUsage(token, questionKey, config.examType);
      if (!res.allowed) {
        setBlockedQuestion(true);
        setShowActivationModal(true);
        return false;
      }
      if (res.remaining !== undefined) {
        setUsageStatus((prev) => prev ? { ...prev, total_used: res.total_used ?? prev.total_used, remaining: res.remaining ?? prev.remaining } : prev);
      }
      return true;
    } catch {
      return true;
    }
  }, [token, isActivated, config.examType]);

  useEffect(() => {
    if (step === 'practice' && !isActivated) {
      const qKey = `${config.examType}-${currentQuestion}`;
      trackQuestionUsage(qKey);
    }
  }, [step, currentQuestion, isActivated, config.examType, trackQuestionUsage]);

  // ─── Select exam handler ───────────────────────────────────────────────
  const handleSelectExam = (exam: Exam) => {
    setConfig(prev => ({ ...prev, examType: exam.slug, subjects: [] }));
    setSubjectsLoading(true);
    examApi.listExamSubjects(token!, exam.id)
      .then(res => setSubjects(res.subjects || []))
      .catch(() => toast.error('Failed to load subjects'))
      .finally(() => setSubjectsLoading(false));
    setStep('subjects');
  };

  // ─── Subject filtering & selection ─────────────────────────────────────
  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const toggleSubject = (name: string) => {
    setConfig((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(name)
        ? prev.subjects.filter((s) => s !== name)
        : [...prev.subjects, name].slice(0, 9),
    }));
  };

  const getSubjectLimit = () => {
    return 9;
  };

  // ─── Calculator ────────────────────────────────────────────────────────
  const handleCalcInput = (value: string) => {
    if (value === 'C') setCalcDisplay('0');
    else if (value === 'DEL') setCalcDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    else if (value === '=') {
      try { setCalcDisplay(String(eval(calcDisplay))); } catch { setCalcDisplay('Error'); }
    } else setCalcDisplay((prev) => (prev === '0' ? value : prev + value));
  };

  // ─── Keyboard shortcuts ────────────────────────────────────────────────
  const handleKeyPress = (key: string) => {
    const keyMap: Record<string, string> = { a: 'A', b: 'B', c: 'C', d: 'D', p: 'prev', n: 'next', s: 'skip', r: 'reveal' };
    const action = keyMap[key.toLowerCase()];
    if (action === 'prev') setCurrentQuestion((q) => Math.max(0, q - 1));
    else if (action === 'next') setCurrentQuestion((q) => Math.min(config.questionCount - 1, q + 1));
    else if (['A', 'B', 'C', 'D'].includes(action)) handleAnswerSelect(currentQuestion, action);
  };

  const handleAnswerSelect = (questionIdx: number, answer: string) => {
    setSelectedAnswer(answer);
    setAnswers((prev) => ({ ...prev, [questionIdx]: answer }));
    setShowExplanation(true);
  };

  // ─── Practice / CBT View ──────────────────────────────────────────────
  if (step === 'practice') {
    const q = sampleQuestions[currentQuestion % sampleQuestions.length];
    return (
      <div className="p-8" onKeyDown={(e) => handleKeyPress(e.key)} tabIndex={0}>
        {/* Activation Modal */}
        {showActivationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
              <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Question Limit Reached</h2>
              <p className="text-neutral-500 mb-2">
                You&apos;ve used all <span className="font-semibold">{usageStatus?.limit || 5}</span> free questions.
              </p>
              <p className="text-neutral-500 mb-6">
                Activate your account to unlock unlimited practice questions, full exam modes, and progress tracking.
              </p>
              <div className="bg-primary-50 rounded-2xl p-4 mb-6">
                <p className="text-sm text-primary-700 font-medium">Activation includes:</p>
                <ul className="mt-2 space-y-1 text-sm text-primary-600">
                  <li>• Unlimited practice questions</li>
                  <li>• Full exam simulation</li>
                  <li>• Progress tracking & analytics</li>
                  <li>• Offline practice mode</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  toast.success('Activation flow coming soon!');
                  setShowActivationModal(false);
                }}
                className="w-full py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-all mb-3"
              >
                Activate Account
              </button>
              <button
                onClick={() => {
                  setShowActivationModal(false);
                  setStep('type');
                  setCurrentQuestion(0);
                  setSelectedAnswer(null);
                  setShowExplanation(false);
                  setBlockedQuestion(false);
                }}
                className="w-full py-3 text-neutral-500 font-medium hover:text-neutral-700 transition-colors"
              >
                Back to practice menu
              </button>
            </div>
          </div>
        )}

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
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setStep('type')} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="font-semibold text-neutral-900">
                  {config.mode === 'exam' ? 'Exam Mode' : 'Study Mode'} — {currentExam?.name || config.examType}
                </h2>
                <p className="text-xs text-neutral-500">Question {currentQuestion + 1} of {config.questionCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-neutral-500">Time Remaining</p>
                <p className="text-xl font-bold text-neutral-900 font-mono">{`${String(Math.floor(config.duration / 60)).padStart(2, '0')}:${String(config.duration % 60).padStart(2, '0')}:00`}</p>
              </div>
              <button onClick={() => setShowCalculator(!showCalculator)} className="p-3 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors" title="Calculator">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button onClick={() => setStep('type')} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">Exit</button>
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / config.questionCount) * 100}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-medium px-3 py-1 bg-primary-100 text-primary-700 rounded-full">Q{currentQuestion + 1}</span>
                <span className="text-xs text-neutral-500">{q.subject}</span>
              </div>
              <h3 className="text-lg text-neutral-900 mb-6 leading-relaxed">{q.question}</h3>
              <div className="grid grid-cols-2 gap-3">
                {q.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(currentQuestion, option.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedAnswer === option.id
                        ? option.id === q.correct
                          ? 'border-success-500 bg-success-50'
                          : 'border-error-500 bg-error-50'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        selectedAnswer === option.id
                          ? option.id === q.correct
                            ? 'bg-success-500 text-white'
                            : 'bg-error-500 text-white'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>{option.id}</span>
                      <span className="text-neutral-700">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>
              {showExplanation && config.mode === 'study' && (
                <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
                  <p className="font-medium text-primary-800 mb-1">Explanation</p>
                  <p className="text-primary-700 text-sm">{q.explanation}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <button onClick={() => { setCurrentQuestion(Math.max(0, currentQuestion - 1)); setSelectedAnswer(null); setShowExplanation(false); }} disabled={currentQuestion === 0} className="px-5 py-2.5 border-2 border-neutral-200 rounded-full text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                ← Previous
              </button>
              <button onClick={() => { setSelectedAnswer(null); setShowExplanation(false); if (currentQuestion < config.questionCount - 1) setCurrentQuestion(currentQuestion + 1); }} className="px-5 py-2.5 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-all">
                Next →
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm font-medium text-neutral-700 mb-3">Questions</p>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: Math.min(config.questionCount, 30) }).map((_, i) => (
                  <button key={i} onClick={() => { setCurrentQuestion(i); setSelectedAnswer(null); setShowExplanation(false); }}
                    className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${
                      i === currentQuestion ? 'bg-primary-500 text-neutral-900' : answers[i] ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}>{i + 1}</button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-primary-500 rounded" /> Current</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-success-100 rounded" /> Answered</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm font-medium text-neutral-700 mb-3">JAMB 8-Keys</p>
              <div className="grid grid-cols-4 gap-2">
                {['A', 'B', 'C', 'D', 'P', 'N', 'S', 'R'].map((key) => (
                  <button key={key} onClick={() => handleKeyPress(key.toLowerCase())}
                    className="py-2 bg-neutral-100 rounded-lg text-sm font-bold hover:bg-neutral-200 transition-colors"
                    title={key === 'P' ? 'Previous' : key === 'N' ? 'Next' : key === 'S' ? 'Skip' : key === 'R' ? 'Reveal' : `Option ${key}`}>{key}</button>
                ))}
              </div>
              <div className="mt-2 text-xs text-neutral-500 space-y-0.5">
                <p>A-D: Select answer</p>
                <p>P: Previous | N: Next</p>
                <p>S: Skip | R: Reveal</p>
              </div>
            </div>

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

            <button className="w-full py-3 bg-primary-500 text-neutral-900 rounded-xl font-semibold hover:bg-primary-400 transition-all"
              onClick={() => { toast.success('Exam submitted!'); setStep('type'); }}>
              Submit {config.mode === 'exam' ? 'Exam' : 'Practice'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Config Step (Session + Duration + Count) ──────────────────────────
  if (step === 'config') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <button onClick={() => setStep('subjects')} className="text-sm text-neutral-500 hover:text-neutral-700 mb-2 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to subjects
          </button>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Build your {currentExam?.name || config.examType} practice exam</h1>
          <p className="text-neutral-600">Select a past-question session and set your preferred question count.</p>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              {currentExam?.icon_url ? (
                <img src={currentExam.icon_url} alt="" className="w-7 h-7 object-contain" />
              ) : (
                <DefaultExamIcon className="w-7 h-7 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{currentExam?.name || config.examType}</h2>
              <p className="text-neutral-400">{config.subjects.length} subject{config.subjects.length !== 1 ? 's' : ''} selected</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-400">Questions</p>
              <p className="text-2xl font-bold">{config.questionCount}</p>
            </div>
          </div>
        </div>

        {/* Session Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">Past Question Session</h3>
          <p className="text-sm text-neutral-500 mb-4">Choose which year to practice from</p>
          <div className="grid grid-cols-5 gap-2">
            {sessions.map((year) => (
              <button key={year} onClick={() => setConfig({ ...config, session: year })}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${
                  config.session === year ? 'bg-primary-500 text-neutral-900' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}>{year}</button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">Question Count</h3>
          <p className="text-sm text-neutral-500 mb-4">How many questions do you want to practice?</p>
          <div className="flex items-center gap-4">
            {[10, 20, 30, 40, 50].map((count) => (
              <button key={count} onClick={() => setConfig({ ...config, questionCount: count })}
                className={`w-16 h-16 rounded-xl text-lg font-bold transition-all ${
                  config.questionCount === count ? 'bg-primary-500 text-neutral-900' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}>{count}</button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">Practice Duration</h3>
          <p className="text-sm text-neutral-500 mb-4">Set time limit for the practice session</p>
          <div className="flex gap-3">
            {durations.map((d) => (
              <button key={d.value} onClick={() => setConfig({ ...config, duration: d.value })}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  config.duration === d.value ? 'bg-neutral-900 text-white' : 'bg-white border-2 border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}>{d.label}</button>
            ))}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-neutral-500">Custom:</span>
              <input type="number" min={5} max={180} value={config.duration}
                onChange={(e) => setConfig({ ...config, duration: Number(e.target.value) || 60 })}
                className="w-20 px-3 py-2 border-2 border-neutral-200 rounded-xl text-center text-sm font-medium focus:border-primary-300 focus:outline-none" />
              <span className="text-sm text-neutral-500">min</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button onClick={() => setStep('subjects')} className="px-6 py-3 border-2 border-neutral-200 rounded-full font-medium text-neutral-700 hover:bg-neutral-50 transition-all">
            Cancel and return to dashboard
          </button>
          <div className="flex gap-3">
            <button onClick={() => { setConfig({ ...config, mode: 'study' }); setStep('practice'); }}
              className="px-6 py-3 border-2 border-neutral-200 rounded-full font-medium text-neutral-700 hover:bg-neutral-50 transition-all">
              Study Mode
            </button>
            <button onClick={() => { setConfig({ ...config, mode: 'exam' }); setStep('practice'); }}
              disabled={!config.session}
              className="px-8 py-3 bg-primary-500 text-neutral-900 rounded-full font-semibold hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              Start Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Subject Selection Step ────────────────────────────────────────────
  if (step === 'subjects') {
    const limit = getSubjectLimit();
    const selectedCount = config.subjects.length;

    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <button onClick={() => setStep('type')} className="text-sm text-neutral-500 hover:text-neutral-700 mb-2 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to exam types
          </button>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Build your {currentExam?.name || config.examType} practice exam</h1>
          <p className="text-neutral-600">Select subjects, choose a past-question session and set your preferred question count.</p>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              {currentExam?.icon_url ? (
                <img src={currentExam.icon_url} alt="" className="w-7 h-7 object-contain" />
              ) : (
                <DefaultExamIcon className="w-7 h-7 text-white" />
              )}
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
            <span className="text-sm text-neutral-500">{selectedCount} selected</span>
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
                const isSelected = config.subjects.includes(subject.name);
                const isMaxed = !isSelected && selectedCount >= limit;
                return (
                  <button
                    key={subject.id}
                    onClick={() => toggleSubject(subject.name)}
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
        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-neutral-600">
              <span className="font-semibold text-neutral-900">{currentExam?.name || config.examType}</span>
              {' • '}
              <span className="font-semibold text-neutral-900">{selectedCount}</span> subjects selected
            </p>
          </div>
          <button
            onClick={() => setStep('config')}
            disabled={selectedCount < 2}
            className="px-8 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ─── Exam Type Selection (Step 1) ─────────────────────────────────────
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Practice</h1>
        <p className="text-neutral-600">Choose your exam type and start practicing</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {examsLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <ExamCardSkeleton key={i} />
          ))
        ) : (
          exams.map((exam) => (
            <button
              key={exam.id}
              onClick={() => handleSelectExam(exam)}
              className="p-6 rounded-2xl border-2 text-left transition-all hover:border-neutral-300 bg-white hover:shadow-md"
            >
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center mb-3">
                {exam.icon_url ? (
                  <img src={exam.icon_url} alt="" className="w-5 h-5 object-contain" />
                ) : (
                  <DefaultExamIcon className="w-5 h-5 text-white" />
                )}
              </div>
              <h3 className="font-semibold text-neutral-900 text-lg">{exam.name}</h3>
              <p className="text-sm text-neutral-500 mt-1">{exam.description || `${exam.subject_count || 0} subjects • ${exam.question_count || 0} questions`}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
