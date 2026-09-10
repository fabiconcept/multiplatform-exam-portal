'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

const initialBookmarks = [
  {
    id: 1,
    subject: 'Mathematics',
    question: 'If 3x + 7 = 22, what is the value of x?',
    options: ['A. 3', 'B. 5', 'C. 7', 'D. 15'],
    correct: 'B',
    date: '2 hours ago',
  },
  {
    id: 2,
    subject: 'English Language',
    question: 'Choose the option that best completes: "The teacher _____ the students to submit their assignments."',
    options: ['A. told', 'B. say', 'C. tells', 'D. said'],
    correct: 'A',
    date: 'Yesterday',
  },
  {
    id: 3,
    subject: 'Physics',
    question: 'What is the SI unit of force?',
    options: ['A. Joule', 'B. Watt', 'C. Newton', 'D. Pascal'],
    correct: 'C',
    date: '2 days ago',
  },
  {
    id: 4,
    subject: 'Chemistry',
    question: 'Which of the following is a noble gas?',
    options: ['A. Oxygen', 'B. Nitrogen', 'C. Neon', 'D. Hydrogen'],
    correct: 'C',
    date: '3 days ago',
  },
];

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [filter, setFilter] = useState('all');

  const filteredBookmarks = filter === 'all' 
    ? bookmarks 
    : bookmarks.filter((b) => b.subject.toLowerCase().includes(filter));

  const removeBookmark = (id: number) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    toast.success('Bookmark removed');
  };

  const clearAll = () => {
    setBookmarks([]);
    toast.success('All bookmarks cleared');
  };

  const subjects = ['all', ...new Set(bookmarks.map((b) => b.subject.toLowerCase()))];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Bookmarks</h1>
          <p className="text-neutral-600">{bookmarks.length} saved questions</p>
        </div>
        {bookmarks.length > 0 && (
          <button
            onClick={clearAll}
            className="px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 rounded-lg transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setFilter(subject)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
              filter === subject
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Bookmarks List */}
      {filteredBookmarks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No bookmarks yet</h3>
          <p className="text-neutral-500">Save questions during practice to review them later</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map((bookmark) => (
            <div key={bookmark.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
                    {bookmark.subject}
                  </span>
                  <span className="text-xs text-neutral-400">{bookmark.date}</span>
                </div>
                <button
                  onClick={() => removeBookmark(bookmark.id)}
                  className="p-2 text-neutral-400 hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p className="text-neutral-900 mb-4">{bookmark.question}</p>
              <div className="grid grid-cols-2 gap-2">
                {bookmark.options.map((option) => (
                  <div
                    key={option}
                    className={`p-3 rounded-xl text-sm ${
                      option.startsWith(bookmark.correct)
                        ? 'bg-success-50 border border-success-200 text-success-700'
                        : 'bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
