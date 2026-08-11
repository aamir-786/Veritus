import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  BookOpen, 
  FileText, 
  LayoutDashboard, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo - Effective RM Theme */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-display text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                VERITUS <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-sans font-semibold">Platform</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium block -mt-1 tracking-wider uppercase">
                Deciding in the Dark
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1.5">
            <Link 
              to="/questions" 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/questions') ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              100 Risk Questions
            </Link>

            <Link 
              to="/courses" 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/courses') ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              Masterclasses
            </Link>

            <Link 
              to="/templates" 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/templates') ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              Template Hub
            </Link>

            {user && (
              <Link 
                to="/dashboard" 
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/dashboard') ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-sky-600" />
                My Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link 
                to="/admin" 
                className={`px-3 py-1 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-colors flex items-center gap-1 border ${
                  isActive('/admin') ? 'bg-amber-500 text-black border-amber-600' : 'bg-slate-100 text-amber-800 border-amber-300 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                Admin Studio
              </Link>
            )}
          </div>

          {/* User Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">{user.full_name}</div>
                  <div className="text-[10px] text-blue-700 font-mono capitalize font-medium">{user.role}</div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 shadow-sm transition-all"
                >
                  Get Access
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 text-xs font-medium">
          <Link
            to="/questions"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100"
          >
            100 Risk Questions Matrix
          </Link>
          <Link
            to="/courses"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100"
          >
            Masterclasses & Courses
          </Link>
          <Link
            to="/templates"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100"
          >
            Template Library
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100"
            >
              My Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-amber-800 font-bold hover:bg-amber-50"
            >
              Admin Studio
            </Link>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-slate-800">{user.full_name}</span>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="px-3 py-1 text-xs bg-rose-50 text-rose-600 rounded-md border border-rose-200"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-1.5 text-xs bg-blue-900 text-white font-bold rounded-lg"
                >
                  Get Access
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
