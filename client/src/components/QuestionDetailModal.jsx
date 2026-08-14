import React from 'react';
import { X, Sparkles, ShieldAlert, Clock, DollarSign, Zap, Layers, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default function QuestionDetailModal({ question, onClose, onAskCopilot }) {
  const { user } = useAuth();
  if (!question) return null;

  // Split guidance text into teaser snippet vs locked body
  const lines = question.guidance_text ? question.guidance_text.split('\n\n') : [];
  const teaserSnippet = lines.slice(0, 2).join('\n\n');
  const lockedBody = lines.slice(2).join('\n\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative text-slate-900">
        
        {/* Header */}
        <div className="shrink-0 bg-white border-b border-slate-100 px-6 py-5 flex items-start justify-between rounded-t-2xl z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                Question #{question.question_number}
              </span>
              <span className="badge-tag badge-domain">{question.domain}</span>
            </div>
            <h2 className="font-display text-xl font-extrabold text-slate-900 leading-snug">
              {question.title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          
          {/* 7-Tag Taxonomy Bar */}
          <div className="p-6 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] border-b border-slate-100">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <div className="text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Regulator Scrutiny
            </div>
            <div className="font-bold text-slate-900">{question.regulator_pressure} Pressure</div>
          </div>

            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <div className="text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-600" /> Payback Window
            </div>
            <div className="font-bold text-amber-800">{question.payback}</div>
          </div>

            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <div className="text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Cost Band
            </div>
            <div className="font-bold text-emerald-800">{question.cost}</div>
          </div>

            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <div className="text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> Duration
            </div>
            <div className="font-bold text-slate-900">{question.duration}</div>
          </div>
        </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 text-slate-700 text-sm leading-relaxed">
          
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h4 className="font-display font-bold text-blue-900 text-xs uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-700" /> Leadership Trait & Tier
              </h4>
              <p className="text-slate-900 font-semibold text-sm">
                {question.leadership_traits} — <span className="text-blue-800">({question.tier})</span>
              </p>
            </div>
          </div>

          {/* Visible Teaser Snippet */}
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 mb-2">
              Executive Preview Guidance
            </h3>
            <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed font-medium">
              <ReactMarkdown>{teaserSnippet}</ReactMarkdown>
            </div>
          </div>

          {/* Locked / Blurred Remaining Guidance (If not logged in or restricted) */}
          <div className="relative mt-6">
            {/* Blurred Content */}
            <div className="filter blur-md select-none opacity-30 pointer-events-none prose prose-slate prose-sm max-w-none text-slate-900 leading-relaxed">
              <ReactMarkdown>{lockedBody || `### Actionable 3-Step Strategy:\n1. Immediate Baseline (Week 1): Map current key risk indicators across governance assets.\n2. Targeted Controls (Weeks 2-3): Deploy automated monitoring attestation.\n3. Regulator Alignment (Week 4): Document control effectiveness before audit.`}</ReactMarkdown>
            </div>

            {/* Lock Overlay Card */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/90 backdrop-blur-xs border border-slate-200 rounded-2xl shadow-lg space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-xs">
                <Lock className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-display text-lg font-extrabold text-slate-900">
                  Full Guidance & Implementation Steps Gated
                </h4>
                <p className="text-xs text-slate-600 max-w-md mt-1">
                  To read the complete 20,000+ words guidance text, step-by-step regulator playbook, and custom framework downloads, please log in to your account.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {!user ? (
                  <>
                    <Link
                      to="/login"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 shadow-sm transition-all flex items-center gap-1.5"
                    >
                      Sign In to Read Full Guidance <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/register"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-300 hover:bg-slate-200 transition-all"
                    >
                      Create Free Account
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/courses"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 shadow-sm transition-all flex items-center gap-1.5"
                  >
                    Unlock Executive Masterclass Access <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
          </div>

        </div>

        {/* Footer */}
        <div className="shrink-0 p-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50 rounded-b-2xl">
          <button
            onClick={() => {
              onClose();
              onAskCopilot(question);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 flex items-center gap-2 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Tailor to My Organization with AI Copilot
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}
