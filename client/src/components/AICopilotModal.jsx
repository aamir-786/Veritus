import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative text-slate-900">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/10 via-white to-white border-b border-slate-200 p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-amber-800 uppercase tracking-wider font-bold">AI Risk Decision Copilot</div>
              <h3 className="font-display font-extrabold text-slate-900 text-base">Tailor Q{question.question_number} to Your Organization</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {copilotAdvice ? (
          <div className="p-6 space-y-4 text-xs">
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl">
              <span className="font-mono text-amber-800 font-bold block mb-0.5">Tailored Executive Action Plan</span>
              <h4 className="font-display text-base font-bold text-slate-900">{copilotAdvice.question_title}</h4>
              <div className="text-slate-600 mt-0.5 font-medium">Context: {copilotAdvice.organization_context}</div>
            </div>

            <div className="space-y-2.5 text-slate-700 font-medium">
              <h5 className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">Recommended Implementation Steps:</h5>
              {copilotAdvice.tailored_action_plan.map((step, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{step}</div>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-medium block">Recommended Template Artifact</span>
                <span className="font-bold text-slate-900">{copilotAdvice.recommended_template}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-bold text-[11px]">
                Payback: {copilotAdvice.estimated_payback_timeline}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setCopilotAdvice(null)}
                className="px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 font-semibold"
              >
                Re-Configure Context
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="p-6 space-y-4 text-xs font-medium">
            
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">Selected Question:</span>
              <div className="font-bold text-slate-900 text-xs mt-0.5">Q{question.question_number}: {question.title}</div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Organization Sector / Industry</label>
              <select
                value={orgType}
                onChange={e => setOrgType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:border-blue-900 font-medium"
              >
                <option value="Banking & Financial Services">Banking & Financial Services</option>
                <option value="Enterprise SaaS / FinTech">Enterprise SaaS / FinTech</option>
                <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                <option value="Energy & Infrastructure">Energy & Infrastructure</option>
                <option value="Retail & E-Commerce">Retail & E-Commerce</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Company Scale / Size</label>
              <select
                value={orgSize}
                onChange={e => setOrgSize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:border-blue-900 font-medium"
              >
                <option value="100 - 500 Employees">100 - 500 Employees (Growth)</option>
                <option value="1,000 - 5,000 Employees">1,000 - 5,000 Employees (Mid-Market)</option>
                <option value="5,000+ Employees">5,000+ Employees (Global Enterprise)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Primary Executive Concern</label>
              <input
                type="text"
                required
                value={primaryConcern}
                onChange={e => setPrimaryConcern(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:border-blue-900 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-500 text-black font-extrabold hover:bg-amber-400 flex items-center justify-center gap-2 shadow-sm text-xs mt-2 disabled:opacity-50"
            >
              {loading ? 'Analyzing Organization Context...' : 'Generate AI Decision Guidance'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
