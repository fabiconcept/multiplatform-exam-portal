export default function AdminQuestions() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Questions</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Add Question</button>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Question</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Subject</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Difficulty</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-t">
                <td className="px-6 py-4">What is {i} + {i}?</td>
                <td className="px-6 py-4">Mathematics</td>
                <td className="px-6 py-4">Easy</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 text-sm mr-2">Edit</button>
                  <button className="text-red-600 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
