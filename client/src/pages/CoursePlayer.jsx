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
  
  // Assessment State
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [assessmentAgreed, setAssessmentAgreed] = useState(false);
  const [assessmentSubmitting, setAssessmentSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);

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
          setAssessmentAnswers({});
          setAssessmentAgreed(false);
          setAssessmentResult(null);
          setIsCompleted(false);
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

  const handleSubmitAssessment = async (e) => {
    e.preventDefault();
    if (!assessmentAgreed) {
      alert("You must agree that this is your own work.");
      return;
    }
    
    // Ensure all questions are answered
    if (activeLesson?.questions?.length > 0 && Object.keys(assessmentAnswers).length < activeLesson.questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setAssessmentSubmitting(true);
    try {
      const res = await api.submitAssessment(activeLesson.id, {
        courseId: course.id,
        answers: assessmentAnswers,
        agreed: assessmentAgreed
      });
      
      if (res.success) {
        setAssessmentResult(res);
        if (res.passed) {
          setIsCompleted(true);
        }
      } else {
        alert(res.error || "Failed to submit assessment.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during submission.");
    }
    setAssessmentSubmitting(false);
  };

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
        <button onClick={() => navigate(-1)} className="text-xs text-blue-900 hover:underline flex items-center gap-1 font-bold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

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

        {/* Mixed Blocks OR Fallback to Single Type */}
        {activeLesson.blocks && Array.isArray(activeLesson.blocks) ? (
          <div className="space-y-8">
            {activeLesson.blocks.map((block, idx) => (
              <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                {block.type === 'video' ? (
                  <VideoPlayer
                    videoUrl={block.url}
                    captionsVtt={block.captions_vtt}
                    title={block.title || activeLesson.title}
                    onCompleted={idx === activeLesson.blocks.length - 1 ? handleMarkComplete : undefined}
                  />
                ) : block.type === 'document' ? (
                  <div className="glass-card rounded-2xl p-6 border border-slate-200 space-y-3">
                    <h3 className="font-display text-base font-bold text-slate-900">{block.title || 'Downloadable Framework Resource'}</h3>
                    {block.content && <p className="text-xs text-slate-600">{block.content}</p>}
                    <a
                      href={block.url}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors shadow-xs"
                    >
                      <Download className="w-4 h-4" /> Download Resource File
                    </a>
                  </div>
                ) : (
                  <div className="glass-card rounded-2xl p-6 border border-slate-200 text-sm text-slate-700 leading-relaxed font-medium prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: block.content }} />
                )}
              </div>
            ))}
          </div>
        ) : activeLesson.type === 'video' ? (
          <div className="space-y-6">
            <VideoPlayer
              videoUrl={activeLesson.video_url}
              captionsVtt={activeLesson.captions_vtt}
              title={activeLesson.title}
              onCompleted={handleMarkComplete}
            />
            {activeLesson.content && (
              <div className="glass-card rounded-2xl p-6 border border-slate-200 text-sm text-slate-700 leading-relaxed font-medium prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
            )}
          </div>
        ) : activeLesson.type === 'assessment' ? (
          <div className="space-y-8">
            {activeLesson.content && (
              <div className="glass-card rounded-2xl p-6 border border-slate-200 text-sm text-slate-700 leading-relaxed font-medium prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
            )}
            
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-6">Assessment Knowledge Check</h2>
              
              {assessmentResult ? (
                <div className={`p-6 rounded-xl border ${assessmentResult.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'} mb-6`}>
                  <div className="flex items-center gap-3 mb-2">
                    {assessmentResult.passed ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <ShieldAlert className="w-6 h-6 text-rose-500" />}
                    <h3 className="font-bold text-lg">{assessmentResult.passed ? 'Assessment Passed!' : 'Assessment Failed'}</h3>
                  </div>
                  <p className="font-medium text-sm">Your score: <strong className="text-xl">{assessmentResult.score}%</strong></p>
                  <p className="text-sm mt-2 opacity-80">
                    {assessmentResult.passed 
                      ? "Great job! You have successfully completed this assessment."
                      : "You did not meet the required passing score of 80%. Please review the material and try again."}
                  </p>
                  {assessmentResult.certificateIssued && (
                    <div className="mt-4 p-4 bg-white/60 rounded-lg border border-emerald-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-emerald-900">Congratulations!</p>
                        <p className="text-xs text-emerald-800">You have earned a certificate for completing this course.</p>
                      </div>
                      <Link to="/dashboard" className="px-4 py-2 bg-emerald-600 text-white rounded font-bold text-xs shadow-sm">View Certificate</Link>
                    </div>
                  )}
                  {!assessmentResult.passed && (
                    <button onClick={() => setAssessmentResult(null)} className="mt-4 px-4 py-2 bg-rose-600 text-white rounded font-bold text-xs shadow-sm">
                      Retry Assessment
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmitAssessment} className="space-y-8">
                  {activeLesson.questions?.map((q, idx) => (
                    <div key={q.id} className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
                      <h3 className="font-bold text-slate-800 text-sm">
                        <span className="text-blue-600 mr-2">{idx + 1}.</span> {q.question_text}
                      </h3>
                      <div className="space-y-2 pl-6">
                        {q.question_type === 'descriptive' ? (
                          <div className="space-y-1 mt-2">
                            <textarea
                              rows={5}
                              placeholder="Type your detailed answer here... (Max 300 words)"
                              value={assessmentAnswers[q.id] || ''}
                              onChange={(e) => {
                                const text = e.target.value;
                                const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
                                if (words <= 300 || text.length < (assessmentAnswers[q.id] || '').length) {
                                  setAssessmentAnswers({...assessmentAnswers, [q.id]: text});
                                }
                              }}
                              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm resize-y"
                            />
                            <div className="text-right text-xs font-bold text-slate-400">
                              {((assessmentAnswers[q.id] || '').trim().split(/\s+/).filter(w => w.length > 0).length)} / 300 words
                            </div>
                          </div>
                        ) : (
                          q.options?.map((opt, oIdx) => (
                            <label key={oIdx} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${assessmentAnswers[q.id] === oIdx ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                              <input 
                                type="radio" 
                                name={`question-${q.id}`} 
                                value={oIdx}
                                checked={assessmentAnswers[q.id] === oIdx}
                                onChange={() => setAssessmentAnswers({...assessmentAnswers, [q.id]: oIdx})}
                                className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-slate-700 font-medium">{opt}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {activeLesson.questions?.length > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                      <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer mb-6">
                        <input 
                          type="checkbox" 
                          checked={assessmentAgreed}
                          onChange={(e) => setAssessmentAgreed(e.target.checked)}
                          className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-xs text-slate-600 font-medium leading-relaxed">
                          By checking this box, I confirm that the answers submitted are my own original work, and I have not received unauthorized assistance in completing this assessment.
                        </span>
                      </label>
                      <button 
                        type="submit" 
                        disabled={assessmentSubmitting || !assessmentAgreed}
                        className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-sm transition-colors flex justify-center items-center gap-2 ${assessmentSubmitting || !assessmentAgreed ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {assessmentSubmitting ? 'Submitting...' : 'Submit Assessment'}
                      </button>
                    </div>
                  )}
                  {(!activeLesson.questions || activeLesson.questions.length === 0) && (
                    <div className="p-6 text-center text-slate-500 text-sm italic">
                      No questions have been added to this assessment yet.
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeLesson.audio_url && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Listen to this lesson</span>
                <audio controls className="w-full h-10 outline-none" src={activeLesson.audio_url}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            <div className="glass-card rounded-2xl p-8 border border-slate-200 text-sm text-slate-700 leading-relaxed font-medium prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
          </div>
        )}

      </div>

    </div>
  );
}
