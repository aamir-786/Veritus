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
                <select required name="domain" value={formData.domain} onChange={handleChange} className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-medium outline-none shadow-sm">
                  <option value="Risk">Risk</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Cyber">Cyber</option>
                  <option value="Resilience">Resilience</option>
                  <option value="AI">AI</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Effort</label>
                <select name="effort" value={formData.effort} onChange={handleChange} className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-medium outline-none shadow-sm">
                  <option value="Quick Win">Quick Win</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Project">Project</option>
                  <option value="Transformation">Transformation</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Duration</label>
                <select name="duration" value={formData.duration} onChange={handleChange} className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-medium outline-none shadow-sm">
                  <option value="< 2 weeks">&lt; 2 weeks</option>
                  <option value="2-6 weeks">2-6 weeks</option>
                  <option value="6-12 weeks">6-12 weeks</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="> 6 months">&gt; 6 months</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tier</label>
                <select name="tier" value={formData.tier} onChange={handleChange} className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-medium outline-none shadow-sm">
                  <option value="Foundational">Foundational</option>
                  <option value="Tactical">Tactical</option>
                  <option value="Strategic">Strategic</option>
                  <option value="Transformational">Transformational</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">Regulator Pressure</label>
                <select name="regulator_pressure" value={formData.regulator_pressure} onChange={handleChange} className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-bold outline-none shadow-sm">
                  <option value="None">None</option>
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Cost</label>
                <select name="cost" value={formData.cost} onChange={handleChange} className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-medium outline-none shadow-sm">
                  <option value="Low ($)">Low ($)</option>
                  <option value="Medium ($$)">Medium ($$)</option>
                  <option value="High ($$$)">High ($$$)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ROI (Payback)</label>
                <select name="payback" value={formData.payback} onChange={handleChange} className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-medium outline-none shadow-sm">
                  <option value="Quick">Quick</option>
                  <option value="Mid">Mid</option>
                  <option value="Strategic">Strategic</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Leadership</label>
                <select name="leadership_traits" value={formData.leadership_traits} onChange={handleChange} className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[10px] font-medium outline-none shadow-sm">
                  <option value="">Select Trait</option>
                  <option value="Accountability">Accountability</option>
                  <option value="Change">Change</option>
                  <option value="Collaboration">Collaboration</option>
                  <option value="Communication">Communication</option>
                  <option value="Empathy">Empathy</option>
                  <option value="Strategic">Strategic</option>
                  <option value="Technical">Technical</option>
                </select>
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
