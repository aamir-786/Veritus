import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';

export default function ModuleManagementModal({ isOpen, module, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (module) {
      setTitle(module.title || '');
    }
  }, [module]);

  if (!isOpen || !module) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-display font-bold text-lg text-slate-900">Manage Module</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Module Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-between p-5 bg-slate-50 border-t border-slate-100">
          <button
            onClick={() => { onDelete(module.id); onClose(); }}
            className="flex items-center gap-1.5 px-4 py-2 text-rose-600 hover:bg-rose-100 rounded-lg text-sm font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete Module
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { onSave(module.id, title); onClose(); }}
              className="flex items-center gap-1.5 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
