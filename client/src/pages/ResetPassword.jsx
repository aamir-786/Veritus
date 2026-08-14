import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, KeyRound, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const { updateUserPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // When the user clicks the link in their email, Supabase redirects them here
    // with the access token in the URL hash. Supabase auth client automatically picks it up
    // and establishes a session. We just need to wait a moment for it to be ready.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If there's no session, the link might be invalid or expired.
        // However, Supabase sometimes takes a split second to parse the hash.
        setTimeout(async () => {
          const { data: { session: delayedSession } } = await supabase.auth.getSession();
          if (!delayedSession) {
            setError('Invalid or expired reset link. Please request a new one.');
          }
          setCheckingSession(false);
        }, 1000);
      } else {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await updateUserPassword(password);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(res.error || 'Failed to update password.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-[82vh] flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium animate-pulse">Verifying secure link...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[82vh] flex items-center justify-center px-4 py-16 bg-slate-50 relative">
        <div className="relative z-10 glass-card rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-xl bg-white text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-slate-900">Password Updated</h2>
          <p className="text-sm text-slate-600 font-medium">
            Your password has been successfully reset. Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-16 bg-slate-50 relative">
      <div className="relative z-10 glass-card rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-xl bg-white space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center mx-auto shadow-md">
            <KeyRound className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-slate-900">Create New Password</h2>
          <p className="text-sm text-slate-500 font-medium">Please enter your new password below.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 mb-1 font-bold text-sm">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 text-sm font-medium outline-none transition-all"
              placeholder="Min 8 characters"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-bold text-sm">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 text-sm font-medium outline-none transition-all"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || error.includes('Invalid or expired')}
            className="w-full py-2.5 rounded-xl bg-blue-900 text-white font-extrabold text-sm hover:bg-blue-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

      </div>
    </div>
  );
}
