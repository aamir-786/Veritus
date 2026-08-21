import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, FileText, Download, Award, ShieldCheck } from 'lucide-react';
import { api, API_BASE } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const { user } = useAuth();
  const { cartItems, removeFromCart } = useCart();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [downloadingId, setDownloadingId] = useState(null);
  const [activeTab, setActiveTab] = useState('mylearning');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewCourseId, setReviewCourseId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const res = await api.createReview({
        product_type: 'course',
        product_id: reviewCourseId,
        rating: reviewRating,
        comment: reviewComment
      });
      if (res.success) {
        alert('Thank you! Your review has been submitted.');
        setReviewModalOpen(false);
        setReviewComment('');
        setReviewRating(5);
      } else {
        alert(res.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
        const res = await api.getDashboardSummary();
        if (res.success) {
          setData(res);
          
          // Auto-remove any already purchased items from the local cart
          const ownedIds = [
            ...res.enrolled_courses.map(c => c.id),
            ...res.accessible_templates.map(t => t.id)
          ];
          
          cartItems.forEach(item => {
            if (ownedIds.includes(item.id)) {
              removeFromCart(item.id);
            }
          });
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
  if (!data) return <div className="py-16 text-center text-rose-600 text-xs font-semibold">Unable to load dashboard data.</div>;

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
              <div key={course.id} className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-xs group h-full">
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
                  
                  {course.progress_percent === 100 ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          setReviewCourseId(course.id);
                          setReviewModalOpen(true);
                        }}
                        className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold text-[10px] hover:bg-slate-50 transition-colors shadow-xs"
                      >
                        Leave a Review
                      </button>
                      <Link
                        to={`/certificate/${course.id}`}
                        target="_blank"
                        className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Award className="w-3.5 h-3.5" /> Certificate
                      </Link>
                    </div>
                  ) : course.resume_lesson && (
                    <Link
                      to={`/learn/${course.slug}/lesson/${course.resume_lesson.id}`}
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

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">Course Review</h3>
                <p className="text-xs text-slate-500 mt-1">Rate your masterclass experience.</p>
              </div>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
              <div className="space-y-2 text-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Rating</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${reviewRating >= star ? 'bg-yellow-100 text-yellow-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Review</label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your thoughts on the course content, delivery, and value..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm outline-none transition-all resize-y"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
