import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, BookOpen, Layers, Users, DollarSign } from 'lucide-react';
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
        regulator_pressure: editQuestionRegulator
      });
      if (res.success) {
        fetchData();
        setEditQuestionId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-16 text-center text-slate-500 text-xs">Loading Admin Studio...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-slate-900 bg-[#F8FAFC]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Non-Technical Management Studio
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 mt-1">Admin Control Panel</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2">
          {['analytics', 'courses', 'questions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors ${
                activeTab === tab ? 'bg-blue-900 text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="text-slate-500 text-xs flex items-center gap-1.5 mb-1 font-bold"><DollarSign className="w-4 h-4 text-emerald-700" /> Total Platform Revenue</div>
              <div className="text-2xl font-extrabold text-emerald-800 font-display">${metrics.total_revenue.toFixed(2)} USD</div>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="text-slate-500 text-xs flex items-center gap-1.5 mb-1 font-bold"><Users className="w-4 h-4 text-blue-700" /> Registered Users</div>
              <div className="text-2xl font-extrabold text-slate-900 font-display">{metrics.total_users}</div>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="text-slate-500 text-xs flex items-center gap-1.5 mb-1 font-bold"><BookOpen className="w-4 h-4 text-amber-700" /> Active Masterclasses</div>
              <div className="text-2xl font-extrabold text-slate-900 font-display">{metrics.total_courses}</div>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="text-slate-500 text-xs flex items-center gap-1.5 mb-1 font-bold"><Layers className="w-4 h-4 text-indigo-700" /> Total Paid Orders</div>
              <div className="text-2xl font-extrabold text-slate-900 font-display">{metrics.total_orders}</div>
            </div>
          </div>

          {/* User List Table */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200 space-y-3 shadow-xs">
            <h3 className="font-display font-bold text-slate-900 text-base">Registered System Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {metrics.users_list.map(u => (
                    <tr key={u.id}>
                      <td className="p-3 font-bold text-slate-900">{u.full_name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-mono text-[11px] font-bold">{u.role}</span></td>
                      <td className="p-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
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
        <div className="space-y-6">
          
          {/* Create New Course */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200 space-y-4 shadow-xs">
            <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-900" /> Add New Masterclass Course (Non-Technical Admin)
            </h3>
            <form onSubmit={handleCreateCourse} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Course Title</label>
                <input
                  type="text"
                  required
                  value={newCourseTitle}
                  onChange={e => setNewCourseTitle(e.target.value)}
                  placeholder="e.g. Cyber Governance for Board Directors"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Price ($ USD)</label>
                <input
                  type="number"
                  required
                  value={newCoursePrice}
                  onChange={e => setNewCoursePrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-700 mb-1 font-bold">Headline / Description</label>
                <input
                  type="text"
                  required
                  value={newCourseHeadline}
                  onChange={e => setNewCourseHeadline(e.target.value)}
                  placeholder="High impact summary..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-900"
                />
              </div>
              <button
                type="submit"
                className="sm:col-span-2 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 shadow-xs"
              >
                Publish Course
              </button>
            </form>
          </div>

        </div>
      )}

      {/* 100 Questions Taxonomy Editor Tab */}
      {activeTab === 'questions' && (
        <div className="glass-card rounded-2xl p-5 border border-slate-200 space-y-4 shadow-xs">
          <h3 className="font-display font-bold text-slate-900 text-base">100 Risk Questions Taxonomy Tag Manager</h3>
          <p className="text-xs text-slate-600 font-medium">Edit regulator scrutiny pressure tags without touching code.</p>

          <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-2">
            {questions.slice(0, 15).map(q => (
              <div key={q.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-mono text-blue-900 font-bold">Q{q.question_number}</span>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">{q.title}</div>
                  <div className="text-slate-500 font-medium">Domain: {q.domain} • Regulator: <span className="text-rose-700 font-bold">{q.regulator_pressure}</span></div>
                </div>

                {editQuestionId === q.id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={editQuestionRegulator}
                      onChange={e => setEditQuestionRegulator(e.target.value)}
                      className="px-2 py-1 rounded bg-white border border-slate-300 text-slate-900 text-xs"
                    >
                      <option value="High">High Scrutiny</option>
                      <option value="Medium">Medium Scrutiny</option>
                      <option value="Low">Low Scrutiny</option>
                    </select>

                    <button
                      onClick={() => handleUpdateQuestionTag(q.id)}
                      className="px-3 py-1 bg-emerald-700 text-white font-bold rounded text-xs"
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
                    className="px-3 py-1 bg-white border border-slate-300 text-slate-800 rounded font-bold hover:bg-slate-100 text-xs"
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
