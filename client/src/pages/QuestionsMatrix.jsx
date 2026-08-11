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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
          <Compass className="w-4 h-4" /> 100 Risk Questions Matrix
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
          Deciding in the Dark Taxonomy Explorer
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Ask <em className="text-amber-400">"What can I fix in a fortnight, cheaply, that my regulator cares about?"</em> and get an instant filtered answer.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search all 100 questions by title, guidance, or domain..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 placeholder-slate-500"
          />
        </div>

        {/* 7 Filter Select Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          
          {/* 1. Domain */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Domain</label>
            <select
              value={domain}
              onChange={e => setDomain(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
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
            <label className="block text-slate-400 mb-1 font-medium">Regulator Scrutiny</label>
            <select
              value={regulatorPressure}
              onChange={e => setRegulatorPressure(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
            >
              <option value="All">All Pressure Levels</option>
              <option value="High">High Scrutiny</option>
              <option value="Medium">Medium Scrutiny</option>
              <option value="Low">Low Scrutiny</option>
            </select>
          </div>

          {/* 3. Payback */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Payback Window</label>
            <select
              value={payback}
              onChange={e => setPayback(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
            >
              <option value="All">All Payback</option>
              <option value="Immediate">Immediate</option>
              <option value="Fast (< 3mo)">Fast (&lt; 3mo)</option>
              <option value="Medium-term">Medium-term</option>
            </select>
          </div>

          {/* 4. Cost Band */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Cost Band</label>
            <select
              value={cost}
              onChange={e => setCost(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
            >
              <option value="All">All Costs</option>
              <option value="$">$ (Cheap)</option>
              <option value="$$">$$ (Moderate)</option>
              <option value="$$$">$$$ (Capital Heavy)</option>
            </select>
          </div>

          {/* 5. Duration */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Implementation</label>
            <select
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
            >
              <option value="All">All Timelines</option>
              <option value="Fortnight">Fortnight (14d)</option>
              <option value="1 Month">1 Month</option>
              <option value="1 Quarter">1 Quarter</option>
            </select>
          </div>

          {/* 6. Effort Level */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Effort Level</label>
            <select
              value={effort}
              onChange={e => setEffort(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
            >
              <option value="All">All Effort</option>
              <option value="Low">Low Effort</option>
              <option value="Medium">Medium Effort</option>
              <option value="High">High Effort</option>
            </select>
          </div>

          {/* 7. Tier */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Risk Tier</label>
            <select
              value={tier}
              onChange={e => setTier(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
            >
              <option value="All">All Tiers</option>
              <option value="Tier 1 (Critical)">Tier 1 (Critical)</option>
              <option value="Tier 2 (Core)">Tier 2 (Core)</option>
            </select>
          </div>

        </div>

        {/* Filter Stats & Reset */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <div>Showing <span className="font-bold text-amber-400">{questions.length}</span> of 100 Questions</div>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>

      </div>

      {/* Grid of Question Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading taxonomy dataset...
        </div>
      ) : questions.length === 0 ? (
        <div className="py-20 text-center glass-card rounded-2xl p-8 space-y-3">
          <p className="text-slate-300 font-medium">No questions match your current 7-tag filter combination.</p>
          <button onClick={resetFilters} className="text-xs text-amber-400 hover:underline">Reset filters to see all 100 questions</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
