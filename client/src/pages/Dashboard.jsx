import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, FileText, Download, Award, ShieldCheck } from 'lucide-react';
import { api, API_BASE } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { cartItems, removeFromCart } = useCart();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

      {/* Enrolled Masterclasses */}
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
                  
                  {course.resume_lesson && (
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

      {/* Accessible Digital Templates */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-700" /> Accessible Digital Risk Frameworks
        </h2>

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
                <a
                  href={`${API_BASE}/templates/download/${tpl.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Download className="w-3 h-3" /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unlocked Reference Content */}
      {data.unlocked_domains && data.unlocked_domains.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-700" /> Unlocked Reference Packs
          </h2>
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
        </div>
      )}

    </div>
  );
}
