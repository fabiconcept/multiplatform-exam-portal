import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOnline: boolean;
  pendingSync: number;
}

export default function Sidebar({ isOnline, pendingSync }: SidebarProps) {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/exams', label: 'Exams' },
    { to: '/results', label: 'Results' },
  ];

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-blue-800">Fabi CBT</h1>
        <p className="text-xs text-gray-500">Desktop</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`block px-3 py-2 rounded-lg text-sm ${
              location.pathname === link.to
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-gray-600">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        {pendingSync > 0 && (
          <p className="text-xs text-orange-600 mt-1">{pendingSync} results pending sync</p>
        )}
      </div>
    </aside>
  );
}
