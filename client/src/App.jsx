import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CookieConsent from './components/CookieConsent';
import PromoBanner from './components/PromoBanner';

// Pages
import Home from './pages/Home';
import QuestionsMatrix from './pages/QuestionsMatrix';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import CoursePlayer from './pages/CoursePlayer';
import TemplateStore from './pages/TemplateStore';
import Dashboard from './pages/Dashboard';
import PaymentVerification from './pages/PaymentVerification';
import AdminStudio from './pages/AdminStudio';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LegalPages from './pages/LegalPages';
import Certificate from './pages/Certificate';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-20 text-center text-slate-600 font-medium">Verifying security token...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  // Redirect admins away from user dashboard
  if (!requireAdmin && user.role === 'admin' && window.location.pathname === '/dashboard') return <Navigate to="/admin" replace />;
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isCertificateRoute = location.pathname.startsWith('/certificate');

  // Completely hide header/footer if the user is on the admin or certificate route
  const hideLayout = isAdminRoute || isCertificateRoute;


  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-amber-400 selection:text-black">
      <div>
        {!hideLayout && (
          <>
            <PromoBanner />
            <Navbar />
          </>
        )}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/questions" element={<QuestionsMatrix />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/courses/:identifier" element={<CourseDetail />} />
            <Route path="/learn/:courseSlug/lesson/:lessonId" element={<CoursePlayer />} />
            <Route path="/templates" element={<TemplateStore />} />
            <Route path="/payment-verification" element={<PaymentVerification />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/certificate/:courseId" element={
              <ProtectedRoute>
                <Certificate />
              </ProtectedRoute>
            } />

            <Route path="/admin/*" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminStudio />
              </ProtectedRoute>
            } />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/legal/:docType" element={<LegalPages />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      {!hideLayout && <Footer />}
      <CartDrawer />
      {!hideLayout && <CookieConsent />}
    </div>
  );
};

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
