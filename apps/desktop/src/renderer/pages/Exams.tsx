import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createApiClient } from '@exam-portal/api-client';
import type { Exam } from '@exam-portal/types';

const api = createApiClient({ baseUrl: 'http://localhost:4000' });

export default function Exams() {
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    api.exams.list().then(res => {
      if (res.success && res.data) setExams(res.data);
    });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Exams</h2>
      <div className="space-y-3">
        {exams.map(exam => (
          <Link key={exam.id} to={`/exams/${exam.id}`} className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{exam.title}</h3>
                <p className="text-sm text-gray-500">{exam.totalQuestions} questions · {exam.durationMins} minutes</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Start</button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
