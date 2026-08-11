import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, BookOpen, Layers, Users, DollarSign, Edit3, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminStudio() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, courses, questions

  // New Course Form State
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState('199');
  const [newCourseTier, setNewCourseTier] = useState('Executive Tier');
  const [newCourseHeadline, setNewCourseHeadline] = useState('');

  // Add Lesson State
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');

  // Question Edit State
  const [editQuestionId, setEditQuestionId] = useState('');
  const [editQuestionRegulator, setEditQuestionRegulator] = useState('High');
  const [editQuestionPayback, setEditQuestionPayback] = useState('Fast (< 3mo)');

  const fetchData = async () => {
    setLoading(true);
    try {
      const mRes = await api.getAdminMetrics();
      if (mRes.success) setMetrics(mRes.metrics);

      const cRes = await api.getCourses();
      if (cRes.success) setCourses(cRes.courses);

      const qRes = await api.getQuestions();
      if (qRes.success) setQuestions(qRes.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createCourse({
        title: newCourseTitle,
        price: parseFloat(newCoursePrice),
        tier: newCourseTier,
        headline: newCourseHeadline
      });
      if (res.success) {
        setNewCourseTitle('');
        setNewCourseHeadline('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    try {
      const res = await api.addModuleToCourse(selectedCourseId, newModuleTitle);
      if (res.success) {
        setNewModuleTitle('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedModuleId) return;
    try {
      const res = await api.addLessonToModule(selectedCourseId, selectedModuleId, {
        title: newLessonTitle,
        type: 'video',
        video_url: newLessonVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        content: newLessonContent || 'Lesson instructions and guidance notes.'
      });
      if (res.success) {
        setNewLessonTitle('');
        setNewLessonContent('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateQuestionTag = async (id) => {
    try {
      const res = await api.updateQuestion(id, {
        regulator_pressure: editQuestionRegulator,
        payback: editQuestionPayback
      });
      if (res.success) {
        fetchData();
        setEditQuestionId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-400">Loading Admin Studio...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold uppercase">
            <Sparkles className="w-4 h-4" /> Non-Technical Management Panel
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white mt-1">Admin Control Studio</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2">
          {['analytics', 'courses', 'questions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase transition-colors ${
                activeTab === tab ? 'bg-amber-500 text-black' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && metrics && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-6 border border-slate-800">
              <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1"><DollarSign className="w-4 h-4 text-emerald-400" /> Total Platform Revenue</div>
              <div className="text-3xl font-extrabold text-emerald-400 font-display">${metrics.total_revenue.toFixed(2)} USD</div>
            </div>
            <div className="glass-card rounded-2xl p-6 border border-slate-800">
              <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1"><Users className="w-4 h-4 text-indigo-400" /> Total Registered Users</div>
              <div className="text-3xl font-extrabold text-white font-display">{metrics.total_users}</div>
            </div>
            <div className="glass-card rounded-2xl p-6 border border-slate-800">
              <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1"><BookOpen className="w-4 h-4 text-amber-400" /> Active Masterclasses</div>
              <div className="text-3xl font-extrabold text-white font-display">{metrics.total_courses}</div>
            </div>
            <div className="glass-card rounded-2xl p-6 border border-slate-800">
              <div className="text-slate-400 text-xs flex items-center gap-1.5 mb-1"><Layers className="w-4 h-4 text-cyan-400" /> Total Paid Transactions</div>
              <div className="text-3xl font-extrabold text-white font-display">{metrics.total_orders}</div>
            </div>
          </div>

          {/* User List */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-white text-lg">Registered System Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono">
                  <tr>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {metrics.users_list.map(u => (
                    <tr key={u.id}>
                      <td className="p-3 font-semibold text-white">{u.full_name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">{u.role}</span></td>
                      <td className="p-3 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Course Creator Tab */}
      {activeTab === 'courses' && (
        <div className="space-y-8">
          
          {/* Create New Course */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" /> Add New Course (Non-Technical Admin)
            </h3>
            <form onSubmit={handleCreateCourse} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={newCourseTitle}
                  onChange={e => setNewCourseTitle(e.target.value)}
                  placeholder="e.g. Cyber Governance for Board Directors"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Price ($ USD)</label>
                <input
                  type="number"
                  required
                  value={newCoursePrice}
                  onChange={e => setNewCoursePrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Headline / Description</label>
                <input
                  type="text"
                  required
                  value={newCourseHeadline}
                  onChange={e => setNewCourseHeadline(e.target.value)}
                  placeholder="High impact summary..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <button
                type="submit"
                className="sm:col-span-2 py-2.5 rounded-xl bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400"
              >
                Publish Course
              </button>
            </form>
          </div>

          {/* Add Lessons & Modules */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-white text-lg">Add Module & Video Lesson to Existing Course</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Target Course</label>
                <select
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              {selectedCourseId && (
                <div>
                  <label className="block text-slate-400 mb-1">Add New Module Title</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newModuleTitle}
                      onChange={e => setNewModuleTitle(e.target.value)}
                      placeholder="e.g. Module 3: Regulator Audits"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                    <button onClick={handleAddModule} className="px-3 py-2 bg-amber-500 text-black font-bold rounded-xl">Add</button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 100 Questions Taxonomy Editor Tab */}
      {activeTab === 'questions' && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-white text-lg">100 Risk Questions Taxonomy & Tag Manager</h3>
          <p className="text-xs text-slate-400">Edit regulator pressure and payback tags without touching code.</p>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {questions.slice(0, 15).map(q => (
              <div key={q.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-mono text-amber-400 font-bold">Q{q.question_number}</span>
                  <div className="font-semibold text-white text-sm">{q.title}</div>
                  <div className="text-slate-400">Domain: {q.domain} • Regulator: <span className="text-rose-400 font-medium">{q.regulator_pressure}</span></div>
                </div>

                {editQuestionId === q.id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={editQuestionRegulator}
                      onChange={e => setEditQuestionRegulator(e.target.value)}
                      className="px-2 py-1 rounded bg-slate-800 text-white"
                    >
                      <option value="High">High Scrutiny</option>
                      <option value="Medium">Medium Scrutiny</option>
                      <option value="Low">Low Scrutiny</option>
                    </select>

                    <button
                      onClick={() => handleUpdateQuestionTag(q.id)}
                      className="px-3 py-1 bg-emerald-500 text-black font-bold rounded"
                    >
                      Save Tag
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditQuestionId(q.id);
                      setEditQuestionRegulator(q.regulator_pressure);
                    }}
                    className="px-3 py-1 bg-slate-800 text-amber-400 rounded hover:bg-slate-700"
                  >
                    Edit Tag
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
