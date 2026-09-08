import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createApiClient } from '@exam-portal/api-client';
import type { Exam, Question } from '@exam-portal/types';

const api = createApiClient({ baseUrl: 'http://localhost:4000' });

interface ExamDetailProps {
  isOnline: boolean;
}

export default function ExamDetail({ isOnline }: ExamDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<(Exam & { questions: Question[] }) | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      api.exams.get(id).then(res => {
        if (res.success && res.data) setExam(res.data as any);
      });
    }
  }, [id]);

  if (!exam) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  const current = exam.questions[currentIndex];

  async function submitExam() {
    const answerArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer }));
    try {
      if (isOnline) {
        const res = await api.exams.submit(exam.id, answerArray);
        if (res.success) {
          alert(`Score: ${res.data?.percentage}%`);
          navigate('/results');
        }
      } else {
        await window.electronAPI.offline.saveResult({ examId: exam.id, answers: answerArray });
        alert('Result saved offline. It will sync when you reconnect.');
        navigate('/results');
      }
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{exam.title}</h2>
        <span className="text-sm text-gray-500">Question {currentIndex + 1}/{exam.questions.length}</span>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <p className="text-lg mb-4">{current?.text}</p>
        <div className="space-y-2">
          {current?.options?.map((opt: any) => (
            <button
              key={opt.label}
              onClick={() => setAnswers({ ...answers, [current.id]: opt.label })}
              className={`w-full text-left p-3 rounded-lg border ${
                answers[current?.id] === opt.label ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {opt.label}. {opt.text}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="px-4 py-2 border rounded-lg disabled:opacity-50">Previous</button>
        {currentIndex < exam.questions.length - 1 ? (
          <button onClick={() => setCurrentIndex(currentIndex + 1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Next</button>
        ) : (
          <button onClick={submitExam} className="px-4 py-2 bg-green-600 text-white rounded-lg">Submit</button>
        )}
      </div>
    </div>
  );
}
