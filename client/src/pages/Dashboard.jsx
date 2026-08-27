import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PlayCircle, FileText, Download, Award, ShieldCheck, User, Lock, Key, CheckCircle2, AlertCircle, Save, Shield, Settings, Mail, UserCheck, ShoppingBag, Tag } from 'lucide-react';
import { api, API_BASE } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import ReviewModal from '../components/ReviewModal';
import NameConfirmationModal from '../components/NameConfirmationModal';

const LinkedInIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const getCertNo = (courseId, userId) => {
  if (!courseId) return 1042;
  let hash = 0;
  const str = `${userId || 'u'}-${courseId}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 9000) + 1000;
};

const getLinkedInCertUrl = (title, certId, certUrl, issuedAt) => {
  const dateObj = issuedAt ? new Date(issuedAt) : new Date();
  const year = isNaN(dateObj.getFullYear()) ? new Date().getFullYear() : dateObj.getFullYear();
  const month = isNaN(dateObj.getMonth()) ? new Date().getMonth() + 1 : dateObj.getMonth() + 1;

  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: title || 'Executive Risk Masterclass',
    organizationName: 'Veritus Executive Risk Platform',
    issueYear: String(year),
    issueMonth: String(month),
    certUrl: certUrl || (typeof window !== 'undefined' ? window.location.href : ''),
    certId: certId ? String(certId) : ''
  });

  return `https://www.linkedin.com/profile/add?${params.toString()}`;
};

