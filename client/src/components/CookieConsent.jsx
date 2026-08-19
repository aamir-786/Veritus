import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted or declined cookies
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay to not overwhelm the user immediately on load
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none flex justify-center">
      <div className="pointer-events-auto w-full max-w-4xl glass-card rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transform translate-y-0 transition-transform duration-500 ease-out">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">We value your privacy</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
              By clicking "Accept All", you consent to our use of cookies. To learn more, read our{' '}
              <Link to="/legal/privacy" className="text-emerald-700 hover:text-emerald-800 font-medium underline">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
          <button 
            onClick={handleDecline}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 shadow-xs shadow-emerald-500/20 transition-all"
          >
            Accept All
          </button>
          <button 
            onClick={handleDecline} 
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-2"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
