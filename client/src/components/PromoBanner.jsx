import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../services/api';

export default function PromoBanner() {
  const [promotion, setPromotion] = useState(null);
  const [isVisible, setIsVisible] = useState(() => {
    return sessionStorage.getItem('dismissedPromoId') !== 'default-executive-2026';
  });

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const res = await api.getActivePromotion();
        if (res.success && res.promotion) {
          // Check if user has already dismissed this specific promotion
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

  const fallbackPromo = {
    id: 'default-executive-2026',
    message: '🎉 EXECUTIVE OFFER: Get 20% OFF All Masterclasses & Frameworks — Use Code: EXECUTIVE20 at checkout!'
  };

  const activePromo = promotion || fallbackPromo;

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white px-4 py-2 flex items-center justify-center relative shadow-sm z-50 border-b border-amber-400/30">
      <div className="text-xs sm:text-sm font-bold text-center pr-8 max-w-4xl flex items-center justify-center gap-3">
        <span>{activePromo.message}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText('EXECUTIVE20');
            alert('Promo code EXECUTIVE20 copied to clipboard!');
          }}
          className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase hover:bg-amber-300 transition-colors shrink-0"
        >
          Copy Code
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
  );
}
