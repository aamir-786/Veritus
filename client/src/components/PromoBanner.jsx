import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { api } from '../services/api';

export default function PromoBanner() {
  const [promotion, setPromotion] = useState(null);
  const [isVisible, setIsVisible] = useState(() => {
    return sessionStorage.getItem('dismissedPromoId') !== 'default-executive-2026';
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const res = await api.getActivePromotion();
        if (res.success && res.promotion) {
          const dismissedId = sessionStorage.getItem('dismissedPromoId');
          if (dismissedId !== res.promotion.id) {
            setPromotion(res.promotion);
            setIsVisible(true);
          }
        }
      } catch (err) {
        console.error('Error fetching promotion:', err);
      }
    };
    fetchPromotion();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (promotion) {
      sessionStorage.setItem('dismissedPromoId', promotion.id);
    }
  };

  const extractPromoCode = (promo) => {
    if (promo?.code) return promo.code;
    if (promo?.promo_code) return promo.promo_code;
    if (promo?.message) {
      const match = promo.message.match(/(?:Code|code|CODE):\s*([A-Za-z0-9_-]+)/);
      if (match && match[1]) return match[1];
    }
    return 'EXECUTIVE20';
  };

  const fallbackPromo = {
    id: 'default-executive-2026',
    code: 'EXECUTIVE20',
    message: '🎉 EXECUTIVE OFFER: Get 20% OFF All Masterclasses & Frameworks — Use Code: EXECUTIVE20 at checkout!'
  };

  const activePromo = promotion || fallbackPromo;
  const promoCodeToCopy = extractPromoCode(activePromo);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCodeToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white px-4 py-2 flex items-center justify-center relative shadow-sm z-50 border-b border-amber-400/30">
        <div className="text-xs sm:text-sm font-bold text-center pr-8 max-w-4xl flex items-center justify-center gap-3">
          <span>{activePromo.message}</span>
          <button
            onClick={handleCopyCode}
            className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase hover:bg-amber-300 transition-all shrink-0 flex items-center gap-1 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-slate-950" /> Copied!
              </>
            ) : (
              'Copy Code'
            )}
          </button>
        </div>
        <button 
          onClick={handleDismiss}
          className="absolute right-4 p-1 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Toast Notification Pill in Corner */}
      {copied && (
        <div className="fixed top-5 right-5 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900/95 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-2.5 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>
              Promo code <span className="font-mono text-amber-400 font-bold">{promoCodeToCopy}</span> copied to clipboard!
            </span>
          </div>
        </div>
      )}
    </>
  );
}
