'use client';

import { bookmarkApi, BookmarkedQuestion } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [clearing, setClearing] = useState(false);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    fetchBookmarks();
  }, [token]);

  const fetchBookmarks = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await bookmarkApi.listBookmarks(token);
      setBookmarks(data.bookmarks);
    } catch (err) {
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (questionId: string) => {
    if (!token) return;
    try {
      await bookmarkApi.deleteBookmark(token, questionId);
      setBookmarks((prev) => prev.filter((b) => b.question_id !== questionId));
      toast.success('Bookmark removed');
    } catch {
      toast.error('Failed to remove bookmark');
    }
  };

  const clearAll = async () => {
    if (!token || bookmarks.length === 0) return;
    setClearing(true);
    try {
      await Promise.all(
        bookmarks.map((b) => bookmarkApi.deleteBookmark(token, b.question_id))
      );
      setBookmarks([]);
      toast.success('All bookmarks cleared');
    } catch {
      toast.error('Failed to clear all bookmarks');
    } finally {
      setClearing(false);
    }
  };

  const subjects = ['all', ...Array.from(new Set(bookmarks.map((b) => b.subject_name).filter(Boolean) as string[]))];

  const filteredBookmarks = bookmarks
    .filter((b) => filter === 'all' || b.subject_name === filter)
    .filter((b) =>
      search === '' ||
      b.question_text.toLowerCase().includes(search.toLowerCase()) ||
      b.subject_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.exam_type?.toLowerCase().includes(search.toLowerCase())
    );

  const difficultyColor = (d: string) => {
    switch (d.toLowerCase()) {
      case 'easy':
        return 'bg-success-100 text-success-700';
      case 'medium':
        return 'bg-warning-100 text-warning-700';
      case 'hard':
        return 'bg-error-100 text-error-700';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="mb-8">
          <div className="h-9 w-48 bg-neutral-200 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-32 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-24 bg-neutral-200 rounded-full animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-5 w-20 bg-neutral-200 rounded-full animate-pulse" />
                <div className="h-5 w-16 bg-neutral-200 rounded-full animate-pulse" />
                <div className="h-5 w-14 bg-neutral-200 rounded-full animate-pulse" />
              </div>
              <div className="h-5 w-full bg-neutral-200 rounded animate-pulse mb-2" />
              <div className="h-5 w-3/4 bg-neutral-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">Bookmarks</h1>
          <p className="text-neutral-600">{bookmarks.length} saved questions</p>
        </div>
        {bookmarks.length > 0 && (
          <button
            onClick={clearAll}
            disabled={clearing}
            className="px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {clearing ? 'Clearing...' : 'Clear all'}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookmarks..."
            className="w-full pl-10 pr-4 py-2.5 border-2 border-neutral-200 rounded-xl text-sm focus:border-primary-300 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      {subjects.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
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
      )}

      {/* Bookmarks List */}
      {filteredBookmarks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No bookmarks yet</h3>
          <p className="text-neutral-500 mb-4">Save questions during practice to review them later</p>
          <Link
            href="/dashboard/practice"
            className="inline-block px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Go to Practice
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map((bookmark) => (
            <div key={bookmark.id} className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {bookmark.subject_name && (
                    <span className="text-xs font-medium px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
                      {bookmark.subject_name}
                    </span>
                  )}
                  <span className="text-xs font-medium px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                    {bookmark.exam_type}
                  </span>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${difficultyColor(bookmark.difficulty)}`}>
                    {bookmark.difficulty}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Date(bookmark.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <button
                  onClick={() => removeBookmark(bookmark.question_id)}
                  className="p-2 text-neutral-400 hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors shrink-0"
                  title="Remove bookmark"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p className="text-neutral-900 leading-relaxed">
                {bookmark.question_text.length > 200
                  ? bookmark.question_text.slice(0, 200) + '...'
                  : bookmark.question_text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
