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

// --- Auth Routes ---
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.post('/auth/google', authController.googleLogin);
router.get('/auth/profile', authenticateToken, authController.getProfile);
router.post('/auth/reset-password', authController.resetPassword);

// --- 100 Risk Questions & AI Copilot Routes ---
router.get('/questions', questionsController.getQuestions);
router.get('/questions/:id', questionsController.getQuestionById);
router.post('/questions/ai-copilot', questionsController.generateAIRiskAdvice);

// --- Courses & Lessons Routes ---
router.get('/courses', coursesController.getCourses);
router.get('/courses/:identifier', optionalToken, coursesController.getCourseDetails);
router.get('/courses/:courseId/lessons/:lessonId', optionalToken, coursesController.getLessonPlayback);

// --- Digital Library & Templates Routes ---
router.get('/templates', optionalToken, templatesController.getTemplates);
router.get('/templates/download/:templateId', optionalToken, templatesController.downloadTemplate);

// --- Commerce & Payment Routes ---
router.post('/checkout/create-session', optionalToken, commerceController.createCheckoutSession);
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

module.exports = router;
