import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null;

  const bgStyles = {
    success: 'bg-emerald-950 border-emerald-800 text-emerald-200',
    error: 'bg-rose-950 border-rose-800 text-rose-200',
    warning: 'bg-amber-950 border-amber-800 text-amber-200',
    info: 'bg-slate-900 border-slate-700 text-slate-200',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start justify-between p-3.5 rounded-xl border shadow-xl text-xs backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200 ${
            bgStyles[t.type] || bgStyles.info
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <span className="font-bold text-sm shrink-0">{icons[t.type]}</span>
            <span className="font-medium leading-relaxed">{t.message}</span>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="ml-3 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
