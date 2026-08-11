export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');


const getHeaders = () => {
  const token = localStorage.getItem('veritus_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth API
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  register: async (email, password, full_name) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name })
    });
    return res.json();
  },

  googleLogin: async (payload = {}) => {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  getProfile: async () => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: getHeaders()
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
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Courses & Lessons API
  getCourses: async () => {
    const res = await fetch(`${API_BASE}/courses`, { headers: getHeaders() });
    return res.json();
  },

  getCourseDetails: async (identifier) => {
    const res = await fetch(`${API_BASE}/courses/${identifier}`, { headers: getHeaders() });
    return res.json();
  },

  getLessonPlayback: async (courseId, lessonId) => {
    const res = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}`, { headers: getHeaders() });
    return res.json();
  },

  // Templates API
  getTemplates: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/templates?${query}`, { headers: getHeaders() });
    return res.json();
  },

  // Commerce API
  createCheckoutSession: async (item_id, item_type, customer_email) => {
    const res = await fetch(`${API_BASE}/checkout/create-session`, {
      method: 'POST',
      headers: getHeaders(),
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

  // Dashboard API
  getDashboardSummary: async () => {
    const res = await fetch(`${API_BASE}/dashboard/summary`, { headers: getHeaders() });
    return res.json();
  },

  updateLessonProgress: async (payload) => {
    const res = await fetch(`${API_BASE}/dashboard/progress`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Admin Studio API
  getAdminMetrics: async () => {
    const res = await fetch(`${API_BASE}/admin/metrics`, { headers: getHeaders() });
    return res.json();
  },

  createCourse: async (courseData) => {
    const res = await fetch(`${API_BASE}/admin/courses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(courseData)
    });
    return res.json();
  },

  addModuleToCourse: async (courseId, title) => {
    const res = await fetch(`${API_BASE}/admin/courses/${courseId}/modules`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title })
    });
    return res.json();
  },

  addLessonToModule: async (courseId, moduleId, lessonData) => {
    const res = await fetch(`${API_BASE}/admin/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(lessonData)
    });
    return res.json();
  },

  updateQuestion: async (id, questionData) => {
    const res = await fetch(`${API_BASE}/admin/questions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(questionData)
    });
    return res.json();
  }
};
