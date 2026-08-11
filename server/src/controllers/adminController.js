// adminController.js - Admin Studio Management & Analytics
const db = require('../data/dbStore');

// Sales & Platform Analytics Overview
exports.getAdminMetrics = (req, res) => {
  const totalRevenue = db.orders
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const totalUsers = db.users.length;
  const totalCourses = db.courses.length;
  const totalTemplates = db.templates.length;
  const totalOrders = db.orders.filter(o => o.status === 'paid').length;

  return res.json({
    success: true,
    metrics: {
      total_revenue: totalRevenue,
      total_users: totalUsers,
      total_courses: totalCourses,
      total_templates: totalTemplates,
      total_orders: totalOrders,
      recent_orders: db.orders.slice(-5).reverse(),
      users_list: db.users.map(u => ({ id: u.id, email: u.email, full_name: u.full_name, role: u.role, created_at: u.created_at }))
    }
  });
};

// Course Management (Create / Update / Delete)
exports.createCourse = (req, res) => {
  const { title, headline, description, tier, price, cover_image, author_name } = req.body;
  if (!title || !price) {
    return res.status(400).json({ success: false, error: 'Course title and price are required' });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCourse = {
    id: `course-${Date.now()}`,
    slug: slug,
    title: title,
    headline: headline || '',
    description: description || '',
    tier: tier || 'Executive Tier',
    price: parseFloat(price),
    currency: 'USD',
    author_name: author_name || 'Admin Author',
    cover_image: cover_image || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    published: true,
    modules: []
  };

  db.courses.push(newCourse);

  return res.status(201).json({
    success: true,
    message: 'Course created successfully',
    course: newCourse
  });
};

exports.addModuleToCourse = (req, res) => {
  const { courseId } = req.params;
  const { title } = req.body;
  const course = db.courses.find(c => c.id === courseId);

  if (!course) {
    return res.status(404).json({ success: false, error: 'Course not found' });
  }

  const newModule = {
    id: `m-${Date.now()}`,
    title: title || 'New Module',
    order_index: course.modules.length + 1,
    lessons: []
  };

  course.modules.push(newModule);

  return res.status(201).json({
    success: true,
    message: 'Module added',
    module: newModule
  });
};

exports.addLessonToModule = (req, res) => {
  const { courseId, moduleId } = req.params;
  const { title, type, duration_minutes, video_url, content, is_free_preview } = req.body;

  const course = db.courses.find(c => c.id === courseId);
  if (!course) return res.status(404).json({ success: false, error: 'Course not found' });

  const mod = course.modules.find(m => m.id === moduleId);
  if (!mod) return res.status(404).json({ success: false, error: 'Module not found' });

  const newLesson = {
    id: `l-${Date.now()}`,
    title: title || 'New Lesson',
    type: type || 'video',
    duration_minutes: parseInt(duration_minutes) || 10,
    video_url: video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    content: content || 'Lesson content instructions.',
    is_free_preview: !!is_free_preview
  };

  mod.lessons.push(newLesson);

  return res.status(201).json({
    success: true,
    message: 'Lesson added to module successfully',
    lesson: newLesson
  });
};

// Edit Question Taxonomy & Guidance
exports.updateQuestion = (req, res) => {
  const { id } = req.params;
  const question = db.questions.find(q => q.id === id || q.question_number === parseInt(id));

  if (!question) {
    return res.status(404).json({ success: false, error: 'Question not found' });
  }

  const { title, domain, effort, duration, cost, payback, tier, regulator_pressure, leadership_traits, guidance_text } = req.body;

  if (title) question.title = title;
  if (domain) question.domain = domain;
  if (effort) question.effort = effort;
  if (duration) question.duration = duration;
  if (cost) question.cost = cost;
  if (payback) question.payback = payback;
  if (tier) question.tier = tier;
  if (regulator_pressure) question.regulator_pressure = regulator_pressure;
  if (leadership_traits) question.leadership_traits = leadership_traits;
  if (guidance_text) question.guidance_text = guidance_text;

  return res.json({
    success: true,
    message: 'Question taxonomy and guidance updated successfully',
    question
  });
};
