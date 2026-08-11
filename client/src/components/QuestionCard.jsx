import React from 'react';
import { Sparkles, Clock, DollarSign, ShieldAlert, Zap, Layers, Award, ArrowUpRight } from 'lucide-react';

export default function QuestionCard({ question, onClick, onAskCopilot }) {
  const isHighRegulator = question.regulator_pressure === 'High';

  return (
    <div 
      className="glass-card glass-card-hover rounded-xl p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
      onClick={() => onClick(question)}
    >
      {/* Top Bar: Question # & Domain */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Q{question.question_number}
          </span>
          <span className="badge-tag badge-domain text-[11px]">
            {question.domain}
          </span>
        </div>

        {/* Question Title */}
        <h3 className="font-display font-semibold text-base text-white group-hover:text-amber-300 transition-colors leading-snug mb-3">
          {question.title}
        </h3>

        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {question.summary}
        </p>
      </div>

      {/* 7 Taxonomy Tags Grid */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {/* Regulator Pressure */}
          <span className={`badge-tag ${isHighRegulator ? 'badge-regulator-high' : 'badge-regulator-medium'}`} title="Regulator Scrutiny Level">
            <ShieldAlert className="w-3 h-3" />
            Regulator: {question.regulator_pressure}
          </span>

          {/* Payback */}
          <span className="badge-tag badge-payback" title="Payback Window">
            <Zap className="w-3 h-3 text-amber-400" />
            {question.payback}
          </span>

          {/* Cost */}
          <span className="badge-tag badge-cost" title="Cost Band">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            Cost: {question.cost}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {question.duration}
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-indigo-400" />
            {question.effort} Effort
          </span>
          <span className="flex items-center gap-1">
            <Award className="w-3 h-3 text-purple-400" />
            {question.leadership_traits.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-4 flex items-center justify-between pt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAskCopilot(question);
          }}
          className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
        >
          <Sparkles className="w-3 h-3" />
          AI Copilot Advice
        </button>

        <span className="text-xs text-slate-400 group-hover:text-white flex items-center gap-0.5">
          Read Guidance <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
}
