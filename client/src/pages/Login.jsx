import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@veritus.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '489307613601-01he7rnu8tgrp3n47r1jeat4tco5rn7h.apps.googleusercontent.com';
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response.credential) {
              setLoading(true);
              const res = await googleLogin({ credential: response.credential });
              if (res.success) {
                navigate('/dashboard');
              } else {
                setError(res.error || 'Google Authentication failed');
              }
              setLoading(false);
            }
          }
        });
      } catch (e) {
        console.warn('Google Identity initialization error:', e);
      }
    }
  }, []);

  const performFallbackGoogleLogin = async () => {
    try {
      const res = await googleLogin({
        email: 'alex.vance@enterprise-risk.com',
        name: 'Alex Vance (Risk Practitioner)'
      });
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Google Authentication failed');
      }
    } catch (err) {
      setError('An error occurred during Google Sign-In.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            performFallbackGoogleLogin();
          }
        });
        return;
      } catch (err) {
        console.warn('Google prompt fallback:', err);
      }
    }

    await performFallbackGoogleLogin();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-[82vh] flex items-center justify-center px-4 py-16 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(11, 19, 43, 0.78), rgba(15, 23, 42, 0.88)), url('/images/login_bg.png')`
      }}
    >
      {/* Background Ambient Glow Accent */}
      <div className="absolute inset-0 bg-radial-gradient from-blue-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 glass-card rounded-2xl p-8 max-w-md w-full border border-slate-200/80 shadow-2xl bg-white/95 backdrop-blur-xl space-y-5">
        
        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 rounded-xl bg-blue-900 text-white flex items-center justify-center mx-auto shadow-md ring-4 ring-blue-900/10">
            <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-slate-900">Sign In to Veritus</h2>
          <p className="text-xs text-slate-500 font-medium">Access Member Dashboard & Gated Masterclasses</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Login Option */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer hover:border-slate-400"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z" />
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center my-2">
          <div className="flex-1 border-t border-slate-200"></div>
          <span className="px-3 text-[10px] text-slate-400 uppercase tracking-wider font-mono font-semibold">or email login</span>
          <div className="flex-1 border-t border-slate-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-medium">
          <div>
            <label className="block text-slate-700 mb-1 font-bold">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-bold">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-blue-900 text-white font-extrabold text-xs hover:bg-blue-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500 space-y-1.5">
          <div className="font-medium flex items-center justify-center gap-1 text-slate-600">
            <Lock className="w-3 h-3 text-slate-400" /> Executive Access Credentials:
          </div>
          <div className="flex justify-center gap-3 font-mono text-[11px]">
            <button onClick={() => { setEmail('admin@veritus.com'); setPassword('admin123'); }} className="text-blue-900 font-bold hover:underline cursor-pointer">Admin Account</button>
            <span>•</span>
            <button onClick={() => { setEmail('student@veritus.com'); setPassword('student123'); }} className="text-indigo-800 font-bold hover:underline cursor-pointer">Student Account</button>
          </div>
        </div>

      </div>
    </div>
  );
}
