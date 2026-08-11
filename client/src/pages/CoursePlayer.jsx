import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlayCircle, CheckCircle2, Lock, ArrowLeft, ChevronRight, ShieldAlert, Download } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';

export default function CoursePlayer() {
  const { courseSlug, lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gatedError, setGatedError] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setGatedError('');
      try {
        const cRes = await api.getCourseDetails(courseSlug);
        if (!cRes.success) {
          setGatedError('Course not found');
          setLoading(false);
          return;
        }
        setCourse(cRes.course);

        // Fetch lesson playback payload
        const targetId = lessonId || cRes.course.modules[0]?.lessons[0]?.id;
        const lRes = await api.getLessonPlayback(cRes.course.id, targetId);

        if (lRes.success) {
          setActiveLesson(lRes.lesson);
        } else {
          setGatedError(lRes.error || 'Access Gated: You must purchase this course to view this lesson.');
        }
      } catch (err) {
        setGatedError('An error occurred loading the lesson stream.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseSlug, lessonId]);

  const handleMarkComplete = async () => {
    if (!course || !activeLesson) return;
    try {
      await api.updateLessonProgress({
        course_id: course.id,
        lesson_id: activeLesson.id,
        completed: true
      });
      setIsCompleted(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-16 text-center text-slate-500 text-xs">Loading learning environment...</div>;

  if (gatedError) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 glass-card rounded-2xl border border-rose-200 text-center space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900">Access Gated Content</h2>
        <p className="text-xs text-slate-600 font-medium">{gatedError}</p>
        <Link
          to={`/courses/${courseSlug}`}
          className="inline-block px-5 py-2.5 rounded-xl bg-blue-900 text-white font-extrabold text-xs shadow-xs"
        >
          View Course & Purchase Access
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-900">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 p-4 space-y-5 shrink-0">
        <Link to="/dashboard" className="text-xs text-blue-900 hover:underline flex items-center gap-1 font-bold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Dashboard
        </Link>

        <div>
          <div className="text-[10px] uppercase font-mono text-slate-500 font-bold tracking-wider">Course Player</div>
          <h2 className="font-display text-base font-extrabold text-slate-900 line-clamp-2 mt-0.5">{course.title}</h2>
        </div>

        <div className="space-y-4 text-xs">
          {course.modules.map(mod => (
            <div key={mod.id} className="space-y-1.5">
              <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] px-2">
                Module {mod.order_index}: {mod.title}
              </div>
              <div className="space-y-1 font-medium">
                {mod.lessons.map(l => {
                  const isActive = activeLesson && activeLesson.id === l.id;
                  return (
                    <Link
                      key={l.id}
                      to={`/learn/${courseSlug}/lesson/${l.id}`}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors block ${
                        isActive ? 'bg-blue-50 text-blue-900 border border-blue-200 font-bold shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 line-clamp-1">
                        <PlayCircle className="w-3.5 h-3.5 shrink-0 text-blue-900" />
                        <span>{l.title}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content & Player */}
      <div className="flex-1 p-6 md:p-8 space-y-6 max-w-5xl">
        
        {/* Lesson Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs text-blue-900 font-mono uppercase font-bold">Active Lesson</span>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 mt-0.5">{activeLesson.title}</h1>
          </div>

          <button
            onClick={handleMarkComplete}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {isCompleted ? 'Completed' : 'Mark as Complete'}
          </button>
        </div>

        {/* Video Player OR Reading Content */}
        {activeLesson.type === 'video' ? (
          <VideoPlayer
            videoUrl={activeLesson.video_url}
            captionsVtt={activeLesson.captions_vtt}
            title={activeLesson.title}
            onCompleted={handleMarkComplete}
          />
        ) : activeLesson.type === 'document' ? (
          <div className="glass-card rounded-2xl p-6 border border-slate-200 space-y-3">
            <h3 className="font-display text-base font-bold text-slate-900">Downloadable Framework Resource</h3>
            <p className="text-xs text-slate-600">{activeLesson.content}</p>
            <a
              href={activeLesson.resource_url}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" /> Download Resource File
            </a>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
            {activeLesson.content}
          </div>
        )}

      </div>

    </div>
  );
}
