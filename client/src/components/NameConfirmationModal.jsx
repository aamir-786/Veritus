import React, { useState, useEffect } from 'react';
import { Award, ShieldAlert, Lock, CheckCircle2, X } from 'lucide-react';

export default function NameConfirmationModal({ isOpen, onClose, onConfirm, initialName = '', courseTitle = '' }) {
  const [name, setName] = useState(initialName);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(initialName);
    setConfirmed(false);
    setError('');
  }, [initialName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full legal name.');
      return;
    }
    if (!confirmed) {
      setError('Please check the box to confirm your legal name verification.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onConfirm(name.trim());
    } catch (err) {
      setError(err.message || 'Failed to issue certificate credential.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in-fade">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in-zoom">
        
        {/* Top Header Accent */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] text-amber-300 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" /> Permanent Credential Locking
              </div>
              <h2 className="font-display text-lg font-bold text-white leading-tight">Verify Certificate Name</h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium text-slate-800">
          {courseTitle && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">Masterclass Program</span>
              <span className="font-bold text-slate-900 text-xs">{courseTitle}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-slate-900 font-bold">Official Legal Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alexander Vance"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 font-bold text-sm"
            />
            <p className="text-[10px] text-slate-500">This exact name will be printed on your executive certificate & verified credential link.</p>
          </div>

          {/* Security Notice Alert */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-950">Security Protection Notice</span>
              Once issued, this certificate credential will be permanently bound to this name and cannot be changed even if you alter your profile name in the future.
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900/20"
            />
            <span className="text-[11px] text-slate-700 font-semibold leading-snug">
              I verify that this is my official legal name and understand it cannot be changed after issuance.
            </span>
          </label>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !confirmed || !name.trim()}
              className={`px-5 py-2.5 rounded-xl text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-2 ${
                loading || !confirmed || !name.trim()
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
              }`}
            >
              {loading ? (
                'Locking Name & Issuing...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Issue & Lock Certificate
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
