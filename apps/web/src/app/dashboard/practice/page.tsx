'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

// ─── Exam Type Config ────────────────────────────────────────────────────────
type ExamType = 'utme' | 'mock' | 'postutme' | 'waec' | 'bece' | 'ncee';
type Step = 'type' | 'subjects' | 'config' | 'practice';
type PracticeMode = 'study' | 'exam';

interface ExamConfig {
  examType: ExamType;
  subjects: string[];
  session: string;
  questionCount: number;
  duration: number; // minutes
  mode: PracticeMode;
}

const ExamIcon = ({ type, className = 'w-6 h-6' }: { type: ExamType; className?: string }) => {
  const icons: Record<ExamType, JSX.Element> = {
    utme: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    mock: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    postutme: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
    waec: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    bece: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    ncee: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  };
  return icons[type];
};

const examTypeMeta: Record<ExamType, { name: string; description: string; color: string }> = {
  utme:    { name: 'JAMB/UTME',     description: '180 questions, 4 subjects, 2 hours',    color: 'bg-primary-500' },
  mock:    { name: 'JAMB Mock',      description: 'Practice for CBT mock exam',            color: 'bg-accent-500' },
  postutme:{ name: 'Post-UTME',      description: 'University screening practice',         color: 'bg-success-500' },
  waec:    { name: 'WAEC/SSCE',      description: 'Senior secondary certificate exam',     color: 'bg-warning-500' },
  bece:    { name: 'BECE',           description: 'Junior secondary certificate exam',     color: 'bg-background-500' },
  ncee:    { name: 'NCEE',           description: 'National Common Entrance Examination',  color: 'bg-neutral-500' },
};

// ─── Subject Data ────────────────────────────────────────────────────────────
const jambSubjects = [
  { name: 'Use of English',           sessions: 30, compulsory: true },
  { name: 'Mathematics',              sessions: 25 },
  { name: 'Physics',                  sessions: 26 },
  { name: 'Chemistry',                sessions: 26 },
  { name: 'Biology',                  sessions: 26 },
  { name: 'Economics',                sessions: 26 },
  { name: 'Government',               sessions: 26 },
  { name: 'Literature in English',    sessions: 35 },
  { name: 'Christian Religious Studies', sessions: 26 },
  { name: 'Islamic Studies',          sessions: 24 },
  { name: 'Commerce',                 sessions: 26 },
  { name: 'Geography',                sessions: 24 },
  { name: 'History',                  sessions: 15 },
  { name: 'Home Economics',           sessions: 12 },
  { name: 'Principles of Accounts',   sessions: 25 },
  { name: 'Computer Studies',         sessions: 6 },
  { name: 'Physical and Health Education', sessions: 7 },
  { name: 'French',                   sessions: 13 },
  { name: 'Agriculture',              sessions: 11 },
  { name: 'Art',                      sessions: 9 },
  { name: 'Igbo Language',            sessions: 13 },
  { name: 'Yoruba Language',          sessions: 12 },
  { name: 'Hausa',                    sessions: 13 },
  { name: 'Arabic',                   sessions: 6 },
  { name: 'Music',                    sessions: 5 },
  { name: 'Lekki Headmaster',         sessions: 4 },
];

