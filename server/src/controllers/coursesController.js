// coursesController.js - Catalog, Course Hierarchy, Gated Video Playback & Content Access
const db = require('../data/dbStore');

// Helper to check if a user has purchased a course
const userHasCourse = (userId, courseId) => {
  if (!userId) return false;
  // Admin automatically gets access to everything
  const user = db.users.find(u => u.id === userId);
  if (user && user.role === 'admin') return true;

  return db.entitlements.some(e => e.user_id === userId && e.product_id === courseId);
};

// Get Course Catalog
exports.getCourses = (req, res) => {
  const publishedCourses = db.courses.filter(c => c.published).map(c => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    headline: c.headline,
    description: c.description,
    tier: c.tier,
    price: c.price,
    currency: c.currency,
    author_name: c.author_name,
    cover_image: c.cover_image,
    module_count: c.modules.length,
    lesson_count: c.modules.reduce((acc, m) => acc + m.lessons.length, 0)
  }));

  return res.json({
    success: true,
    courses: publishedCourses
  });
};

// Get Single Course Details by Slug or ID
exports.getCourseDetails = (req, res) => {
  const { identifier } = req.params;
  const course = db.courses.find(c => c.slug === identifier || c.id === identifier);

  if (!course) {
    return res.status(404).json({ success: false, error: 'Course not found' });
  }

  const userId = req.user ? req.user.id : null;
  const isEnrolled = userHasCourse(userId, course.id);

  // Return course hierarchy; mask full lesson video URLs if not enrolled and not free preview
  const sanitizedModules = course.modules.map(mod => ({
    id: mod.id,
    title: mod.title,
    order_index: mod.order_index,
    lessons: mod.lessons.map(l => ({
      id: l.id,
      title: l.title,
      type: l.type,
      duration_minutes: l.duration_minutes,
      is_free_preview: l.is_free_preview,
      // Only include video_url and content if enrolled OR if free preview
      video_url: (isEnrolled || l.is_free_preview) ? l.video_url : null,
      captions_vtt: (isEnrolled || l.is_free_preview) ? l.captions_vtt : null,
      content: (isEnrolled || l.is_free_preview) ? l.content : 'This lesson is locked. Purchase the course to gain instant lifetime access.'
    }))
  }));

  return res.json({
    success: true,
    course: {
      id: course.id,
      slug: course.slug,
      title: course.title,
      headline: course.headline,
      description: course.description,
      tier: course.tier,
      price: course.price,
      currency: course.currency,
      author_name: course.author_name,
      cover_image: course.cover_image,
      is_enrolled: isEnrolled,
      modules: sanitizedModules
    }
  });
};

// Access Gated Video Lesson Stream
exports.getLessonPlayback = (req, res) => {
  const { courseId, lessonId } = req.params;
  const course = db.courses.find(c => c.id === courseId || c.slug === courseId);

  if (!course) {
    return res.status(404).json({ success: false, error: 'Course not found' });
  }

  let targetLesson = null;
  for (const mod of course.modules) {
    const l = mod.lessons.find(less => less.id === lessonId);
    if (l) {
      targetLesson = l;
      break;
    }
  }

  if (!targetLesson) {
    return res.status(404).json({ success: false, error: 'Lesson not found' });
  }

  const userId = req.user ? req.user.id : null;
  const isEnrolled = userHasCourse(userId, course.id);

  if (!isEnrolled && !targetLesson.is_free_preview) {
    return res.status(403).json({ 
      success: false, 
      error: 'Access Gated: You must purchase this course to access this lesson video.',
      requires_purchase: true 
    });
  }

  return res.json({
    success: true,
    lesson: targetLesson
  });
};
