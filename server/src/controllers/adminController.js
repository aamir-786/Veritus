// adminController.js - Admin Studio Management & Analytics
const supabase = require('../config/supabase');

// Sales & Platform Analytics Overview
exports.getAdminMetrics = async (req, res) => {
  try {
    const { data: orders } = await supabase.from('orders').select('*');
    const { data: users } = await supabase.from('profiles').select('*');
    const { data: courses } = await supabase.from('courses').select('id', { count: 'exact' });
    const { data: templates } = await supabase.from('templates').select('id', { count: 'exact' });

    const paidOrders = (orders || []).filter(o => o.status === 'paid');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

    const recentOrders = paidOrders
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    return res.json({
      success: true,
      metrics: {
        total_revenue: totalRevenue,
        total_users: users ? users.length : 0,
        total_courses: courses ? courses.length : 0,
        total_templates: templates ? templates.length : 0,
        total_orders: paidOrders.length,
        recent_orders: recentOrders,
        users_list: users || []
      }
    });
  } catch (err) {
    console.error('getAdminMetrics Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch metrics' });
  }
};

// Course Management (Create / Update / Delete)
exports.createCourse = async (req, res) => {
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
    published: true
  };

  try {
    const { error } = await supabase.from('courses').insert([newCourse]);
    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: { ...newCourse, modules: [] }
    });
  } catch (err) {
    console.error('createCourse Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create course' });
  }
};

exports.addModuleToCourse = async (req, res) => {
  const { courseId } = req.params;
  const { title } = req.body;

  try {
    const { data: existingModules } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', courseId);
      
    const newModule = {
      id: `m-${Date.now()}`,
      course_id: courseId,
      title: title || 'New Module',
      order_index: (existingModules ? existingModules.length : 0) + 1
    };

    const { error } = await supabase.from('modules').insert([newModule]);
    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Module added',
      module: { ...newModule, lessons: [] }
    });
  } catch (err) {
    console.error('addModuleToCourse Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to add module' });
  }
};

exports.addLessonToModule = async (req, res) => {
  const { courseId, moduleId } = req.params;
  const { title, type, duration_minutes, video_url, content, is_free_preview } = req.body;

  try {
    const newLesson = {
      id: `l-${Date.now()}`,
      module_id: moduleId,
      title: title || 'New Lesson',
      type: type || 'video',
      duration_minutes: parseInt(duration_minutes) || 10,
      video_url: video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      content: content || 'Lesson content instructions.',
      is_free_preview: !!is_free_preview
    };

    const { error } = await supabase.from('lessons').insert([newLesson]);
    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Lesson added to module successfully',
      lesson: newLesson
    });
  } catch (err) {
    console.error('addLessonToModule Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to add lesson' });
  }
};

// Edit Question Taxonomy & Guidance
exports.updateQuestion = async (req, res) => {
  const { id } = req.params;
  
  try {
    const { title, domain, effort, duration, cost, payback, tier, regulator_pressure, leadership_traits, summary, guidance_text } = req.body;
    const updates = {};
    
    if (title !== undefined) updates.title = title;
    if (domain !== undefined) updates.domain = domain;
    if (effort !== undefined) updates.effort = effort;
    if (duration !== undefined) updates.duration = duration;
    if (cost !== undefined) updates.cost = cost;
    if (payback !== undefined) updates.payback = payback;
    if (tier !== undefined) updates.tier = tier;
    if (regulator_pressure !== undefined) updates.regulator_pressure = regulator_pressure;
    if (leadership_traits !== undefined) updates.leadership_traits = leadership_traits;
    if (summary !== undefined) updates.summary = summary;
    if (guidance_text !== undefined) updates.guidance_text = guidance_text;

    let query = supabase.from('questions').update(updates);
    if (!isNaN(id)) {
      query = query.eq('question_number', parseInt(id));
    } else {
      query = query.eq('id', id);
    }
    
    const { data: question, error } = await query.select().single();

    if (error || !question) {
      return res.status(404).json({ success: false, error: 'Question not found or update failed' });
    }

    return res.json({
      success: true,
      message: 'Question taxonomy and guidance updated successfully',
      question
    });
  } catch (err) {
    console.error('updateQuestion Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update question' });
  }
};

