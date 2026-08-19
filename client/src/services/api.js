import { supabase } from '../lib/supabase';

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');


const getHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth API
  // NOTE: login, register, and googleLogin are now handled directly by Supabase in AuthContext.
  // We keep getProfile for completeness if needed.
  getProfile: async () => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: await getHeaders()
    });
    return res.json();
  },

  checkAndSendWelcomeEmail: async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/welcome`, {
        method: 'POST',
        headers: await getHeaders()
      });
      return res.json();
    } catch (e) {
      return { success: false };
    }
  },

  sendContactInquiry: async (formData) => {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return res.json();
  },

  // 100 Questions Taxonomy API
  getQuestions: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/questions?${params}`);
    return res.json();
  },

  getQuestionById: async (id) => {
    const res = await fetch(`${API_BASE}/questions/${id}`);
    return res.json();
  },

  getAICopilotAdvice: async (payload) => {
    const res = await fetch(`${API_BASE}/questions/ai-copilot`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Courses & Lessons API
  getCourses: async () => {
    const res = await fetch(`${API_BASE}/courses`, { headers: await getHeaders() });
    return res.json();
  },

  getCourseDetails: async (identifier) => {
    const res = await fetch(`${API_BASE}/courses/${identifier}`, { headers: await getHeaders() });
    return res.json();
  },

  getLessonPlayback: async (courseId, lessonId) => {
    const res = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}`, { headers: await getHeaders() });
    return res.json();
  },

  // Templates API
  getTemplates: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/templates?${qs}`, { headers: await getHeaders() });
    return res.json();
  },

  downloadTemplateFile: async (templateId) => {
    const res = await fetch(`${API_BASE}/templates/download/${templateId}`, {
      method: 'GET',
      headers: await getHeaders()
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to download template');
    }
    
    // Get filename from Content-Disposition header if possible
    let filename = 'template-download.txt';
    const disposition = res.headers.get('Content-Disposition');
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const matches = /filename="([^"]+)"/.exec(disposition);
      if (matches != null && matches[1]) filename = matches[1];
    }
    
    const blob = await res.blob();
    return { blob, filename };
  },

  // Commerce API
  createCheckoutSession: async (item_id, item_type, customer_email) => {
    const res = await fetch(`${API_BASE}/checkout/create-session`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ item_id, item_type, customer_email })
    });
    return res.json();
  },

  completeCheckout: async (order_id, card_holder_name) => {
    const res = await fetch(`${API_BASE}/checkout/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id, card_holder_name })
    });
    return res.json();
  },

  createMultiCheckoutSession: async (payload) => {
    const res = await fetch(`${API_BASE}/checkout/session/multi`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  verifySession: async (sessionId) => {
    const res = await fetch(`${API_BASE}/checkout/verify-session/${sessionId}`, {
      method: 'GET',
      headers: await getHeaders()
    });
    return res.json();
  },

  // Dashboard API
  getDashboardSummary: async () => {
    const res = await fetch(`${API_BASE}/dashboard/summary`, { headers: await getHeaders() });
    return res.json();
  },

  updateLessonProgress: async (payload) => {
    const res = await fetch(`${API_BASE}/dashboard/progress`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Admin Studio API
  getAdminMetrics: async () => {
    const res = await fetch(`${API_BASE}/admin/metrics`, { headers: await getHeaders() });
    return res.json();
  },

  getAdminOrders: async () => {
    const res = await fetch(`${API_BASE}/admin/orders`, { headers: await getHeaders() });
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return res.json();
    }
    return { success: false, error: 'Server returned an invalid response. Is the backend running?' };
  },

  updateOrderStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  refundOrder: async (id) => {
    const res = await fetch(`${API_BASE}/admin/orders/${id}/refund`, {
      method: 'POST',
      headers: await getHeaders()
    });
    return res.json();
  },

  getAdminInquiries: async () => {
    const res = await fetch(`${API_BASE}/admin/inquiries`, {
      headers: await getHeaders()
    });
    return res.json();
  },

  replyToInquiry: async (id, replyMessage) => {
    const res = await fetch(`${API_BASE}/admin/inquiries/${id}/reply`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ replyMessage })
    });

    // Check if the response is JSON before parsing to prevent SyntaxError
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return res.json();
    } else {
      return { success: false, error: 'Server returned an invalid response. Is the backend running?' };
    }
  },

  updateInquiryStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/admin/inquiries/${id}/status`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  createCourse: async (courseData) => {
    const res = await fetch(`${API_BASE}/admin/courses`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(courseData)
    });
    return res.json();
  },

  updateCourse: async (id, courseData) => {
    const res = await fetch(`${API_BASE}/admin/courses/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(courseData)
    });
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return res.json();
    }
    return { success: false, error: 'Server returned an invalid response. Is the backend running?' };
  },

  addModuleToCourse: async (courseId, title) => {
    const res = await fetch(`${API_BASE}/admin/courses/${courseId}/modules`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ title })
    });
    return res.json();
  },

  addLessonToModule: async (courseId, moduleId, lessonData) => {
    const res = await fetch(`${API_BASE}/admin/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(lessonData)
    });
    return res.json();
  },
  updateLesson: async (courseId, moduleId, lessonId, lessonData) => {
    const res = await fetch(`${API_BASE}/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(lessonData)
    });
    return res.json();
  },


  updateQuestion: async (id, questionData) => {
    const res = await fetch(`${API_BASE}/admin/questions/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(questionData)
    });
    return res.json();
  },

  createQuestion: async (questionData) => {
    const res = await fetch(`${API_BASE}/admin/questions`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(questionData)
    });
    return res.json();
  },

  deleteQuestion: async (id) => {
    const res = await fetch(`${API_BASE}/admin/questions/${id}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return res.json();
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return res.json();
  },

  getUserAdminDetails: async (id) => {
    const res = await fetch(`${API_BASE}/admin/users/${id}/details`, {
      headers: await getHeaders()
    });
    return res.json();
  },

  adminResetPassword: async (email) => {
    const res = await fetch(`${API_BASE}/admin/users/reset-password`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  createTemplate: async (templateData) => {
    const res = await fetch(`${API_BASE}/admin/templates`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(templateData)
    });
    return res.json();
  },

  updateTemplate: async (id, templateData) => {
    const res = await fetch(`${API_BASE}/admin/templates/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(templateData)
    });
    return res.json();
  },

  deleteTemplate: async (id) => {
    const res = await fetch(`${API_BASE}/admin/templates/${id}`, {
      method: 'DELETE',
      headers: await getHeaders()
    });
    return res.json();
  },

  getPacks: async () => {
    const res = await fetch(`${API_BASE}/packs`);
    return res.json();
  },

  updatePacks: async (packs) => {
    const res = await fetch(`${API_BASE}/admin/packs`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify({ packs })
    });
    return res.json();
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    // We cannot use getHeaders directly since fetch shouldn't have 'Content-Type': 'application/json' for FormData
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch(`${API_BASE}/admin/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    return res.json();
  }
};
