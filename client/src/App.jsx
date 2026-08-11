import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import QuestionsMatrix from './pages/QuestionsMatrix';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import CoursePlayer from './pages/CoursePlayer';
import TemplateStore from './pages/TemplateStore';
import Dashboard from './pages/Dashboard';
import AdminStudio from './pages/AdminStudio';
import Login from './pages/Login';
import Register from './pages/Register';
import LegalPages from './pages/LegalPages';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-20 text-center text-slate-400">Verifying security token...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col justify-between">
        <div>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/questions" element={<QuestionsMatrix />} />
              <Route path="/courses" element={<CourseCatalog />} />
              <Route path="/courses/:identifier" element={<CourseDetail />} />
              <Route path="/learn/:courseSlug/lesson/:lessonId" element={<CoursePlayer />} />
              <Route path="/templates" element={<TemplateStore />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminStudio />
                </ProtectedRoute>
              } />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/legal/:docType" element={<LegalPages />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}
