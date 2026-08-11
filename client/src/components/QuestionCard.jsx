import React from 'react';
import { Sparkles, Clock, DollarSign, ShieldAlert, Zap, Layers, Award, ArrowUpRight, Lock } from 'lucide-react';

export default function QuestionCard({ question, onClick, onAskCopilot }) {
  const isHighRegulator = question.regulator_pressure === 'High';

  return (
    <div 
      className="glass-card glass-card-hover rounded-xl p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
      onClick={() => onClick(question)}
    >
      {/* Top Bar: Question # & Domain */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Q{question.question_number}
          </span>
          <span className="badge-tag badge-domain text-[11px]">
            {question.domain}
          </span>
        </div>

        {/* Question Title */}
        <h3 className="font-display font-bold text-sm text-slate-900 group-hover:text-blue-900 transition-colors leading-snug mb-2">
          {question.title}
        </h3>

        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed font-normal">
          {question.summary}
        </p>
      </div>

      {/* 7 Taxonomy Tags Grid */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {/* Regulator Pressure */}
          <span className={`badge-tag ${isHighRegulator ? 'badge-regulator-high' : 'badge-regulator-medium'}`} title="Regulator Scrutiny Level">
            <ShieldAlert className="w-3 h-3" />
            Regulator: {question.regulator_pressure}
          </span>

          {/* Payback */}
          <span className="badge-tag badge-payback" title="Payback Window">
            <Zap className="w-3 h-3 text-indigo-600" />
            {question.payback}
          </span>

          {/* Cost */}
          <span className="badge-tag badge-cost" title="Cost Band">
            <DollarSign className="w-3 h-3 text-emerald-600" />
            Cost: {question.cost}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3 text-slate-400" />
            {question.duration}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Layers className="w-3 h-3 text-blue-600" />
            {question.effort} Effort
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <Award className="w-3 h-3 text-amber-600" />
            {question.leadership_traits.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAskCopilot(question);
          }}
          className="text-[11px] text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all"
        >
          <Sparkles className="w-3 h-3 text-amber-600" />
          AI Copilot Advice
        </button>

        <span className="text-xs text-blue-700 group-hover:text-blue-900 font-semibold flex items-center gap-1">
          <Lock className="w-3 h-3 text-slate-400" /> Teaser Preview <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
}
