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

    const unlocked_domains = req.user.role === 'admin' 
      ? ['pack_full'] 
      : userEntitlementIds.filter(id => id.startsWith('pack_'));

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
        is_completed: progressPercent === 100 && allLessonIds.length > 0,
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
      accessible_templates: templateEntitlements || [],
      unlocked_domains: unlocked_domains || []
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

exports.submitAssessment = async (req, res) => {
  const userId = req.user.id;
  const { lessonId } = req.params;
  const { courseId, answers, agreed } = req.body;

  if (!agreed) {
    return res.status(400).json({ success: false, error: 'You must agree and confirm your submission.' });
  }

  try {
    // Get lesson details
    const { data: lesson } = await supabase.from('lessons').select('*').eq('id', lessonId).single();
    if (!lesson || lesson.type !== 'assessment') {
      return res.status(400).json({ success: false, error: 'Invalid assessment lesson.' });
    }

    // Get correct answers
    const { data: questions } = await supabase.from('assessment_questions').select('*').eq('lesson_id', lessonId);
    
    let correctCount = 0;
    const totalQuestions = questions ? questions.length : 0;

    if (totalQuestions > 0) {
      questions.forEach(q => {
        const userAnswer = answers[q.id];
        if (userAnswer === q.correct_option_index) {
          correctCount++;
        }
      });
    }

    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
    const passed = score >= 80; // Pass threshold, you can adjust as needed

    // Save submission
    await supabase.from('assessment_submissions').upsert({
      user_id: userId,
      lesson_id: lessonId,
      score,
      passed,
      agreed,
      submitted_at: new Date().toISOString()
    }, { onConflict: 'user_id,lesson_id' });

    let certificateIssued = false;

    if (passed) {
      // Mark progress as completed
      await supabase.from('progress').upsert({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        completed: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,lesson_id' });

      if (lesson.is_final_assessment) {
        // Check if all lessons in the course are completed
        const { data: course } = await supabase.from('courses').select('modules(lessons(id))').eq('id', courseId).single();
        const allLessonIds = course.modules.flatMap(m => m.lessons.map(l => l.id));
        
        const { data: userProgress } = await supabase.from('progress').select('lesson_id').eq('user_id', userId).eq('course_id', courseId).eq('completed', true);
        const completedLessonIds = userProgress.map(p => p.lesson_id);
        
        const allCompleted = allLessonIds.every(id => completedLessonIds.includes(id));

        if (allCompleted) {
          const { error: certError } = await supabase.from('certificates').insert([{
            user_id: userId,
            course_id: courseId
          }]);
          if (!certError) {
            certificateIssued = true;
          }
        }
      }
    }

    return res.json({
      success: true,
      score,
      passed,
      certificateIssued
    });
  } catch (err) {
    console.error('submitAssessment Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit assessment' });
  }
};

exports.getCertificates = async (req, res) => {
  const userId = req.user.id;
  try {
    const { data: certificates, error } = await supabase
      .from('certificates')
      .select('*, courses(title, cover_image, author_name)')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return res.json({ success: true, certificates });
  } catch (err) {
    console.error('getCertificates Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch certificates' });
  }
};
