export default function AdminExams() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Exams</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Create Exam</button>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Subject</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Duration</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Questions</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2].map((i) => (
              <tr key={i} className="border-t">
                <td className="px-6 py-4">Exam {i}</td>
                <td className="px-6 py-4">Mathematics</td>
                <td className="px-6 py-4">60 mins</td>
                <td className="px-6 py-4">40</td>
                <td className="px-6 py-4"><span className="text-green-600 text-sm">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
