// dashboardController.js - User Dashboard & Learning Progress Tracker
const supabase = require('../config/supabase');

exports.getDashboardSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    // Admin gets access to all courses, otherwise check entitlements
    let userEntitlementIds = [];
    if (req.user.role !== 'admin') {
      const { data: entitlements } = await supabase
        .from('entitlements')
        .select('product_id')
        .eq('user_id', userId);
      userEntitlementIds = entitlements.map(e => e.product_id);
    }

    // Get courses
    let coursesQuery = supabase.from('courses').select('*, modules(*, lessons(id))');
    if (req.user.role !== 'admin' && userEntitlementIds.length > 0) {
      coursesQuery = coursesQuery.in('id', userEntitlementIds);
    } else if (req.user.role !== 'admin') {
      // Not an admin and no entitlements
      coursesQuery = coursesQuery.in('id', ['dummy_none']); // Will return empty
    }

    const { data: courses } = await coursesQuery;
    
    // Get user progress
    const { data: userProgress } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId);

    const enrolledCourses = (courses || []).map(c => {
      const allLessonIds = c.modules ? c.modules.flatMap(m => m.lessons.map(l => l.id)) : [];
      const completedCount = userProgress.filter(p => p.course_id === c.id && p.completed).length;
      const progressPercent = allLessonIds.length > 0 ? Math.round((completedCount / allLessonIds.length) * 100) : 0;
      
      const lastProgress = userProgress.find(p => p.course_id === c.id);
      let resumeLesson = c.modules && c.modules[0] && c.modules[0].lessons ? c.modules[0].lessons[0] : null;
      if (lastProgress && c.modules) {
        for (const m of c.modules) {
          if (m.lessons) {
            const l = m.lessons.find(less => less.id === lastProgress.lesson_id);
            if (l) {
              resumeLesson = l;
              break;
            }
          }
        }
      }

      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        headline: c.headline,
        tier: c.tier,
        cover_image: c.cover_image,
        total_lessons: allLessonIds.length,
        completed_lessons: completedCount,
        progress_percent: progressPercent,
        resume_lesson: resumeLesson
      };
    });

    // User purchased templates or free templates
    let templatesQuery = supabase.from('templates').select('*');
    if (req.user.role !== 'admin') {
      if (userEntitlementIds.length > 0) {
        const joinedIds = userEntitlementIds.map(id => `"${id}"`).join(',');
        templatesQuery = templatesQuery.or(`is_free.eq.true,id.in.(${joinedIds})`);
      } else {
        templatesQuery = templatesQuery.eq('is_free', true);
      }
    }
    const { data: templateEntitlements } = await templatesQuery;

    return res.json({
      success: true,
      user: {
        id: req.user.id,
        full_name: req.user.full_name,
        email: req.user.email,
        role: req.user.role
      },
      enrolled_courses: enrolledCourses,
      accessible_templates: templateEntitlements || []
    });
  } catch (err) {
    console.error('getDashboardSummary Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch dashboard' });
  }
};

exports.updateLessonProgress = async (req, res) => {
  const userId = req.user.id;
  const { course_id, lesson_id, completed, last_position_seconds } = req.body;

  try {
    const { data: existing } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lesson_id)
      .maybeSingle();

    const upsertData = {
      user_id: userId,
      course_id: course_id,
      lesson_id: lesson_id,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      upsertData.id = existing.id;
      upsertData.completed = completed !== undefined ? completed : existing.completed;
      upsertData.last_position_seconds = last_position_seconds !== undefined ? last_position_seconds : existing.last_position_seconds;
    } else {
      upsertData.completed = !!completed;
      upsertData.last_position_seconds = last_position_seconds || 0;
    }

    const { data: prog, error } = await supabase
      .from('progress')
      .upsert(upsertData)
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      progress: prog
    });
  } catch (err) {
    console.error('updateLessonProgress Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update progress' });
  }
};
