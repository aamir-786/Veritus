import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, BookOpen, FileText, ShieldAlert, Sparkles, ArrowRight, Zap, CheckCircle2, Lock, Layers } from 'lucide-react';
import { api } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import QuestionDetailModal from '../components/QuestionDetailModal';
import AICopilotModal from '../components/AICopilotModal';

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [copilotQuestion, setCopilotQuestion] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const qRes = await api.getQuestions({ limit: 6 });
        if (qRes.success) setQuestions(qRes.questions.slice(0, 6));

        const cRes = await api.getCourses();
        if (cRes.success) setCourses(cRes.courses);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-[#0B0F17] to-[#0B0F17] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> 100 Risk Questions Dataset & 7-Way Taxonomy
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Deciding in the Dark <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              The Executive Knowledge & Decision Platform
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Where risk practitioners learn, watch, download and buy — built on 100 real-world questions from risk leaders across 5 critical domains, tagged 7 ways.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/questions"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold hover:from-amber-400 hover:to-amber-500 shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 text-base"
            >
              <Compass className="w-5 h-5 stroke-[2.5]" />
              Explore 100 Questions Matrix
            </Link>

            <Link
              to="/courses"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold border border-slate-700 transition-all flex items-center gap-2 text-base"
            >
              <BookOpen className="w-5 h-5 text-indigo-400" />
              View Masterclasses
            </Link>
          </div>

          {/* Key Metric Pills */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
              <div className="text-2xl font-extrabold text-white font-display">100</div>
              <div className="text-xs text-slate-400">Structured Questions</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
              <div className="text-2xl font-extrabold text-amber-400 font-display">7 Tags</div>
              <div className="text-xs text-slate-400">Taxonomy Filter System</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
              <div className="text-2xl font-extrabold text-emerald-400 font-display">20,000+</div>
              <div className="text-xs text-slate-400">Words of Guidance</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
              <div className="text-2xl font-extrabold text-cyan-400 font-display">14-Day</div>
              <div className="text-xs text-slate-400">Regulator Quick-Wins</div>
            </div>
          </div>

        </div>
      </section>

      {/* 100 Questions Teaser Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-amber-400 uppercase font-semibold">Structured Dataset</div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">The 100 Risk Questions Matrix</h2>
            <p className="text-sm text-slate-400 mt-1">Filter by effort, duration, cost, payback, tier, regulator pressure and leadership traits.</p>
          </div>
          <Link to="/questions" className="text-sm font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
            Browse All 100 Questions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

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
      </section>

      {/* Executive Masterclasses Section */}
      <section className="bg-slate-900/40 border-y border-slate-800/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display text-3xl font-bold text-white">Executive Video Masterclasses</h2>
            <p className="text-sm text-slate-400">Gated, high-impact video playback with closed captions VTT and downloadable templates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courses.map(course => (
              <div key={course.id} className="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between">
                <div>
                  <img src={course.cover_image} alt={course.title} className="w-full h-48 object-cover" />
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">{course.tier}</span>
                      <span className="text-slate-400 font-medium">{course.module_count} Modules • {course.lesson_count} Lessons</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">{course.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{course.headline}</p>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-extrabold text-emerald-400">${course.price}</div>
                    <div className="text-[10px] text-slate-400">Single Pay Access</div>
                  </div>
                  <Link
                    to={`/courses/${course.slug}`}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold hover:bg-amber-400 transition-colors text-sm flex items-center gap-1.5"
                  >
                    View Syllabus <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Lead Magnet Template Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-[#141C2E] to-[#141C2E] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Free Entry-Point Asset
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Executive Board Risk Deck Template (PPTX)
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Earn immediate value with our 15-slide board presentation deck designed to answer regulator inquiries without administrative delay.
            </p>
          </div>
          <Link
            to="/templates"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold hover:from-amber-400 hover:to-amber-500 shadow-xl shadow-amber-500/20 shrink-0 text-sm flex items-center gap-2"
          >
            <FileText className="w-5 h-5" /> Download Free Template
          </Link>
        </div>
      </section>

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
