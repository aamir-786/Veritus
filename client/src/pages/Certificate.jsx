import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Award, Download, ShieldCheck, Share2 } from 'lucide-react';
import EffectiveVeritusLogo from '../components/EffectiveVeritusLogo';

const LinkedInIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

export default function Certificate() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [completedDate] = useState(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.getDashboardSummary();
        if (res.success && res.enrolled_courses) {
          const enrolled = res.enrolled_courses.find(c => c.id === courseId || c.slug === courseId);
          if (enrolled) {
            setCourse(enrolled);
            if (res.user && res.user.full_name) {
              setStudentName(res.user.full_name);
            }
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.log('Fetching public course details...');
      }

      try {
        const publicRes = await api.getCourseDetails(courseId);
        if (publicRes.success && publicRes.course) {
          setCourse(publicRes.course);
        } else {
          setCourse(null);
        }
      } catch (err) {
        console.error(err);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [courseId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm font-mono">Verifying certificate credential...</div>;

  if (!course) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
      <ShieldCheck className="w-12 h-12 text-rose-500" />
      <h1 className="font-display text-xl font-bold text-white">Certificate Credential Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm leading-relaxed">The certificate identifier or public verification URL you entered could not be verified in our executive record registry.</p>
      <a href="/" className="px-4 py-2 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors shadow-md">
        Return to Home Page
      </a>
    </div>
  );

  const handlePrint = () => {
    window.print();
  };

  const get4DigitCertNo = (idStr) => {
    if (course?.cert_number) return course.cert_number;
    if (!idStr) return 1042;
    let hash = 0;
    const combined = `${user?.id || 'u'}-${idStr}`;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 9000) + 1000;
  };

  const certNo = course?.cert_number || get4DigitCertNo(course.id);
  const displayName = studentName || user?.full_name || 'Executive Practitioner';
  const verifyUrl = `${window.location.origin}/certificate/${course.slug || course.id}`;

  const linkedInCertUrl = `https://www.linkedin.com/profile/add?${new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: course.title,
    organizationName: 'Veritus Executive Risk Platform',
    issueYear: String(new Date().getFullYear()),
    issueMonth: String(new Date().getMonth() + 1),
    certUrl: verifyUrl,
    certId: String(certNo)
  }).toString()}`;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center py-6 px-4 print:py-0 print:px-0 print:bg-white print:block">
      
      {/* Controls (Hidden on Print) */}
      <div className="max-w-4xl w-full flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" /> Executive Certificate
          </h1>
          <p className="text-xs text-slate-400">Click below to print or add your verified credential directly to LinkedIn.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <a
            href={linkedInCertUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer shrink-0"
            title="Add verified credential directly to your LinkedIn profile"
          >
            <LinkedInIcon className="w-4 h-4 text-white" /> Add to LinkedIn
          </a>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Certificate Main Canvas Container */}
      <div className="w-full max-w-4xl print:max-w-none print:w-full print:h-screen flex items-center justify-center">
        <div 
          className="bg-white relative shadow-2xl rounded-2xl print:rounded-none overflow-hidden border-4 border-amber-500/30 print:border-none flex flex-col justify-between p-8 sm:p-12 md:p-14 print:p-16 aspect-[1.414/1] w-full"
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
          
          {/* Header with Exact Brand Logo & 4-digit Certificate Number */}
          <div className="flex justify-between items-start relative z-10">
            <div>
              <EffectiveVeritusLogo variant="dark" subtitle={true} className="scale-90 origin-top-left" />
            </div>
            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-slate-500 font-mono font-bold uppercase">DATE: {completedDate}</p>
              <p className="text-[10px] sm:text-xs text-slate-900 font-mono font-black uppercase">CERTIFICATE NO: #{certNo}</p>
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
                  {displayName}
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
                <p className="text-[7px] font-mono text-slate-400 font-medium tracking-tight mt-0.5">VERIFY: {verifyUrl}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
