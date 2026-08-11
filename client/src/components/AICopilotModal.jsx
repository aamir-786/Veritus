import React, { useState } from 'react';
import { X, Sparkles, Building2, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function AICopilotModal({ question, onClose }) {
  const [orgType, setOrgType] = useState('Banking & Financial Services');
  const [orgSize, setOrgSize] = useState('1,000 - 5,000 Employees');
  const [primaryConcern, setPrimaryConcern] = useState('Imminent Regulatory Audit Scrutiny');
  const [loading, setLoading] = useState(false);
  const [copilotAdvice, setCopilotAdvice] = useState(null);

  if (!question) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.getAICopilotAdvice({
        question_id: question.id,
        org_type: orgType,
        org_size: orgSize,
        primary_concern: primaryConcern
      });

      if (res.success) {
        setCopilotAdvice(res.copilot_advice);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#141C2E] border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950/60 to-slate-900 border-b border-slate-800 p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">AI Risk Decision Copilot</div>
              <h3 className="font-display font-bold text-white text-base">Tailor Q{question.question_number} to Your Organization</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {copilotAdvice ? (
          <div className="p-6 space-y-5 text-xs">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <span className="font-mono text-amber-400 font-bold block mb-1">Tailored Executive Action Plan</span>
              <h4 className="font-display text-base font-bold text-white">{copilotAdvice.question_title}</h4>
              <div className="text-slate-400 mt-1">Context: {copilotAdvice.organization_context}</div>
            </div>

            <div className="space-y-3 text-slate-200">
              <h5 className="font-display text-sm font-semibold text-white">Recommended Implementation Steps:</h5>
              {copilotAdvice.tailored_action_plan.map((step, idx) => (
                <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{step}</div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Recommended Template Artifact</span>
                <span className="font-semibold text-white">{copilotAdvice.recommended_template}</span>
              </div>
              <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                Payback: {copilotAdvice.estimated_payback_timeline}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setCopilotAdvice(null)}
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800"
              >
                Re-Configure Context
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="p-6 space-y-4 text-xs">
            
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-slate-400">Selected Question:</span>
              <div className="font-semibold text-white text-sm mt-0.5">Q{question.question_number}: {question.title}</div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Organization Sector / Industry</label>
              <select
                value={orgType}
                onChange={e => setOrgType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500"
              >
                <option value="Banking & Financial Services">Banking & Financial Services</option>
                <option value="Enterprise SaaS / FinTech">Enterprise SaaS / FinTech</option>
                <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                <option value="Energy & Infrastructure">Energy & Infrastructure</option>
                <option value="Retail & E-Commerce">Retail & E-Commerce</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Company Scale / Size</label>
              <select
                value={orgSize}
                onChange={e => setOrgSize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500"
              >
                <option value="100 - 500 Employees">100 - 500 Employees (Growth)</option>
                <option value="1,000 - 5,000 Employees">1,000 - 5,000 Employees (Mid-Market)</option>
                <option value="5,000+ Employees">5,000+ Employees (Global Enterprise)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Primary Executive Concern</label>
              <input
                type="text"
                required
                value={primaryConcern}
                onChange={e => setPrimaryConcern(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold hover:from-amber-400 hover:to-amber-500 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 text-sm mt-4 disabled:opacity-50"
            >
              {loading ? 'Analyzing Organization Context...' : 'Generate AI Decision Guidance'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
