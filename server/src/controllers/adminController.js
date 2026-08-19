// adminController.js - Admin Studio Management & Analytics
const supabase = require('../config/supabase');
const emailService = require('../services/emailService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');

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

exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    headline,
    description,
    tier,
    price,
    author_name,
    cover_image
  } = req.body;

  try {
    const updates = {
      ...(title && { title }),
      ...(headline && { headline }),
      ...(description !== undefined && { description }),
      ...(tier && { tier }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(author_name && { author_name }),
      ...(cover_image && { cover_image })
    };

    const { data: updatedCourse, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedCourse) {
      return res.status(404).json({ success: false, error: 'Course not found or update failed' });
    }

    return res.json({
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (err) {
    console.error('updateCourse Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update course' });
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

exports.updateLesson = async (req, res) => {
  const { lessonId } = req.params;
  const { title, type, duration_minutes, video_url, content, is_free_preview } = req.body;

  try {
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (type !== undefined) updates.type = type;
    if (duration_minutes !== undefined) updates.duration_minutes = parseInt(duration_minutes) || 10;
    if (video_url !== undefined) updates.video_url = video_url;
    if (content !== undefined) updates.content = content;
    if (is_free_preview !== undefined) updates.is_free_preview = !!is_free_preview;

    const { data: updatedLesson, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', lessonId)
      .select()
      .single();

    if (error || !updatedLesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found or update failed' });
    }

    return res.json({
      success: true,
      message: 'Lesson updated successfully',
      lesson: updatedLesson
    });
  } catch (err) {
    console.error('updateLesson Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update lesson' });
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

exports.getUserDetails = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Get profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // 2. Get orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    // 3. Get entitlements
    const { data: entitlements } = await supabase
      .from('entitlements')
      .select('*')
      .eq('user_id', id);

    // 4. Get progress
    const { data: progress } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', id);

    return res.json({
      success: true,
      user: profile,
      orders: orders || [],
      entitlements: entitlements || [],
      progress: progress || []
    });
  } catch (err) {
    console.error('getUserDetails Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch user details' });
  }
};

exports.replyToInquiry = async (req, res) => {
  const { id } = req.params;
  const { replyMessage } = req.body;

  if (!replyMessage || !replyMessage.trim()) {
    return res.status(400).json({ success: false, error: 'Reply message is required' });
  }

  try {
    // 1. Fetch the inquiry
    const { data: inquiry, error: fetchError } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !inquiry) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    // 2. Send the email
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Re: Your Inquiry to Veritus</h2>
        <p>Hi ${inquiry.name},</p>
        <p>Thank you for reaching out to us. Here is the response to your inquiry:</p>
        <div style="padding: 15px; border-left: 4px solid #1e3a8a; background: #f8fafc; margin: 20px 0;">
          ${replyMessage.replace(/\n/g, '<br/>')}
        </div>
        <br/>
        <p><strong>Your Original Message:</strong></p>
        <blockquote style="color: #64748b; font-size: 0.9em; border-left: 2px solid #cbd5e1; padding-left: 10px;">
          ${inquiry.message.replace(/\n/g, '<br/>')}
        </blockquote>
        <br/>
        <p>Best regards,<br/>The Veritus Team</p>
      </div>
    `;

    await emailService.sendEmail({
      to: inquiry.email,
      subject: 'Re: Your Inquiry to Veritus',
      html: emailHtml
    });

    // 3. Update status (ignore error if status column doesn't exist yet, to ensure backward compatibility)
    const { error: updateError } = await supabase
      .from('inquiries')
      .update({ status: 'replied' })
      .eq('id', id);
      
    if (updateError) {
      console.warn('Could not update status to replied (column might be missing):', updateError);
    }

    return res.json({ success: true, message: 'Reply sent successfully' });
  } catch (err) {
    console.error('replyToInquiry Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to send reply' });
  }
};

exports.updateInquiryStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const { data: updatedInquiry, error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedInquiry) {
      return res.status(404).json({ success: false, error: 'Inquiry not found or update failed' });
    }

    return res.json({ success: true, inquiry: updatedInquiry });
  } catch (err) {
    console.error('updateInquiryStatus Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update status' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;

    return res.json({ success: true, orders: orders || [] });
  } catch (err) {
    console.error('getOrders Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // 1. Get the current order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // 2. Update the order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 3. Handle entitlements
    if (order.user_id) {
      if (status === 'refunded' || status === 'cancelled') {
        // Revoke entitlement
        await supabase
          .from('entitlements')
          .delete()
          .match({ user_id: order.user_id, product_id: order.product_id });
      } else if (status === 'paid' && order.status !== 'paid') {
        // Grant entitlement
        await supabase
          .from('entitlements')
          .upsert({ user_id: order.user_id, product_id: order.product_id });
      }
    }

    return res.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error('updateOrderStatus Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
};

exports.refundOrder = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Get the current order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({ success: false, error: 'Order is not in paid status' });
    }

    // 2. Process Stripe Refund (if applicable)
    if (order.stripe_payment_intent) {
      // Calculate 75% refund (keep 25% cut)
      const refundAmount = Math.round((order.amount * 100) * 0.75); // Stripe expects cents
      
      try {
        await stripe.refunds.create({
          payment_intent: order.stripe_payment_intent,
          amount: refundAmount,
        });
      } catch (stripeErr) {
        console.error('Stripe Refund Error:', stripeErr);
        return res.status(500).json({ success: false, error: 'Failed to process refund with payment gateway' });
      }
    }

    // 3. Update Order Status in Database
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status: 'refunded' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 4. Revoke Entitlement
    if (order.user_id) {
      await supabase
        .from('entitlements')
        .delete()
        .match({ user_id: order.user_id, product_id: order.product_id });
    }

    return res.json({ success: true, message: 'Order refunded successfully', order: updatedOrder });
  } catch (err) {
    console.error('refundOrder Error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during refund' });
  }
};

exports.getPacks = (req, res) => {
  try {
    const packsPath = path.join(__dirname, '../data/packs.json');
    if (!fs.existsSync(packsPath)) {
      return res.json({ success: true, packs: [] });
    }
    const packsData = fs.readFileSync(packsPath, 'utf8');
    const packs = JSON.parse(packsData);
    return res.json({ success: true, packs });
  } catch (err) {
    console.error('getPacks Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch packs' });
  }
};

exports.updatePacks = (req, res) => {
  try {
    const packsPath = path.join(__dirname, '../data/packs.json');
    const packs = req.body.packs;
    if (!Array.isArray(packs)) {
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }
    fs.writeFileSync(packsPath, JSON.stringify(packs, null, 2), 'utf8');
    return res.json({ success: true, message: 'Packs updated successfully' });
  } catch (err) {
    console.error('updatePacks Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update packs' });
  }
};