export default function Dashboard() {
  const { user, updateUserProfile, updateUserPassword } = useAuth();
  const { cartItems, removeFromCart } = useCart();
  const [data, setData] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const [downloadingId, setDownloadingId] = useState(null);
  
  const tabFromUrl = searchParams.get('tab');
  const validTabs = ['mylearning', 'assets', 'certificates', 'orders', 'profile'];
  const initialTab = (tabFromUrl && validTabs.includes(tabFromUrl))
    ? tabFromUrl
    : (localStorage.getItem('veritus_dashboard_tab') || 'mylearning');

  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
    localStorage.setItem('veritus_dashboard_tab', newTab);
  };

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab && validTabs.includes(currentTab)) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  const [userOrders, setUserOrders] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewCourseId, setReviewCourseId] = useState(null);
  const [copiedCertId, setCopiedCertId] = useState(null);

  // Profile Edit State
  const [profileFullName, setProfileFullName] = useState(user?.full_name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  // Name Confirmation Modal State
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [selectedCertCourse, setSelectedCertCourse] = useState(null);

  // Refund Request State
  const [refundModalOrder, setRefundModalOrder] = useState(null);
  const [refundReasonInput, setRefundReasonInput] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundModalError, setRefundModalError] = useState('');

  // View Admin Reply / Details Modal State
  const [viewDetailsOrder, setViewDetailsOrder] = useState(null);

  const handleRequestRefundSubmit = async (e) => {
    e.preventDefault();
    if (!refundModalOrder || !refundReasonInput.trim()) return;

    setRefundSubmitting(true);
    setRefundModalError('');

    try {
      const res = await api.requestOrderRefund(refundModalOrder.id, refundReasonInput.trim());
      if (res.success && res.order) {
        setUserOrders(prev => prev.map(o => o.id === res.order.id ? res.order : o));
        setRefundModalOrder(null);
        setRefundReasonInput('');
      } else {
        setRefundModalError(res.error || 'Failed to submit refund request');
      }
    } catch (err) {
      setRefundModalError('Failed to submit refund request');
    } finally {
      setRefundSubmitting(false);
    }
  };

  const isEligibleForRefund = (order) => {
    if (order.status !== 'paid') return false;
    const orderTime = new Date(order.paid_at || order.created_at).getTime();
    const diffHours = (Date.now() - orderTime) / (1000 * 60 * 60);
    return diffHours <= 72;
  };

  const handleConfirmAndIssueCert = async (confirmedName) => {
    if (!selectedCertCourse) return;
    const res = await api.issueCertificate({
      course_id: selectedCertCourse.id,
      student_name: confirmedName
    });
    if (res.success && res.certificate) {
      const certRes = await api.getCertificates();
      if (certRes.success) setCertificates(certRes.certificates);
      setNameModalOpen(false);
      window.open(`/certificate/${selectedCertCourse.slug || selectedCertCourse.id}`, '_blank');
    } else {
      throw new Error(res.error || 'Failed to issue certificate');
    }
  };

  useEffect(() => {
    if (user?.full_name) {
      setProfileFullName(user.full_name);
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    const res = await updateUserProfile({ full_name: profileFullName });
    setProfileLoading(false);
    if (res.success) {
      setData(prev => prev ? { ...prev, user: { ...prev.user, full_name: profileFullName.trim() } } : prev);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setProfileMsg({ type: 'error', text: res.error || 'Failed to update profile' });
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMsg(null);
    const res = await updateUserPassword(newPassword);
    setPasswordLoading(false);
    if (res.success) {
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: res.error || 'Failed to update password' });
    }
  };

  const handleDownload = async (tpl) => {
    try {
      setDownloadingId(tpl.id);
      const { blob, filename } = await api.downloadTemplateFile(tpl.id);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert(err.message || 'Failed to download template. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, certRes, ordersRes] = await Promise.all([
          api.getDashboardSummary(),
          api.getCertificates(),
          api.getUserOrders()
        ]);
        
        if (dashRes.success) {
          setData(dashRes);
          
          // Auto-remove any already purchased items from the local cart
          const ownedIds = [
            ...dashRes.enrolled_courses.map(c => c.id),
            ...dashRes.accessible_templates.map(t => t.id)
          ];
          
          cartItems.forEach(item => {
            if (ownedIds.includes(item.id)) {
              removeFromCart(item.id);
            }
          });
        }
        
        if (certRes.success) {
          setCertificates(certRes.certificates);
        }

        if (ordersRes && ordersRes.success) {
          setUserOrders(ordersRes.orders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [cartItems, removeFromCart]);

  if (loading) return <div className="py-16 text-center text-slate-500 text-xs">Loading your member dashboard...</div>;
  const completedFromSummary = (data?.enrolled_courses || []).filter(c => c.is_completed).map(c => {
    const certNo = getCertNo(c.id, user?.id);
    return {
      id: c.id,
      course_id: c.id,
      course_slug: c.slug,
      course_title: c.title,
      cert_number: certNo,
      issued_at: c.completed_at || new Date().toISOString()
    };
  });

  const displayCertificates = certificates.length > 0 ? certificates : completedFromSummary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-900 bg-[#F8FAFC]">
      
      {/* Header Profile Summary */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-display text-lg font-bold">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="text-[11px] text-blue-900 font-mono font-bold uppercase">Executive Practitioner Portal</div>
            <h1 className="font-display text-xl font-extrabold text-slate-900">{user?.full_name}</h1>
            <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
          <div className="flex-1 md:flex-none p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
            <div className="text-lg font-extrabold text-slate-900 font-display">{data.enrolled_courses.length}</div>
            <div className="text-[10px] text-slate-500 font-medium">Enrolled Courses</div>
          </div>
          <div className="flex-1 md:flex-none p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
            <div className="text-lg font-extrabold text-emerald-700 font-display">{data.accessible_templates.length}</div>
            <div className="text-[10px] text-slate-500 font-medium">Unlocked Assets</div>
          </div>
          <div className="flex-1 md:flex-none p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
            <div className="text-lg font-extrabold text-amber-600 font-display">{displayCertificates.length}</div>
            <div className="text-[10px] text-slate-500 font-medium">Certificates</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-6 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => handleTabChange('mylearning')}
          className={`pb-4 text-sm font-bold transition-colors relative shrink-0 ${activeTab === 'mylearning' ? 'text-blue-900' : 'text-slate-500 hover:text-slate-900'}`}
        >
          My Learning
          {activeTab === 'mylearning' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-900 rounded-t-full"></span>}
        </button>
        <button
          onClick={() => handleTabChange('assets')}
          className={`pb-4 text-sm font-bold transition-colors relative shrink-0 ${activeTab === 'assets' ? 'text-blue-900' : 'text-slate-500 hover:text-slate-900'}`}
        >
          Digital Assets
          {activeTab === 'assets' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-900 rounded-t-full"></span>}
        </button>
        <button
          onClick={() => handleTabChange('certificates')}
          className={`pb-4 text-sm font-bold transition-colors relative shrink-0 ${activeTab === 'certificates' ? 'text-blue-900' : 'text-slate-500 hover:text-slate-900'}`}
        >
          My Certificates
          {activeTab === 'certificates' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-900 rounded-t-full"></span>}
        </button>
        <button
          onClick={() => handleTabChange('orders')}
          className={`pb-4 text-sm font-bold transition-colors relative shrink-0 flex items-center gap-1.5 ${activeTab === 'orders' ? 'text-blue-900' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <ShoppingBag className="w-4 h-4" />
          Order History
          {activeTab === 'orders' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-900 rounded-t-full"></span>}
        </button>
        <button
          onClick={() => handleTabChange('profile')}
          className={`pb-4 text-sm font-bold transition-colors relative shrink-0 flex items-center gap-1.5 ${activeTab === 'profile' ? 'text-blue-900' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Settings className="w-4 h-4" />
          Profile & Settings
          {activeTab === 'profile' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-900 rounded-t-full"></span>}
        </button>
      </div>

      {/* Enrolled Masterclasses */}
      {activeTab === 'mylearning' && (
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-blue-900" /> Enrolled Masterclasses & Learning Progress
        </h2>

        {data.enrolled_courses.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center space-y-3">
            <p className="text-slate-600 text-xs font-medium">You have not enrolled in any masterclasses yet.</p>
            <Link to="/courses" className="inline-block px-4 py-2 bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs">
              Explore Masterclass Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.enrolled_courses.map(course => (
              <div 
                key={course.id} 
                onClick={() => {
                  if (course.resume_lesson) {
                    navigate(`/learn/${course.slug}/lesson/${course.resume_lesson.id}`);
                  } else {
                    navigate(`/courses/${course.slug}`);
                  }
                }}
                className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-xs group h-full cursor-pointer"
              >
                <div>
                  <div className="relative overflow-hidden">
                    <img src={course.cover_image || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800'} alt={course.title} className="w-full h-32 object-cover transition-transform duration-700 group-hover:scale-105" />
                    {course.tier && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur text-blue-900 text-[10px] font-bold border border-blue-200 shadow-xs">
                        {course.tier}
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="font-display text-base font-bold text-slate-900 leading-tight">{course.title}</h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">{course.headline || 'Continue your learning journey with this masterclass.'}</p>
                    
                    {/* Progress Bar */}
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Course Completion</span>
                        <span className="font-bold text-blue-900">{course.progress_percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div 
                          className="h-full bg-blue-900 transition-all duration-500 rounded-full" 
                          style={{ width: `${course.progress_percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-slate-100 flex flex-col gap-2 mt-auto">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>{course.completed_lessons} / {course.total_lessons} Lessons</span>
                    {course.is_completed && (
                      <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 100% Completed
                      </span>
                    )}
                  </div>
                  
                  {course.is_completed ? (
                    <div className="flex items-center gap-1.5 w-full pt-0.5">
                      {!course.user_has_reviewed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewCourseId(course.id);
                            setReviewModalOpen(true);
                          }}
                          className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold text-[10px] hover:bg-slate-50 transition-colors shadow-xs text-center justify-center whitespace-nowrap"
                        >
                          Review
                        </button>
                      )}
                      <a
                        href={getLinkedInCertUrl(
                          course.title, 
                          getCertNo(course.id, user?.id), 
                          `${window.location.origin}/certificate/${course.slug || course.id}`, 
                          course.completed_at
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 px-2 py-1.5 rounded-lg bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer text-center whitespace-nowrap"
                        title="Add this certification directly to your LinkedIn profile"
                      >
                        <LinkedInIcon className="w-3 h-3 text-white shrink-0" /> <span className="truncate">Add to LinkedIn</span>
                      </a>
                      <Link
                        to={`/certificate/${course.id}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 px-2 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1 shadow-xs text-center whitespace-nowrap"
                      >
                        <Award className="w-3.5 h-3.5 shrink-0" /> Certificate
                      </Link>
                    </div>
                  ) : course.resume_lesson && (
                    <Link
                      to={`/learn/${course.slug}/lesson/${course.resume_lesson.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full sm:w-auto justify-center px-3 py-1.5 rounded-lg bg-blue-900 text-white font-bold text-[10px] hover:bg-blue-800 transition-colors flex items-center gap-1 shadow-xs"
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
      )}

      {/* Accessible Digital Templates */}
      {activeTab === 'assets' && (
      <>
        <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-700" /> Accessible Digital Risk Frameworks
        </h2>

        {data.accessible_templates.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center space-y-3">
            <p className="text-slate-600 text-xs font-medium">You have not unlocked any digital risk frameworks yet.</p>
            <Link to="/templates" className="inline-block px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors">
              Explore Template Hub
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.accessible_templates.map(tpl => (
            <div key={tpl.id} className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-xs h-full">
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {tpl.category}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Unlocked
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-slate-900 leading-snug">{tpl.title}</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed font-normal line-clamp-3">{tpl.description || 'Access your digital risk framework asset.'}</p>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 mt-auto">
                <span className="text-[10px] text-slate-500 font-medium">Ready for download</span>
                <button
                  onClick={() => handleDownload(tpl)}
                  disabled={downloadingId === tpl.id}
                  className={`px-3 py-1.5 rounded-lg text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                    downloadingId === tpl.id 
                      ? 'bg-slate-300 text-slate-500 cursor-wait' 
                      : 'bg-emerald-700 hover:bg-emerald-600'
                  }`}
                >
                  {downloadingId === tpl.id ? (
                    <span className="flex items-center gap-1 animate-pulse">
                      Downloading...
                    </span>
                  ) : (
                    <>
                      <Download className="w-3 h-3" /> Download
                    </>
                  )}
                </button>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Unlocked Reference Content */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-700" /> Unlocked Reference Packs
        </h2>
        
        {!data.unlocked_domains || data.unlocked_domains.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center space-y-3">
            <p className="text-slate-600 text-xs font-medium">You have not unlocked any domain master packs yet.</p>
            <Link to="/questions" className="inline-block px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors">
              Explore 100 Risk Questions
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.unlocked_domains.map(packId => (
              <div key={packId} className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-indigo-200 flex flex-col justify-between shadow-xs h-full bg-indigo-50/30">
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
                      Domain Pack
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Unlocked
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-900 leading-snug">
                    {packId.replace('pack_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Pack
                  </h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                    Full access to guidance, answers, and frameworks for this domain.
                  </p>
                </div>
                <div className="p-4 border-t border-indigo-100 bg-white/50 flex items-center justify-between mt-auto">
                  <Link
                    to="/questions"
                    className="w-full px-3 py-2 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    View in Taxonomy Explorer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}

      {/* Certificates Tab */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> My Certificates
          </h2>

          {displayCertificates.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center space-y-3">
              <p className="text-slate-600 text-xs font-medium">You have not earned any certificates yet. Complete a masterclass and pass the final assessment to earn one.</p>
              <button onClick={() => setActiveTab('mylearning')} className="inline-block px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors">
                Go to My Learning
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayCertificates.map(cert => {
                const certTitle = cert.course_title || cert.courses?.title || 'Executive Masterclass';
                const certNum = cert.cert_number || getCertNo(cert.course_id || cert.id, user?.id);
                const verifyUrl = `${window.location.origin}/certificate/${cert.course_slug || cert.course_id}`;

                return (
                  <div key={cert.id} className="glass-card glass-card-hover rounded-3xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-xs h-full bg-white p-6 space-y-5">
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-950 text-white flex items-center justify-center font-bold shadow-sm">
                        <Award className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-900 font-mono font-extrabold text-[11px] border border-blue-200/80 shadow-xs">
                        NO: #{certNum}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] text-blue-900 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Executive Credential
                      </div>
                      <h3 className="font-display font-black text-lg text-slate-900 leading-tight">
                        {certTitle}
                      </h3>
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-900" />
                        <span>Recipient: {cert.student_name || user?.full_name || 'Executive Practitioner'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Issued: {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 mt-auto">
                      <Link
                        to={`/certificate/${cert.course_slug || cert.course_id}`}
                        target="_blank"
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Award className="w-3.5 h-3.5" /> View
                      </Link>

                      <a
                        href={getLinkedInCertUrl(certTitle, certNum, verifyUrl, cert.issued_at)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        title="Add this certification directly to your LinkedIn profile"
                      >
                        <LinkedInIcon className="w-3.5 h-3.5 text-white" /> Add to LinkedIn
                      </a>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(verifyUrl);
                          setCopiedCertId(cert.id);
                          setTimeout(() => setCopiedCertId(null), 2500);
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
                        title="Copy public verification link"
                      >
                        {copiedCertId === cert.id ? (
                          <span className="text-emerald-700 font-bold">✓ Copied</span>
                        ) : (
                          'Copy URL'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Order History Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-900" /> Order History & Receipts
          </h2>

          {userOrders.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center space-y-3">
              <p className="text-slate-600 text-xs font-medium">You have no order history yet.</p>
              <Link to="/courses" className="inline-block px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors">
                Browse Courses & Resources
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Item Purchased</th>
                      <th className="px-4 py-3">Coupon Code</th>
                      <th className="px-4 py-3 text-right">Original Price</th>
                      <th className="px-4 py-3 text-right">Discount</th>
                      <th className="px-4 py-3 text-right">Amount Paid</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Action / Refund</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userOrders.map(order => {
                      const canRefund = isEligibleForRefund(order);

                      return (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3.5 text-slate-500 font-medium">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-500">{order.id}</td>
                          <td className="px-4 py-3.5 font-semibold text-slate-900">{order.product_title || order.product_id}</td>
                          <td className="px-4 py-3.5">
                            {order.coupon_code ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[10px] uppercase">
                                <Tag className="w-3 h-3" /> {order.coupon_code}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right text-slate-500 font-medium">
                            {order.original_amount ? `$${Number(order.original_amount).toFixed(2)}` : `$${Number(order.amount).toFixed(2)}`}
                          </td>
                          <td className="px-4 py-3.5 text-right font-bold text-rose-600">
                            {order.discount_amount && Number(order.discount_amount) > 0 ? `-$${Number(order.discount_amount).toFixed(2)}` : '$0.00'}
                          </td>
                          <td className="px-4 py-3.5 text-right font-extrabold text-emerald-700 text-sm">
                            ${Number(order.amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                              order.status === 'paid' && order.admin_reply ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              order.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              order.status === 'refund_requested' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                              order.status === 'refunded' ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                              'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {order.status === 'refund_requested' ? 'Refund Requested' :
                               order.status === 'paid' && order.admin_reply ? 'Refund Declined' :
                               order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {canRefund ? (
                              <button
                                onClick={() => {
                                  setRefundModalOrder(order);
                                  setRefundReasonInput('');
                                  setRefundModalError('');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                              >
                                Request Refund
                              </button>
                            ) : order.status === 'refund_requested' || order.admin_reply ? (
                              <button
                                onClick={() => setViewDetailsOrder(order)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors cursor-pointer whitespace-nowrap"
                              >
                                View Details / Reply
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[10px] font-medium">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Refund Request Modal */}
      {refundModalOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">Request Order Refund</h3>
                <p className="text-[11px] text-slate-500 font-mono">Order #{refundModalOrder.id}</p>
              </div>
              <button onClick={() => setRefundModalOrder(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                ✕
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 space-y-1">
              <p className="font-bold">🛡️ 3-Day Satisfaction Guarantee</p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                You are requesting a refund within your first 3 days of purchase. Please explain why you are requesting a refund so our administrative team can review and process your request.
              </p>
            </div>

            <form onSubmit={handleRequestRefundSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Refund <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please describe why you would like a refund for this course or resource..."
                  value={refundReasonInput}
                  onChange={(e) => setRefundReasonInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium placeholder:text-slate-400"
                />
              </div>

              {refundModalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {refundModalError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModalOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!refundReasonInput.trim() || refundSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  {refundSubmitting ? 'Submitting...' : 'Submit Refund Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details / Admin Reply Modal */}
      {viewDetailsOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">Refund Request Details</h3>
                <p className="text-[11px] text-slate-500 font-mono">Order #{viewDetailsOrder.id}</p>
              </div>
              <button onClick={() => setViewDetailsOrder(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Purchased Product</span>
                <span className="font-bold text-slate-900 text-sm">{viewDetailsOrder.product_title || viewDetailsOrder.product_id}</span>
              </div>

              {viewDetailsOrder.refund_reason && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Your Submitted Reason</span>
                  <p className="text-slate-800 italic leading-relaxed">{viewDetailsOrder.refund_reason}</p>
                  {viewDetailsOrder.refund_requested_at && (
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Submitted on {new Date(viewDetailsOrder.refund_requested_at).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {viewDetailsOrder.admin_reply ? (
                <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 space-y-1">
                  <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">Administrator Reply / Note</span>
                  <p className="text-purple-950 font-medium leading-relaxed">{viewDetailsOrder.admin_reply}</p>
                </div>
              ) : (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-xs">
                  <p className="font-bold">⌛ Pending Review</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">Your refund request is currently being reviewed by an administrator.</p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setViewDetailsOrder(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile & Settings Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-900" /> Account & Security Settings
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Manage your practitioner profile information, account credentials, and password.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information Card */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200 bg-white shadow-xs space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-900/10 text-blue-900 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">Personal Information</h3>
                  <p className="text-[11px] text-slate-500">Update your name as displayed on certificates and platform.</p>
                </div>
              </div>

              {profileMsg && (
                <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  profileMsg.type === 'success' 
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileFullName}
                    onChange={e => setProfileFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 text-xs font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">This name will be displayed across your profile, dashboard, and earned certificates.</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-mono cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Your registered email address is verified and locked for security.</p>
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {profileLoading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile Changes</>}
                </button>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="glass-card rounded-2xl p-6 border border-slate-200 bg-white shadow-xs space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-900/10 text-indigo-900 flex items-center justify-center font-bold">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">Security & Password</h3>
                  <p className="text-[11px] text-slate-500">Update your account access password.</p>
                </div>
              </div>

              {passwordMsg && (
                <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  passwordMsg.type === 'success' 
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" /> New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-900 focus:ring-2 focus:ring-indigo-900/10 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" /> Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-900 focus:ring-2 focus:ring-indigo-900/10 text-xs font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {passwordLoading ? 'Updating Password...' : <><Shield className="w-4 h-4 text-emerald-400" /> Update Password</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal Component */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSuccess={() => {
          if (data && data.enrolled_courses) {
            setData({
              ...data,
              enrolled_courses: data.enrolled_courses.map(c => 
                (c.id === reviewCourseId || c.slug === reviewCourseId) ? { ...c, user_has_reviewed: true } : c
              )
            });
          }
        }}
        productType="course"
        productId={reviewCourseId}
        productName={data?.enrolled_courses?.find(c => c.id === reviewCourseId)?.title}
      />

      {/* Name Confirmation & Locking Modal */}
      <NameConfirmationModal
        isOpen={nameModalOpen}
        onClose={() => setNameModalOpen(false)}
        onConfirm={handleConfirmAndIssueCert}
        initialName={user?.full_name || ''}
        courseTitle={selectedCertCourse?.title || ''}
      />

    </div>
  );
}
