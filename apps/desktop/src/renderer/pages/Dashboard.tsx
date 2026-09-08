import React, { useEffect, useState } from 'react';
import { createApiClient } from '@exam-portal/api-client';

const api = createApiClient({ baseUrl: 'http://localhost:4000' });

export default function Dashboard() {
  const [stats, setStats] = useState({ exams: 0, completed: 0, avgScore: 0 });

  useEffect(() => {
    async function load() {
      const [examsRes, resultsRes] = await Promise.all([api.exams.list(), api.results.list()]);
      const exams = examsRes.success ? examsRes.data!.length : 0;
      const results = resultsRes.success ? resultsRes.data! : [];
      const avg = results.length > 0 ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length) : 0;
      setStats({ exams, completed: results.length, avgScore: avg });
    }
    load();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 mb-1">Available Exams</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.exams}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 mb-1">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 mb-1">Average Score</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.avgScore}%</p>
        </div>
      </div>
    </div>
  );
}
