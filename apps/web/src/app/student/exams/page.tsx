import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exams',
};

export default function StudentExams() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Available Exams</h2>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Mathematics Practice {i}</h3>
              <p className="text-sm text-gray-500">40 questions · 60 minutes</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Start</button>
          </div>
        ))}
      </div>
    </div>
  );
}
