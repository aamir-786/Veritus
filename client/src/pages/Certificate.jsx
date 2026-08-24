import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Award, Download, ShieldCheck, Sparkles, Ribbon } from 'lucide-react';
import EffectiveVeritusLogo from '../components/EffectiveVeritusLogo';

export default function Certificate() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('executive'); // 'executive' | 'platinum' | 'gold'
  const [completedDate] = useState(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.getDashboardSummary();
        if (res.success) {
          const enrolled = res.enrolled_courses.find(c => c.id === courseId);
          if (enrolled && enrolled.is_completed) {
            setCourse(enrolled);
          } else {
            setCourse(null);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [courseId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">Loading executive certificate...</div>;
  if (!course) return <Navigate to="/dashboard" />;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center py-6 px-4 print:py-0 print:px-0 print:bg-white print:block">
      
      {/* Controls & Design Switcher (Hidden on Print) */}
      <div className="max-w-4xl w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 print:hidden">
        <div>
          <h1 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Executive Certificate
          </h1>
          <p className="text-xs text-slate-400">Select your preferred design theme below and click Print / Save PDF.</p>
        </div>

        {/* Theme Switcher Selector */}
        <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner gap-1">
          <button
            onClick={() => setSelectedTheme('executive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedTheme === 'executive' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Royal Navy
          </button>
          
          <button
            onClick={() => setSelectedTheme('platinum')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedTheme === 'platinum' 
                ? 'bg-slate-700 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Platinum Crest
          </button>

          <button
            onClick={() => setSelectedTheme('gold')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedTheme === 'gold' 
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Ribbon className="w-3.5 h-3.5 text-amber-400" /> Gold Classic
          </button>
        </div>

        {/* PDF Download Button */}
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Certificate Main Canvas Container */}
      <div className="w-full max-w-4xl print:max-w-none print:w-full print:h-screen flex items-center justify-center">
        
        {/* ========================================== */}
        {/* DESIGN 1: EXECUTIVE ROYAL NAVY (DEFAULT)   */}
        {/* ========================================== */}
        {selectedTheme === 'executive' && (
          <div 
            className="bg-white relative shadow-2xl rounded-2xl print:rounded-none overflow-hidden border-4 border-amber-500/30 print:border-none flex flex-col justify-between p-8 sm:p-12 md:p-14 print:p-16 aspect-[1.414/1] w-full animate-in fade-in duration-300"
          >
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                @page { size: landscape; margin: 0; }
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
              }
            `}} />

            {/* Business Corporate Background Watermark */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-[0.04] pointer-events-none mix-blend-multiply"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80')` }}
            />

            {/* Decorative Corner Ornaments */}
            <div className="absolute top-0 left-0 w-20 h-20 sm:w-24 sm:h-24 border-t-8 border-l-8 border-blue-900/80 pointer-events-none" />
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 border-t-8 border-r-8 border-blue-900/80 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 border-b-8 border-l-8 border-blue-900/80 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-24 sm:h-24 border-b-8 border-r-8 border-blue-900/80 pointer-events-none" />

            {/* Left Decorative Gold/Navy Accent Bar */}
            <div className="w-3 h-full bg-gradient-to-b from-blue-900 via-amber-500 to-blue-950 absolute left-0 top-0" />
            
            {/* Header with Exact Brand Logo & Subtitle */}
            <div className="flex justify-between items-start relative z-10">
              <div>
                <EffectiveVeritusLogo variant="dark" subtitle={true} className="scale-90 origin-top-left" />
              </div>
              <div className="text-right">
                <p className="text-[10px] sm:text-xs text-slate-500 font-mono font-bold uppercase">DATE: {completedDate}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 font-mono font-bold uppercase">ID: VRT-{course.id.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>

            {/* Main Body */}
            <div className="my-auto py-2 relative z-10">
              <div className="text-center space-y-2 sm:space-y-3">
                <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase">
                  Certificate <span className="text-blue-900">of Completion</span>
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">
                  This is to officially certify that
                </p>
                
                <div className="py-1 sm:py-2">
                  <h3 className="font-display text-2xl sm:text-4xl font-extrabold text-blue-950 border-b-2 border-amber-400 inline-block px-8 pb-1">
                    {user?.full_name || 'Executive Practitioner'}
                  </h3>
                </div>
                
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">
                  has successfully completed the executive masterclass program
                </p>
                
                <h4 className="font-display text-sm sm:text-lg font-bold text-slate-900 max-w-2xl mx-auto leading-snug">
                  {course.title}
                </h4>
              </div>
            </div>

            {/* Footer & Signature / Official Seal */}
            <div className="flex justify-between items-end relative z-10 pt-2 border-t border-slate-100">
              <div className="text-left">
                <div className="mb-1">
                  <span className="text-base sm:text-2xl font-bold text-slate-800 italic" style={{ fontFamily: 'Georgia, serif' }}>
                    Kashif Qadir
                  </span>
                </div>
                <div className="w-14 h-0.5 bg-blue-900 mb-1"></div>
                <p className="text-[10px] sm:text-xs text-slate-900 font-extrabold uppercase tracking-wider">Kashif Qadir</p>
                <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase">Founder & Executive Director</p>
              </div>

              {/* Official Credential Badge / Seal */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100/80 p-2 sm:p-3 rounded-xl border border-amber-300/60 shadow-xs">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-wider leading-none">VERIFIED CREDENTIAL</p>
                  <p className="text-[8px] sm:text-[9px] font-semibold text-amber-800 tracking-tight mt-0.5">Effective Risk Management</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* DESIGN 2: PLATINUM CREST MODERN           */}
        {/* ========================================== */}
        {selectedTheme === 'platinum' && (
          <div 
            className="bg-slate-900 text-white relative shadow-2xl rounded-2xl print:rounded-none overflow-hidden border-4 border-slate-700 print:border-none flex flex-col justify-between p-8 sm:p-12 md:p-14 print:p-16 aspect-[1.414/1] w-full animate-in fade-in duration-300"
          >
            {/* Modern Skyscraper Backdrop Watermark */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-[0.08] pointer-events-none mix-blend-screen"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80')` }}
            />

            {/* Sleek Dual Border Frame */}
            <div className="absolute inset-4 border border-slate-700/60 rounded-xl pointer-events-none" />

            {/* Top Header Logo with Deciding in the Dark */}
            <div className="flex justify-between items-start relative z-10">
              <EffectiveVeritusLogo variant="light" subtitle={true} className="scale-90 origin-top-left" />
              <div className="text-right">
                <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-400 font-bold">
                  VERIFIED EXECUTIVE PASS
                </span>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-1">ISSUED: {completedDate}</p>
              </div>
            </div>

            {/* Center Content */}
            <div className="text-center my-auto relative z-10 space-y-3">
              <p className="text-[10px] sm:text-xs text-cyan-400 font-mono uppercase tracking-[0.3em]">EXECUTIVE ACCREDITATION</p>
              <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
                CERTIFICATE OF MASTERY
              </h2>
              
              <div className="py-2">
                <h3 className="font-display text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 border-b border-cyan-500/50 inline-block px-10 pb-1">
                  {user?.full_name || 'Executive Practitioner'}
                </h3>
              </div>

              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest max-w-lg mx-auto">
                is hereby recognized for successfully mastering advanced strategic protocols in
              </p>
              <h4 className="font-display text-base sm:text-xl font-bold text-cyan-300 max-w-2xl mx-auto">
                {course.title}
              </h4>
            </div>

            {/* Platinum Footer */}
            <div className="flex justify-between items-end relative z-10 pt-2 border-t border-slate-800">
              <div>
                <span className="text-base sm:text-2xl font-bold text-white italic" style={{ fontFamily: 'Georgia, serif' }}>
                  Kashif Qadir
                </span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Director of Assessment</p>
              </div>

              <div className="flex items-center gap-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <p className="text-[9px] font-mono text-slate-300 font-bold">HASH: {course.id.substring(0, 10).toUpperCase()}</p>
                  <p className="text-[8px] text-slate-500 font-bold">PLATINUM LEVEL RECORD</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* DESIGN 3: GOLD CLASSIC CREST              */}
        {/* ========================================== */}
        {selectedTheme === 'gold' && (
          <div 
            className="bg-[#FFFDF9] relative shadow-2xl rounded-2xl print:rounded-none overflow-hidden border-8 border-amber-600/40 print:border-none flex flex-col justify-between p-8 sm:p-12 md:p-14 print:p-16 aspect-[1.414/1] w-full text-slate-900 animate-in fade-in duration-300"
          >
            {/* Ornamental Gold Inner Border */}
            <div className="absolute inset-3 border-2 border-amber-500/60 rounded-lg pointer-events-none" />
            <div className="absolute inset-5 border border-amber-400/40 pointer-events-none" />

            {/* Header with Exact Logo */}
            <div className="flex justify-between items-start relative z-10">
              <div>
                <EffectiveVeritusLogo variant="dark" subtitle={true} className="scale-90 origin-top-left" />
              </div>
              <div className="text-right">
                <Ribbon className="w-8 h-8 text-amber-500 ml-auto" />
                <p className="text-[9px] text-amber-900 font-serif font-bold uppercase mt-1">No. {course.id.substring(0, 6).toUpperCase()}</p>
              </div>
            </div>

            {/* Main Body */}
            <div className="text-center my-auto relative z-10 space-y-2 sm:space-y-3">
              <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-amber-950 tracking-wide uppercase">
                Certificate of Distinction
              </h2>
              <div className="w-24 h-0.5 bg-amber-500 mx-auto my-1" />
              
              <p className="font-serif text-xs text-amber-900 italic">This scroll attests that</p>
              
              <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 border-b border-amber-500/80 inline-block px-12 pb-1">
                {user?.full_name || 'Executive Practitioner'}
              </h3>
              
              <p className="font-serif text-xs text-amber-900 italic">
                has fulfilled all academic and practical requirements for the completion of
              </p>
              
              <h4 className="font-serif text-base sm:text-xl font-extrabold text-amber-950 max-w-xl mx-auto">
                {course.title}
              </h4>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end relative z-10 pt-2 border-t border-amber-200">
              <div className="text-left">
                <span className="font-serif text-xl font-bold text-slate-900 italic">Kashif Qadir</span>
                <div className="w-20 h-0.5 bg-amber-600 my-0.5" />
                <p className="font-serif text-[10px] text-amber-900 font-bold uppercase">Executive Director</p>
              </div>

              {/* Gold Crest Medal Stamp */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 text-amber-950 flex flex-col items-center justify-center font-bold shadow-md border-2 border-amber-300 text-center shrink-0">
                <Award className="w-6 h-6 stroke-[2.5]" />
                <span className="text-[7px] font-black uppercase tracking-tighter leading-none mt-0.5">VERIFIED</span>
              </div>

              <div className="text-right">
                <p className="font-serif text-xs font-bold text-slate-900">{completedDate}</p>
                <div className="w-20 h-0.5 bg-amber-600 my-0.5 ml-auto" />
                <p className="font-serif text-[10px] text-amber-900 font-bold uppercase">Date of Award</p>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
