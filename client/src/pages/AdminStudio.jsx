import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Plus, BookOpen, Layers, Users, DollarSign, 
  BarChart3, Settings, ShieldCheck, Search, ChevronRight, Video, Edit2, PlayCircle, ShieldAlert,
  LogOut, Trash2, KeyRound, TrendingUp, FileText, Download, ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EffectiveVeritusLogo from '../components/EffectiveVeritusLogo';
import AdminQuestionModal from '../components/AdminQuestionModal';
import { supabase } from '../lib/supabase';

export default function AdminStudio() {
  const { user, logout, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('adminStudioActiveTab') || 'overview';
  });

  useEffect(() => {
    localStorage.setItem('adminStudioActiveTab', activeTab);
  }, [activeTab]);

  // Course Form State
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState('199');
  const [newCourseTier, setNewCourseTier] = useState('Executive Tier');
  const [newCourseHeadline, setNewCourseHeadline] = useState('');
  const [newCourseCover, setNewCourseCover] = useState('');
  const [isUploadingCourseCover, setIsUploadingCourseCover] = useState(false);

  // Question Form State
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  // Edit Question State
  const [searchQuery, setSearchQuery] = useState('');

  // Template Form State
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('Frameworks');
  const [newTemplateFilePath, setNewTemplateFilePath] = useState('');
  const [newTemplateIsFree, setNewTemplateIsFree] = useState(false);
  const [newTemplatePrice, setNewTemplatePrice] = useState('49');
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);

  // Course Detailed Management State
  const [managingCourse, setManagingCourse] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [activeModuleIdForLesson, setActiveModuleIdForLesson] = useState(null);
  
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState('video');
  const [newLessonDuration, setNewLessonDuration] = useState('10');
  const [newLessonUrl, setNewLessonUrl] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonFree, setNewLessonFree] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const handleFileUpload = async (e, setUrlCallback, setLoadingCallback) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingCallback(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success) {
        setUrlCallback(res.url);
      } else {
        throw new Error(res.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      alert('File upload failed: ' + err.message);
    } finally {
      setLoadingCallback(false);
      e.target.value = ''; // reset file input
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, cRes, qRes, tRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getCourses(),
        api.getQuestions(),
        api.getTemplates()
      ]);
      if (mRes.success) setMetrics(mRes.metrics);
      if (cRes.success) setCourses(cRes.courses);
      if (qRes.success) setQuestions(qRes.questions);
      if (tRes.success) setTemplates(tRes.templates);
      
      if (managingCourse) {
        const detailsRes = await api.getCourseDetails(managingCourse.slug);
        if (detailsRes.success) setManagingCourse(detailsRes.course);
      }
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
        headline: newCourseHeadline,
        cover_image: newCourseCover
      });
      if (res.success) {
        setNewCourseTitle('');
        setNewCourseHeadline('');
        setNewCourseCover('');
        setShowCourseForm(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveQuestion = async (formData, id) => {
    try {
      if (id) {
        const res = await api.updateQuestion(id, formData);
        if (res.success) {
          fetchData();
          setShowQuestionForm(false);
          setEditingQuestion(null);
        }
      } else {
        const res = await api.createQuestion(formData);
        if (res.success) {
          fetchData();
          setShowQuestionForm(false);
          setEditingQuestion(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await api.deleteQuestion(id);
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to completely delete this user? This cannot be undone.")) return;
    try {
      const res = await api.deleteUser(id);
      if (res.success) {
        fetchData();
      } else {
        alert(res.error || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async (email) => {
    if (!window.confirm(`Send a password reset email to ${email}?`)) return;
    try {
      const res = await api.adminResetPassword(email);
      if (res.success) {
        alert('Password reset email sent!');
      } else {
        alert(res.error || "Failed to send reset email");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    try {
      const templateData = {
        title: newTemplateTitle,
        description: newTemplateDesc,
        category: newTemplateCategory,
        file_path: newTemplateFilePath,
        is_free: newTemplateIsFree,
        price: newTemplateIsFree ? 0 : parseFloat(newTemplatePrice)
      };

      let res;
      if (editingTemplateId) {
        res = await api.updateTemplate(editingTemplateId, templateData);
      } else {
        res = await api.createTemplate(templateData);
      }

      if (res.success) {
        setShowTemplateForm(false);
        setEditingTemplateId(null);
        setNewTemplateTitle('');
        setNewTemplateDesc('');
        setNewTemplateCategory('Frameworks');
        setNewTemplateFilePath('');
        setNewTemplateIsFree(false);
        setNewTemplatePrice('49');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      const res = await api.deleteTemplate(id);
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!managingCourse) return;
    try {
      const res = await api.addModuleToCourse(managingCourse.id, newModuleTitle);
      if (res.success) {
        setNewModuleTitle('');
        setShowModuleForm(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!managingCourse || !activeModuleIdForLesson) return;
    try {
      const res = await api.addLessonToModule(managingCourse.id, activeModuleIdForLesson, {
        title: newLessonTitle,
        type: newLessonType,
        duration_minutes: newLessonDuration,
        video_url: newLessonUrl,
        content: newLessonContent,
        is_free_preview: newLessonFree
      });
      if (res.success) {
        setNewLessonTitle('');
        setNewLessonUrl('');
        setNewLessonContent('');
        setActiveModuleIdForLesson(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-[11px] tracking-widest uppercase">Loading Admin Workspace</p>
      </div>
    </div>
  );

  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation - Dark Theme for Admin Feel */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col hidden md:flex h-screen sticky top-0 text-slate-300">
        <div className="px-5 py-3 border-b border-slate-800 bg-white">
          <EffectiveVeritusLogo subtitle={true} />
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Platform Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'courses' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <PlayCircle className="w-4 h-4" /> Course Management
          </button>
          
          <button 
            onClick={() => setActiveTab('questions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'questions' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Questions Taxonomy
          </button>

          <button 
            onClick={() => setActiveTab('templates')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'templates' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> Digital Templates
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> User Management
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-[11px] font-bold text-white truncate">{user?.full_name || 'Admin'}</div>
                <div className="text-[9px] text-slate-400 truncate">{user?.email}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors" title="Logout">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen">
        
        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && metrics && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
            
            <div className="flex justify-between items-end">
              <div>
                <h1 className="font-display text-xl font-bold text-slate-900">Executive Dashboard</h1>
                <p className="text-slate-500 text-xs mt-1">Live metrics and recent activity across the platform.</p>
              </div>
            </div>

            {/* Premium Compact KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full blur-xl group-hover:bg-emerald-100 transition-colors"></div>
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="relative z-10">
                  <div className="text-2xl font-extrabold text-slate-900">${metrics.total_revenue.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
                    <TrendingUp className="w-3 h-3" /> +12.5% this month
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-50 rounded-full blur-xl group-hover:bg-indigo-100 transition-colors"></div>
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Users</span>
                  <Users className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="relative z-10">
                  <div className="text-2xl font-extrabold text-slate-900">{metrics.total_users}</div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 mt-1">
                    <TrendingUp className="w-3 h-3" /> +4 new this week
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-50 rounded-full blur-xl group-hover:bg-amber-100 transition-colors"></div>
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Masterclasses</span>
                  <BookOpen className="w-4 h-4 text-amber-500" />
                </div>
                <div className="relative z-10">
                  <div className="text-2xl font-extrabold text-slate-900">{metrics.total_courses}</div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-1">
                    Published & Active
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-50 rounded-full blur-xl group-hover:bg-rose-100 transition-colors"></div>
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Orders</span>
                  <Layers className="w-4 h-4 text-rose-500" />
                </div>
                <div className="relative z-10">
                  <div className="text-2xl font-extrabold text-slate-900">{metrics.total_orders}</div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-1">
                    Lifetime volume
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Overview Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-sm">Recent Signups</h3>
                <button onClick={() => setActiveTab('users')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Manage Users &rarr;</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {metrics.users_list.slice(0, 5).map((u, i) => (
                      <tr key={u.id || i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {u.full_name?.charAt(0) || 'U'}
                            </div>
                            <span className="font-bold text-slate-700">{u.full_name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500">{u.email}</td>
                        <td className="px-5 py-3 text-slate-400">
                          {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && metrics && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
            
            <div className="flex justify-between items-end">
              <div>
                <h1 className="font-display text-xl font-bold text-slate-900">User Management</h1>
                <p className="text-slate-500 text-xs mt-1">Control access, reset passwords, or remove accounts.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-4 w-64">Practitioner Name</th>
                      <th className="px-5 py-4">Email Address</th>
                      <th className="px-5 py-4">Role</th>
                      <th className="px-5 py-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metrics.users_list.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold">
                              {u.full_name?.charAt(0) || 'U'}
                            </div>
                            <span className="font-bold text-slate-800">{u.full_name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500">{u.email}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                            u.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleResetPassword(u.email)}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded text-slate-600 hover:text-indigo-600 font-bold text-[10px] flex items-center gap-1 shadow-sm"
                            >
                              <KeyRound className="w-3 h-3" /> Reset Pwd
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded font-bold text-[10px] flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- COURSES TAB --- */}
        {activeTab === 'courses' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
            
            {!managingCourse ? (
              <>
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="font-display text-xl font-bold text-slate-900">Course Management</h1>
                    <p className="text-slate-500 text-xs mt-1">Create and manage executive masterclasses.</p>
                  </div>
                  <button 
                    onClick={() => setShowCourseForm(!showCourseForm)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wide transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> {showCourseForm ? 'Cancel' : 'New Masterclass'}
                  </button>
                </div>

                {/* Create Course Form */}
                {showCourseForm && (
                  <div className="bg-white rounded-xl p-8 border border-indigo-100 shadow-md relative overflow-hidden animate-in zoom-in-95 duration-200">
                    <h3 className="font-bold text-base text-slate-900 mb-6 border-b border-slate-100 pb-2">Masterclass Configuration</h3>
                    <form onSubmit={handleCreateCourse} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Official Title</label>
                          <input
                            type="text" required value={newCourseTitle} onChange={e => setNewCourseTitle(e.target.value)}
                            placeholder="e.g. Boardroom Cyber Governance"
                            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium outline-none transition-all shadow-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pricing ($)</label>
                          <input
                            type="number" required value={newCoursePrice} onChange={e => setNewCoursePrice(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium outline-none transition-all shadow-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Executive Headline</label>
                          <input
                            type="text" required value={newCourseHeadline} onChange={e => setNewCourseHeadline(e.target.value)}
                            placeholder="Master the art of risk decision intelligence..."
                            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium outline-none transition-all shadow-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                            <span>Cover Image (URL or Upload)</span>
                            {isUploadingCourseCover && <span className="text-indigo-600 animate-pulse">Uploading...</span>}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text" value={newCourseCover} onChange={e => setNewCourseCover(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium outline-none transition-all shadow-sm"
                            />
                            <label className="cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 flex items-center shrink-0">
                              Upload Image
                              <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, setNewCourseCover, setIsUploadingCourseCover)} disabled={isUploadingCourseCover} />
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button type="button" onClick={() => setShowCourseForm(false)} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold text-[11px] uppercase tracking-wide hover:bg-slate-100 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wide transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                          Publish Configuration
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Courses List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map(course => (
                    <div key={course.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:border-indigo-200 transition-colors">
                      <div className="h-24 bg-slate-100 relative overflow-hidden">
                        <img 
                          src={course.cover_image || course.thumbnail_url || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800'} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-slate-900/40"></div>
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest rounded shadow-sm">
                            {course.tier}
                          </span>
                          <span className="text-white font-bold text-sm shadow-sm">${course.price}</span>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-sm text-slate-900 mb-1 leading-tight">{course.title}</h3>
                        <p className="text-[11px] text-slate-500 mb-4 line-clamp-2 leading-relaxed">{course.headline}</p>
                        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {course.modules?.length || 0} Modules
                          </div>
                          <button 
                            onClick={async () => {
                              const res = await api.getCourseDetails(course.slug);
                              if (res.success) setManagingCourse(res.course);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold flex items-center gap-1"
                          >
                            Manage <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // Managing Course Detailed View
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <button 
                  onClick={() => { setManagingCourse(null); fetchData(); }}
                  className="mb-4 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Courses
                </button>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h1 className="font-display text-xl font-bold text-slate-900">{managingCourse.title}</h1>
                    <p className="text-slate-500 text-xs mt-1">Manage modules and curriculum.</p>
                  </div>
                  <button 
                    onClick={() => setShowModuleForm(!showModuleForm)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wide transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Module
                  </button>
                </div>

                {showModuleForm && (
                  <div className="bg-white rounded-xl p-5 border border-indigo-100 shadow-sm mb-6">
                    <form onSubmit={handleCreateModule} className="flex gap-4 items-end">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Module Title</label>
                        <input
                          type="text" required value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-400/20"
                        />
                      </div>
                      <button type="submit" className="px-5 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs">Add Module</button>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {(managingCourse.modules || []).map((mod, idx) => (
                    <div key={mod.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-slate-900">Module {idx + 1}: {mod.title}</h3>
                        <button 
                          onClick={() => setActiveModuleIdForLesson(activeModuleIdForLesson === mod.id ? null : mod.id)}
                          className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 uppercase tracking-wide"
                        >
                          <Plus className="w-3 h-3" /> Add Lesson
                        </button>
                      </div>

                      {activeModuleIdForLesson === mod.id && (
                        <div className="p-5 border-b border-slate-100 bg-indigo-50/30">
                          <form onSubmit={handleCreateLesson} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Lesson Title</label>
                                <input type="text" required value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)} className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-200 text-xs" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Duration (min)</label>
                                <input type="number" required value={newLessonDuration} onChange={e => setNewLessonDuration(e.target.value)} className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-200 text-xs" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                                <span>Video URL (or embed)</span>
                                {isUploadingVideo && <span className="text-indigo-600 animate-pulse">Uploading...</span>}
                              </label>
                              <div className="flex gap-2">
                                <input type="text" required value={newLessonUrl} onChange={e => setNewLessonUrl(e.target.value)} className="flex-1 px-2.5 py-1.5 rounded bg-white border border-slate-200 text-xs" placeholder="https://..." />
                                <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-bold text-slate-600 flex items-center shrink-0">
                                  Upload Video
                                  <input type="file" className="hidden" accept="video/*" onChange={e => handleFileUpload(e, setNewLessonUrl, setIsUploadingVideo)} disabled={isUploadingVideo} />
                                </label>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Lesson Content (Text)</label>
                              <textarea required value={newLessonContent} onChange={e => setNewLessonContent(e.target.value)} rows={4} className="w-full px-2.5 py-2 rounded bg-white border border-slate-200 text-xs resize-y font-mono" placeholder="Write lesson content here..."></textarea>
                            </div>
                            <div className="flex items-center gap-2 pb-2">
                              <input type="checkbox" id={`free-${mod.id}`} checked={newLessonFree} onChange={e => setNewLessonFree(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                              <label htmlFor={`free-${mod.id}`} className="text-[10px] font-bold text-slate-600">Available as Free Preview</label>
                            </div>
                            <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded text-[10px] font-bold shadow-sm">Save Lesson</button>
                          </form>
                        </div>
                      )}

                      <div className="divide-y divide-slate-100">
                        {(mod.lessons || []).map((lesson, lIdx) => (
                          <div key={lesson.id} className="px-5 py-3 flex justify-between items-center hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-slate-500">
                                <PlayCircle className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-slate-700">{lIdx + 1}. {lesson.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold">{lesson.duration_minutes} min</span>
                          </div>
                        ))}
                        {(!mod.lessons || mod.lessons.length === 0) && (
                          <div className="px-5 py-4 text-xs text-slate-400 italic text-center">No lessons in this module yet.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* --- TEMPLATES TAB --- */}
        {activeTab === 'templates' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="font-display text-xl font-bold text-slate-900">Digital Templates Library</h1>
                <p className="text-slate-500 text-xs mt-1">Manage downloadable frameworks and assets.</p>
              </div>
              <button 
                onClick={() => {
                  setEditingTemplateId(null);
                  setNewTemplateTitle('');
                  setNewTemplateDesc('');
                  setNewTemplateFilePath('');
                  setNewTemplateCategory('Frameworks');
                  setNewTemplateIsFree(false);
                  setShowTemplateForm(!showTemplateForm);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wide transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> {showTemplateForm ? 'Cancel' : 'New Template'}
              </button>
            </div>

            {showTemplateForm && (
              <div className="bg-white rounded-xl p-8 border border-indigo-100 shadow-md animate-in zoom-in-95 duration-200">
                <h3 className="font-bold text-base text-slate-900 mb-6 border-b border-slate-100 pb-2">{editingTemplateId ? 'Edit' : 'New'} Template Configuration</h3>
                <form onSubmit={handleSaveTemplate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Title</label>
                      <input type="text" required value={newTemplateTitle} onChange={e => setNewTemplateTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium outline-none transition-all shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                      <select value={newTemplateCategory} onChange={e => setNewTemplateCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium outline-none transition-all shadow-sm">
                        <option value="Frameworks">Frameworks</option>
                        <option value="Policies">Policies</option>
                        <option value="Presentations">Presentations</option>
                        <option value="Checklists">Checklists</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5 bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                    <input type="text" value={newTemplateDesc} onChange={e => setNewTemplateDesc(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium outline-none transition-all shadow-sm" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                        <span>File Path / URL</span>
                        {isUploadingTemplate && <span className="text-indigo-600 animate-pulse">Uploading...</span>}
                      </label>
                      <div className="flex gap-2">
                        <input type="text" required value={newTemplateFilePath} onChange={e => setNewTemplateFilePath(e.target.value)} placeholder="e.g. https://..." className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium outline-none transition-all shadow-sm" />
                        <label className="cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 flex items-center shrink-0">
                          Upload File
                          <input type="file" className="hidden" onChange={e => handleFileUpload(e, setNewTemplateFilePath, setIsUploadingTemplate)} disabled={isUploadingTemplate} />
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={newTemplateIsFree} onChange={e => setNewTemplateIsFree(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded border-slate-300" />
                        Mark as Free (Bypasses Paywall)
                      </label>
                      {!newTemplateIsFree && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700">Price ($)</span>
                          <input
                            type="number" value={newTemplatePrice} onChange={e => setNewTemplatePrice(e.target.value)}
                            className="w-24 px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 text-xs font-medium outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                    <button type="button" onClick={() => {
                      setShowTemplateForm(false);
                      setEditingTemplateId(null);
                    }} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold text-[11px] uppercase tracking-wide hover:bg-slate-100 transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wide transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">{editingTemplateId ? 'Save Changes' : 'Publish Template'}</button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Template Title</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Access</th>
                    <th className="px-5 py-4">Downloads</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {templates.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/80 group">
                      <td className="px-5 py-4 font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" /> {t.title}
                      </td>
                      <td className="px-5 py-4 text-slate-500">{t.category}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${t.is_free ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {t.is_free ? 'Free' : 'Premium'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 font-bold">{t.downloads_count || 0}</td>
                      <td className="px-5 py-4 text-right flex items-center justify-end gap-2">
                        <button onClick={() => {
                          setEditingTemplateId(t.id);
                          setNewTemplateTitle(t.title);
                          setNewTemplateDesc(t.description || '');
                          setNewTemplateCategory(t.category);
                          setNewTemplateFilePath(t.file_path);
                          setNewTemplateIsFree(t.is_free);
                          setNewTemplatePrice(t.price ? t.price.toString() : '49');
                          setShowTemplateForm(true);
                        }} className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded font-bold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit2 className="w-3 h-3 inline mr-1" /> Edit
                        </button>
                        <button onClick={() => handleDeleteTemplate(t.id)} className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded font-bold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-3 h-3 inline mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {templates.length === 0 && (
                    <tr><td colSpan="5" className="px-5 py-8 text-center text-slate-400 italic">No templates available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* --- QUESTIONS TAB --- */}
        {activeTab === 'questions' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
            
            <div className="flex justify-between items-end">
              <div>
                <h1 className="font-display text-xl font-bold text-slate-900">Taxonomy Manager</h1>
                <p className="text-slate-500 text-xs mt-1">Manage the 100 Risk Questions and regulator tags.</p>
              </div>
              <button 
                onClick={() => setShowQuestionForm(!showQuestionForm)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wide transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> {showQuestionForm ? 'Cancel' : 'New Question'}
              </button>
            </div>

            <AdminQuestionModal 
              isOpen={showQuestionForm || !!editingQuestion} 
              onClose={() => {
                setShowQuestionForm(false);
                setEditingQuestion(null);
              }} 
              question={editingQuestion} 
              onSave={handleSaveQuestion} 
            />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-3 border-b border-slate-100 bg-slate-50/80">
                <div className="relative max-w-sm">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search taxonomy..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-white sticky top-0 z-10 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 shadow-sm">
                    <tr>
                      <th className="px-4 py-3 w-12">ID</th>
                      <th className="px-4 py-3">Question Title</th>
                      <th className="px-4 py-3 w-40">Domain</th>
                      <th className="px-4 py-3 w-36">Pressure</th>
                      <th className="px-4 py-3 w-28 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {filteredQuestions.map(q => (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-4 py-3 font-mono font-bold text-slate-400">
                          Q{q.question_number}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {q.title}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-medium">
                          {q.domain}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide
                            ${q.regulator_pressure === 'High' ? 'bg-rose-50 text-rose-600' : 
                              q.regulator_pressure === 'Medium' || q.regulator_pressure === 'Moderate' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}
                          `}>
                            {q.regulator_pressure}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingQuestion(q);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit Question"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
