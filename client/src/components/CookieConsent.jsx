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
    <div className="fixed bottom-0 left-0 z-50 p-4 pointer-events-none flex justify-start">
      <div className="pointer-events-auto w-full max-w-[320px] glass-card rounded-xl border border-slate-200 shadow-2xl p-4 flex flex-col gap-3 transform translate-y-0 transition-transform duration-500 ease-out">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
              <Cookie className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">We value your privacy</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies. To learn more, read our{' '}
                <Link to="/legal/privacy" className="text-emerald-700 hover:text-emerald-800 font-medium underline">
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </div>
          <button 
            onClick={handleDecline} 
            className="p-1.5 -mt-1.5 -mr-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 w-full justify-end mt-1">
          <button 
            onClick={handleDecline}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-lg text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-600 shadow-xs shadow-emerald-500/20 transition-all"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