const waecSubjects = [
  { name: 'Economics',                    sessions: 15 },
  { name: 'Commerce',                     sessions: 15 },
  { name: 'Biology',                      sessions: 15 },
  { name: 'General Mathematics',          sessions: 15 },
  { name: 'Civic Education',              sessions: 12 },
  { name: 'Christian Religious Studies',  sessions: 15 },
  { name: 'Animal Husbandry',             sessions: 10 },
  { name: 'Computer Studies',             sessions: 12 },
  { name: 'English Language',             sessions: 15 },
  { name: 'Financial Accounting',         sessions: 15 },
  { name: 'Geography',                    sessions: 15 },
  { name: 'Government',                   sessions: 15 },
  { name: 'Marketing',                    sessions: 10 },
  { name: 'Agricultural Science',         sessions: 14 },
  { name: 'Physics',                      sessions: 15 },
  { name: 'Chemistry',                    sessions: 15 },
  { name: 'Data Processing',              sessions: 12 },
  { name: 'Literature in English',        sessions: 15 },
  { name: 'Office Practice',              sessions: 8 },
  { name: 'Visual Art',                   sessions: 10 },
  { name: 'Book Keeping',                 sessions: 11 },
  { name: 'Catering Craft Practice',      sessions: 13 },
  { name: 'Fisheries',                    sessions: 11 },
  { name: 'Foods and Nutrition',          sessions: 7 },
  { name: 'French',                       sessions: 14 },
  { name: 'Further Mathematics',          sessions: 5 },
  { name: 'Hausa',                        sessions: 4 },
  { name: 'Health Education',             sessions: 8 },
  { name: 'History',                      sessions: 11 },
  { name: 'Home Management',              sessions: 14 },
  { name: 'Igbo',                         sessions: 18 },
  { name: 'Islamic Studies',              sessions: 12 },
  { name: 'Music',                        sessions: 5 },
  { name: 'Yoruba',                       sessions: 18 },
  { name: 'Technical Drawing',            sessions: 5 },
  { name: 'Garment Making',               sessions: 4 },
  { name: 'Arabic',                       sessions: 12 },
];

const beceSubjects = [
  { name: 'Basic Science',                   sessions: 11 },
  { name: 'English Language',                sessions: 18 },
  { name: 'Mathematics',                     sessions: 19 },
  { name: 'Agricultural Science',            sessions: 11 },
  { name: 'Creative Arts & Culture',         sessions: 7 },
  { name: 'Basic Technology',                sessions: 10 },
  { name: 'Business Studies',                sessions: 20 },
  { name: 'Christian Religious Studies',     sessions: 17 },
  { name: 'Civic Education',                 sessions: 11 },
  { name: 'Home Economics',                  sessions: 11 },
  { name: 'Physical and Health Education',   sessions: 7 },
  { name: 'Social Studies',                  sessions: 11 },
  { name: 'Computer Studies',                sessions: 10 },
  { name: 'History',                         sessions: 6 },
  { name: 'French',                          sessions: 7 },
  { name: 'Hausa L2',                        sessions: 1 },
  { name: 'Hausa L1',                        sessions: 2 },
  { name: 'Security Education',              sessions: 2 },
  { name: 'Igbo L1',                         sessions: 3 },
  { name: 'Igbo L2',                         sessions: 1 },
  { name: 'Islamic Religious Studies',       sessions: 6 },
  { name: 'Yoruba',                          sessions: 3 },
];

const nceeSubjects = [
  { name: 'English Language and Social Studies',                sessions: 15 },
  { name: 'Verbal',                                             sessions: 15 },
  { name: 'Mathematics and General Science',                   sessions: 15 },
  { name: 'Quantitative Reasoning and Vocational Aptitude',    sessions: 15 },
];

const subjectsByExam: Record<ExamType, typeof jambSubjects> = {
  utme: jambSubjects,
  mock: jambSubjects,
  postutme: jambSubjects,
  waec: waecSubjects,
  bece: beceSubjects,
  ncee: nceeSubjects,
};

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

