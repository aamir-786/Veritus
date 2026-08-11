import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  BookOpen, 
  FileText, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Lock, 
  Layers, 
  Award,
  ChevronDown,
  Mail,
  Send,
  Building2,
  Users,
  Check,
  TrendingUp,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import QuestionDetailModal from '../components/QuestionDetailModal';
import AICopilotModal from '../components/AICopilotModal';

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [copilotQuestion, setCopilotQuestion] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const qRes = await api.getQuestions({ limit: 6 });
        if (qRes.success) setQuestions(qRes.questions.slice(0, 6));

        const cRes = await api.getCourses();
        if (cRes.success) setCourses(cRes.courses);

        const tRes = await api.getTemplates();
        if (tRes.success) setTemplates(tRes.templates);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactCompany('');
    setContactMessage('');
  };

  const faqs = [
    {
      q: "What is 'Deciding in the Dark' and who is it built for?",
      a: "Deciding in the Dark holds 100 real-world questions gathered from risk leaders across 5 core domains. It is designed for Chief Risk Officers (CROs), Board Directors, Compliance Heads, and Risk Practitioners seeking actionable quick-wins under regulator pressure."
    },
    {
      q: "How does the 7-way taxonomy tag system work?",
      a: "Every question is tagged 7 ways: Effort, Duration, Cost Band, Payback ROI, Risk Tier, Regulator Pressure, and Leadership Trait. This allows you to filter instantly for '14-day payback quick-wins under high regulator scrutiny'."
    },
    {
      q: "Are the digital templates free to download?",
      a: "We offer both free entry-point lead magnets (like the 15-slide Executive Board Risk Deck PPTX) and premium paid framework spreadsheets available for instant download."
    },
    {
      q: "Can I manage content without technical coding knowledge?",
      a: "Yes. An administrator can log in to the non-technical Admin Control Studio (/admin) to add courses, modules, video lessons with closed captions, edit question tags, and manage users."
    }
  ];

  return (
    <div className="space-y-16 pb-20 text-slate-900 bg-[#F8FAFC]">
      
      {/* 1. Hero Section - Executive Background Imagery & Pattern Layer */}
      <section className="relative pt-12 pb-16 overflow-hidden border-b border-slate-200 bg-white">
        
        {/* Architectural Glass Tower Background Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80')` }}
        />
        
        {/* Subtle Executive Dot Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-4 h-4 text-blue-700" /> Effective RM Platform Family • 100 Risk Questions Dataset
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Deciding in the Dark <br />
            <span className="text-blue-900">
              Executive Knowledge & Decision Platform
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Where risk leaders learn, watch video masterclasses, download framework templates, and tailor 100 structured risk questions using 7-way taxonomy and AI Copilot guidance.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/questions"
              className="px-5 py-2.5 rounded-xl bg-blue-900 text-white font-extrabold hover:bg-blue-800 shadow-md shadow-blue-900/10 transition-all flex items-center gap-2 text-xs"
            >
              <Compass className="w-4 h-4 stroke-[2.5]" />
              Explore 100 Questions Matrix
            </Link>

            <Link
              to="/courses"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 transition-all flex items-center gap-2 text-xs shadow-2xs"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              View Masterclasses
            </Link>
          </div>

          {/* Metrics Bar with Background Card Accents */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur border border-slate-200 shadow-xs relative overflow-hidden group">
              <div className="text-2xl font-extrabold text-slate-900 font-display">100</div>
              <div className="text-[11px] text-slate-500 font-bold">Structured Questions</div>
              <div className="absolute -right-3 -bottom-3 text-slate-100 group-hover:text-blue-50 transition-colors pointer-events-none">
                <Compass className="w-16 h-16 opacity-30" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur border border-blue-200 shadow-xs relative overflow-hidden group">
              <div className="text-2xl font-extrabold text-blue-900 font-display">7 Tags</div>
              <div className="text-[11px] text-slate-500 font-bold">Taxonomy Filter Matrix</div>
              <div className="absolute -right-3 -bottom-3 text-blue-50 pointer-events-none">
                <Layers className="w-16 h-16 opacity-40" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur border border-emerald-200 shadow-xs relative overflow-hidden group">
              <div className="text-2xl font-extrabold text-emerald-800 font-display">20,000+</div>
              <div className="text-[11px] text-slate-500 font-bold">Words of Guidance</div>
              <div className="absolute -right-3 -bottom-3 text-emerald-50 pointer-events-none">
                <TrendingUp className="w-16 h-16 opacity-40" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 backdrop-blur border border-amber-200 shadow-xs relative overflow-hidden group">
              <div className="text-2xl font-extrabold text-amber-800 font-display">14-Day</div>
              <div className="text-[11px] text-slate-500 font-bold">Regulator Quick-Wins</div>
              <div className="absolute -right-3 -bottom-3 text-amber-50 pointer-events-none">
                <Zap className="w-16 h-16 opacity-40" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Visual Enterprise Boardroom Feature Section with Background Image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-2">
          
          <div className="p-8 lg:p-12 space-y-4 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold w-fit">
              <ShieldCheck className="w-4 h-4 text-blue-700" /> Proven Executive Governance
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              Structured Risk Data Designed for Executive Decision-Making
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              No static PDF offers interactive multi-facet filtering. Veritus allows risk leaders to ask <em>"What can I fix in a fortnight, cheaply, that my regulator cares about?"</em> and get an instant answer.
            </p>

            <div className="space-y-2 pt-2 text-xs font-semibold text-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>7-Way Taxonomy Matrix (Effort, Duration, Cost, Payback, Tier, Regulator, Leadership)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>AI Decision Copilot tailored for specific corporate scale & regulatory scrutiny</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Gated video playback & downloadable executive board deck frameworks</span>
              </div>
            </div>

            <div className="pt-3">
              <Link
                to="/questions"
                className="px-5 py-2.5 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 transition-colors text-xs inline-flex items-center gap-1.5 shadow-xs"
              >
                Launch Taxonomy Explorer <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative min-h-[280px] lg:min-h-[400px]">
            <img 
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80" 
              alt="Executive Risk Presentation" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-white lg:via-transparent lg:to-transparent" />
          </div>

        </div>
      </section>

      {/* 3. 100 Questions Teaser Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider font-mono">Interactive Explorer</span>
            <h2 className="font-display text-2xl font-extrabold text-slate-900">100 Risk Questions Preview</h2>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">Click any question to view its preview snippet or unlock full guidance.</p>
          </div>
          <Link to="/questions" className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1">
            Browse Full 100 Questions Matrix <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

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
      </section>

      {/* 4. Masterclasses Feature Banner with Imagery */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider font-mono">Video Masterclasses</span>
            <h2 className="font-display text-2xl font-extrabold text-slate-900">Executive Video Learning Series</h2>
            <p className="text-xs text-slate-600 font-medium">Closed-captioned video playback, reading modules, and framework attachments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(course => (
              <div key={course.id} className="glass-card rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="relative">
                    <img src={course.cover_image} alt={course.title} className="w-full h-48 object-cover" />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur text-blue-900 text-xs font-bold border border-blue-200 shadow-xs">
                      {course.tier}
                    </div>
                  </div>
                  <div className="p-5 space-y-2.5">
                    <h3 className="font-display text-lg font-bold text-slate-900">{course.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{course.headline}</p>
                  </div>
                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-extrabold text-emerald-800">${course.price}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono font-medium">Single Pay License</div>
                  </div>
                  <Link
                    to={`/courses/${course.slug}`}
                    className="px-4 py-2 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 transition-colors text-xs flex items-center gap-1 shadow-xs"
                  >
                    View Syllabus <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Free Entry Point Lead Magnet Template Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-2xl p-8 border border-blue-200 bg-gradient-to-r from-blue-50/60 via-white to-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="space-y-2 max-w-xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Free Lead Magnet Asset
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
              Executive Board Risk Deck Template (PPTX)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Earn immediate value with our 15-slide board presentation deck designed to answer regulator inquiries without administrative delay.
            </p>
          </div>

          <Link
            to="/templates"
            className="px-5 py-2.5 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 shadow-sm shrink-0 text-xs flex items-center gap-2 relative z-10"
          >
            <FileText className="w-4 h-4" /> Download Free Template
          </Link>
        </div>
      </section>

      {/* 6. Pricing Tiers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider font-mono">Flexible Licensing</span>
          <h2 className="font-display text-2xl font-extrabold text-slate-900">Platform Pricing & Access Tiers</h2>
          <p className="text-xs text-slate-600 font-medium">Choose the access level that fits your executive team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-card rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xs">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">Free Entry</span>
              <h3 className="font-display text-xl font-bold text-slate-900 mt-1">Practitioner Preview</h3>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">$0 <span className="text-xs font-normal text-slate-500">/ Free</span></div>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Browse 100 Risk Questions Titles</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 7-Way Taxonomy Filtering</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Free Board Deck PPTX Download</li>
            </ul>
            <Link to="/register" className="block text-center py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs">
              Create Free Account
            </Link>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-blue-300 bg-blue-50/30 relative space-y-4 shadow-md">
            <span className="absolute top-4 right-4 px-2 py-0.5 rounded bg-blue-900 text-white text-[10px] font-bold uppercase">Popular</span>
            <div>
              <span className="text-xs font-bold text-blue-900 uppercase">Core License</span>
              <h3 className="font-display text-xl font-bold text-slate-900 mt-1">Single Masterclass Access</h3>
              <div className="text-2xl font-extrabold text-blue-900 mt-2">$149 – $299 <span className="text-xs font-normal text-slate-500">/ Lifetime</span></div>
            </div>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Full Video Playback & Closed Captions</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Unlocked 20,000+ Words Guidance</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> AI Risk Decision Copilot</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Downloadable Framework Templates</li>
            </ul>
            <Link to="/courses" className="block text-center py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs">
              Explore Masterclasses
            </Link>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xs">
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase">Enterprise</span>
              <h3 className="font-display text-xl font-bold text-slate-900 mt-1">Team & Board License</h3>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">Custom <span className="text-xs font-normal text-slate-500">/ Team</span></div>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> All 100 Questions & Masterclasses</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Custom Admin Control Studio Access</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Dedicated Organizational AI Copilot</li>
            </ul>
            <a href="#contact" className="block text-center py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
              Contact Sales
            </a>
          </div>

        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider font-mono">Got Questions?</span>
          <h2 className="font-display text-2xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-card rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${openFaq === idx ? 'rotate-180 text-blue-900' : 'text-slate-400'}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 font-medium">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. Contact Us Section */}
      <section id="contact" className="max-w-4xl mx-auto px-4 pt-4">
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-200 space-y-6 shadow-xs">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mx-auto font-bold mb-2">
              <Mail className="w-5 h-5 text-blue-700" />
            </div>
            <h2 className="font-display text-2xl font-extrabold text-slate-900">Get in Touch with Our Team</h2>
            <p className="text-xs text-slate-600 font-medium">Have questions regarding enterprise team access or custom risk frameworks?</p>
          </div>

          {contactSuccess ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">Thank You for Reaching Out!</h4>
              <p className="text-slate-600">Our executive risk team has received your message and will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Alex Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="cro@enterprise.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={contactCompany}
                  onChange={e => setContactCompany(e.target.value)}
                  placeholder="Global Financial Institution"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Message / Inquiry</label>
                <textarea
                  rows="3"
                  required
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  placeholder="How can we assist your executive risk team?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-900"
                ></textarea>
              </div>

              <button
                type="submit"
                className="sm:col-span-2 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Inquiry
              </button>
            </form>
          )}
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
