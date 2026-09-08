import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Results',
};

export default function StudentResults() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Results</h2>
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
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-t">
                <td className="px-6 py-4">Mathematics Practice {i}</td>
                <td className="px-6 py-4 font-semibold text-green-600">85%</td>
                <td className="px-6 py-4 text-gray-500">Sep {i}, 2026</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
