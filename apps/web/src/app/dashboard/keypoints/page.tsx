'use client';

import { useState, useEffect, useCallback } from 'react';
import { examApi, type Exam, type Subject, type Topic } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

const SubjectIcon = ({ name, className = 'w-5 h-5' }: { name: string; className?: string }) => {
  const lower = name.toLowerCase();
  if (lower.includes('math')) return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
  if (lower.includes('english') || lower.includes('language')) return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
  if (lower.includes('physics')) return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
  if (lower.includes('chemistry')) return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
  if (lower.includes('biology')) return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
  if (lower.includes('government') || lower.includes('civic')) return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
  if (lower.includes('literature') || lower.includes('lit')) return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
};

export default function KeyPointsPage() {
  const { token } = useAuthStore();
  const [exams, setExams] = useState<Exam[]>([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setExamsLoading(true);
    examApi.listExams(token)
      .then(res => {
        const examList = res.exams || [];
        setExams(examList);
        if (examList.length > 0) setSelectedExamId(examList[0].id);
      })
      .catch(() => toast.error('Failed to load exams'))
      .finally(() => setExamsLoading(false));
  }, [token]);

  const fetchSubjects = useCallback(async () => {
    if (!token || !selectedExamId) return;
    setSubjectsLoading(true);
    try {
      const res = await examApi.listExamSubjects(token, selectedExamId);
      setSubjects(res.subjects || []);
      setSelectedSubjectId(res.subjects?.[0]?.id || null);
    } catch {
      toast.error('Failed to load subjects');
    } finally {
      setSubjectsLoading(false);
    }
  }, [token, selectedExamId]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const fetchTopics = useCallback(async () => {
    if (!token || !selectedSubjectId) return;
    setTopicsLoading(true);
    try {
      const res = await examApi.listSubjectTopics(token, selectedSubjectId);
      setTopics(res.topics || []);
    } catch {
      setTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  }, [token, selectedSubjectId]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  if (examsLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="mb-8">
          <div className="h-8 w-48 bg-neutral-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-72 bg-neutral-100 rounded animate-pulse" />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
          <div className="h-6 w-32 bg-neutral-200 rounded mb-4" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-neutral-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <div className="p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">Key Points</h1>
          <p className="text-neutral-600">Study materials and key topics from major subjects</p>
        </div>
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm text-center">
          <p className="text-neutral-500">No exams available. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">Key Points</h1>
        <p className="text-neutral-600">Study materials and key topics from major subjects</p>
      </div>

      {/* Exam Tabs */}
      {exams.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {exams.map(exam => (
            <button
              key={exam.id}
              onClick={() => setSelectedExamId(exam.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedExamId === exam.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {exam.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        {/* Subject Tabs */}
        <div className="space-y-2">
          {subjectsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-white rounded-xl animate-pulse" />
            ))
          ) : (
            subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedSubjectId === subject.id
                    ? 'bg-primary-500 text-neutral-900 font-semibold'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <SubjectIcon name={subject.name} className="w-5 h-5" />
                  <span className="truncate">{subject.name}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Topics List */}
        <div className="col-span-3">
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900">
                {currentSubject?.name || 'Select a subject'} Topics
              </h2>
              <span className="text-sm text-neutral-500">
                {topics.length} topic{topics.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full" style={{ width: '0%' }} />
            </div>
          </div>

          {topicsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-neutral-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-neutral-200 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-neutral-100 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : topics.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
              <p className="text-neutral-500">No topics available for this subject yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topics.map((topic, index) => (
                <div
                  key={topic.id}
                  className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-neutral-100 text-neutral-500">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{topic.name}</h3>
                      <p className="text-sm text-neutral-500">{currentSubject?.name}</p>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/practice`}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-primary-500 text-neutral-900 hover:bg-primary-400 transition-colors"
                  >
                    Study
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
