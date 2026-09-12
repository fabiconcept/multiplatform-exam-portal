'use client';

import { useState, useEffect } from 'react';

const shortcuts = [
  { key: '?', description: 'Show keyboard shortcuts' },
  { key: 'Esc', description: 'Close modal / Exit practice' },
  { key: 'A-D', description: 'Select answer option (during practice)' },
  { key: 'P', description: 'Previous question (during practice)' },
  { key: 'N', description: 'Next question (during practice)' },
  { key: '1-9', description: 'Jump to question by number (during practice)' },
];

export function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
      <div
        className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Keyboard Shortcuts</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-3">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-2">
              <span className="text-sm text-neutral-600">{s.description}</span>
              <kbd className="px-2.5 py-1 bg-neutral-100 rounded-lg text-xs font-mono font-medium text-neutral-700 border border-neutral-200">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-400 mt-6 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-600">?</kbd> anytime to toggle this panel
        </p>
      </div>
    </div>
  );
}
