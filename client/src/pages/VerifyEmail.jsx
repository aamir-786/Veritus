import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verifyToken = async () => {
      try {
        // Typically we'd have this in api.js, but fetch is fine for a simple GET
        const response = await fetch(`http://localhost:5000/api/v1/auth/verify-email?token=${token}`);
        const data = await response.json();
        
        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! You can now log in.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. Token may be invalid or expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('An unexpected error occurred during verification.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div 
      className="min-h-[82vh] flex items-center justify-center px-4 py-16 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(11, 19, 43, 0.78), rgba(15, 23, 42, 0.88)), url('/images/login_bg.png')`
      }}
    >
      <div className="absolute inset-0 bg-radial-gradient from-blue-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 glass-card rounded-2xl p-8 max-w-md w-full border border-slate-200/80 shadow-2xl bg-white/95 backdrop-blur-xl space-y-5 text-center">
        
        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-blue-900 animate-spin mx-auto" />
            <h2 className="font-display text-xl font-extrabold text-slate-900">Verifying Email</h2>
            <p className="text-xs text-slate-500 font-medium">Please wait while we confirm your executive account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md ring-4 ring-emerald-600/10">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h2 className="font-display text-xl font-extrabold text-slate-900">Verification Successful</h2>
            <p className="text-sm text-slate-600 font-medium">{message}</p>
            <Link to="/login" className="w-full py-2.5 rounded-xl bg-blue-900 text-white font-extrabold text-xs hover:bg-blue-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4">
              Proceed to Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-md ring-4 ring-rose-600/10">
              <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h2 className="font-display text-xl font-extrabold text-slate-900">Verification Failed</h2>
            <p className="text-sm text-rose-600 font-medium">{message}</p>
            <Link to="/login" className="w-full py-2.5 rounded-xl bg-slate-200 text-slate-800 font-extrabold text-xs hover:bg-slate-300 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4">
              Return to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
