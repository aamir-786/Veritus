import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AdminQuestionModal({ isOpen, onClose, question, onSave }) {
  const isEditing = !!question;
  
  const [formData, setFormData] = useState({
    title: '',
    domain: 'Risk',
    effort: 'Moderate',
    duration: '6-12 weeks',
    tier: 'Foundational',
    regulator_pressure: 'Low',
    cost: 'Low ($)',
    payback: 'Quick',
    leadership_traits: '',
    summary: '',
    guidance_text: ''
  });

  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title || '',
        domain: question.domain || 'Risk',
        effort: question.effort || 'Moderate',
        duration: question.duration || '6-12 weeks',
        tier: question.tier || 'Foundational',
        regulator_pressure: question.regulator_pressure || 'Low',
        cost: question.cost || 'Low ($)',
        payback: question.payback || 'Quick',
        leadership_traits: question.leadership_traits || '',
        summary: question.summary || '',
        guidance_text: question.guidance_text || ''
      });
    } else {
      setFormData({
        title: '',
        domain: 'Risk',
        effort: 'Moderate',
        duration: '6-12 weeks',
        tier: 'Foundational',
        regulator_pressure: 'Low',
        cost: 'Low ($)',
        payback: 'Quick',
        leadership_traits: '',
        summary: '',
        guidance_text: ''
      });
    }
  }, [question, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData, question?.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="p-4 border-b border-slate-100 shrink-0">
          <h2 className="text-sm font-display font-bold text-slate-900">
            {isEditing ? 'Edit Taxonomy Question' : 'Create Taxonomy Question'}
          </h2>
          <p className="text-slate-500 text-[10px] mt-0.5">Configure metadata tags and guidance.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Section 1: Core Information */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-1.5">Core Information</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Question Title</label>
                <input
                  type="text" required name="title" value={formData.title} onChange={handleChange}
                  placeholder="e.g. Q001: We Have a Risk Register, But No One Uses It"
                  className="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-[10px] font-medium outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Summary (Plain Language)</label>
                <input
                  type="text" name="summary" value={formData.summary} onChange={handleChange}
                  placeholder="e.g. How do you make a risk register that people actually use?"
                  className="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-[10px] font-medium outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Taxonomy & Metadata */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-1.5">Taxonomy & Metadata</h3>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Domain</label>
                <input type="text" list="domain-options" required name="domain" value={formData.domain} onChange={handleChange} className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-medium outline-none shadow-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Effort</label>
                <input type="text" list="effort-options" name="effort" value={formData.effort} onChange={handleChange} className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-medium outline-none shadow-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Duration</label>
                <input type="text" list="duration-options" name="duration" value={formData.duration} onChange={handleChange} className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-medium outline-none shadow-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tier</label>
                <input type="text" list="tier-options" name="tier" value={formData.tier} onChange={handleChange} className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-medium outline-none shadow-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">Regulator Pressure</label>
                <input type="text" list="pressure-options" name="regulator_pressure" value={formData.regulator_pressure} onChange={handleChange} className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-bold outline-none shadow-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Cost</label>
                <input type="text" list="cost-options" name="cost" value={formData.cost} onChange={handleChange} className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-medium outline-none shadow-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ROI (Payback)</label>
                <input type="text" list="payback-options" name="payback" value={formData.payback} onChange={handleChange} className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-medium outline-none shadow-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Leadership</label>
                <input type="text" list="leadership-options" name="leadership_traits" value={formData.leadership_traits} onChange={handleChange} placeholder="e.g. Accountability" className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-medium outline-none shadow-sm" />
              </div>
            </div>
          </div>

          {/* Section 3: Detailed Guidance */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-1.5">Detailed Guidance</h3>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Question & Guidance</label>
              <textarea
                required name="guidance_text" value={formData.guidance_text} onChange={handleChange} rows={3}
                placeholder="### Plain-language question\n...\n\n### Answer\n..."
                className="w-full px-3 py-2 rounded bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-medium outline-none resize-y transition-all font-mono leading-relaxed"
              ></textarea>
            </div>
          </div>
          </div>

          {/* Datalists for custom autocomplete */}
          <datalist id="domain-options">
            <option value="Risk" />
            <option value="Governance" />
            <option value="Operational Risk" />
            <option value="Cyber & Tech Risk" />
            <option value="Financial & Market" />
            <option value="Regulatory & Compliance" />
            <option value="Resilience" />
            <option value="AI" />
          </datalist>
          <datalist id="effort-options">
            <option value="Light" />
            <option value="Low" />
            <option value="Moderate" />
            <option value="High" />
            <option value="Project" />
          </datalist>
          <datalist id="duration-options">
            <option value="S" />
            <option value="M" />
            <option value="L" />
            <option value="1 Month" />
            <option value="6-12 weeks" />
            <option value="1 Quarter" />
          </datalist>
          <datalist id="tier-options">
            <option value="Foundational" />
            <option value="Tactical" />
            <option value="Foundational (F)" />
            <option value="Tactical (T)" />
            <option value="Tier 1 (Critical)" />
            <option value="Tier 2 (Core)" />
          </datalist>
          <datalist id="pressure-options">
            <option value="Low" />
            <option value="Moderate" />
            <option value="High" />
            <option value="None" />
          </datalist>
          <datalist id="cost-options">
            <option value="$" />
            <option value="$$" />
            <option value="$$$" />
            <option value="Low ($)" />
            <option value="Moderate ($$)" />
            <option value="High ($$$)" />
          </datalist>
          <datalist id="payback-options">
            <option value="Quick" />
            <option value="Mid" />
            <option value="Long-term" />
            <option value="Immediate" />
            <option value="Medium-term" />
          </datalist>
          <datalist id="leadership-options">
            <option value="Accountability" />
            <option value="Change" />
            <option value="Collaboration" />
            <option value="Communication" />
            <option value="Empathy" />
            <option value="Strategic" />
            <option value="Technical" />
          </datalist>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0 rounded-b-xl">
            <button type="button" onClick={onClose} className="px-4 py-1.5 rounded-lg text-slate-600 font-bold text-[10px] uppercase tracking-wide hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wide transition-all shadow-sm">
              {isEditing ? 'Save Changes' : 'Create Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
