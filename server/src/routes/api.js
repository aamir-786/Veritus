// api.js - Central Express Router for Veritus Platform API
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const questionsController = require('../controllers/questionsController');
const coursesController = require('../controllers/coursesController');
const templatesController = require('../controllers/templatesController');
const commerceController = require('../controllers/commerceController');
const dashboardController = require('../controllers/dashboardController');
const adminController = require('../controllers/adminController');
const reviewsController = require('../controllers/reviewsController');
const promotionsController = require('../controllers/promotionsController');

const { authenticateToken, optionalToken, requireAdmin } = require('../middleware/auth');
const emailService = require('../services/emailService');
const supabase = require('../config/supabase');

// --- Auth Routes ---
// Note: Login, Registration, Google Auth, and Reset Password are now handled entirely by Supabase Auth on the frontend.
router.get('/auth/profile', authenticateToken, (req, res) => {
  return res.json({ success: true, user: req.user });
});
router.post('/auth/welcome', authenticateToken, authController.checkAndSendWelcome);

// --- Contact Form Email Endpoint ---
router.post('/contact', async (req, res) => {
  const { name, email, company, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
  }

  try {
    const { error } = await supabase.from('inquiries').insert([{ name, email, company, message }]);
    if (error) console.error('Failed to save inquiry to DB:', error);
  } catch (err) {
    console.error('Failed to save inquiry to DB:', err);
  }

  const result = await emailService.sendEmail({
    to: process.env.FROM_EMAIL || 'mr.amir.mangrio@gmail.com',
    subject: `[Veritus Contact Inquiry] ${name} from ${company || 'Enterprise'}`,
    html: `
      <h2>New Enterprise Inquiry Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background:#f1f5f9; padding:12px; border-left:4px solid #1e3a8a;">${message}</blockquote>
    `
  });

  return res.json({ success: true, message: 'Inquiry received successfully' });
});

// --- 100 Risk Questions & AI Copilot Routes ---
router.get('/questions', questionsController.getQuestions);
router.get('/questions/:id', questionsController.getQuestionById);
router.post('/questions/ai-copilot', authenticateToken, questionsController.generateAIRiskAdvice);

// --- Courses & Lessons Routes ---
router.get('/courses', coursesController.getCourses);
router.get('/courses/:identifier', optionalToken, coursesController.getCourseDetails);
router.get('/courses/:courseId/lessons/:lessonId', optionalToken, coursesController.getLessonPlayback);

// --- Digital Library & Templates Routes ---
router.get('/templates', optionalToken, templatesController.getTemplates);
router.get('/templates/download/:templateId', optionalToken, templatesController.downloadTemplate);

// --- Commerce & Payment Routes ---
router.get('/packs', adminController.getPacks);
router.post('/checkout/create-session', optionalToken, commerceController.createCheckoutSession);
router.post('/checkout/session/multi', optionalToken, commerceController.createMultiCheckoutSession);
router.post('/checkout/complete', commerceController.completeCheckout);
router.get('/checkout/verify-session/:sessionId', commerceController.verifySession);
router.post('/checkout/webhook', commerceController.handleStripeWebhook);
router.get('/orders', authenticateToken, commerceController.getUserOrders);

// --- Dashboard & Learning Progress Routes ---
router.get('/dashboard/summary', authenticateToken, dashboardController.getDashboardSummary);
router.post('/dashboard/progress', authenticateToken, dashboardController.updateLessonProgress);
router.post('/dashboard/assessments/:lessonId/submit', authenticateToken, dashboardController.submitAssessment);
router.get('/dashboard/certificates', authenticateToken, dashboardController.getCertificates);

// --- Reviews Routes ---
router.get('/reviews/landing', reviewsController.getLandingPageReviews);
router.post('/reviews', authenticateToken, reviewsController.createReview);

// --- Admin Studio Routes (Protected: Admin Only) ---
router.get('/admin/metrics', authenticateToken, requireAdmin, adminController.getAdminMetrics);
router.post('/admin/courses', authenticateToken, requireAdmin, adminController.createCourse);
router.put('/admin/courses/:id', authenticateToken, requireAdmin, adminController.updateCourse);
router.post('/admin/courses/:courseId/modules', authenticateToken, requireAdmin, adminController.addModuleToCourse);
router.put('/admin/courses/:courseId/modules/:moduleId', authenticateToken, requireAdmin, adminController.updateModule);
router.delete('/admin/courses/:courseId/modules/:moduleId', authenticateToken, requireAdmin, adminController.deleteModule);
router.post('/admin/courses/:courseId/modules/:moduleId/lessons', authenticateToken, requireAdmin, adminController.addLessonToModule);
router.put('/admin/courses/:courseId/modules/:moduleId/lessons/:lessonId', authenticateToken, requireAdmin, adminController.updateLesson);

