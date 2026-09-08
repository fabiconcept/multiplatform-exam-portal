export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 mb-1">Total Students</h3>
          <p className="text-3xl font-bold">245</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 mb-1">Questions</h3>
          <p className="text-3xl font-bold">1,230</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 mb-1">Exams</h3>
          <p className="text-3xl font-bold">18</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500 mb-1">Exams Taken</h3>
          <p className="text-3xl font-bold">892</p>
        </div>
      </div>
    </div>
  );
}
