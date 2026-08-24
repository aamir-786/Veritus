import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Award, Download } from 'lucide-react';

export default function Certificate() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [completedDate, setCompletedDate] = useState(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.getDashboardSummary();
        if (res.success) {
          const enrolled = res.enrolled_courses.find(c => c.id === courseId);
          if (enrolled && enrolled.is_completed) {
            setCourse(enrolled);
          } else {
            // Not completed or not found
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-500 text-sm">Loading certificate...</div>;
  if (!course) return <Navigate to="/dashboard" />;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-12 px-4 print:py-0 print:px-0 print:bg-white">
      
      {/* Controls (Hidden on Print) */}
      <div className="max-w-5xl w-full flex justify-between items-center mb-8 print:hidden">
        <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-emerald-600" /> Your Certificate
        </h1>
        <button
          onClick={handlePrint}
          className="px-6 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 transition-colors shadow-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      {/* Certificate Canvas - Minimalist Corporate Design */}
      <div 
        className="bg-white relative shadow-2xl overflow-hidden print:shadow-none print:w-[1000px] print:h-[700px]"
        style={{ width: '1000px', height: '700px', minWidth: '1000px', minHeight: '700px' }}
      >
        {/* Style scoped only to certificate for crisp printing */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page { size: landscape; margin: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
          }
        `}} />

        {/* Blue Edge Bar */}
        <div className="w-6 h-full bg-blue-900 absolute left-0 top-0 print:bg-[#1e3a8a]"></div>
        
        <div className="w-full h-full p-20 pl-28 flex flex-col justify-between absolute inset-0">
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-sans text-3xl font-black text-slate-900 tracking-tighter print:text-black">VERITUS</h1>
              <p className="font-sans text-[10px] text-slate-400 tracking-widest uppercase font-bold mt-1">By EffectiveRM</p>
            </div>
            <div className="text-right">
              <p className="font-sans text-sm text-slate-400 font-bold uppercase">DATE: {completedDate}</p>
              <p className="font-sans text-sm text-slate-400 font-bold uppercase">ID: VRT-{course.id.substring(0, 6).toUpperCase()}</p>
            </div>
          </div>

          <div>
            <h2 className="font-sans text-6xl text-slate-900 font-black mb-2 tracking-tighter print:text-black">CERTIFICATE</h2>
            <h3 className="font-sans text-2xl text-blue-900 font-bold mb-12 uppercase tracking-widest print:text-[#1e3a8a]">Of Completion</h3>
            
            <p className="font-sans text-slate-500 mb-2 uppercase tracking-widest text-sm font-bold">Awarded to</p>
            <h4 className="font-sans text-5xl text-slate-900 font-black mb-10 border-b-4 border-slate-100 pb-4 inline-block pr-20 print:text-black print:border-gray-200">
              {user?.full_name || 'Executive Practitioner'}
            </h4>
            
            <p className="font-sans text-slate-500 mb-2 uppercase tracking-widest text-sm font-bold">For successfully completing</p>
            <h5 className="font-sans text-2xl text-slate-800 font-bold print:text-gray-800">{course.title}</h5>
          </div>
          
          <div className="flex justify-between items-end">
            <div className="text-left">
              <div className="mb-2">
                <span className="font-sans text-2xl font-bold text-slate-800 italic print:text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
                  Kashif Qadir
                </span>
              </div>
              <div className="w-8 h-1 bg-blue-900 mb-3 print:bg-[#1e3a8a]"></div>
              <p className="font-sans text-xs text-slate-900 uppercase tracking-wider font-black print:text-black">Kashif Qadir</p>
              <p className="font-sans text-[10px] text-slate-500 uppercase tracking-widest font-bold">Founder & Director</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
