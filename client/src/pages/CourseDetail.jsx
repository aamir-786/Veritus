import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Lock, CheckCircle2, ShieldAlert, ArrowRight, ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import VideoPlayer from '../components/VideoPlayer';
import ReviewModal from '../components/ReviewModal';

export default function CourseDetail() {
  const { identifier } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePreviewLesson, setActivePreviewLesson] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

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

  const userHasReviewed = course?.user_has_reviewed || (user && course?.reviews?.some(r => r.user_id === user.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-slate-900 bg-[#F8FAFC]">
      
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-xs text-slate-500 font-mono font-medium uppercase tracking-wider">
          Masterclass ID: {course.id}
        </span>
      </div>

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
            <div className="flex items-center gap-1.5">
              <div className={`flex ${course.rating_count > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                {[1,2,3,4,5].map(i => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${course.rating_count > 0 && course.rating_avg >= i ? 'fill-emerald-500 text-emerald-500' : (course.rating_count > 0 && course.rating_avg >= i - 0.5 ? 'fill-emerald-500 text-emerald-500 opacity-50' : 'fill-slate-200 text-slate-200')}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-600">
                {course.rating_count > 0 ? (
                  <>{course.rating_avg} <span className="font-normal text-slate-500">({course.rating_count} verified ratings)</span></>
                ) : 'No reviews'}
              </span>
            </div>
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
              <button
                onClick={() => {
                  const firstLesson = course.modules?.[0]?.lessons?.[0];
                  if (firstLesson) {
                    navigate(`/learn/${course.slug}/lesson/${firstLesson.id}`);
                  }
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <PlayCircle className="w-4 h-4" /> Continue Learning
              </button>
            ) : (
              <button
                onClick={() => addToCart({ ...course, type: 'Course' })}
                className="w-full py-3 rounded-xl bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Free Preview Video Section */}
      {activePreviewLesson && (
        <div className="glass-card rounded-3xl p-6 border border-slate-200 space-y-4 shadow-xs bg-white">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-blue-900" /> Free Preview: {activePreviewLesson.title}
            </h2>
            <span className="text-xs font-mono font-bold text-slate-500">{activePreviewLesson.duration_minutes} Mins</span>
          </div>

          {activePreviewLesson.video_url ? (
            <VideoPlayer
              videoUrl={activePreviewLesson.video_url}
              captionsVtt={activePreviewLesson.captions_vtt}
            />
          ) : (
            <div className="p-8 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 italic border border-slate-200">
              No video preview available for this lesson.
            </div>
          )}
        </div>
      )}

      {/* Syllabus Modules Hierarchy */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-slate-900">Course Curriculum & Syllabus</h2>
          {course.is_enrolled && !userHasReviewed && (
            <button
              onClick={() => setIsReviewOpen(true)}
              className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5" /> Leave a Review
            </button>
          )}
        </div>

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

        {/* Student Reviews Section */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Student Ratings & Reviews ({course.rating_count || 0})
            </h2>
            {course.is_enrolled && !userHasReviewed && (
              <button
                onClick={() => setIsReviewOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-current" /> Write a Review
              </button>
            )}
          </div>

          {(!course.reviews || course.reviews.length === 0) ? (
            <div className="glass-card rounded-2xl p-6 border border-slate-200 text-center text-slate-500 text-xs font-medium">
              No student reviews submitted for this masterclass yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.reviews.map(r => {
                const authorName = r.profiles?.full_name || (Array.isArray(r.profiles) ? r.profiles[0]?.full_name : null) || 'Verified Student';
                return (
                  <div key={r.id} className="glass-card rounded-2xl p-5 border border-slate-200 space-y-3 shadow-xs bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{authorName}</div>
                          <div className="flex items-center text-emerald-500">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} className={`w-3 h-3 ${i <= r.rating ? 'fill-emerald-500' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{r.comment}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onSuccess={fetchDetails}
        productType="course"
        productId={course.id}
        productName={course.title}
      />
    </div>
  );
}
