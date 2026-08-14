import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle, Lock, CheckCircle2, ShieldAlert, ArrowRight, ShoppingCart } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import VideoPlayer from '../components/VideoPlayer';

export default function CourseDetail() {
  const { identifier } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePreviewLesson, setActivePreviewLesson] = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getCourseDetails(identifier);
      if (res.success) {
        setCourse(res.course);
        for (const mod of res.course.modules) {
          const preview = mod.lessons.find(l => l.is_free_preview);
          if (preview) {
            setActivePreviewLesson(preview);
            break;
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [identifier]);

  if (loading) return <div className="py-16 text-center text-slate-500 text-xs">Loading course syllabus...</div>;
  if (!course) return <div className="py-16 text-center text-rose-600 text-xs font-bold">Course not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-900 bg-[#F8FAFC]">
      
      {/* Course Hero Banner */}
      <div className="glass-card rounded-3xl p-8 border border-slate-200 space-y-6 relative overflow-hidden bg-gradient-to-r from-blue-50/50 via-white to-white shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-xs border border-blue-200">
                {course.tier}
              </span>
              <span className="text-xs text-slate-500 font-medium">Author: {course.author_name}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              {course.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {course.description}
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shrink-0 text-center space-y-4 min-w-[280px] shadow-sm">
            <div>
              <div className="text-3xl font-extrabold text-emerald-700">${course.price.toFixed(2)}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono font-medium mt-0.5">Instant Lifetime Access</div>
            </div>

            {course.is_enrolled ? (
              <Link
                to={`/learn/${course.slug}/lesson/${course.modules[0]?.lessons[0]?.id}`}
                className="w-full py-3 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 text-xs shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                Enrolled — Enter Learning Player
              </Link>
            ) : (
              <button
                onClick={() => addToCart({ ...course, type: 'Course' })}
                className="w-full py-3 rounded-xl bg-blue-900 text-white font-extrabold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 text-xs shadow-xs"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart — ${course.price.toFixed(2)}
              </button>
            )}

            <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1 font-medium">
              <Lock className="w-3.5 h-3.5 text-emerald-600" /> Fail-Closed Access Protection
            </div>
          </div>

        </div>
      </div>

      {/* Free Preview Video Player if available */}
      {activePreviewLesson && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 text-xs font-bold uppercase">Free Video Preview</span>
            <h3 className="font-display font-bold text-slate-900 text-base">{activePreviewLesson.title}</h3>
          </div>
          <VideoPlayer
            videoUrl={activePreviewLesson.video_url}
            captionsVtt={activePreviewLesson.captions_vtt}
            title={activePreviewLesson.title}
          />
        </div>
      )}

      {/* Syllabus Modules Hierarchy */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-slate-900">Course Curriculum & Syllabus</h2>

        <div className="space-y-3">
          {course.modules.map(mod => (
            <div key={mod.id} className="glass-card rounded-2xl p-5 border border-slate-200 space-y-3 shadow-xs">
              <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-900 flex items-center justify-center text-xs font-mono font-bold">
                  M{mod.order_index}
                </span>
                {mod.title}
              </h3>

              <div className="space-y-2">
                {mod.lessons.map(l => (
                  <div key={l.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {l.is_free_preview ? (
                        <PlayCircle className="w-4 h-4 text-blue-900 shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          {l.title}
                          {l.is_free_preview && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold uppercase">
                              Free Preview
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">{l.duration_minutes} Minutes • {l.type}</div>
                      </div>
                    </div>

                    {l.is_free_preview && (
                      <button
                        onClick={() => setActivePreviewLesson(l)}
                        className="text-xs text-blue-900 hover:underline font-bold"
                      >
                        Play Preview
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
