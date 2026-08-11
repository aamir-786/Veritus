import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, PlayCircle, CheckCircle2, FileText, Download, Award, ShieldCheck, User } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.getDashboardSummary();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="py-20 text-center text-slate-400">Loading your executive member dashboard...</div>;
  if (!data) return <div className="py-20 text-center text-rose-400">Unable to load dashboard data.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Profile Summary */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-display text-xl font-bold">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="text-xs text-amber-400 font-mono font-semibold uppercase">Executive Practitioner Portal</div>
            <h1 className="font-display text-2xl font-bold text-white">{user?.full_name}</h1>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center min-w-[100px]">
            <div className="text-lg font-bold text-white">{data.enrolled_courses.length}</div>
            <div className="text-[10px] text-slate-400">Enrolled Courses</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center min-w-[100px]">
            <div className="text-lg font-bold text-emerald-400">{data.accessible_templates.length}</div>
            <div className="text-[10px] text-slate-400">Unlocked Assets</div>
          </div>
        </div>
      </div>

      {/* Enrolled Masterclasses */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-amber-400" /> Enrolled Courses & Progress
        </h2>

        {data.enrolled_courses.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center space-y-3">
            <p className="text-slate-300 text-sm">You have not enrolled in any masterclasses yet.</p>
            <Link to="/courses" className="inline-block px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl">
              Explore Masterclass Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.enrolled_courses.map(course => (
              <div key={course.id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
                <h3 className="font-display text-lg font-bold text-white">{course.title}</h3>
                
                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Course Completion</span>
                    <span className="font-bold text-amber-400">{course.progress_percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500" 
                      style={{ width: `${course.progress_percent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{course.completed_lessons} of {course.total_lessons} Lessons Finished</span>
                  
                  {course.resume_lesson && (
                    <Link
                      to={`/learn/${course.slug}/lesson/${course.resume_lesson.id}`}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1"
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
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" /> Accessible Templates & Frameworks
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.accessible_templates.map(tpl => (
            <div key={tpl.id} className="glass-card rounded-xl p-4 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-white line-clamp-1">{tpl.title}</div>
                <div className="text-[10px] text-slate-400">{tpl.category}</div>
              </div>
              <a
                href={`/api/v1/templates/download/${tpl.id}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20"
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
