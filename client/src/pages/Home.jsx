import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Cpu,
  PlayCircle,
  Star
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { api } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import QuestionDetailModal from '../components/QuestionDetailModal';
import AICopilotModal from '../components/AICopilotModal';
import ScrollReveal from '../components/ScrollReveal';

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [copilotQuestion, setCopilotQuestion] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const navigate = useNavigate();

  const carouselRef = React.useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const qRes = await api.getQuestions({ limit: 6 });
        if (qRes.success) setQuestions(qRes.questions.slice(0, 6));

        const cRes = await api.getCourses();
        if (cRes.success) {
          // Shuffle courses to show random courses
          const shuffled = cRes.courses.sort(() => 0.5 - Math.random());
          setCourses(shuffled);
        }

        const tRes = await api.getTemplates();
        if (tRes.success) setTemplates(tRes.templates);

        try {
          const rRes = await api.getLandingPageReviews();
          if (rRes.success) setReviews(rRes.reviews || []);
        } catch (err) {
          console.error("Failed to fetch reviews", err);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Horizontal scroll timer
  useEffect(() => {
    if (courses.length === 0) return;
    const timer = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        // If reached the end, snap back to start. Otherwise, scroll right by approx one card width.
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll right by 320px (card width + gap)
          carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 3500); // 3.5 seconds timer
    return () => clearInterval(timer);
  }, [courses]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (contactLoading) return;
    setContactLoading(true);
    try {
      await api.sendContactInquiry({
        name: contactName,
        email: contactEmail,
        company: contactCompany,
        message: contactMessage
      });
      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactCompany('');
      setContactMessage('');
    } catch (err) {
      console.warn('Contact email error:', err);
    } finally {
      setContactLoading(false);
    }
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
      <section className="relative pt-1 pb-20 overflow-hidden border-b border-slate-200 bg-section-hero">

        {/* Subtle Executive Dot Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 relative z-10">

          <ScrollReveal animation="slide-down" delay={0}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 backdrop-blur border border-blue-200 text-blue-900 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-4 h-4 text-blue-700" /> Effective RM Platform Family • 100 Risk Questions Dataset
            </div>
          </ScrollReveal>

          <ScrollReveal animation="zoom-in" delay={100}>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
              Deciding in the Dark <br />
              <span className="text-blue-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900">
                Executive Knowledge & Decision Platform
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal animation="slide-up" delay={200}>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Where risk leaders learn, watch video masterclasses, download framework templates, and tailor 100 structured risk questions using 7-way taxonomy and AI Copilot guidance.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="slide-up" delay={300}>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/questions"
                className="px-6 py-3 rounded-xl bg-blue-900 text-white font-extrabold hover:bg-blue-800 shadow-md shadow-blue-900/15 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 text-xs"
              >
                <Compass className="w-4 h-4 stroke-[2.5]" />
                Explore 100 Questions Matrix
              </Link>

              <Link
                to="/courses"
                className="px-6 py-3 rounded-xl bg-white/90 hover:bg-white text-slate-800 font-bold border border-slate-300 hover:border-slate-400 hover:-translate-y-0.5 transition-all flex items-center gap-2 text-xs shadow-2xs"
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                View Masterclasses
              </Link>
            </div>
          </ScrollReveal>

          {/* Metrics Bar with Background Card Accents & Slide Animations */}
          <div className="pt-2 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <ScrollReveal animation="slide-up" delay={150}>
              <div className="p-4 rounded-2xl glass-card glass-card-hover border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
                <div className="text-2xl font-extrabold text-slate-900 font-display">100</div>
                <div className="text-[11px] text-slate-500 font-bold">Structured Questions</div>
                <div className="absolute -right-3 -bottom-3 text-slate-200 group-hover:text-blue-100 transition-colors pointer-events-none">
                  <Compass className="w-16 h-16 opacity-40" />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="slide-up" delay={250}>
              <div className="p-4 rounded-2xl glass-card glass-card-hover border border-blue-200/90 shadow-xs relative overflow-hidden group hover:border-blue-400 transition-all">
                <div className="text-2xl font-extrabold text-blue-900 font-display">7 Tags</div>
                <div className="text-[11px] text-slate-500 font-bold">Taxonomy Filter Matrix</div>
                <div className="absolute -right-3 -bottom-3 text-blue-100 pointer-events-none">
                  <Layers className="w-16 h-16 opacity-50" />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="slide-up" delay={350}>
              <div className="p-4 rounded-2xl glass-card glass-card-hover border border-emerald-200/90 shadow-xs relative overflow-hidden group hover:border-emerald-400 transition-all">
                <div className="text-2xl font-extrabold text-emerald-800 font-display">20,000+</div>
                <div className="text-[11px] text-slate-500 font-bold">Words of Guidance</div>
                <div className="absolute -right-3 -bottom-3 text-emerald-100 pointer-events-none">
                  <TrendingUp className="w-16 h-16 opacity-50" />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="slide-up" delay={450}>
              <div className="p-4 rounded-2xl glass-card glass-card-hover border border-amber-200/90 shadow-xs relative overflow-hidden group hover:border-amber-400 transition-all">
                <div className="text-2xl font-extrabold text-amber-800 font-display">14-Day</div>
                <div className="text-[11px] text-slate-500 font-bold">Regulator Quick-Wins</div>
                <div className="absolute -right-3 -bottom-3 text-amber-100 pointer-events-none">
                  <Zap className="w-16 h-16 opacity-50" />
                </div>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* 2. Visual Enterprise Boardroom Feature Section with Background Image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <ScrollReveal animation="slide-up" delay={100}>
          <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 shadow-md grid grid-cols-1 lg:grid-cols-2 bg-section-governance">

            <div className="p-8 lg:p-12 space-y-4 flex flex-col justify-center bg-white/70 backdrop-blur-md">
              <ScrollReveal animation="slide-right" delay={150}>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold w-fit">
                  <ShieldCheck className="w-4 h-4 text-blue-700" /> Proven Executive Governance
                </div>
              </ScrollReveal>

              <ScrollReveal animation="slide-right" delay={200}>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Structured Risk Data Designed for Executive Decision-Making
                </h2>
              </ScrollReveal>

              <ScrollReveal animation="slide-right" delay={250}>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  No static PDF offers interactive multi-facet filtering. Veritus allows risk leaders to ask <em>"What can I fix in a fortnight, cheaply, that my regulator cares about?"</em> and get an instant answer.
                </p>
              </ScrollReveal>

              <ScrollReveal animation="slide-right" delay={300}>
                <div className="space-y-2.5 pt-2 text-xs font-semibold text-slate-800">
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
              </ScrollReveal>

              <ScrollReveal animation="slide-right" delay={350}>
                <div className="pt-3">
                  <Link
                    to="/questions"
                    className="px-5 py-2.5 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 transition-colors text-xs inline-flex items-center gap-1.5 shadow-xs"
                  >
                    Launch Taxonomy Explorer <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>
            </div>

            <div className="relative min-h-[280px] lg:min-h-[400px] overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80"
                alt="Executive Risk Presentation"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-white/80 lg:via-transparent lg:to-transparent" />
            </div>

          </div>
        </ScrollReveal>
      </section>

      {/* 3. 100 Questions Teaser Grid Section */}
      <section className="relative py-10 border-y border-slate-200/80 bg-section-questions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          <ScrollReveal animation="slide-up" delay={0}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
              <div>
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider font-mono">Interactive Explorer</span>
                <h2 className="font-display text-2xl font-extrabold text-slate-900">100 Risk Questions Preview</h2>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">Click any question to view its preview snippet or unlock full guidance.</p>
              </div>
              <Link to="/questions" className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1">
                Browse Full 100 Questions Matrix <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {questions.map((q, index) => (
              <ScrollReveal
                key={q.id}
                animation={index % 2 === 0 ? 'slide-left' : 'slide-right'}
                delay={(index % 3) * 100}
              >
                <QuestionCard
                  question={q}
                  onClick={setSelectedQuestion}
                  onAskCopilot={setCopilotQuestion}
                />
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* 4. Masterclasses Feature Banner with Imagery */}
      <section className="bg-section-masterclass border-b border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <ScrollReveal animation="slide-down" delay={0}>
            <div className="text-center max-w-2xl mx-auto space-y-1">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider font-mono">Video Masterclasses</span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">Executive Video Learning Series</h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Closed-captioned video playback, reading modules, and framework attachments.</p>
            </div>
          </ScrollReveal>

          <style>{`
            .hide-scrollbar::-webkit-scrollbar { display: none; }
          `}</style>

          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scroll-smooth hide-scrollbar"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            {courses.map((course, idx) => (
              <ScrollReveal key={course.id} animation="zoom-in" delay={150 * (idx % 4)} className="shrink-0 w-[280px] sm:w-[320px] snap-center">
                <div
                  onClick={() => navigate(`/courses/${course.slug}`)}
                  className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-xs transition-all group h-full cursor-pointer"
                >
                  <div>
                    <div className="relative overflow-hidden">
                      <img src={course.cover_image || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800'} alt={course.title} className="w-full h-40 object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur text-blue-900 text-[10px] font-bold border border-blue-200 shadow-xs">
                        {course.tier}
                      </div>
                    </div>
                    <div className="p-5 sm:p-6 space-y-3 flex-grow">
                      <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2 leading-snug">{course.title}</h3>

                      <div className="flex items-center gap-2 pt-1 pb-1">
                        <div className={`flex ${course.rating_count > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${course.rating_count > 0 && course.rating_avg >= i ? 'fill-emerald-500 text-emerald-500' : (course.rating_count > 0 && course.rating_avg >= i - 0.5 ? 'fill-emerald-500 text-emerald-500 opacity-50' : 'fill-slate-200 text-slate-200')}`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">
                          {course.rating_count > 0 ? `${course.rating_avg} (${course.rating_count} reviews)` : 'No reviews'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-2 pt-1">{course.headline}</p>
                      <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 pt-4 mt-3 border-t border-slate-100 font-medium">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-amber-700" /> {course.module_count} Modules
                        </span>
                        <span className="flex items-center gap-1">
                          <PlayCircle className="w-3.5 h-3.5 text-blue-700" /> {course.lesson_count} Lessons
                        </span>
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold w-full mt-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Gated Access Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border-t border-slate-100/80 bg-slate-50/80 backdrop-blur flex items-center justify-between mt-auto">
                    <div>
                      <div className="text-lg font-extrabold text-emerald-800">${course.price}</div>
                    </div>
                    <Link
                      to={`/courses/${course.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 rounded-lg bg-blue-900 text-white font-bold hover:bg-blue-800 transition-colors text-[11px] flex items-center gap-1 shadow-xs"
                    >
                      Syllabus <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal animation="slide-up" delay={400}>
            <div className="flex justify-center pt-8">
              <Link
                to="/courses"
                className="px-6 py-3 rounded-xl bg-white text-slate-800 font-bold border border-slate-300 hover:border-slate-400 hover:-translate-y-0.5 transition-all text-xs shadow-sm flex items-center gap-2"
              >
                View More Masterclasses <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. Free Entry Point Lead Magnet Template Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="zoom-in" delay={100}>
          <div className="glass-card rounded-2xl p-8 border border-blue-200/90 bg-section-lead flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">

            <div className="space-y-2 max-w-xl relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-100/90 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Free Lead Magnet Asset
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                Executive Board Risk Deck Template (PPTX)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Earn immediate value with our 15-slide board presentation deck designed to answer regulator inquiries without administrative delay.
              </p>
            </div>

            <Link
              to="/templates"
              className="px-6 py-3 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 shadow-md hover:-translate-y-0.5 shrink-0 text-xs flex items-center gap-2 relative z-10 transition-all"
            >
              <FileText className="w-4 h-4" /> Download Free Template
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* 6. Pricing Tiers Section */}
      <section className="py-10 bg-section-pricing border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <ScrollReveal animation="slide-down" delay={0}>
            <div className="text-center max-w-2xl mx-auto space-y-1">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider font-mono">Flexible Licensing</span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">Platform Pricing & Access Tiers</h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Choose the access level that fits your executive team.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <ScrollReveal animation="slide-up" delay={100}>
              <div className="glass-card rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xs hover:border-slate-300 transition-all h-full flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Free Entry</span>
                  <h3 className="font-display text-xl font-bold text-slate-900 mt-1">Practitioner Preview</h3>
                  <div className="text-2xl font-extrabold text-slate-900 mt-2">$0 <span className="text-xs font-normal text-slate-500">/ Free</span></div>
                  <ul className="space-y-2 text-xs text-slate-600 font-medium mt-4">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Browse 100 Risk Questions Titles</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 7-Way Taxonomy Filtering</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Free Board Deck PPTX Download</li>
                  </ul>
                </div>
                <Link to="/register" className="block text-center py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors mt-6">
                  Create Free Account
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="zoom-in" delay={200}>
              <div className="glass-card glass-card-hover rounded-2xl p-6 border-2 border-blue-600 bg-blue-50/40 relative space-y-4 shadow-md h-full flex flex-col justify-between transform md:-translate-y-2">
                <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-blue-900 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">Most Popular</span>
                <div>
                  <span className="text-xs font-bold text-blue-900 uppercase">Core License</span>
                  <h3 className="font-display text-xl font-bold text-slate-900 mt-1">Single Masterclass Access</h3>
                  <div className="text-2xl font-extrabold text-blue-900 mt-2">$149 – $299 <span className="text-xs font-normal text-slate-500">/ Lifetime</span></div>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium mt-4">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Full Video Playback & Closed Captions</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Unlocked 20,000+ Words Guidance</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> AI Risk Decision Copilot</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Downloadable Framework Templates</li>
                  </ul>
                </div>
                <Link to="/courses" className="block text-center py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors mt-6">
                  Explore Masterclasses
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="slide-up" delay={300}>
              <div className="glass-card rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xs hover:border-slate-300 transition-all h-full flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase">Enterprise</span>
                  <h3 className="font-display text-xl font-bold text-slate-900 mt-1">Team & Board License</h3>
                  <div className="text-2xl font-extrabold text-slate-900 mt-2">Custom <span className="text-xs font-normal text-slate-500">/ Team</span></div>
                  <ul className="space-y-2 text-xs text-slate-600 font-medium mt-4">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> All 100 Questions & Masterclasses</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Custom Admin Control Studio Access</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Dedicated Organizational AI Copilot</li>
                  </ul>
                </div>
                <a href="#contact" className="block text-center py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors mt-6">
                  Contact Sales
                </a>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* 6.5 User Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-14 bg-section-reviews border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <ScrollReveal animation="slide-down" delay={0}>
              <div className="text-center max-w-2xl mx-auto space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider font-mono">Testimonials</span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">Is Veritus worth it? Hear from our users</h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, idx) => (
                <ScrollReveal key={review.id} animation="zoom-in" delay={idx * 100}>
                  <div className="glass-card rounded-2xl p-6 border border-slate-200 space-y-4 shadow-sm h-full flex flex-col transition-all hover:border-emerald-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold shrink-0 text-lg">
                        {review.profiles?.full_name ? review.profiles.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{review.profiles?.full_name || 'Anonymous User'}</div>
                        <div className="flex items-center text-emerald-500">
                          {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-emerald-500" />)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed italic flex-grow">
                      "{review.comment}"
                    </p>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Reviewed a {review.product_type}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. FAQ Section */}
      <section className="py-10 bg-section-faq">
        <div className="max-w-4xl mx-auto px-4 space-y-6">

          <ScrollReveal animation="slide-down" delay={0}>
            <div className="text-center space-y-1">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider font-mono">Got Questions?</span>
              <h2 className="font-display text-2xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
            </div>
          </ScrollReveal>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <ScrollReveal key={idx} animation="slide-up" delay={idx * 80}>
                <div className="glass-card rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs hover:border-blue-300 transition-colors">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-blue-900' : 'text-slate-400'}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 font-medium bg-white/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Contact Us Section */}
      <section id="contact" className="max-w-4xl mx-auto px-4 pt-4">
        <ScrollReveal animation="zoom-in" delay={100}>
          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-200/90 space-y-6 shadow-sm bg-section-contact">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mx-auto font-bold mb-2 shadow-2xs">
                <Mail className="w-5 h-5 text-blue-700" />
              </div>
              <h2 className="font-display text-2xl font-extrabold text-slate-900">Get in Touch with Our Team</h2>
              <p className="text-xs text-slate-600 font-medium">Have questions regarding enterprise team access or custom risk frameworks?</p>
            </div>

            {contactSuccess ? (
              <div className="p-6 bg-emerald-50/90 backdrop-blur border border-emerald-200 rounded-2xl text-center space-y-2 text-xs">
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 backdrop-blur border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-900 transition-colors"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 backdrop-blur border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-900 transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={contactCompany}
                    onChange={e => setContactCompany(e.target.value)}
                    placeholder="Global Financial Institution"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 backdrop-blur border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-900 transition-colors"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 backdrop-blur border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-900 transition-colors"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="sm:col-span-2 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition-all hover:shadow-md"
                >
                  <Send className={`w-4 h-4 ${contactLoading ? 'animate-pulse' : ''}`} />
                  {contactLoading ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </ScrollReveal>
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

