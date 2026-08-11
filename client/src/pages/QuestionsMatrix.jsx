import React, { useState, useEffect } from 'react';
import { Compass, Filter, Search, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import QuestionDetailModal from '../components/QuestionDetailModal';
import AICopilotModal from '../components/AICopilotModal';

export default function QuestionsMatrix() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 7 Filter States
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('All');
  const [effort, setEffort] = useState('All');
  const [duration, setDuration] = useState('All');
  const [cost, setCost] = useState('All');
  const [payback, setPayback] = useState('All');
  const [tier, setTier] = useState('All');
  const [regulatorPressure, setRegulatorPressure] = useState('All');

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [copilotQuestion, setCopilotQuestion] = useState(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.getQuestions({
        search,
        domain,
        effort,
        duration,
        cost,
        payback,
        tier,
        regulator_pressure: regulatorPressure
      });
      if (res.success) {
        setQuestions(res.questions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [search, domain, effort, duration, cost, payback, tier, regulatorPressure]);

  const resetFilters = () => {
    setSearch('');
    setDomain('All');
    setEffort('All');
    setDuration('All');
    setCost('All');
    setPayback('All');
    setTier('All');
    setRegulatorPressure('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-slate-900 bg-[#F8FAFC]">
      
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-100/80 text-blue-900 border border-blue-200 text-xs font-bold uppercase">
          <Compass className="w-3.5 h-3.5 text-blue-700" /> 100 Risk Questions Dataset
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
          Deciding in the Dark Taxonomy Explorer
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Filter instantly by Effort, Duration, Cost, Payback, Tier, Regulator Pressure, and Leadership Trait.
        </p>
      </div>

      {/* Light Search & Filter Toolbar */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200 space-y-4 shadow-xs">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search 100 questions by title, guidance, or domain..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-900 placeholder-slate-400 font-medium"
          />
        </div>

        {/* 7 Filter Select Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs font-medium">
          
          {/* 1. Domain */}
          <div>
            <label className="block text-slate-500 mb-1 text-[11px] font-bold">Domain</label>
            <select
              value={domain}
              onChange={e => setDomain(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-medium"
            >
              <option value="All">All Domains</option>
              <option value="Governance">Governance</option>
              <option value="Operational Risk">Operational Risk</option>
              <option value="Financial & Market">Financial & Market</option>
              <option value="Cyber & Tech Risk">Cyber & Tech Risk</option>
              <option value="Regulatory & Compliance">Regulatory</option>
            </select>
          </div>

          {/* 2. Regulator Pressure */}
          <div>
            <label className="block text-slate-500 mb-1 text-[11px] font-bold">Regulator Scrutiny</label>
            <select
              value={regulatorPressure}
              onChange={e => setRegulatorPressure(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-medium"
            >
              <option value="All">All Pressure</option>
              <option value="High">High Scrutiny</option>
              <option value="Medium">Medium Scrutiny</option>
              <option value="Low">Low Scrutiny</option>
            </select>
          </div>

          {/* 3. Payback */}
          <div>
            <label className="block text-slate-500 mb-1 text-[11px] font-bold">Payback Window</label>
            <select
              value={payback}
              onChange={e => setPayback(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-medium"
            >
              <option value="All">All Payback</option>
              <option value="Immediate">Immediate</option>
              <option value="Fast (< 3mo)">Fast (&lt; 3mo)</option>
              <option value="Medium-term">Medium-term</option>
            </select>
          </div>

          {/* 4. Cost Band */}
          <div>
            <label className="block text-slate-500 mb-1 text-[11px] font-bold">Cost Band</label>
            <select
              value={cost}
              onChange={e => setCost(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-medium"
            >
              <option value="All">All Costs</option>
              <option value="$">$ (Cheap)</option>
              <option value="$$">$$ (Moderate)</option>
              <option value="$$$">$$$ (Capital Heavy)</option>
            </select>
          </div>

          {/* 5. Duration */}
          <div>
            <label className="block text-slate-500 mb-1 text-[11px] font-bold">Timeline</label>
            <select
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-medium"
            >
              <option value="All">All Timelines</option>
              <option value="Fortnight">Fortnight (14d)</option>
              <option value="1 Month">1 Month</option>
              <option value="1 Quarter">1 Quarter</option>
            </select>
          </div>

          {/* 6. Effort Level */}
          <div>
            <label className="block text-slate-500 mb-1 text-[11px] font-bold">Effort Level</label>
            <select
              value={effort}
              onChange={e => setEffort(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-medium"
            >
              <option value="All">All Effort</option>
              <option value="Low">Low Effort</option>
              <option value="Medium">Medium Effort</option>
              <option value="High">High Effort</option>
            </select>
          </div>

          {/* 7. Tier */}
          <div>
            <label className="block text-slate-500 mb-1 text-[11px] font-bold">Risk Tier</label>
            <select
              value={tier}
              onChange={e => setTier(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-medium"
            >
              <option value="All">All Tiers</option>
              <option value="Tier 1 (Critical)">Tier 1 (Critical)</option>
              <option value="Tier 2 (Core)">Tier 2 (Core)</option>
            </select>
          </div>

        </div>

        {/* Filter Stats & Reset */}
        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
          <div>Showing <span className="font-bold text-blue-900">{questions.length}</span> of 100 Questions</div>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-slate-600 hover:text-blue-900 transition-colors font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>

      </div>

      {/* Grid of Question Cards */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          Loading 100 questions dataset...
        </div>
      ) : questions.length === 0 ? (
        <div className="py-16 text-center glass-card rounded-2xl p-8 space-y-2">
          <p className="text-slate-700 font-semibold text-sm">No questions match your current 7-tag filter combination.</p>
          <button onClick={resetFilters} className="text-xs text-blue-900 hover:underline font-bold">Reset filters to see all 100 questions</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {questions.map(q => (
            <QuestionCard
              key={q.id}
              question={q}
              onClick={setSelectedQuestion}
              onAskCopilot={setCopilotQuestion}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
          onAskCopilot={(q) => {
            setSelectedQuestion(null);
            setCopilotQuestion(q);
          }}
        />
      )}

      {copilotQuestion && (
        <AICopilotModal
          question={copilotQuestion}
          onClose={() => setCopilotQuestion(null)}
        />
      )}

    </div>
  );
}
