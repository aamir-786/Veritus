import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await sendPasswordReset(email);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Failed to send reset email.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[82vh] flex items-center justify-center px-4 py-16 bg-slate-50 relative">
        <div className="relative z-10 glass-card rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-xl bg-white text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-slate-900">Check Your Email</h2>
          <p className="text-sm text-slate-600 font-medium">
            We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and click the link to continue.
          </p>
          <div className="pt-4">
            <Link to="/login" className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors inline-block">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-16 bg-slate-50 relative">
      <div className="relative z-10 glass-card rounded-2xl p-8 max-w-md w-full border border-slate-200 shadow-xl bg-white space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-slate-900">Reset Password</h2>
          <p className="text-sm text-slate-500 font-medium">Enter your email address to receive a secure reset link.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 mb-1 font-bold text-sm">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 text-sm font-medium outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-blue-900 text-white font-extrabold text-sm hover:bg-blue-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link to="/login" className="text-sm text-slate-500 hover:text-blue-900 font-bold inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
