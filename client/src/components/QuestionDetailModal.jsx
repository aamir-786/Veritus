import React from 'react';
import { X, Sparkles, ShieldAlert, Clock, DollarSign, Zap, Layers, Award, CheckCircle2 } from 'lucide-react';

export default function QuestionDetailModal({ question, onClose, onAskCopilot }) {
  if (!question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#141C2E] border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#141C2E]/95 backdrop-blur border-b border-slate-800 p-6 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                Question #{question.question_number}
              </span>
              <span className="badge-tag badge-domain">{question.domain}</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white leading-snug">
              {question.title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Tag Taxonomy Bar */}
        <div className="p-6 bg-slate-900/50 border-b border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Regulator Pressure
            </div>
            <div className="font-semibold text-white">{question.regulator_pressure} Scrutiny</div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Payback ROI
            </div>
            <div className="font-semibold text-amber-300">{question.payback}</div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Implementation Cost
            </div>
            <div className="font-semibold text-emerald-300">{question.cost}</div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Target Duration
            </div>
            <div className="font-semibold text-white">{question.duration}</div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 text-slate-300 text-sm leading-relaxed">
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <h4 className="font-display font-semibold text-amber-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> Leadership Trait Required
            </h4>
            <p className="text-white font-medium text-sm">
              {question.leadership_traits} — ({question.tier})
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-white mb-3">
              Executive Guidance & Strategic Implementation
            </h3>
            <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-line leading-relaxed">
              {question.guidance_text}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-between bg-slate-900/80">
          <button
            onClick={() => {
              onClose();
              onAskCopilot(question);
            }}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Tailor to My Organization with AI Copilot
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