// ─── Component ───────────────────────────────────────────────────────────────
export default function PracticePage() {
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

  const availableSubjects = subjectsByExam[config.examType];
  const filteredSubjects = availableSubjects.filter((s) =>
    s.name.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const toggleSubject = (name: string) => {
    const subject = availableSubjects.find((s) => s.name === name);
    if (subject?.compulsory) return;
    setConfig((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(name)
        ? prev.subjects.filter((s) => s !== name)
        : [...prev.subjects, name].slice(0, 9),
    }));
  };

  const getSubjectLimit = () => {
    switch (config.examType) {
      case 'utme':
      case 'mock':
      case 'postutme':
        return 4;
      case 'waec':
      case 'bece':
        return 9;
      case 'ncee':
        return 4;
      default:
        return 9;
    }
  };

  const handleCalcInput = (value: string) => {
    if (value === 'C') setCalcDisplay('0');
    else if (value === 'DEL') setCalcDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    else if (value === '=') {
      try { setCalcDisplay(String(eval(calcDisplay))); } catch { setCalcDisplay('Error'); }
    } else setCalcDisplay((prev) => (prev === '0' ? value : prev + value));
  };

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

  // ─── Practice / CBT View ─────────────────────────────────────────────────
  if (step === 'practice') {
    const q = sampleQuestions[currentQuestion % sampleQuestions.length];
    return (
      <div className="p-8" onKeyDown={(e) => handleKeyPress(e.key)} tabIndex={0}>
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
                  {config.mode === 'exam' ? 'Exam Mode' : 'Study Mode'} — {examTypeMeta[config.examType].name}
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

  // ─── Config Step (Session + Duration + Count) ─────────────────────────────
  if (step === 'config') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <button onClick={() => setStep('subjects')} className="text-sm text-neutral-500 hover:text-neutral-700 mb-2 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to subjects
          </button>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Build your {examTypeMeta[config.examType].name} practice exam</h1>
          <p className="text-neutral-600">Select a past-question session and set your preferred question count.</p>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><ExamIcon type={config.examType} className="w-7 h-7 text-white" /></div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{examTypeMeta[config.examType].name}</h2>
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

  // ─── Subject Selection Step ───────────────────────────────────────────────
  if (step === 'subjects') {
    const limit = getSubjectLimit();
    const compulsory = availableSubjects.filter((s) => s.compulsory);
    const selectedCount = config.subjects.length + compulsory.length;

    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <button onClick={() => setStep('type')} className="text-sm text-neutral-500 hover:text-neutral-700 mb-2 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to exam types
          </button>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Build your {examTypeMeta[config.examType].name} practice exam</h1>
          <p className="text-neutral-600">Select subjects, choose a past-question session and set your preferred question count.</p>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><ExamIcon type={config.examType} className="w-7 h-7 text-white" /></div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{examTypeMeta[config.examType].name}</h2>
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

          {/* Compulsory Subjects */}
          {compulsory.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-primary-600 uppercase tracking-wider mb-2">Compulsory</p>
              <div className="grid grid-cols-4 gap-3">
                {compulsory.map((subject) => (
                  <div key={subject.name} className="p-4 rounded-2xl border-2 border-primary-500 bg-primary-50 cursor-default">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm text-neutral-900">{subject.name}</h3>
                      <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-primary-600">{subject.sessions} session(s) available</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Subjects */}
          <div className="grid grid-cols-4 gap-3">
            {filteredSubjects.filter((s) => !s.compulsory).map((subject) => {
              const isSelected = config.subjects.includes(subject.name);
              const isMaxed = !isSelected && selectedCount >= limit;
              return (
                <button
                  key={subject.name}
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
                  <p className="text-xs text-neutral-500">{subject.sessions} session(s) available</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary + Continue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-neutral-600">
              <span className="font-semibold text-neutral-900">{examTypeMeta[config.examType].name}</span>
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

  // ─── Exam Type Selection (Step 1) ─────────────────────────────────────────
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Practice</h1>
        <p className="text-neutral-600">Choose your exam type and start practicing</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(Object.keys(examTypeMeta) as ExamType[]).map((id) => {
          const exam = examTypeMeta[id];
          return (
            <button
              key={id}
              onClick={() => { setConfig({ ...config, examType: id, subjects: [] }); setStep('subjects'); }}
              className={`p-6 rounded-2xl border-2 text-left transition-all hover:border-neutral-300 bg-white hover:shadow-md`}
            >
              <div className={`w-10 h-10 ${exam.color} rounded-xl flex items-center justify-center mb-3`}><ExamIcon type={id} className="w-5 h-5 text-white" /></div>
              <h3 className="font-semibold text-neutral-900 text-lg">{exam.name}</h3>
              <p className="text-sm text-neutral-500 mt-1">{exam.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
