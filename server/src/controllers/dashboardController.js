// dashboardController.js - User Dashboard & Learning Progress Tracker
const db = require('../data/dbStore');

exports.getDashboardSummary = (req, res) => {
  const userId = req.user.id;

  // Find all user entitlements
  const userEntitlementIds = db.entitlements
    .filter(e => e.user_id === userId)
    .map(e => e.product_id);

  // Enrolled courses
  const enrolledCourses = db.courses
    .filter(c => userEntitlementIds.includes(c.id))
    .map(c => {
      const allLessonIds = c.modules.flatMap(m => m.lessons.map(l => l.id));
      const completedCount = db.progress.filter(p => p.user_id === userId && p.course_id === c.id && p.completed).length;
      const progressPercent = allLessonIds.length > 0 ? Math.round((completedCount / allLessonIds.length) * 100) : 0;
      
      // Find last watched lesson for Resume button
      const lastProgress = db.progress.find(p => p.user_id === userId && p.course_id === c.id);
      let resumeLesson = c.modules[0]?.lessons[0] || null;
      if (lastProgress) {
        for (const m of c.modules) {
          const l = m.lessons.find(less => less.id === lastProgress.lesson_id);
          if (l) {
            resumeLesson = l;
            break;
          }
        }
      }

      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        cover_image: c.cover_image,
        total_lessons: allLessonIds.length,
        completed_lessons: completedCount,
        progress_percent: progressPercent,
        resume_lesson: resumeLesson
      };
    });

  // User purchased templates
  const templateEntitlements = db.templates.filter(t => 
    t.is_free || userEntitlementIds.includes(t.id)
  );

  return res.json({
    success: true,
    user: {
      id: req.user.id,
      full_name: req.user.full_name,
      email: req.user.email,
      role: req.user.role
    },
    enrolled_courses: enrolledCourses,
    accessible_templates: templateEntitlements
  });
};

exports.updateLessonProgress = (req, res) => {
  const userId = req.user.id;
  const { course_id, lesson_id, completed, last_position_seconds } = req.body;

  let prog = db.progress.find(p => p.user_id === userId && p.course_id === course_id && p.lesson_id === lesson_id);

  if (prog) {
    if (completed !== undefined) prog.completed = completed;
    if (last_position_seconds !== undefined) prog.last_position_seconds = last_position_seconds;
    prog.updated_at = new Date().toISOString();
  } else {
    prog = {
      user_id: userId,
      course_id: course_id,
      lesson_id: lesson_id,
      completed: !!completed,
      last_position_seconds: last_position_seconds || 0,
      updated_at: new Date().toISOString()
    };
    db.progress.push(prog);
  }

  return res.json({
    success: true,
    progress: prog
  });
};
