// coursesController.js - Catalog, Course Hierarchy, Gated Video Playback & Content Access
const supabase = require('../config/supabase');

// Helper to check if a user has purchased a course
const userHasCourse = async (userId, courseId) => {
  if (!userId) return false;
  
  // Admin gets everything
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
    
  if (userProfile && userProfile.role === 'admin') return true;

  // Check entitlements
  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', courseId)
    .maybeSingle();

  return !!entitlement;
};

// Get Course Catalog
exports.getCourses = async (req, res) => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*, modules(*, lessons(id))')
      .eq('published', true);

    if (error) throw error;

    // Fetch reviews for courses
    const { data: reviews, error: reviewError } = await supabase
      .from('reviews')
      .select('product_id, rating')
      .eq('product_type', 'course');
      
    if (reviewError) throw reviewError;

    // Group reviews by product_id
    const courseRatings = {};
    if (reviews) {
      reviews.forEach(r => {
        if (!courseRatings[r.product_id]) {
          courseRatings[r.product_id] = { sum: 0, count: 0 };
        }
        if (r.rating) {
          courseRatings[r.product_id].sum += r.rating;
          courseRatings[r.product_id].count += 1;
        }
      });
    }

    const formattedCourses = courses.map(c => {
      const module_count = c.modules ? c.modules.length : 0;
      const lesson_count = c.modules ? c.modules.reduce((acc, m) => acc + (m.lessons ? m.lessons.length : 0), 0) : 0;
      
      const ratingData = courseRatings[c.id];
      const rating_count = ratingData ? ratingData.count : 0;
      const rating_avg = ratingData && ratingData.count > 0 ? (ratingData.sum / ratingData.count).toFixed(1) : "0.0";

      return {
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
        module_count,
        lesson_count,
        rating_avg,
        rating_count
      };
    });

    return res.json({
      success: true,
      courses: formattedCourses
    });
  } catch (err) {
    console.error('getCourses Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch courses' });
  }
};

// Get Single Course Details by Slug or ID
exports.getCourseDetails = async (req, res) => {
  const { identifier } = req.params;

  try {
    const { data: course, error } = await supabase
      .from('courses')
      .select('*, modules(*, lessons(*))')
      .or(`id.eq.${identifier},slug.eq.${identifier}`)
      .single();

    if (error || !course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // Sort modules and lessons based on order_index or id if order_index is missing
    if (course.modules) {
      course.modules.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      course.modules.forEach(m => {
        if (m.lessons) {
          m.lessons.sort((a, b) => a.id.localeCompare(b.id)); // Fallback sorting for lessons
        }
      });
    }

    const userId = req.user ? req.user.id : null;
    const isEnrolled = await userHasCourse(userId, course.id);

    // Return course hierarchy; mask full lesson video URLs if not enrolled and not free preview
    const sanitizedModules = (course.modules || []).map(mod => ({
      id: mod.id,
      title: mod.title,
      order_index: mod.order_index,
      lessons: (mod.lessons || []).map(l => ({
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

    // Fetch Course Reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_type', 'course')
      .eq('product_id', course.id);

    let rating_avg = "0.0";
    let rating_count = 0;
    
    if (reviews && reviews.length > 0) {
      rating_count = reviews.length;
      const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
      rating_avg = (sum / rating_count).toFixed(1);
    }

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
        modules: sanitizedModules,
        rating_avg,
        rating_count
      }
    });
  } catch (err) {
    console.error('getCourseDetails Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch course details' });
  }
};

// Access Gated Video Lesson Stream
exports.getLessonPlayback = async (req, res) => {
  const { courseId, lessonId } = req.params;

  try {
    const { data: course, error } = await supabase
      .from('courses')
      .select('id, slug, modules(lessons(*))')
      .or(`id.eq.${courseId},slug.eq.${courseId}`)
      .single();

    if (error || !course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    let targetLesson = null;
    if (course.modules) {
      for (const mod of course.modules) {
        if (mod.lessons) {
          const l = mod.lessons.find(less => less.id === lessonId);
          if (l) {
            targetLesson = l;
            break;
          }
        }
      }
    }

    if (!targetLesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    const userId = req.user ? req.user.id : null;
    const isEnrolled = await userHasCourse(userId, course.id);

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
  } catch (err) {
    console.error('getLessonPlayback Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch lesson' });
  }
};