router.get('/admin/lessons/:lessonId/assessment-questions', authenticateToken, requireAdmin, adminController.getAssessmentQuestions);
router.post('/admin/lessons/:lessonId/assessment-questions', authenticateToken, requireAdmin, adminController.addAssessmentQuestion);
router.put('/admin/assessment-questions/:questionId', authenticateToken, requireAdmin, adminController.updateAssessmentQuestion);
router.delete('/admin/assessment-questions/:questionId', authenticateToken, requireAdmin, adminController.deleteAssessmentQuestion);

router.put('/admin/questions/:id', authenticateToken, requireAdmin, adminController.updateQuestion);
router.post('/admin/questions', authenticateToken, requireAdmin, adminController.createQuestion);
router.delete('/admin/questions/:id', authenticateToken, requireAdmin, adminController.deleteQuestion);
router.delete('/admin/users/:id', authenticateToken, requireAdmin, adminController.deleteUser);
router.get('/admin/users/:id/details', authenticateToken, requireAdmin, adminController.getUserDetails);
router.post('/admin/users/reset-password', authenticateToken, requireAdmin, adminController.adminResetPassword);

router.post('/admin/templates', authenticateToken, requireAdmin, adminController.createTemplate);
router.put('/admin/templates/:id', authenticateToken, requireAdmin, adminController.updateTemplate);
router.delete('/admin/templates/:id', authenticateToken, requireAdmin, adminController.deleteTemplate);

router.get('/admin/packs', authenticateToken, requireAdmin, adminController.getPacks);
router.put('/admin/packs', authenticateToken, requireAdmin, adminController.updatePacks);

router.get('/admin/inquiries', authenticateToken, requireAdmin, adminController.getInquiries);
router.post('/admin/inquiries/:id/reply', authenticateToken, requireAdmin, adminController.replyToInquiry);
router.put('/admin/inquiries/:id/status', authenticateToken, requireAdmin, adminController.updateInquiryStatus);
router.get('/admin/orders', authenticateToken, requireAdmin, adminController.getOrders);
router.put('/admin/orders/:id/status', authenticateToken, requireAdmin, adminController.updateOrderStatus);
router.post('/admin/orders/:id/refund', authenticateToken, requireAdmin, adminController.refundOrder);

router.get('/admin/reviews', authenticateToken, requireAdmin, adminController.getAllReviews);
router.delete('/admin/reviews/:id', authenticateToken, requireAdmin, adminController.deleteReview);
router.put('/admin/reviews/:id/featured', authenticateToken, requireAdmin, adminController.toggleFeaturedReview);

// --- Promotions Routes ---
router.get('/promotions/active', promotionsController.getActivePromotion);
router.get('/admin/promotions', authenticateToken, requireAdmin, adminController.getAllPromotions);
router.post('/admin/promotions', authenticateToken, requireAdmin, adminController.createPromotion);
router.put('/admin/promotions/:id', authenticateToken, requireAdmin, adminController.updatePromotion);
router.put('/admin/promotions/:id/status', authenticateToken, requireAdmin, adminController.togglePromotionStatus);
router.put('/admin/promotions/:id/banner', authenticateToken, requireAdmin, adminController.toggleBannerVisibility);
router.delete('/admin/promotions/:id', authenticateToken, requireAdmin, adminController.deletePromotion);

// --- Email Health Diagnostic Route ---
router.get('/health/email', async (req, res) => {
  try {
    const targetEmail = req.query.to || process.env.SMTP_USER || 'aamir.fss22@gmail.com';
    const result = await emailService.sendEmail({
      to: targetEmail,
      subject: 'Vercel Production Email Diagnostic Test',
      text: 'Testing email sending capability from live production environment.',
      html: '<div style="font-family:sans-serif; padding:20px; background:#0f172a; color:#ffffff; rounded:10px;"><h2>Vercel Live Email Test</h2><p>This is a diagnostic email sent from the live server.</p></div>'
    });
    return res.json({
      success: true,
      env: {
        SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
        SMTP_PORT: process.env.SMTP_PORT || '465',
        SMTP_USER: process.env.SMTP_USER ? 'configured' : 'configured (fallback)',
        FROM_EMAIL: process.env.FROM_EMAIL || 'aamir.fss22@gmail.com'
      },
      result
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
