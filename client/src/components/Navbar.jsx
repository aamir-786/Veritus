import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  BookOpen, 
  FileText, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  ShoppingCart
} from 'lucide-react';
import EffectiveVeritusLogo from './EffectiveVeritusLogo';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartItems, toggleCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo - Effective RM + Veritus Hybrid Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <EffectiveVeritusLogo subtitle={true} />
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
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all"
                >
                  Get Access
                </Link>
              </div>
            )}
            
            {/* Desktop Cart Button */}
            <button 
              onClick={toggleCart}
              className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors ml-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute 0 right-0 -translate-y-1 translate-x-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-indigo-600 rounded-full border-2 border-white">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Toggle & Cart */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={toggleCart}
              className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute 0 right-0 -translate-y-1 translate-x-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-indigo-600 rounded-full border-2 border-white">
                  {cartItems.length}
                </span>
              )}
            </button>
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
                  className="flex-1 text-center py-1.5 text-xs bg-slate-900 text-white font-bold rounded-lg"
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
