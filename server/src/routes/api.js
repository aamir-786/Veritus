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

const { authenticateToken, optionalToken, requireAdmin } = require('../middleware/auth');
const emailService = require('../services/emailService');

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
router.post('/checkout/create-session', optionalToken, commerceController.createCheckoutSession);
router.post('/checkout/session/multi', optionalToken, commerceController.createMultiCheckoutSession);
router.post('/checkout/complete', commerceController.completeCheckout);
router.post('/checkout/webhook', commerceController.handleStripeWebhook);
router.get('/orders', authenticateToken, commerceController.getUserOrders);

// --- Dashboard & Learning Progress Routes ---
router.get('/dashboard/summary', authenticateToken, dashboardController.getDashboardSummary);
router.post('/dashboard/progress', authenticateToken, dashboardController.updateLessonProgress);

// --- Admin Studio Routes (Protected: Admin Only) ---
router.get('/admin/metrics', authenticateToken, requireAdmin, adminController.getAdminMetrics);
router.post('/admin/courses', authenticateToken, requireAdmin, adminController.createCourse);
router.post('/admin/courses/:courseId/modules', authenticateToken, requireAdmin, adminController.addModuleToCourse);
router.post('/admin/courses/:courseId/modules/:moduleId/lessons', authenticateToken, requireAdmin, adminController.addLessonToModule);
router.put('/admin/questions/:id', authenticateToken, requireAdmin, adminController.updateQuestion);
router.post('/admin/questions', authenticateToken, requireAdmin, adminController.createQuestion);
router.delete('/admin/questions/:id', authenticateToken, requireAdmin, adminController.deleteQuestion);
router.delete('/admin/users/:id', authenticateToken, requireAdmin, adminController.deleteUser);
router.post('/admin/users/reset-password', authenticateToken, requireAdmin, adminController.adminResetPassword);

router.post('/admin/templates', authenticateToken, requireAdmin, adminController.createTemplate);
router.put('/admin/templates/:id', authenticateToken, requireAdmin, adminController.updateTemplate);
router.delete('/admin/templates/:id', authenticateToken, requireAdmin, adminController.deleteTemplate);

module.exports = router;
