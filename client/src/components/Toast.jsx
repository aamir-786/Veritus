import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in-slide-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${type === 'success' ? 'bg-white border-emerald-200 text-slate-800' : 'bg-white border-rose-200 text-slate-800'}`}>
        {type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : (
          <XCircle className="w-5 h-5 text-rose-500" />
        )}
        <p className="text-sm font-semibold pr-4">{message}</p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
