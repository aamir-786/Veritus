import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Lock, CheckCircle2, ShieldAlert, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import CheckoutModal from '../components/CheckoutModal';

export default function CourseDetail() {
  const { identifier } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePreviewLesson, setActivePreviewLesson] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getCourseDetails(identifier);
      if (res.success) {
        setCourse(res.course);
        // Find first free preview lesson if available
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

  if (loading) return <div className="py-20 text-center text-slate-400">Loading course syllabus...</div>;
  if (!course) return <div className="py-20 text-center text-rose-400">Course not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Course Hero Banner */}
      <div className="glass-card rounded-3xl p-8 sm:p-12 border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-400 font-semibold text-xs border border-amber-500/20">
                {course.tier}
              </span>
              <span className="text-xs text-slate-400 font-medium">Author: {course.author_name}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              {course.title}
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shrink-0 text-center space-y-4 min-w-[280px]">
            <div>
              <div className="text-3xl font-extrabold text-emerald-400">${course.price.toFixed(2)}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">Instant Lifetime Access</div>
            </div>

            {course.is_enrolled ? (
              <Link
                to={`/learn/${course.slug}/lesson/${course.modules[0]?.lessons[0]?.id}`}
                className="w-full py-3.5 rounded-xl bg-emerald-500 text-black font-extrabold hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                Enrolled — Enter Learning Player
              </Link>
            ) : (
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2 text-sm shadow-xl shadow-amber-500/20"
              >
                Enroll Now — ${course.price.toFixed(2)}
              </button>
            )}

            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Fail-Closed Access Protection
            </div>
          </div>

        </div>
      </div>

      {/* Free Preview Video Player if available */}
      {activePreviewLesson && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase">Free Video Preview</span>
            <h3 className="font-display font-bold text-white text-lg">{activePreviewLesson.title}</h3>
          </div>
          <VideoPlayer
            videoUrl={activePreviewLesson.video_url}
            captionsVtt={activePreviewLesson.captions_vtt}
            title={activePreviewLesson.title}
          />
        </div>
      )}

      {/* Syllabus Modules Hierarchy */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-white">Course Curriculum & Syllabus</h2>

        <div className="space-y-4">
          {course.modules.map(mod => (
            <div key={mod.id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-mono">
                  M{mod.order_index}
                </span>
                {mod.title}
              </h3>

              <div className="space-y-2">
                {mod.lessons.map(l => (
                  <div key={l.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {l.is_free_preview ? (
                        <PlayCircle className="w-5 h-5 text-amber-400 shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-white flex items-center gap-2">
                          {l.title}
                          {l.is_free_preview && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase">
                              Free Preview
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{l.duration_minutes} Minutes • {l.type}</div>
                      </div>
                    </div>

                    {l.is_free_preview && (
                      <button
                        onClick={() => setActivePreviewLesson(l)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
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

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          item={course}
          itemType="course"
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            fetchDetails();
          }}
        />
      )}

    </div>
  );
}
