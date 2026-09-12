'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function RouteProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPath) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
        setPrevPath(pathname);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, prevPath]);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    window.addEventListener('beforeunload', handleStart);
    return () => {
      window.removeEventListener('beforeunload', handleStart);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1">
      <div className="h-full bg-primary-500 animate-[loading_1.5s_ease-in-out_infinite] rounded-full" />
      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
