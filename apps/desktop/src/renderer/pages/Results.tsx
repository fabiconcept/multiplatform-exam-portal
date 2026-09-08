import React, { useEffect, useState } from 'react';
import { createApiClient } from '@exam-portal/api-client';
import type { ExamResult } from '@exam-portal/types';

const api = createApiClient({ baseUrl: 'http://localhost:4000' });

interface ResultsProps {
  setPendingSync: (n: number) => void;
}

export default function Results({ setPendingSync }: ResultsProps) {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { loadResults(); }, []);

  async function loadResults() {
    const res = await api.results.list();
    if (res.success && res.data) setResults(res.data);
    const pending = await window.electronAPI.offline.getPendingCount();
    setPendingSync(pending);
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const syncResult = await window.electronAPI.offline.sync();
      alert(`Synced: ${syncResult.synced}, Failed: ${syncResult.failed}`);
      await loadResults();
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Results</h2>
        <button onClick={handleSync} disabled={syncing} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
          {syncing ? 'Syncing...' : 'Sync Offline Data'}
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Exam</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Score</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr key={r.id} className="border-t">
                <td className="px-6 py-4">{r.exam?.title || 'Exam'}</td>
                <td className="px-6 py-4 font-semibold text-green-600">{r.percentage}%</td>
                <td className="px-6 py-4 text-gray-500">{new Date(r.completedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
