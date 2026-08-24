import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, FileText, Download, Award, ShieldCheck } from 'lucide-react';
import { api, API_BASE } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import ReviewModal from '../components/ReviewModal';

export default function Dashboard() {
  const { user } = useAuth();
  const { cartItems, removeFromCart } = useCart();
  const [data, setData] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [downloadingId, setDownloadingId] = useState(null);
  const [activeTab, setActiveTab] = useState('mylearning');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewCourseId, setReviewCourseId] = useState(null);

  const handleDownload = async (tpl) => {
    try {
      setDownloadingId(tpl.id);
      const { blob, filename } = await api.downloadTemplateFile(tpl.id);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert(err.message || 'Failed to download template. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, certRes] = await Promise.all([
          api.getDashboardSummary(),
          api.getCertificates()
        ]);
        
        if (dashRes.success) {
          setData(dashRes);
          
          // Auto-remove any already purchased items from the local cart
          const ownedIds = [
            ...dashRes.enrolled_courses.map(c => c.id),
            ...dashRes.accessible_templates.map(t => t.id)
          ];
          
          cartItems.forEach(item => {
            if (ownedIds.includes(item.id)) {
              removeFromCart(item.id);
            }
          });
        }
        
        if (certRes.success) {
          setCertificates(certRes.certificates);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [cartItems, removeFromCart]);

  if (loading) return <div className="py-16 text-center text-slate-500 text-xs">Loading your member dashboard...</div>;
  const completedFromSummary = (data?.enrolled_courses || []).filter(c => c.is_completed).map(c => {
    let hash = 0;
    const str = `${user?.id || 'u'}-${c.id}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const certNo = Math.abs(hash % 9000) + 1000;
    return {
      id: c.id,
      course_id: c.id,
      course_slug: c.slug,
      course_title: c.title,
      cert_number: certNo,
      issued_at: c.completed_at || new Date().toISOString()
    };
  });

  const displayCertificates = certificates.length > 0 ? certificates : completedFromSummary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-900 bg-[#F8FAFC]">
      
      {/* Header Profile Summary */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-display text-lg font-bold">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="text-[11px] text-blue-900 font-mono font-bold uppercase">Executive Practitioner Portal</div>
            <h1 className="font-display text-xl font-extrabold text-slate-900">{user?.full_name}</h1>
            <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
          <div className="flex-1 md:flex-none p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
            <div className="text-lg font-extrabold text-slate-900 font-display">{data.enrolled_courses.length}</div>
            <div className="text-[10px] text-slate-500 font-medium">Enrolled Courses</div>
          </div>
          <div className="flex-1 md:flex-none p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
            <div className="text-lg font-extrabold text-emerald-700 font-display">{data.accessible_templates.length}</div>
            <div className="text-[10px] text-slate-500 font-medium">Unlocked Assets</div>
          </div>
          <div className="flex-1 md:flex-none p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
            <div className="text-lg font-extrabold text-amber-600 font-display">{displayCertificates.length}</div>
            <div className="text-[10px] text-slate-500 font-medium">Certificates</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('mylearning')}
          className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === 'mylearning' ? 'text-blue-900' : 'text-slate-500 hover:text-slate-900'}`}
        >
          My Learning
          {activeTab === 'mylearning' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-900 rounded-t-full"></span>}
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === 'assets' ? 'text-blue-900' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Digital Assets
          {activeTab === 'assets' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-900 rounded-t-full"></span>}
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === 'certificates' ? 'text-blue-900' : 'text-slate-500 hover:text-slate-900'}`}
        >
          My Certificates
          {activeTab === 'certificates' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-900 rounded-t-full"></span>}
        </button>
      </div>

      {/* Enrolled Masterclasses */}
      {activeTab === 'mylearning' && (
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-blue-900" /> Enrolled Masterclasses & Learning Progress
        </h2>

        {data.enrolled_courses.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center space-y-3">
            <p className="text-slate-600 text-xs font-medium">You have not enrolled in any masterclasses yet.</p>
            <Link to="/courses" className="inline-block px-4 py-2 bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs">
              Explore Masterclass Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.enrolled_courses.map(course => (
              <div 
                key={course.id} 
                onClick={() => {
                  if (course.resume_lesson) {
                    navigate(`/learn/${course.slug}/lesson/${course.resume_lesson.id}`);
                  } else {
                    navigate(`/courses/${course.slug}`);
                  }
                }}
                className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-xs group h-full cursor-pointer"
              >
                <div>
                  <div className="relative overflow-hidden">
                    <img src={course.cover_image || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800'} alt={course.title} className="w-full h-32 object-cover transition-transform duration-700 group-hover:scale-105" />
                    {course.tier && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur text-blue-900 text-[10px] font-bold border border-blue-200 shadow-xs">
                        {course.tier}
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="font-display text-base font-bold text-slate-900 leading-tight">{course.title}</h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">{course.headline || 'Continue your learning journey with this masterclass.'}</p>
                    
                    {/* Progress Bar */}
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Course Completion</span>
                        <span className="font-bold text-blue-900">{course.progress_percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div 
                          className="h-full bg-blue-900 transition-all duration-500 rounded-full" 
                          style={{ width: `${course.progress_percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-auto">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{course.completed_lessons} / {course.total_lessons} Lessons</span>
                  
                  {course.is_completed ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                      {!course.user_has_reviewed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewCourseId(course.id);
                            setReviewModalOpen(true);
                          }}
                          className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold text-[10px] hover:bg-slate-50 transition-colors shadow-xs"
                        >
                          Leave a Review
                        </button>
                      )}
                      <Link
                        to={`/certificate/${course.id}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Award className="w-3.5 h-3.5" /> Certificate
                      </Link>
                    </div>
                  ) : course.resume_lesson && (
                    <Link
                      to={`/learn/${course.slug}/lesson/${course.resume_lesson.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full sm:w-auto justify-center px-3 py-1.5 rounded-lg bg-blue-900 text-white font-bold text-[10px] hover:bg-blue-800 transition-colors flex items-center gap-1 shadow-xs"
                    >
                      Resume Learning
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Accessible Digital Templates */}
      {activeTab === 'assets' && (
      <>
        <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-700" /> Accessible Digital Risk Frameworks
        </h2>

        {data.accessible_templates.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center space-y-3">
            <p className="text-slate-600 text-xs font-medium">You have not unlocked any digital risk frameworks yet.</p>
            <Link to="/templates" className="inline-block px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors">
              Explore Template Hub
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.accessible_templates.map(tpl => (
            <div key={tpl.id} className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-xs h-full">
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {tpl.category}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Unlocked
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-slate-900 leading-snug">{tpl.title}</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed font-normal line-clamp-3">{tpl.description || 'Access your digital risk framework asset.'}</p>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 mt-auto">
                <span className="text-[10px] text-slate-500 font-medium">Ready for download</span>
                <button
                  onClick={() => handleDownload(tpl)}
                  disabled={downloadingId === tpl.id}
                  className={`px-3 py-1.5 rounded-lg text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                    downloadingId === tpl.id 
                      ? 'bg-slate-300 text-slate-500 cursor-wait' 
                      : 'bg-emerald-700 hover:bg-emerald-600'
                  }`}
                >
                  {downloadingId === tpl.id ? (
                    <span className="flex items-center gap-1 animate-pulse">
                      Downloading...
                    </span>
                  ) : (
                    <>
                      <Download className="w-3 h-3" /> Download
                    </>
                  )}
                </button>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Unlocked Reference Content */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-700" /> Unlocked Reference Packs
        </h2>
        
        {!data.unlocked_domains || data.unlocked_domains.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center space-y-3">
            <p className="text-slate-600 text-xs font-medium">You have not unlocked any domain master packs yet.</p>
            <Link to="/questions" className="inline-block px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors">
              Explore 100 Risk Questions
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.unlocked_domains.map(packId => (
              <div key={packId} className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-indigo-200 flex flex-col justify-between shadow-xs h-full bg-indigo-50/30">
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
                      Domain Pack
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Unlocked
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-900 leading-snug">
                    {packId.replace('pack_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Pack
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                    Full access to guidance, answers, and frameworks for this domain.
                  </p>
                </div>
                <div className="p-4 border-t border-indigo-100 bg-white/50 flex items-center justify-between mt-auto">
                  <Link
                    to="/questions"
                    className="w-full px-3 py-2 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    View in Taxonomy Explorer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}

      {/* Certificates Tab */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> My Certificates
          </h2>

          {displayCertificates.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center space-y-3">
              <p className="text-slate-600 text-xs font-medium">You have not earned any certificates yet. Complete a masterclass and pass the final assessment to earn one.</p>
              <button onClick={() => setActiveTab('mylearning')} className="inline-block px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors">
                Go to My Learning
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCertificates.map(cert => {
                const certTitle = cert.course_title || cert.courses?.title || 'Executive Masterclass';
                const certNum = cert.cert_number || cert.id;
                const verifyUrl = `${window.location.origin}/certificate/${cert.course_slug || cert.course_id}`;

                return (
                  <div key={cert.id} className="glass-card glass-card-hover rounded-3xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-xs h-full bg-white p-6 space-y-5">
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-950 text-white flex items-center justify-center font-bold shadow-sm">
                        <Award className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-900 font-mono font-extrabold text-[11px] border border-blue-200/80 shadow-xs">
                        NO: #{certNum}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] text-blue-900 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Executive Credential
                      </div>
                      <h3 className="font-display font-black text-lg text-slate-900 leading-tight">
                        {certTitle}
                      </h3>
                      <div className="text-xs text-slate-500 font-medium">
                        Issued: {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5 mt-auto">
                      <Link
                        to={`/certificate/${cert.course_slug || cert.course_id}`}
                        target="_blank"
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                      >
                        <Award className="w-4 h-4" /> View Certificate
                      </Link>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(verifyUrl);
                          alert(`Verification link copied to clipboard!\n${verifyUrl}`);
                        }}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                        title="Copy public verification link"
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Review Modal Component */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSuccess={() => {
          if (data && data.enrolled_courses) {
            setData({
              ...data,
              enrolled_courses: data.enrolled_courses.map(c => 
                c.id === reviewCourseId ? { ...c, user_has_reviewed: true } : c
              )
            });
          }
        }}
        productType="course"
        productId={reviewCourseId}
        productName={data?.enrolled_courses?.find(c => c.id === reviewCourseId)?.title}
      />

    </div>
  );
}
