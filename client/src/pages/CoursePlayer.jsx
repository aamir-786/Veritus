import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlayCircle, CheckCircle2, Lock, FileText, ArrowLeft, ChevronRight, ShieldAlert, Download } from 'lucide-react';
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
          setGatedError(lRes.error || 'Access Gated: You do not have permission to view this lesson.');
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

  if (loading) return <div className="py-20 text-center text-slate-400">Loading learning environment...</div>;

  if (gatedError) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 glass-card rounded-2xl border border-rose-500/30 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white">Access Gated Content</h2>
        <p className="text-sm text-slate-300">{gatedError}</p>
        <Link
          to={`/courses/${courseSlug}`}
          className="inline-block px-6 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-sm"
        >
          View Course & Purchase Access
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 bg-[#141C2E] border-r border-slate-800 p-4 space-y-6 shrink-0">
        <Link to="/dashboard" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to My Dashboard
        </Link>

        <div>
          <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Course Player</div>
          <h2 className="font-display text-base font-bold text-white line-clamp-2 mt-0.5">{course.title}</h2>
        </div>

        <div className="space-y-4 text-xs">
          {course.modules.map(mod => (
            <div key={mod.id} className="space-y-2">
              <div className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] px-2">
                Module {mod.order_index}: {mod.title}
              </div>
              <div className="space-y-1">
                {mod.lessons.map(l => {
                  const isActive = activeLesson && activeLesson.id === l.id;
                  return (
                    <Link
                      key={l.id}
                      to={`/learn/${courseSlug}/lesson/${l.id}`}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors block ${
                        isActive ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold' : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 line-clamp-1">
                        <PlayCircle className="w-4 h-4 shrink-0" />
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
      <div className="flex-1 p-6 md:p-10 space-y-6 max-w-5xl">
        
        {/* Lesson Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs text-amber-400 font-mono uppercase font-semibold">Active Lesson</span>
            <h1 className="font-display text-2xl font-bold text-white mt-1">{activeLesson.title}</h1>
          </div>

          <button
            onClick={handleMarkComplete}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isCompleted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
          <div className="glass-card rounded-2xl p-8 border border-slate-800 space-y-4">
            <h3 className="font-display text-lg font-bold text-white">Downloadable Framework Resource</h3>
            <p className="text-sm text-slate-300">{activeLesson.content}</p>
            <a
              href={activeLesson.resource_url}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Download className="w-4 h-4" /> Download Resource File
            </a>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-8 border border-slate-800 prose prose-invert max-w-none text-slate-300 leading-relaxed">
            {activeLesson.content}
          </div>
        )}

      </div>

    </div>
  );
}
