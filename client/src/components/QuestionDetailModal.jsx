import React, { useState } from 'react';
import { X, Sparkles, ShieldAlert, Clock, DollarSign, Zap, Layers, Lock, ArrowRight, CheckCircle2, ShoppingCart, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';
import ReviewModal from './ReviewModal';

export default function QuestionDetailModal({ question, unlockedDomains, packs, onClose, onAskCopilot }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  if (!question) return null;

  // Prepare text based on auth state
  let fullText = question.guidance_text || '';
  fullText = fullText.replace(/^###\s*(Answer|Guidance|Response)\s*\n+/i, ''); // Strip explicit header if present

  const domainPackId = `pack_${question.domain.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_').replace(/[^a-z0-9_]/g, '')}`;
  const hasAccess = user?.role === 'admin' || 
    (unlockedDomains && (unlockedDomains.includes('pack_full') || unlockedDomains.includes(domainPackId)));

  let teaserSnippet = '';
  let lockedBody = '';

  if (!hasAccess) {
    const firstPeriod = fullText.indexOf('. ');
    if (firstPeriod !== -1) {
      teaserSnippet = fullText.slice(0, firstPeriod + 1);
      lockedBody = fullText.slice(firstPeriod + 1).trim();
    } else {
      teaserSnippet = fullText.slice(0, 100) + '...';
      lockedBody = fullText.slice(100).trim();
    }
  } else {
    teaserSnippet = fullText;
  }

  const packObj = packs && packs[domainPackId] ? packs[domainPackId] : { id: domainPackId, title: `${question.domain} Master Pack`, price: 49 };

  const handleAddToCart = () => {
    if (!user) {
      window.location.href = '/login?redirect=/questions';
      return;
    }
    addToCart({
      id: packObj.id,
      title: packObj.title,
      price: packObj.price,
      type: 'pack'
    });
    onClose();
  };

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

          {/* Answer Content */}
          <div>
            <h3 className="font-display text-base font-bold text-slate-900 mb-2">
              Answer
            </h3>
            <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed font-medium">
              <ReactMarkdown>{teaserSnippet}</ReactMarkdown>
            </div>
          </div>

          {/* Locked / Blurred Remaining Guidance */}
          {!hasAccess && (
            <div className="relative mt-2">
              {/* Blurred Content */}
              <div className="filter blur-md select-none opacity-40 pointer-events-none prose prose-slate prose-sm max-w-none text-slate-900 leading-relaxed overflow-hidden" style={{ maxHeight: '200px' }}>
                <ReactMarkdown>{lockedBody || `This is a sample locked body that demonstrates the blurred effect...`}</ReactMarkdown>
              </div>

              {/* Lock Overlay Card */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-[2px] border border-slate-200 rounded-2xl shadow-lg space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-xs">
                  <Lock className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-display text-lg font-extrabold text-slate-900">
                    Unlock {question.domain} Master Pack
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mt-1">
                    Get full lifetime access to all guidance, answers, and frameworks for the {question.domain} domain.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    className="px-5 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 shadow-sm transition-all flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add {question.domain} Pack to Cart - ${packObj.price}
                  </button>
                  {!user && (
                    <Link
                      to="/register"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-300 hover:bg-slate-200 transition-all"
                    >
                      Create Free Account
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
          </div>

        </div>

        {/* Footer */}
        <div className="shrink-0 p-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50 rounded-b-2xl">
          <div className="flex gap-3 items-center flex-wrap">
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
            {user && (
              <button
                onClick={() => setIsReviewOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 flex items-center gap-2 shadow-sm transition-all"
              >
                <Star className="w-4 h-4" />
                Leave a Review
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            Close Preview
          </button>
        </div>

        <ReviewModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          productType="question"
          productId={question.id}
          productName={question.title}
        />
      </div>
    </div>
  );
}
