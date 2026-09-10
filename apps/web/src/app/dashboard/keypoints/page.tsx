'use client';

import { useState } from 'react';

const SubjectIcon = ({ id, className = 'w-5 h-5' }: { id: string; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    math: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    english: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    physics: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    chemistry: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  };
  return icons[id] || icons.math;
};

const subjects = [
  {
    id: 'math',
    name: 'Mathematics',
    topics: [
      { name: 'Number Bases', questions: 15, completed: true },
      { name: 'Fractions & Decimals', questions: 20, completed: true },
      { name: 'Indices & Logarithms', questions: 18, completed: false },
      { name: 'Sets & Venn Diagrams', questions: 12, completed: false },
      { name: 'Algebraic Expressions', questions: 22, completed: false },
      { name: 'Quadratic Equations', questions: 16, completed: false },
      { name: 'Statistics & Probability', questions: 14, completed: false },
      { name: 'Geometry', questions: 20, completed: false },
    ],
  },
  {
    id: 'english',
    name: 'English Language',
    topics: [
      { name: 'Comprehension', questions: 25, completed: true },
      { name: 'Summary Writing', questions: 15, completed: false },
      { name: 'Lexis & Structure', questions: 30, completed: false },
      { name: 'Oral Forms', questions: 20, completed: false },
      { name: 'Grammar', questions: 25, completed: false },
    ],
  },
  {
    id: 'physics',
    name: 'Physics',
    topics: [
      { name: 'Motion & Gravity', questions: 18, completed: true },
      { name: 'Waves & Optics', questions: 22, completed: false },
      { name: 'Electricity & Magnetism', questions: 20, completed: false },
      { name: 'Heat & Temperature', questions: 15, completed: false },
      { name: 'Nuclear Physics', questions: 12, completed: false },
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    topics: [
      { name: 'Atomic Structure', questions: 16, completed: false },
      { name: 'Chemical Bonding', questions: 18, completed: false },
      { name: 'Stoichiometry', questions: 20, completed: false },
      { name: 'Organic Chemistry', questions: 22, completed: false },
      { name: 'Acids & Bases', questions: 14, completed: false },
    ],
  },
];

export default function KeyPointsPage() {
  const [selectedSubject, setSelectedSubject] = useState('math');

  const currentSubject = subjects.find((s) => s.id === selectedSubject);
  const completedTopics = currentSubject?.topics.filter((t) => t.completed).length || 0;
  const totalTopics = currentSubject?.topics.length || 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Key Points</h1>
        <p className="text-neutral-600">Study materials and key topics from major subjects</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Subject Tabs */}
        <div className="space-y-2">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                selectedSubject === subject.id
                  ? 'bg-primary-500 text-neutral-900 font-semibold'
                  : 'bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <SubjectIcon id={subject.id} className="w-5 h-5" />
                <span>{subject.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Topics List */}
        <div className="col-span-3">
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900">{currentSubject?.name} Topics</h2>
              <span className="text-sm text-neutral-500">
                {completedTopics}/{totalTopics} completed
              </span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {currentSubject?.topics.map((topic, index) => (
              <div
                key={topic.name}
                className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    topic.completed ? 'bg-success-100 text-success-600' : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {topic.completed ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{topic.name}</h3>
                    <p className="text-sm text-neutral-500">{topic.questions} questions</p>
                  </div>
                </div>
                <button className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  topic.completed
                    ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    : 'bg-primary-500 text-neutral-900 hover:bg-primary-400'
                }`}>
                  {topic.completed ? 'Review' : 'Study'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
