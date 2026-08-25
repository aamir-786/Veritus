import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, supabaseGoogleLogin, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      const from = searchParams.get('from');
      if (from) {
        navigate(from);
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate, searchParams]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    const res = await supabaseGoogleLogin();
    if (!res.success) {
      setError(res.error || 'Failed to initialize Google login');
      setLoading(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const res = await register(email, password, fullName);
      if (res.success) {
        setSuccess(res.message || 'Registration successful! Please check your email to verify your account.');
        setFullName('');
        setEmail('');
        setPassword('');
      } else {
        setError(res.error || 'Registration failed');
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
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.82), rgba(11, 19, 43, 0.90)), url('/images/signup_bg.png')`
      }}
    >
      {/* Ambient Radial Gradient Accent */}
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 glass-card rounded-2xl p-8 max-w-md w-full border border-slate-200/80 shadow-2xl bg-white/95 backdrop-blur-xl space-y-5">
        
        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 rounded-xl bg-blue-900 text-white flex items-center justify-center mx-auto shadow-md ring-4 ring-blue-900/10">
            <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-slate-900">Create Practitioner Account</h2>
          <p className="text-xs text-slate-500 font-medium">Join Veritus Executive Risk Decision Platform</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Supabase Google Sign-Up Option */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
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
          <span className="px-3 text-[10px] text-slate-400 uppercase tracking-wider font-mono font-semibold">or register with email</span>
          <div className="flex-1 border-t border-slate-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs font-medium">
          <div>
            <label className="block text-slate-700 mb-1 font-bold">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Alex Vance"
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-bold">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="cro@enterprise.com"
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
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-blue-900 text-white font-extrabold text-xs hover:bg-blue-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Register Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account? <Link to={searchParams.get('redirect') ? `/login?redirect=${searchParams.get('redirect')}` : '/login'} className="text-blue-900 font-bold hover:underline">Sign In</Link>
        </div>

      </div>
    </div>
  );
}