exports.createQuestion = async (req, res) => {
  const { title, domain, regulator_pressure, effort, duration, cost, payback, tier, leadership_traits, summary, guidance_text } = req.body;
  try {
    const { data: existingQuestions } = await supabase.from('questions').select('id');
    const question_number = (existingQuestions?.length || 0) + 1;
    const newQuestion = {
      id: `q-${question_number}`,
      title,
      domain: domain || 'Uncategorized',
      regulator_pressure: regulator_pressure || 'Medium',
      question_number: question_number,
      effort: effort || 'Moderate',
      duration: duration || '',
      cost: cost || '',
      payback: payback || '',
      tier: tier || '',
      leadership_traits: leadership_traits || '',
      summary: summary || '',
      guidance_text: guidance_text || ''
    };

    const { data, error } = await supabase.from('questions').insert([newQuestion]).select().single();
    if (error) throw error;
    return res.json({ success: true, question: data });
  } catch (err) {
    console.error('createQuestion Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create question' });
  }
};

exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    let query = supabase.from('questions').delete();
    if (!isNaN(id)) {
      query = query.eq('question_number', parseInt(id));
    } else {
      query = query.eq('id', id);
    }
    const { error } = await query;
    if (error) throw error;
    
    return res.json({ success: true, message: 'Question deleted successfully' });
  } catch (err) {
    console.error('deleteQuestion Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete question' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Delete from public.profiles
    const { error: profileError } = await supabase.from('profiles').delete().eq('id', id);
    if (profileError) throw profileError;

    // We also need to delete from auth.users, which requires the admin auth API
    const { data, error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;

    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('deleteUser Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to delete user' });
  }
};

exports.adminResetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });
    if (error) throw error;
    
    // Send email using email service with the generated link, or just rely on Supabase's built-in email sending.
    // If we rely on Supabase built-in, we just do:
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/reset-password',
    });
    
    if (resetError) throw resetError;
    return res.json({ success: true, message: 'Password reset link sent' });
  } catch (err) {
    console.error('adminResetPassword Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to send reset link' });
  }
};

// Template Management
exports.createTemplate = async (req, res) => {
  const { title, description, category, file_path, is_free, price } = req.body;
  if (!title || !file_path) {
    return res.status(400).json({ success: false, error: 'Title and file path are required' });
  }

  const newTemplate = {
    id: `template-${Date.now()}`,
    title,
    description: description || '',
    category: category || 'Frameworks',
    file_path,
    is_free: !!is_free,
    price: is_free ? 0 : parseFloat(price || 49),
    downloads_count: 0
  };

  try {
    const { error } = await supabase.from('templates').insert([newTemplate]);
    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Template created successfully',
      template: newTemplate
    });
  } catch (err) {
    console.error('createTemplate Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create template' });
  }
};

exports.updateTemplate = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  try {
    const { data: template, error } = await supabase
      .from('templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !template) {
      return res.status(404).json({ success: false, error: 'Template not found or update failed' });
    }

    return res.json({
      success: true,
      message: 'Template updated successfully',
      template
    });
  } catch (err) {
    console.error('updateTemplate Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update template' });
  }
};

exports.deleteTemplate = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) throw error;

    return res.json({ success: true, message: 'Template deleted successfully' });
  } catch (err) {
    console.error('deleteTemplate Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete template' });
  }
};

// --- Inquiries Management ---
exports.getInquiries = async (req, res) => {
  try {
    const { data: inquiries, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;

    return res.json({ success: true, inquiries: inquiries || [] });
  } catch (err) {
    console.error('getInquiries Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch inquiries' });
  }
};
