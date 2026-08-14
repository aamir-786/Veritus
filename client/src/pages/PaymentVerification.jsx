import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function PaymentVerification() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 10;

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    let intervalId;

    const verifyPayment = async () => {
      try {
        const res = await api.verifySession(sessionId);
        if (res.success && res.verified) {
          setStatus('success');
          clearCart(); // Clear cart immediately on verified success
          clearInterval(intervalId);
        } else {
          setAttempts(prev => {
            if (prev >= MAX_ATTEMPTS) {
              clearInterval(intervalId);
              setStatus('error');
              return prev;
            }
            return prev + 1;
          });
        }
      } catch (err) {
        console.error('Session verification error:', err);
        setAttempts(prev => {
          if (prev >= MAX_ATTEMPTS) {
            clearInterval(intervalId);
            setStatus('error');
            return prev;
          }
          return prev + 1;
        });
      }
    };

    // Initial check immediately
    verifyPayment();

    // Poll every 3 seconds
    intervalId = setInterval(verifyPayment, 3000);

    return () => clearInterval(intervalId);
  }, [sessionId]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center space-y-6 relative overflow-hidden">
        
        {/* Background Accent */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {status === 'verifying' && (
          <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2 shadow-inner">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-900">Verifying Payment</h2>
            <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
              Please wait while we confirm your secure payment with Stripe. This usually takes just a few seconds.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-5 animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2 shadow-inner border border-emerald-100">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-display font-extrabold text-slate-900">Payment Verified!</h2>
              <p className="text-sm text-slate-500 font-medium">
                Your purchase was successful. Receipt emailed.
              </p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-4 w-full py-3.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
            >
              Go to Dashboard Learning Page
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-2 border border-rose-100">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900">Verification Timed Out</h2>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              We couldn't verify your payment instantly. If your payment went through, your access will be granted shortly via email.
            </p>
            <div className="flex w-full gap-3 mt-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold transition-colors text-sm"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => navigate('/cart')}
                className="flex-1 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-md transition-colors text-sm"
              >
                Return to Cart
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
