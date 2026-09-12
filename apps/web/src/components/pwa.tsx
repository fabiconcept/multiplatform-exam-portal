'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    deferredPrompt?: any;
  }
}

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            }
          });
        })
        .catch(() => {});
    }
  }, []);

  return null;
}

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      window.deferredPrompt = e;
      const wasDismissed = localStorage.getItem('pwa-install-dismissed');
      if (!wasDismissed) {
        setShow(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      setShow(false);
      window.deferredPrompt = null;
    };
    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  const handleInstall = async () => {
    if (!window.deferredPrompt) return;
    window.deferredPrompt.prompt();
    const { outcome } = await window.deferredPrompt.userChoice;
    if (outcome === 'dismissed') {
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
    window.deferredPrompt = null;
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setDismissed(true);
    setShow(false);
  };

  if (!show || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-50">
      <div className="bg-neutral-900 text-white rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-neutral-900">E</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Install ExamScholars</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Add to your home screen for quick access and offline practice
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 py-2 bg-primary-500 text-neutral-900 text-sm font-semibold rounded-lg hover:bg-primary-400 transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-neutral-400 text-sm hover:text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
