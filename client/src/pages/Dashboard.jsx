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

        <div className="flex items-center gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
            <div className="text-lg font-extrabold text-slate-900 font-display">{data.enrolled_courses.length}</div>
            <div className="text-[10px] text-slate-500 font-medium">Enrolled Courses</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.enrolled_courses.map(course => (
              <div key={course.id} className="glass-card rounded-2xl p-5 border border-slate-200 space-y-3 shadow-xs">
                <h3 className="font-display text-base font-bold text-slate-900">{course.title}</h3>
                
                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Course Completion</span>
                    <span className="font-bold text-blue-900">{course.progress_percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="h-full bg-blue-900 transition-all duration-500 rounded-full" 
                      style={{ width: `${course.progress_percent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{course.completed_lessons} of {course.total_lessons} Lessons Finished</span>
                  
                  {course.resume_lesson && (
                    <Link
                      to={`/learn/${course.slug}/lesson/${course.resume_lesson.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors flex items-center gap-1 shadow-xs"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.accessible_templates.map(tpl => (
            <div key={tpl.id} className="glass-card rounded-xl p-4 border border-slate-200 flex items-center justify-between text-xs shadow-xs">
              <div>
                <div className="font-bold text-slate-900 line-clamp-1">{tpl.title}</div>
                <div className="text-[10px] text-slate-500 font-medium">{tpl.category}</div>
              </div>
              <a
                href={`${API_BASE}/templates/download/${tpl.id}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-200"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
