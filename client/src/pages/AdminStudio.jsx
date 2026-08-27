import React, { useState, useEffect } from 'react';
import {
  Sparkles, Plus, BookOpen, Layers, Users, DollarSign,
  BarChart3, Settings, ShieldCheck, Search, ChevronRight, Video, Edit2, PlayCircle, ShieldAlert,
  LogOut, Trash2, KeyRound, TrendingUp, FileText, Download, ArrowLeft, Mail, Menu, X, CheckCircle2, Send, Star, Megaphone, UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import EffectiveVeritusLogo from '../components/EffectiveVeritusLogo';
import AdminQuestionModal from '../components/AdminQuestionModal';
import VideoPlayer from '../components/VideoPlayer';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import AssessmentBuilderModal from '../components/AssessmentBuilderModal';
import ModuleManagementModal from '../components/ModuleManagementModal';
import AssessmentPreview from '../components/AssessmentPreview';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '../lib/supabase';

const usePersistedState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) return JSON.parse(item);
    } catch (e) {}
    return defaultValue;
  });

  useEffect(() => {
    if (state === null || state === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

export default function AdminStudio() {
  const { user, logout, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [packs, setPacks] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [newPromotionMessage, setNewPromotionMessage] = useState('');
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('');
  const [newPromoStart, setNewPromoStart] = useState('');
  const [newPromoEnd, setNewPromoEnd] = useState('');
  const [newPromoLimit, setNewPromoLimit] = useState('');
  const [newPromoShowBanner, setNewPromoShowBanner] = useState(true);
  const [selectedPromoDetails, setSelectedPromoDetails] = usePersistedState('admin_selectedPromoDetails', null);
  const [editPromotion, setEditPromotion] = usePersistedState('admin_editPromotion', null);
  const [selectedOrder, setSelectedOrder] = usePersistedState('admin_selectedOrder', null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Modern UI State
  const [toastConfig, setToastConfig] = useState({ isOpen: false, message: '', type: 'success' });
  const [promoDeleteConfig, setPromoDeleteConfig] = useState({ isOpen: false, promoId: null });
  const [genericConfirm, setGenericConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmText: 'Confirm', type: 'danger' });

  const confirmAction = (title, message, onConfirm, confirmText = 'Confirm', type = 'danger') => {
    setGenericConfirm({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        await onConfirm();
        setGenericConfirm(prev => ({ ...prev, isOpen: false }));
      },
      confirmText,
      type
    });
  };

  const showToast = (message, type = 'success') => {
    setToastConfig({ isOpen: true, message, type });
  };

  // Inquiry Modal State
  const [selectedInquiry, setSelectedInquiry] = usePersistedState('admin_selectedInquiry', null);
  const [inquiryReplyText, setInquiryReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState(null);

  // Edit User Modal State
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserRole, setEditUserRole] = useState('student');
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserError, setEditUserError] = useState('');
  const [editUserSuccessMsg, setEditUserSuccessMsg] = useState('');

  const handleSaveEditedUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditUserLoading(true);
    setEditUserError('');
    setEditUserSuccessMsg('');

    try {
      const res = await api.updateAdminUser(editingUser.id, {
        full_name: editUserName,
        email: editUserEmail,
        password: editUserPassword || undefined,
        role: editUserRole
      });

      if (res.success) {
        setMetrics(prev => prev ? {
          ...prev,
          users_list: (prev.users_list || []).map(u => 
            u.id === editingUser.id ? { 
              ...u, 
              full_name: editUserName.trim(), 
              email: editUserEmail.trim(), 
              role: editUserRole 
            } : u
          )
        } : prev);

        setEditUserSuccessMsg('User account updated successfully!');
        showToast('User account updated successfully!', 'success');
        setTimeout(() => {
          setEditUserModalOpen(false);
          setEditingUser(null);
        }, 1000);
      } else {
        setEditUserError(res.error || 'Failed to update user account.');
      }
    } catch (err) {
      setEditUserError(err.message || 'An error occurred while updating user.');
    } finally {
      setEditUserLoading(false);
    }
  };

  // Navigation State
  const [searchParams, setSearchParams] = useSearchParams();
  const validAdminTabs = ['overview', 'courses', 'questions', 'templates', 'users', 'inquiries', 'orders', 'reviews', 'promotions'];
  const tabFromUrl = searchParams.get('tab');
  
  const initialAdminTab = (tabFromUrl && validAdminTabs.includes(tabFromUrl))
    ? tabFromUrl
    : (localStorage.getItem('adminStudioActiveTab') || 'overview');

  const [activeTab, setActiveTab] = useState(initialAdminTab);

  const changeAdminTab = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
    localStorage.setItem('adminStudioActiveTab', newTab);
  };

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab && validAdminTabs.includes(currentTab)) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  // Course Form State
  const [showCourseForm, setShowCourseForm] = usePersistedState('admin_showCourseForm', false);
  const [editingCourseId, setEditingCourseId] = usePersistedState('admin_editingCourseId', null);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState('199');
  const [newCourseTier, setNewCourseTier] = useState('Executive Tier');
  const [newCourseHeadline, setNewCourseHeadline] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseCover, setNewCourseCover] = useState('');
  const [isUploadingCourseCover, setIsUploadingCourseCover] = useState(false);

  // User Profile Details State
  const [selectedUserForDetails, setSelectedUserForDetails] = usePersistedState('admin_selectedUserForDetails', null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  // Question Form State
  const [showQuestionForm, setShowQuestionForm] = usePersistedState('admin_showQuestionForm', false);
  const [editingQuestion, setEditingQuestion] = usePersistedState('admin_editingQuestion', null);

  // Edit Question State
  const [searchQuery, setSearchQuery] = useState('');

  // Template Form State
  const [showTemplateForm, setShowTemplateForm] = usePersistedState('admin_showTemplateForm', false);
  const [editingTemplateId, setEditingTemplateId] = usePersistedState('admin_editingTemplateId', null);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('Frameworks');
  const [newTemplateFilePath, setNewTemplateFilePath] = useState('');
  const [newTemplateIsFree, setNewTemplateIsFree] = useState(false);
  const [newTemplatePrice, setNewTemplatePrice] = useState('49');
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);

  // Course Detailed Management State
  const [managingCourse, setManagingCourse] = usePersistedState('admin_managingCourse', null);
  const [managingLesson, setManagingLesson] = usePersistedState('admin_managingLesson', null);
  const [editingLesson, setEditingLesson] = usePersistedState('admin_editingLesson', false);
  const [showModuleForm, setShowModuleForm] = usePersistedState('admin_showModuleForm', false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [moduleEditModalOpen, setModuleEditModalOpen] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState(null);
  const [activeModuleIdForLesson, setActiveModuleIdForLesson] = usePersistedState('admin_activeModuleId', null);
  const [assessmentBuilderLesson, setAssessmentBuilderLesson] = usePersistedState('admin_assessmentBuilderLesson', null);

  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState('video');
  const [newLessonDuration, setNewLessonDuration] = useState('10');
  const [newLessonUrl, setNewLessonUrl] = useState('');
  const [newLessonAudioUrl, setNewLessonAudioUrl] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonFree, setNewLessonFree] = useState(false);
  const [newLessonFinal, setNewLessonFinal] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

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
    if (!metrics) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      const [mRes, cRes, qRes, tRes, iRes, oRes, pRes, rRes, prRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getCourses(),
        api.getQuestions(),
        api.getTemplates(),
        api.getAdminInquiries(),
        api.getAdminOrders(),
        api.getPacks(),
        api.getAdminReviews ? api.getAdminReviews() : fetch(`${API_BASE}/admin/reviews`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()),
        api.getAdminPromotions ? api.getAdminPromotions() : fetch(`${API_BASE}/admin/promotions`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json())
      ]);
      if (mRes.success) setMetrics(mRes.metrics);
      if (cRes.success) setCourses(cRes.courses);
      if (qRes.success) setQuestions(qRes.questions);
      if (pRes && pRes.success) setPacks(pRes.packs);
      if (tRes.success) setTemplates(tRes.templates);
      if (iRes && iRes.success) setInquiries(iRes.inquiries);
      if (oRes && oRes.success) setOrders(oRes.orders);
      if (rRes && rRes.success) setReviews(rRes.reviews);
      if (prRes && prRes.success) setPromotions(prRes.promotions);
      if (rRes && rRes.success) setReviews(rRes.reviews);
      if (rRes && rRes.success) setReviews(rRes.reviews);
      if (prRes && prRes.success) setPromotions(prRes.promotions);
      
      if (managingCourse) {
        const detailsRes = await api.getCourseDetails(managingCourse.slug);
        if (detailsRes.success) {
          setManagingCourse(detailsRes.course);
          
          if (managingLesson) {
            for (const mod of detailsRes.course.modules || []) {
              const foundLesson = mod.lessons?.find(l => l.id === managingLesson.id);
              if (foundLesson) {
                setManagingLesson(foundLesson);
                break;
              }
            }
          }

          if (assessmentBuilderLesson) {
            for (const mod of detailsRes.course.modules || []) {
              const foundLesson = mod.lessons?.find(l => l.id === assessmentBuilderLesson.id);
              if (foundLesson) {
                setAssessmentBuilderLesson(foundLesson);
                break;
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setIsUpdatingOrder(orderId);
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        alert(res.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating the order status.');
    } finally {
      setIsUpdatingOrder(null);
    }
  };

  const [adminReplyInput, setAdminReplyInput] = useState('');

  const handleProcessRefundRequest = async (orderId, action) => {
    setIsUpdatingOrder(orderId);
    try {
      const res = await api.processRefundRequest(orderId, action, adminReplyInput);
      if (res.success && res.order) {
        setOrders(orders.map(o => o.id === orderId ? res.order : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(res.order);
        }
        showToast(res.message || `Refund request ${action === 'approve' ? 'approved' : 'rejected'}`);
      } else {
        alert(res.error || 'Failed to process refund request');
      }
    } catch (err) {
      console.error(err);
      alert('Error processing refund request.');
    } finally {
      setIsUpdatingOrder(null);
    }
  };

  const handleRefundOrder = (orderId) => {
    confirmAction(
      "Refund Order",
      "Are you sure you want to process a refund? This action will refund the payment and revoke access.",
      async () => {
        setIsUpdatingOrder(orderId);
        try {
          const res = await api.refundOrder(orderId, adminReplyInput);
          if (res.success) {
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'refunded', admin_reply: adminReplyInput || o.admin_reply } : o));
            if (selectedOrder && selectedOrder.id === orderId) {
              setSelectedOrder({ ...selectedOrder, status: 'refunded', admin_reply: adminReplyInput || selectedOrder.admin_reply });
            }
            showToast('Order refunded successfully');
          } else {
            alert(res.error || 'Failed to refund order');
          }
        } catch (err) {
          console.error(err);
          alert('Failed to process refund.');
        } finally {
          setIsUpdatingOrder(null);
        }
      }
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      const courseData = {
        title: newCourseTitle,
        price: parseFloat(newCoursePrice),
        tier: newCourseTier,
        headline: newCourseHeadline,
        description: newCourseDescription,
        cover_image: newCourseCover
      };

      let res;
      if (editingCourseId) {
        res = await api.updateCourse(editingCourseId, courseData);
      } else {
        res = await api.createCourse(courseData);
      }

      if (res.success) {
        setNewCourseTitle('');
        setNewCourseHeadline('');
        setNewCourseDescription('');
        setNewCourseCover('');
        setShowCourseForm(false);
        setEditingCourseId(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openCourseForEditing = (course) => {
    setEditingCourseId(course.id);
    setNewCourseTitle(course.title || '');
    setNewCourseHeadline(course.headline || '');
    setNewCourseDescription(course.description || '');
    setNewCoursePrice(course.price ? course.price.toString() : '199');
    setNewCourseTier(course.tier || 'Executive Tier');
    setNewCourseCover(course.cover_image || '');
    setShowCourseForm(true);
  };

  const handleToggleCourseForm = () => {
    if (!showCourseForm) {
      setEditingCourseId(null);
      setNewCourseTitle('');
      setNewCourseHeadline('');
      setNewCourseDescription('');
      setNewCoursePrice('199');
      setNewCourseTier('Executive Tier');
      setNewCourseCover('');
    }
    setShowCourseForm(!showCourseForm);
  };

  const handleOpenUserDetails = async (userId) => {
    setSelectedUserForDetails(userId);
    setUserDetailsLoading(true);
    setUserDetails(null);
    try {
      const res = await api.getUserAdminDetails(userId);
      if (res.success) {
        setUserDetails(res);
      } else {
        alert('Failed to load user details.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching user details.');
    } finally {
      setUserDetailsLoading(false);
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

  const handleDeleteQuestion = (id) => {
    confirmAction("Delete Question", "Are you sure you want to delete this question?", async () => {
      try {
        const res = await api.deleteQuestion(id);
        if (res.success) {
          showToast('Question deleted successfully');
          fetchData();
        }
      } catch (err) {
        console.error(err);
        alert('Error deleting question');
      }
    });
  };

  const handleSavePackPrice = async (packId, newPrice) => {
    const updatedPacks = packs.map(p => p.id === packId ? { ...p, price: Number(newPrice) } : p);
    setPacks(updatedPacks);
    try {
      const res = await api.updatePacks(updatedPacks);
      if (!res.success) {
        alert('Failed to update pack price');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating pack price');
    }
  };

  const handleDeleteUser = (id) => {
    confirmAction("Delete User", "Are you sure you want to completely delete this user? This cannot be undone.", async () => {
      try {
        const res = await api.deleteUser(id);
        if (res.success) {
          showToast('User deleted successfully');
          fetchData(); // This will refresh users from metrics
        }
      } catch (err) {
        console.error(err);
        alert('Error deleting user');
      }
    });
  };

  const handleResetPassword = (email) => {
    confirmAction("Reset Password", `Send a password reset email to ${email}?`, async () => {
      try {
        const res = await api.adminResetPassword(email);
        if (res.success) {
          showToast(`Password reset link sent to ${email}`);
        } else {
          alert('Failed to send reset link');
        }
      } catch (err) {
        console.error(err);
        alert('Error sending reset link');
      }
    }, "Send Link", "primary");
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

  const handleDeleteTemplate = (id) => {
    confirmAction("Delete Template", "Are you sure you want to delete this template?", async () => {
      try {
        const res = await api.deleteTemplate(id);
        if (res.success) {
          showToast('Template deleted successfully');
          fetchData();
        }
      } catch (err) {
        console.error(err);
        alert('Error deleting template');
      }
    });
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle || !managingCourse) return;
    try {
      const res = await api.addModuleToCourse(managingCourse.id, newModuleTitle);
      if (res.success) {
        showToast('Module added successfully.');
        setNewModuleTitle('');
        setShowModuleForm(false);
        const updatedCourse = await api.getCourseDetails(managingCourse.slug);
        if (updatedCourse.success) setManagingCourse(updatedCourse.course);
      } else {
        alert(res.error || 'Failed to add module');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding module');
    }
  };

  const handleUpdateModule = async (moduleId, title) => {
    if (!title || !managingCourse || !moduleId) return;
    try {
      const res = await api.updateModule(managingCourse.id, moduleId, title);
      if (res.success) {
        showToast('Module title updated successfully.');
        const updatedCourse = await api.getCourseDetails(managingCourse.slug);
        if (updatedCourse.success) setManagingCourse(updatedCourse.course);
      } else {
        alert(res.error || 'Failed to update module');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating module');
    }
  };

  const handleDeleteModule = (moduleId) => {
    confirmAction("Delete Module", "Are you sure you want to delete this module? All lessons inside will be permanently deleted.", async () => {
      try {
        const res = await api.deleteModule(managingCourse.id, moduleId);
        if (res.success) {
          showToast('Module deleted successfully.');
          if (activeModuleIdForLesson === moduleId) setActiveModuleIdForLesson(null);
          const updatedCourse = await api.getCourseDetails(managingCourse.slug);
          if (updatedCourse.success) setManagingCourse(updatedCourse.course);
        } else {
          alert(res.error || 'Failed to delete module');
        }
      } catch (err) {
        console.error(err);
        alert('Error deleting module');
      }
    });
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
        audio_url: newLessonAudioUrl,
        content: newLessonContent,
        is_free_preview: newLessonFree,
        is_final_assessment: newLessonFinal
      });
      if (res.success) {
        setNewLessonTitle('');
        setNewLessonUrl('');
        setNewLessonAudioUrl('');
        setNewLessonContent('');
        setNewLessonType('video');
        setNewLessonFinal(false);
        setActiveModuleIdForLesson(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    if (!managingCourse || !managingLesson) return;
    try {
      const res = await api.updateLesson(managingCourse.id, managingLesson.module_id, managingLesson.id, {
        title: newLessonTitle,
        type: newLessonType,
        duration_minutes: newLessonDuration,
        video_url: newLessonUrl,
        audio_url: newLessonAudioUrl,
        content: newLessonContent,
        is_free_preview: newLessonFree,
        is_final_assessment: newLessonFinal
      });
      if (res.success) {
        setManagingLesson(res.lesson);
        setEditingLesson(false);
        fetchData();
        const detailsRes = await api.getCourseDetails(managingCourse.slug);
        if (detailsRes.success) setManagingCourse(detailsRes.course);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleReplyToInquiry = async () => {
    if (!inquiryReplyText.trim() || !selectedInquiry) return;
    setIsReplying(true);
    setReplyFeedback(null);
    try {
      const res = await api.replyToInquiry(selectedInquiry.id, inquiryReplyText);
      if (res.success) {
        setReplyFeedback({ type: 'success', message: 'Reply sent successfully!' });
        setInquiries(inquiries.map(i => i.id === selectedInquiry.id ? { ...i, status: 'replied' } : i));
        setInquiryReplyText('');
      } else {
        setReplyFeedback({ type: 'error', message: res.error || 'Failed to send reply' });
      }
    } catch (err) {
      console.error(err);
      setReplyFeedback({ type: 'error', message: 'Error sending reply. Please try again.' });
    } finally {
      setIsReplying(false);
    }
  };

  const handleInquiryStatusChange = async (e, id) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    try {
      const res = await api.updateInquiryStatus(id, newStatus);
      if (res.success) {
        setInquiries(inquiries.map(i => i.id === id ? { ...i, status: newStatus } : i));
      } else {
        alert(res.error || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  const handleDeleteReview = (id) => {
    confirmAction("Delete Review", "Are you sure you want to delete this review?", async () => {
      try {
        const data = await api.deleteAdminReview(id);
        if (data.success) {
          showToast('Review deleted successfully');
          fetchData();
        } else {
          alert(data.error || 'Failed to delete review');
        }
      } catch (err) {
        console.error(err);
        alert('Error deleting review');
      }
    });
  };

  const handleToggleFeaturedReview = async (id, currentStatus) => {
    try {
      const res = await api.toggleFeaturedReview(id, !currentStatus);
      if (res.success) {
        setReviews(reviews.map(r => r.id === id ? { ...r, is_featured: !currentStatus } : r));
      } else {
        alert(res.error || 'Failed to update review status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating review status');
    }
  };

  const handleCreatePromotion = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createPromotion({ 
        message: newPromotionMessage, 
        is_active: true,
        promo_code: newPromoCode,
        discount_percentage: newPromoDiscount,
        start_date: newPromoStart ? new Date(newPromoStart).toISOString() : '',
        end_date: newPromoEnd ? new Date(newPromoEnd).toISOString() : '',
        show_banner: newPromoShowBanner,
        max_redemptions: newPromoLimit
      });
      if (res.success) {
        // If this one is set to show banner, deactivate banner on all others in state
        let updatedPromos = promotions;
        if (newPromoShowBanner) {
          updatedPromos = promotions.map(p => ({ ...p, show_banner: false }));
        }
        setPromotions([res.promotion, ...updatedPromos]);
        
        setNewPromotionMessage('');
        setNewPromoCode('');
        setNewPromoDiscount('');
        setNewPromoStart('');
        setNewPromoEnd('');
        setNewPromoLimit('');
        setNewPromoShowBanner(true);
        showToast('Promotion created successfully!', 'success');
      } else {
        showToast(res.error || 'Failed to create promotion', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error creating promotion', 'error');
    }
  };

  const handleUpdatePromotion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        message: editPromotion.message,
        start_date: editPromotion.start_date ? new Date(editPromotion.start_date).toISOString() : '',
        end_date: editPromotion.end_date ? new Date(editPromotion.end_date).toISOString() : '',
        max_redemptions: editPromotion.max_redemptions
      };
      const res = await api.updatePromotion(editPromotion.id, payload);
      if (res.success) {
        setPromotions(promotions.map(p => p.id === editPromotion.id ? { ...p, ...res.promotion } : p));
        setEditPromotion(null);
        showToast('Promotion updated successfully!', 'success');
      } else {
        showToast(res.error || 'Failed to update promotion', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating promotion', 'error');
    }
  };

  const handleToggleBannerVisibility = async (id, currentStatus) => {
    try {
      const res = await api.toggleBannerVisibility(id, !currentStatus);
      if (res.success) {
        setPromotions(promotions.map(p => {
          if (p.id === id) return { ...p, show_banner: !currentStatus };
          if (!currentStatus) return { ...p, show_banner: false }; // deactivate others if this one was turned on
          return p;
        }));
        showToast('Banner visibility updated', 'success');
      } else {
        showToast(res.error || 'Failed to update banner visibility', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating banner visibility', 'error');
    }
  };

  const handleDeletePromotion = async (id) => {
    setPromoDeleteConfig({ isOpen: true, promoId: id });
  };

  const confirmDeletePromotion = async () => {
    const id = promoDeleteConfig.promoId;
    setPromoDeleteConfig({ isOpen: false, promoId: null });
    
    try {
      const res = await api.deletePromotion(id);
      if (res.success) {
        setPromotions(promotions.filter(p => p.id !== id));
        showToast('Promotion deleted successfully', 'success');
      } else {
        showToast('Failed to delete promotion', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting promotion', 'error');
    }
  };

  const handleTogglePromotionStatus = async (id, currentStatus) => {
    try {
      const res = await api.togglePromotionStatus(id, !currentStatus);
      if (res.success) {
        setPromotions(promotions.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
      }
    } catch (err) {
      console.error(err);
    }
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
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col md:flex-row font-sans relative">

      {/* Background Refreshing Overlay */}
      {isRefreshing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px] transition-all pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-slate-200 flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 font-bold text-[10px] tracking-widest uppercase">Syncing</p>
          </div>
        </div>
      )}


      {/* Inquiry Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 font-display">Inquiry from {selectedInquiry.name}</h3>
                <p className="text-xs text-slate-500">{selectedInquiry.email} • {selectedInquiry.company || 'No Company'}</p>
              </div>
              <button onClick={() => { setSelectedInquiry(null); setInquiryReplyText(''); setReplyFeedback(null); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 text-sm text-slate-700 whitespace-pre-wrap">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Original Message:</span>
                {selectedInquiry.message}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Your Reply (Sent via Email)</label>
                <textarea
                  rows={5}
                  value={inquiryReplyText}
                  onChange={(e) => setInquiryReplyText(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                  disabled={selectedInquiry.status === 'replied'}
                />
                {selectedInquiry.status === 'replied' && !replyFeedback && (
                  <p className="text-emerald-600 text-xs font-bold mt-2">✓ You have already replied to this inquiry.</p>
                )}
                {replyFeedback && (
                  <p className={`text-xs font-bold mt-2 ${replyFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {replyFeedback.type === 'success' ? '✓ ' : '⚠ '}{replyFeedback.message}
                  </p>
                )}
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => { setSelectedInquiry(null); setInquiryReplyText(''); setReplyFeedback(null); }}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={handleReplyToInquiry}
                disabled={isReplying || !inquiryReplyText.trim() || selectedInquiry.status === 'replied'}
                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {isReplying ? 'Sending...' : 'Send Reply Email'}
                {!isReplying && <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Details Modal */}
      {selectedUserForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 font-display">User Profile</h3>
                <p className="text-xs text-slate-500">View details, enrollments, and activity</p>
              </div>
              <button onClick={() => setSelectedUserForDetails(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {userDetailsLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Loading Profile...</p>
                </div>
              ) : userDetails ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-2xl">
                      {userDetails.user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">{userDetails.user?.full_name || 'Unknown User'}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-slate-500">{userDetails.user?.email}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${userDetails.user?.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {userDetails.user?.role || 'student'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Joined {new Date(userDetails.user?.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Enrollments */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200">
                      <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Enrolled Courses
                      </h5>
                      {userDetails.entitlements.length === 0 ? (
                        <p className="text-sm text-slate-400">No active enrollments.</p>
                      ) : (
                        <ul className="space-y-2">
                          {userDetails.entitlements.map(ent => (
                            <li key={ent.id} className="text-sm font-medium text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                              {(() => {
                                const course = courses.find(c => c.id === ent.product_id);
                                return course ? course.title : ent.product_id;
                              })()}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Stats & Progress */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200">
                      <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Activity Stats
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="text-sm text-slate-500">Lessons Completed</span>
                          <span className="font-bold text-slate-900">{userDetails.progress.length}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="text-sm text-slate-500">Total Orders</span>
                          <span className="font-bold text-slate-900">{userDetails.orders.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Total Spent</span>
                          <span className="font-bold text-slate-900">
                            ${userDetails.orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + Number(o.amount || 0), 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">Failed to load details.</div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
              <button
                onClick={() => setSelectedUserForDetails(null)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <EffectiveVeritusLogo subtitle={true} variant="light" />
        <button
          onClick={() => setMobileNavOpen(true)}
          className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar Navigation - Dark Theme for Admin Feel */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col z-50 transition-transform duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 md:h-screen text-slate-300 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <EffectiveVeritusLogo subtitle={true} variant="light" />
          <button className="md:hidden p-1 bg-slate-100 rounded text-slate-500" onClick={() => setMobileNavOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          <button
            onClick={() => { changeAdminTab('overview'); setMobileNavOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <BarChart3 className="w-4 h-4" /> Platform Dashboard
          </button>

          <button
            onClick={() => { changeAdminTab('courses'); setMobileNavOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'courses' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <PlayCircle className="w-4 h-4" /> Course Management
          </button>

          <button
            onClick={() => { changeAdminTab('questions'); setMobileNavOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'questions' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Layers className="w-4 h-4" /> Questions Taxonomy
          </button>

          <button
            onClick={() => { changeAdminTab('templates'); setMobileNavOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'templates' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <FileText className="w-4 h-4" /> Digital Templates
          </button>

          <button
            onClick={() => { changeAdminTab('users'); setMobileNavOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Users className="w-4 h-4" /> User Management
          </button>

          <button
            onClick={() => { changeAdminTab('inquiries'); setMobileNavOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'inquiries' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Mail className="w-4 h-4" /> Contact Inquiries
          </button>

          <button
            onClick={() => { changeAdminTab('orders'); setMobileNavOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <TrendingUp className="w-4 h-4" /> Orders
          </button>

          <button
            onClick={() => { changeAdminTab('reviews'); setMobileNavOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'reviews' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Star className="w-4 h-4" /> Reviews
          </button>

          <button
            onClick={() => { changeAdminTab('promotions'); setMobileNavOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'promotions' ? 'bg-indigo-600 text-white shadow-md border border-indigo-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Megaphone className="w-4 h-4" /> Promotions
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
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto overflow-x-hidden">

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
                <button onClick={() => changeAdminTab('users')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Manage Users &rarr;</button>
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
                      <tr
                        key={u.id}
                        onClick={() => handleOpenUserDetails(u.id)}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      >
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
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${u.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingUser(u);
                                setEditUserName(u.full_name || '');
                                setEditUserEmail(u.email || '');
                                setEditUserPassword('');
                                setEditUserRole(u.role || 'student');
                                setEditUserError('');
                                setEditUserSuccessMsg('');
                                setEditUserModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded font-bold text-[10px] flex items-center gap-1 transition-colors border border-indigo-200/60 shadow-xs"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleResetPassword(u.email); }}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded text-slate-600 hover:text-indigo-600 font-bold text-[10px] flex items-center gap-1 shadow-sm"
                            >
                              <KeyRound className="w-3 h-3" /> Reset Pwd
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id); }}
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

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-display text-xl font-bold text-slate-900">Orders & Revenue</h1>
                <p className="text-slate-500 text-xs mt-1">Review all purchases and transactions.</p>
              </div>

              <button
                onClick={() => {
                  if (!orders || orders.length === 0) {
                    alert('No orders available to export.');
                    return;
                  }
                  const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Product Title', 'Coupon Code', 'Original Price', 'Discount Deducted', 'Amount Paid', 'Status', 'Date'];
                  const rows = orders.map(o => [
                    `"${o.id}"`,
                    `"${o.profiles?.full_name || o.card_holder_name || 'N/A'}"`,
                    `"${o.user_email || o.profiles?.email || 'N/A'}"`,
                    `"${o.product_title || 'N/A'}"`,
                    `"${o.coupon_code || 'None'}"`,
                    `"${o.original_amount || o.amount}"`,
                    `"${o.discount_amount || 0}"`,
                    `"${o.amount}"`,
                    `"${o.status}"`,
                    `"${new Date(o.created_at).toLocaleString()}"`
                  ]);
                  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', `Veritus_Orders_Export_${new Date().toISOString().slice(0, 10)}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export Orders CSV
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">Item</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">Coupon</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-right">Amount</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-slate-400">No orders found.</td>
                      </tr>
                    ) : (
                      orders.map(order => (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500">{order.id.slice(0, 8)}...</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{order.user_email || 'Guest'}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {order.product_title || order.product_id}
                          </td>
                          <td className="px-4 py-3">
                            {order.coupon_code ? (
                              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[10px] uppercase">
                                {order.coupon_code}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900 text-right">
                            {order.currency?.toUpperCase()} {order.amount?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                order.status === 'refunded' ? 'bg-rose-100 text-rose-700' :
                                  order.status === 'cancelled' ? 'bg-slate-200 text-slate-700' :
                                    'bg-amber-100 text-amber-700'
                              }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- INQUIRIES TAB --- */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">

            <div className="flex justify-between items-end">
              <div>
                <h1 className="font-display text-xl font-bold text-slate-900">Contact Inquiries</h1>
                <p className="text-slate-500 text-xs mt-1">Review messages sent via the contact form.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-4">Name</th>
                      <th className="px-5 py-4">Email Address</th>
                      <th className="px-5 py-4">Company</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inquiries.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-5 py-8 text-center text-slate-500">No inquiries found.</td>
                      </tr>
                    ) : (
                      inquiries.map((inq) => (
                        <tr
                          key={inq.id}
                          onClick={() => setSelectedInquiry(inq)}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        >
                          <td className="px-5 py-3 font-bold text-slate-800">{inq.name}</td>
                          <td className="px-5 py-3 text-slate-500">{inq.email}</td>
                          <td className="px-5 py-3 text-slate-500">{inq.company || '-'}</td>
                          <td className="px-5 py-3">
                            <select
                              value={inq.status || 'pending'}
                              onChange={(e) => handleInquiryStatusChange(e, inq.id)}
                              onClick={(e) => e.stopPropagation()}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border-none outline-none cursor-pointer appearance-none ${inq.status === 'replied'
                                  ? 'bg-emerald-100 text-emerald-700 focus:ring-2 focus:ring-emerald-500/50'
                                  : 'bg-amber-100 text-amber-700 focus:ring-2 focus:ring-amber-500/50'
                                }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="replied">Replied</option>
                            </select>
                          </td>
                          <td className="px-5 py-3 text-slate-400">
                            {new Date(inq.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      ))
                    )}
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
                    onClick={handleToggleCourseForm}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wide transition-all shadow-sm"
                  >
                    {!showCourseForm && <Plus className="w-3.5 h-3.5" />} {showCourseForm ? 'Cancel' : 'New Masterclass'}
                  </button>
                </div>

                {/* Create/Edit Course Form */}
                {showCourseForm && (
                  <div className="bg-white rounded-xl p-8 border border-indigo-100 shadow-md relative overflow-hidden animate-in zoom-in-95 duration-200 mb-6">
                    <h3 className="font-bold text-base text-slate-900 mb-6 border-b border-slate-100 pb-2">
                      {editingCourseId ? 'Edit Masterclass Configuration' : 'New Masterclass Configuration'}
                    </h3>
                    <form onSubmit={handleSaveCourse} className="space-y-6">
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
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                          <textarea
                            required value={newCourseDescription} onChange={e => setNewCourseDescription(e.target.value)}
                            rows={3}
                            placeholder="Detailed description of the masterclass..."
                            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium outline-none transition-all shadow-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                            <span>Cover Image (URL or Upload)</span>
                            {isUploadingCourseCover && <span className="text-indigo-600 animate-pulse">Uploading...</span>}
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text" value={newCourseCover} onChange={e => setNewCourseCover(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium outline-none transition-all shadow-sm"
                            />
                            <label className="cursor-pointer justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 flex items-center shrink-0">
                              Upload Image
                              <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, setNewCourseCover, setIsUploadingCourseCover)} disabled={isUploadingCourseCover} />
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button type="button" onClick={() => { setShowCourseForm(false); setEditingCourseId(null); }} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold text-[11px] uppercase tracking-wide hover:bg-slate-100 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wide transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                          {editingCourseId ? 'Save Updates' : 'Publish Configuration'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Courses List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map(course => (
                    <div
                      key={course.id}
                      onClick={async () => {
                        const res = await api.getCourseDetails(course.slug);
                        if (res.success) setManagingCourse(res.course);
                      }}
                      className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-xs group h-full cursor-pointer"
                    >
                      <div>
                        <div className="relative overflow-hidden">
                          <img
                            src={course.cover_image || course.thumbnail_url || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800'}
                            alt={course.title}
                            className="w-full h-32 object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur text-blue-900 text-[10px] font-bold border border-blue-200 shadow-xs">
                            {course.tier}
                          </div>
                        </div>
                        <div className="p-3 space-y-2">
                          <h3 className="font-display text-base font-bold text-slate-900 leading-tight">{course.title}</h3>
                          <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">{course.headline}</p>
                        </div>
                      </div>
                      <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between mt-auto">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <Layers className="w-3 h-3" /> {course.module_count || 0} Modules
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openCourseForEditing(course);
                            }}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-indigo-600 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const res = await api.getCourseDetails(course.slug);
                              if (res.success) setManagingCourse(res.course);
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                          >
                            Manage <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : managingLesson ? (
              // Managing Lesson Detailed View
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 w-full">
                <button
                  onClick={() => { setManagingLesson(null); setEditingLesson(false); }}
                  className="mb-4 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to {managingCourse.title}
                </button>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h1 className="font-display text-xl font-bold text-slate-900">{managingLesson.title}</h1>
                    <p className="text-slate-500 text-xs mt-1">Preview and edit lesson details.</p>
                  </div>
                  <div className="flex gap-2">
                    {managingLesson.type === 'assessment' && (
                      <button
                        onClick={() => setAssessmentBuilderLesson(managingLesson)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] uppercase tracking-wide transition-all shadow-sm"
                      >
                        <Settings className="w-3.5 h-3.5" /> Manage Questions
                      </button>
                    )}
                    <button
                    onClick={() => {
                      if (!editingLesson) {
                        setNewLessonTitle(managingLesson.title);
                        setNewLessonType(managingLesson.type || 'video');
                        setNewLessonUrl(managingLesson.video_url || '');
                        setNewLessonAudioUrl(managingLesson.audio_url || '');
                        setNewLessonContent(managingLesson.content || '');
                        setNewLessonDuration(managingLesson.duration_minutes || 10);
                        setNewLessonFree(managingLesson.is_free_preview || false);
                        setNewLessonFinal(managingLesson.is_final_assessment || false);
                      }
                      setEditingLesson(!editingLesson);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wide transition-all shadow-sm"
                  >
                    {editingLesson ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />} 
                    {editingLesson ? 'Cancel Edit' : 'Edit Lesson'}
                  </button>
                </div>
              </div>

              {editingLesson ? (
                  <div className="bg-white rounded-xl p-6 border border-indigo-100 shadow-sm mb-6">
                    <form onSubmit={handleUpdateLesson} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            {newLessonType === 'assessment' ? 'Assessment Name' : newLessonType === 'reading' ? 'Document Title' : 'Lesson Title'}
                          </label>
                          <input type="text" required value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)} className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-200 text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Duration (min)</label>
                          <input type="number" required value={newLessonDuration} onChange={e => setNewLessonDuration(e.target.value)} className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-200 text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Lesson Type</label>
                          <select value={newLessonType} onChange={e => setNewLessonType(e.target.value)} className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-200 text-xs">
                            <option value="reading">Reading</option>
                            <option value="video">Lecture Video</option>
                            <option value="assessment">Assessment</option>
                          </select>
                        </div>
                      </div>
                      
                      {newLessonType === 'video' && (
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                            <span>Video URL (or embed)</span>
                            {isUploadingVideo && <span className="text-indigo-600 animate-pulse">Uploading...</span>}
                          </label>
                          <div className="flex gap-2">
                            <input type="text" value={newLessonUrl} onChange={e => setNewLessonUrl(e.target.value)} className="flex-1 px-2.5 py-1.5 rounded bg-white border border-slate-200 text-xs" placeholder="https://..." />
                            <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-bold text-slate-600 flex items-center shrink-0">
                              Upload Video
                              <input type="file" className="hidden" accept="video/*" onChange={e => handleFileUpload(e, setNewLessonUrl, setIsUploadingVideo)} disabled={isUploadingVideo} />
                            </label>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                          <span>Audio / Voice URL (Optional)</span>
                          {isUploadingAudio && <span className="text-indigo-600 animate-pulse">Uploading...</span>}
                        </label>
                        <div className="flex gap-2">
                          <input type="text" value={newLessonAudioUrl} onChange={e => setNewLessonAudioUrl(e.target.value)} className="flex-1 px-2.5 py-1.5 rounded bg-white border border-slate-200 text-xs" placeholder="https://..." />
                          <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-bold text-slate-600 flex items-center shrink-0">
                            Upload Audio
                            <input type="file" className="hidden" accept="audio/*" onChange={e => handleFileUpload(e, setNewLessonAudioUrl, setIsUploadingAudio)} disabled={isUploadingAudio} />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                          {newLessonType === 'assessment' ? 'Assessment Instructions' : newLessonType === 'reading' ? 'Reading Content' : 'Lesson Content (Text)'}
                        </label>
                        <ReactQuill theme="snow" value={newLessonContent} onChange={setNewLessonContent} className="bg-white rounded" placeholder={newLessonType === 'assessment' ? 'Write instructions here...' : 'Write content here...'} />
                      </div>

                      <div className="flex items-center gap-4 pb-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="edit-free-preview" checked={newLessonFree} onChange={e => setNewLessonFree(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                          <label htmlFor="edit-free-preview" className="text-[10px] font-bold text-slate-600">Available as Free Preview</label>
                        </div>
                        {newLessonType === 'assessment' && (
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="edit-final-assessment" checked={newLessonFinal} onChange={e => setNewLessonFinal(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                            <label htmlFor="edit-final-assessment" className="text-[10px] font-bold text-slate-600">Is Final Assessment (Mandatory for Course Completion)</label>
                          </div>
                        )}
                      </div>
                      <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700">Update Lesson</button>
                    </form>
                  </div>
                ) : (
                  <>
                    {managingLesson.type === 'assessment' ? (
                      <div className="space-y-6 mt-6 w-full">
                        {managingLesson.content && (
                          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-slate-200 text-sm text-slate-700 leading-relaxed font-medium prose prose-slate max-w-none shadow-sm" dangerouslySetInnerHTML={{ __html: managingLesson.content }} />
                        )}
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
                          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 text-blue-600">
                            <CheckCircle2 className="w-8 h-8" />
                          </div>
                          <h2 className="font-display text-xl font-bold text-slate-900 mb-2">Assessment Knowledge Check</h2>
                          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                            This is how learners will view the assessment. Use the "Manage Questions" button above to add interactive questions.
                          </p>
                          <div className="text-left">
                            <AssessmentPreview lessonId={managingLesson.id} />
                          </div>
                        </div>
                      </div>
                    ) : managingLesson.type === 'reading' ? (
                      <div className="mt-6 w-full">
                        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-slate-200 shadow-sm">
                          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-display text-lg font-bold text-slate-900">Reading Material</h3>
                              <p className="text-xs text-slate-500">Document or text-based lesson</p>
                            </div>
                          </div>
                          {managingLesson.content ? (
                            <div className="text-sm text-slate-700 leading-relaxed font-medium prose prose-slate max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: managingLesson.content }} />
                          ) : (
                            <div className="text-center py-8 text-slate-400 text-sm italic">
                              No reading content provided for this lesson.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-800 p-4 w-full">
                        {managingLesson.video_url ? (
                          <div className="w-full">
                            <VideoPlayer videoUrl={managingLesson.video_url} title={managingLesson.title} />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                            <Video className="w-12 h-12 mb-4 opacity-50" />
                            <p>No video URL provided for this lesson.</p>
                          </div>
                        )}
                        {managingLesson.content && (
                          <div className="mt-6 bg-slate-800/50 p-6 rounded-xl border border-slate-700 w-full">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Lesson Notes</h4>
                            <div className="text-slate-300 text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: managingLesson.content }} />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              // Managing Course Detailed View
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <button
                  onClick={() => { setManagingCourse(null); }}
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
                      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center group">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900">Module {idx + 1}: {mod.title}</h3>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setModuleToEdit(mod);
                                setModuleEditModalOpen(true);
                              }}
                              className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Manage Module"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => setActiveModuleIdForLesson(activeModuleIdForLesson === mod.id ? null : mod.id)}
                            className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 uppercase tracking-wide shrink-0"
                          >
                            <Plus className="w-3 h-3" /> Add Lesson
                          </button>
                      </div>

                      {activeModuleIdForLesson === mod.id && (
                        <div className="p-5 border-b border-slate-100 bg-indigo-50/30">
                          <form onSubmit={handleCreateLesson} className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                    {newLessonType === 'assessment' ? 'Assessment Name' : newLessonType === 'reading' ? 'Document Title' : 'Lesson Title'}
                                  </label>
                                  <input type="text" required value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)} className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-200 text-xs" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Duration (min)</label>
                                  <input type="number" required value={newLessonDuration} onChange={e => setNewLessonDuration(e.target.value)} className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-200 text-xs" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Lesson Type</label>
                                  <select value={newLessonType} onChange={e => setNewLessonType(e.target.value)} className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-200 text-xs">
                                    <option value="reading">Reading</option>
                                    <option value="video">Lecture Video</option>
                                    <option value="assessment">Assessment</option>
                                  </select>
                                </div>
                              </div>
                              
                              {newLessonType === 'video' && (
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                                    <span>Video URL (or embed)</span>
                                    {isUploadingVideo && <span className="text-indigo-600 animate-pulse">Uploading...</span>}
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" value={newLessonUrl} onChange={e => setNewLessonUrl(e.target.value)} className="flex-1 px-2.5 py-1.5 rounded bg-white border border-slate-200 text-xs" placeholder="https://..." />
                                    <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-bold text-slate-600 flex items-center shrink-0">
                                      Upload Video
                                      <input type="file" className="hidden" accept="video/*" onChange={e => handleFileUpload(e, setNewLessonUrl, setIsUploadingVideo)} disabled={isUploadingVideo} />
                                    </label>
                                  </div>
                                </div>
                              )}
                              
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                                  <span>Audio / Voice URL (Optional)</span>
                                  {isUploadingAudio && <span className="text-indigo-600 animate-pulse">Uploading...</span>}
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" value={newLessonAudioUrl} onChange={e => setNewLessonAudioUrl(e.target.value)} className="flex-1 px-2.5 py-1.5 rounded bg-white border border-slate-200 text-xs" placeholder="https://..." />
                                  <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[10px] font-bold text-slate-600 flex items-center shrink-0">
                                    Upload Audio
                                    <input type="file" className="hidden" accept="audio/*" onChange={e => handleFileUpload(e, setNewLessonAudioUrl, setIsUploadingAudio)} disabled={isUploadingAudio} />
                                  </label>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                                  {newLessonType === 'assessment' ? 'Assessment Instructions' : newLessonType === 'reading' ? 'Reading Content' : 'Lesson Content (Text)'}
                                </label>
                                <ReactQuill theme="snow" value={newLessonContent} onChange={setNewLessonContent} className="bg-white rounded" placeholder={newLessonType === 'assessment' ? 'Write instructions here...' : 'Write content here...'} />
                              </div>

                              <div className="flex items-center gap-4 pb-2">
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" id={`free-${mod.id}`} checked={newLessonFree} onChange={e => setNewLessonFree(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                                  <label htmlFor={`free-${mod.id}`} className="text-[10px] font-bold text-slate-600">Available as Free Preview</label>
                                </div>
                                {newLessonType === 'assessment' && (
                                  <div className="flex items-center gap-2">
                                    <input type="checkbox" id={`final-${mod.id}`} checked={newLessonFinal} onChange={e => setNewLessonFinal(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                                    <label htmlFor={`final-${mod.id}`} className="text-[10px] font-bold text-slate-600">Is Final Assessment (Mandatory for Course Completion)</label>
                                  </div>
                                )}
                              </div>
                            <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded text-[10px] font-bold shadow-sm">Save Lesson</button>
                          </form>
                        </div>
                      )}

                      <div className="divide-y divide-slate-100">
                        {(mod.lessons || []).map((lesson, lIdx) => (
                          <div key={lesson.id} onClick={() => setManagingLesson(lesson)} className="px-5 py-3 flex justify-between items-center hover:bg-slate-50 group cursor-pointer">
                            <div className="flex items-center gap-3">
                              <button 
                                className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all cursor-pointer shrink-0 shadow-sm"
                                title="Preview Lesson"
                              >
                                <PlayCircle className="w-4 h-4" />
                              </button>
                              <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-900 transition-colors">{lIdx + 1}. {lesson.title}</span>
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
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input type="text" required value={newTemplateFilePath} onChange={e => setNewTemplateFilePath(e.target.value)} placeholder="e.g. https://..." className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs font-medium outline-none transition-all shadow-sm" />
                        <label className="cursor-pointer justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 flex items-center shrink-0">
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
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-4">Template Title</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Access</th>
                      <th className="px-5 py-4">Price</th>
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
                        <td className="px-5 py-4 text-slate-900 font-bold">
                          {t.is_free ? '—' : `$${t.price || 49}`}
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
                      <tr><td colSpan="6" className="px-5 py-8 text-center text-slate-400 italic">No templates available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
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

      {assessmentBuilderLesson && (
        <AssessmentBuilderModal
          lesson={assessmentBuilderLesson}
          onClose={() => setAssessmentBuilderLesson(null)}
        />
      )}

            <AdminQuestionModal
              isOpen={showQuestionForm || !!editingQuestion}
              onClose={() => {
                setShowQuestionForm(false);
                setEditingQuestion(null);
              }}
              question={editingQuestion}
              onSave={handleSaveQuestion}
            />

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-4 p-4 max-w-4xl">
              <h2 className="font-display text-sm font-bold text-slate-900 mb-3">Domain Packs Pricing</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {packs.map(pack => (
                  <div key={pack.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">{pack.title}</div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5 truncate">{pack.id}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-slate-500 font-bold text-xs">$</span>
                      <input
                        type="number"
                        value={pack.price}
                        onChange={(e) => {
                          const updatedPacks = packs.map(p => p.id === pack.id ? { ...p, price: Number(e.target.value) } : p);
                          setPacks(updatedPacks);
                        }}
                        onBlur={(e) => handleSavePackPrice(pack.id, e.target.value)}
                        className="w-14 px-1.5 py-1 text-xs font-bold border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
              <div className="flex-1 overflow-x-auto overflow-y-auto">
                <table className="w-full text-left min-w-[600px]">
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
        {/* --- REVIEWS TAB --- */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="font-display text-xl font-bold text-slate-900">Reviews & Testimonials</h1>
                <p className="text-slate-500 text-xs mt-1">Manage, delete, and feature user reviews on the landing page.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4 font-bold">User</th>
                      <th className="p-4 font-bold">Product</th>
                      <th className="p-4 font-bold">Rating</th>
                      <th className="p-4 font-bold">Comment</th>
                      <th className="p-4 font-bold text-center">Featured</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {reviews.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-500 text-xs">No reviews found.</td>
                      </tr>
                    ) : (
                      reviews.map(review => (
                        <tr key={review.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{review.profiles?.full_name || 'Unknown'}</div>
                            <div className="text-[10px] text-slate-400">{new Date(review.created_at).toLocaleDateString()}</div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                              {review.product_type}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center text-emerald-500">
                              {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-emerald-500" />)}
                            </div>
                          </td>
                          <td className="p-4 max-w-xs">
                            <p className="text-xs text-slate-600 truncate" title={review.comment}>
                              {review.comment || <span className="text-slate-400 italic">No comment</span>}
                            </p>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleFeaturedReview(review.id, review.is_featured)}
                              className={`px-3 py-1 text-[10px] font-bold rounded-full transition-colors border ${review.is_featured ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
                            >
                              {review.is_featured ? '★ Featured' : 'Feature'}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Review"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- PROMOTIONS TAB --- */}
        {activeTab === 'promotions' && (
          <div className="space-y-6 max-w-5xl">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">Global Promotions</h2>
              <p className="text-sm text-slate-500 mt-1">Manage site-wide promotional banners and coupons.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
              <h3 className="font-bold text-slate-900 mb-4">Create New Promotion</h3>
              <form onSubmit={handleCreatePromotion} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Banner Message *</label>
                  <input
                    type="text"
                    required
                    value={newPromotionMessage}
                    onChange={e => setNewPromotionMessage(e.target.value)}
                    placeholder="e.g., Get back to achieving your goals. Save up to 20% with code ACTION2026"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Promo Code *</label>
                    <input
                      type="text"
                      required
                      value={newPromoCode}
                      onChange={e => setNewPromoCode(e.target.value)}
                      placeholder="e.g., SUMMER25"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Discount % *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={newPromoDiscount}
                      onChange={e => setNewPromoDiscount(e.target.value)}
                      placeholder="e.g., 25"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Start Date</label>
                    <input
                      type="datetime-local"
                      value={newPromoStart}
                      onChange={e => setNewPromoStart(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">End Date</label>
                    <input
                      type="datetime-local"
                      value={newPromoEnd}
                      onChange={e => setNewPromoEnd(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700">Usage Limit</label>
                    <input
                      type="number"
                      min="1"
                      value={newPromoLimit}
                      onChange={e => setNewPromoLimit(e.target.value)}
                      placeholder="e.g. 15 (blank = unlimited)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2 pb-2 pl-2">
                    <input
                      type="checkbox"
                      id="showBannerCheck"
                      checked={newPromoShowBanner}
                      onChange={e => setNewPromoShowBanner(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="showBannerCheck" className="text-sm font-bold text-slate-700 cursor-pointer">
                      Show Banner
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-2">
                    <Megaphone className="w-4 h-4" /> Publish Banner & Code
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Promotion History</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold w-1/3">Message</th>
                      <th className="p-4 font-bold">Details</th>
                      <th className="p-4 font-bold">Dates</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {promotions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-500 text-sm">No promotions found. Create one above!</td>
                      </tr>
                    ) : (
                      promotions.map(promo => (
                        <tr 
                          key={promo.id} 
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedPromoDetails(promo)}
                        >
                          <td className="p-4">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleTogglePromotionStatus(promo.id, promo.is_active); }}
                                className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest transition-colors w-24 ${promo.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                              >
                                {promo.is_active ? 'Active' : 'Inactive'}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleToggleBannerVisibility(promo.id, promo.show_banner); }}
                                className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest transition-colors w-24 ${promo.show_banner ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                              >
                                {promo.show_banner ? 'Banner ON' : 'Banner OFF'}
                              </button>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-slate-700 font-medium">{promo.message}</p>
                            <div className="text-xs text-slate-400 mt-1">Created: {new Date(promo.created_at).toLocaleDateString()}</div>
                          </td>
                          <td className="p-4">
                            {promo.promo_code ? (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 mb-1">{promo.promo_code}</span>
                                <div className="text-xs font-medium text-slate-600">{promo.discount_percentage}% OFF</div>
                                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">{promo.max_redemptions ? `${promo.max_redemptions} Uses Max` : 'Unlimited'}</div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No code</span>
                            )}
                          </td>
                          <td className="p-4">
                             {(promo.start_date || promo.end_date) ? (
                               <div className="text-xs text-slate-600 space-y-1">
                                 <div><span className="text-slate-400">Starts:</span> {promo.start_date ? new Date(promo.start_date).toLocaleString() : 'Now'}</div>
                                 <div><span className="text-slate-400">Ends:</span> {promo.end_date ? new Date(promo.end_date).toLocaleString() : 'Never'}</div>
                               </div>
                             ) : (
                               <span className="text-xs text-slate-400 italic">Always valid</span>
                             )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  const toDatetimeLocal = (iso) => {
                                    if (!iso) return '';
                                    const d = new Date(iso);
                                    const tzOffset = d.getTimezoneOffset() * 60000;
                                    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
                                  };
                                  setEditPromotion({
                                    ...promo,
                                    start_date: toDatetimeLocal(promo.start_date),
                                    end_date: toDatetimeLocal(promo.end_date)
                                  }); 
                                }}
                                className="p-2 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                title="Edit Promotion"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeletePromotion(promo.id); }}
                                className="p-2 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Promotion"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- ORDER DETAILS MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">Order Details</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Email</span>
                  <span className="font-medium text-slate-900 text-sm">{selectedOrder.user_email || 'Guest'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Order Date</span>
                  <span className="font-medium text-slate-900 text-sm">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Product</span>
                  <span className="font-bold text-indigo-600 text-sm">{selectedOrder.product_title || selectedOrder.product_id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Coupon Applied</span>
                  {selectedOrder.coupon_code ? (
                    <span className="inline-flex px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 font-extrabold text-xs uppercase border border-purple-200">
                      {selectedOrder.coupon_code}
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium text-xs">None</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Original Price</span>
                  <span className="font-bold text-slate-600 text-sm">
                    {selectedOrder.currency?.toUpperCase()} {selectedOrder.original_amount ? Number(selectedOrder.original_amount).toLocaleString() : Number(selectedOrder.amount).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Discount Deducted</span>
                  <span className="font-extrabold text-rose-600 text-sm">
                    -{selectedOrder.currency?.toUpperCase()} {selectedOrder.discount_amount ? Number(selectedOrder.discount_amount).toLocaleString() : '0'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Remaining Paid Amount</span>
                  <span className="font-extrabold text-emerald-700 text-xl">{selectedOrder.currency?.toUpperCase()} {selectedOrder.amount?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
                  <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-widest ${selectedOrder.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      selectedOrder.status === 'refunded' ? 'bg-rose-100 text-rose-700' :
                        selectedOrder.status === 'cancelled' ? 'bg-slate-200 text-slate-700' :
                          'bg-amber-100 text-amber-700'
                    }`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {selectedOrder.refund_reason && (
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 space-y-1">
                  <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">Customer Refund Reason</span>
                  <p className="text-xs text-purple-950 font-medium leading-relaxed italic">"{selectedOrder.refund_reason}"</p>
                  {selectedOrder.refund_requested_at && (
                    <span className="text-[10px] text-purple-700 block pt-1 font-mono">
                      Requested: {new Date(selectedOrder.refund_requested_at).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {selectedOrder.admin_reply && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Saved Admin Reply / Note</span>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{selectedOrder.admin_reply}</p>
                </div>
              )}

              {/* Admin Note Input */}
              {(selectedOrder.status === 'paid' || selectedOrder.status === 'refund_requested') && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Admin Reply / Exception Note (Sent/Visible to User)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter optional note or explanation for the user..."
                    value={adminReplyInput}
                    onChange={(e) => setAdminReplyInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              )}

              {/* Pending Refund Request Decision Actions */}
              {selectedOrder.status === 'refund_requested' && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <h4 className="text-xs font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-purple-700" /> Pending User Refund Request
                    </h4>
                    <p className="text-[11px] text-purple-800 leading-relaxed mb-3">
                      Review the customer's request above. Approving will issue a refund via Stripe and revoke product access. Rejecting will keep the order active and send your reply note to the user.
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleProcessRefundRequest(selectedOrder.id, 'reject')}
                        disabled={isUpdatingOrder === selectedOrder.id}
                        className="flex-1 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Reject Refund Request
                      </button>

                      <button
                        onClick={() => handleProcessRefundRequest(selectedOrder.id, 'approve')}
                        disabled={isUpdatingOrder === selectedOrder.id}
                        className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isUpdatingOrder === selectedOrder.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          'Accept & Process Refund'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Perpetual Admin Manual Actions for Paid Orders */}
              {selectedOrder.status === 'paid' && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <h4 className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Administrative Override Actions</h4>
                    <p className="text-[11px] text-amber-700/80 mb-4 leading-relaxed">
                      Admins can process a manual refund or cancellation for any order at any time (even after the 3-day user window).
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'cancelled')}
                        disabled={isUpdatingOrder === selectedOrder.id}
                        className="flex-1 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Cancel Order (No Refund)
                      </button>

                      <button
                        onClick={() => handleRefundOrder(selectedOrder.id)}
                        disabled={isUpdatingOrder === selectedOrder.id}
                        className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-rose-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isUpdatingOrder === selectedOrder.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <DollarSign className="w-3.5 h-3.5" />
                        )}
                        Process Refund
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modern UI Components */}
      <Toast 
        message={toastConfig.message} 
        type={toastConfig.type} 
        onClose={() => setToastConfig({ ...toastConfig, isOpen: false, message: '' })} 
      />
      <ConfirmModal 
        isOpen={promoDeleteConfig.isOpen}
        title="Delete Promotion"
        message="Are you sure you want to delete this promotion? This action will permanently remove it and disable the associated Stripe promo code if applicable. This action cannot be undone."
        onConfirm={confirmDeletePromotion}
        onCancel={() => setPromoDeleteConfig({ isOpen: false, promoId: null })}
        confirmText="Delete Promotion"
        cancelText="Cancel"
        type="danger"
      />
      <ConfirmModal 
        isOpen={genericConfirm.isOpen}
        title={genericConfirm.title}
        message={genericConfirm.message}
        onConfirm={genericConfirm.onConfirm}
        onCancel={() => setGenericConfirm(prev => ({ ...prev, isOpen: false }))}
        confirmText={genericConfirm.confirmText}
        cancelText="Cancel"
        type={genericConfirm.type}
      />

      {/* Promotion Details Modal */}
      {selectedPromoDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in-fade" onClick={() => setSelectedPromoDetails(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in-zoom">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Promotion Details</h3>
                  <p className="text-xs text-slate-500">ID: {selectedPromoDetails.id.split('-')[0]}...</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPromoDetails(null)}
                className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Banner Message</p>
                <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedPromoDetails.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Promo Code</p>
                  <p className="font-mono font-bold text-indigo-600">{selectedPromoDetails.promo_code || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Discount</p>
                  <p className="font-bold text-emerald-600">{selectedPromoDetails.discount_percentage ? `${selectedPromoDetails.discount_percentage}% OFF` : 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Usage Limit</p>
                  <p className="font-bold text-slate-700">{selectedPromoDetails.max_redemptions ? `${selectedPromoDetails.max_redemptions} Uses Max` : 'Unlimited'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Created At</p>
                  <p className="font-bold text-slate-700 text-sm">{new Date(selectedPromoDetails.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</p>
                  <p className="font-bold text-slate-700 text-sm">{selectedPromoDetails.start_date ? new Date(selectedPromoDetails.start_date).toLocaleString() : 'Immediately'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Due Date (End)</p>
                  <p className="font-bold text-slate-700 text-sm">{selectedPromoDetails.end_date ? new Date(selectedPromoDetails.end_date).toLocaleString() : 'Never expires'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-4 justify-between items-center">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleTogglePromotionStatus(selectedPromoDetails.id, selectedPromoDetails.is_active);
                      setSelectedPromoDetails({...selectedPromoDetails, is_active: !selectedPromoDetails.is_active});
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${selectedPromoDetails.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {selectedPromoDetails.is_active ? 'Stripe Active' : 'Stripe Inactive'}
                  </button>
                  <button
                    onClick={() => {
                      handleToggleBannerVisibility(selectedPromoDetails.id, selectedPromoDetails.show_banner);
                      setSelectedPromoDetails({...selectedPromoDetails, show_banner: !selectedPromoDetails.show_banner});
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${selectedPromoDetails.show_banner ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {selectedPromoDetails.show_banner ? 'Banner is ON' : 'Banner is OFF'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT PROMOTION MODAL --- */}
      {editPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditPromotion(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Edit Promotion</h3>
                  <p className="text-xs text-slate-500">ID: {editPromotion.id.split('-')[0]}...</p>
                </div>
              </div>
              <button 
                onClick={() => setEditPromotion(null)}
                className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdatePromotion} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Banner Message</label>
                <input
                  type="text"
                  required
                  value={editPromotion.message}
                  onChange={e => setEditPromotion({...editPromotion, message: e.target.value})}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="opacity-50 pointer-events-none cursor-not-allowed">
                  <label className="text-xs font-bold text-slate-700">Promo Code (Read-only)</label>
                  <input
                    type="text"
                    readOnly
                    value={editPromotion.promo_code || 'N/A'}
                    className="w-full mt-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                  />
                </div>
                <div className="opacity-50 pointer-events-none cursor-not-allowed">
                  <label className="text-xs font-bold text-slate-700">Discount (Read-only)</label>
                  <input
                    type="text"
                    readOnly
                    value={editPromotion.discount_percentage ? `${editPromotion.discount_percentage}% OFF` : 'N/A'}
                    className="w-full mt-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">Start Date</label>
                  <input
                    type="datetime-local"
                    value={editPromotion.start_date || ''}
                    onChange={e => setEditPromotion({...editPromotion, start_date: e.target.value})}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">End Date</label>
                  <input
                    type="datetime-local"
                    value={editPromotion.end_date || ''}
                    onChange={e => setEditPromotion({...editPromotion, end_date: e.target.value})}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Usage Limit</label>
                <input
                  type="number"
                  min="1"
                  value={editPromotion.max_redemptions || ''}
                  onChange={e => setEditPromotion({...editPromotion, max_redemptions: e.target.value})}
                  placeholder="e.g. 15 (blank = unlimited)"
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <p className="text-[10px] text-slate-500 text-center px-4">
                Note: Updating Usage Limit will seamlessly regenerate your Stripe limits behind the scenes. Promo codes and discounts cannot be modified.
              </p>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditPromotion(null)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assessment Builder Modal */}
      {assessmentBuilderLesson && (
        <AssessmentBuilderModal
          lesson={assessmentBuilderLesson}
          onClose={() => setAssessmentBuilderLesson(null)}
        />
      )}

      <ModuleManagementModal
        isOpen={moduleEditModalOpen}
        module={moduleToEdit}
        onClose={() => setModuleEditModalOpen(false)}
        onSave={handleUpdateModule}
        onDelete={handleDeleteModule}
      />

      {/* --- EDIT USER MODAL --- */}
      {editUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setEditUserModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">Edit User Account</h3>
                  <p className="text-[11px] text-slate-300 font-mono">ID: {editingUser.id?.slice(0, 18)}...</p>
                </div>
              </div>
              <button onClick={() => setEditUserModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEditedUser} className="p-6 space-y-4 text-xs">
              
              {editUserError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{editUserError}</span>
                </div>
              )}

              {editUserSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{editUserSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-slate-800 font-bold">Practitioner Full Name</label>
                <input
                  type="text"
                  required
                  value={editUserName}
                  onChange={e => setEditUserName(e.target.value)}
                  placeholder="e.g. Aamir Hussain"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-800 font-bold">Email Address</label>
                <input
                  type="email"
                  required
                  value={editUserEmail}
                  onChange={e => setEditUserEmail(e.target.value)}
                  placeholder="e.g. user@domain.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-800 font-bold">Set New Password <span className="text-[10px] font-normal text-slate-400">(Optional)</span></label>
                <input
                  type="password"
                  value={editUserPassword}
                  onChange={e => setEditUserPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  minLength={6}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-800 font-bold">Account Role</label>
                <select
                  value={editUserRole}
                  onChange={e => setEditUserRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-xs"
                >
                  <option value="student">Student / Practitioner</option>
                  <option value="admin">Administrator (Admin)</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editUserLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {editUserLoading ? 'Saving...' : 'Save User Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
