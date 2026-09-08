import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Exams from './pages/Exams';
import ExamDetail from './pages/ExamDetail';
import Results from './pages/Results';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';

export default function App() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [pendingSync, setPendingSync] = React.useState(0);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar isOnline={isOnline} pendingSync={pendingSync} />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/exams/:id" element={<ExamDetail isOnline={isOnline} />} />
            <Route path="/results" element={<Results setPendingSync={setPendingSync} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
