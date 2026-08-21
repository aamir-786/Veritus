import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../services/api';

export default function PromoBanner() {
  const [promotion, setPromotion] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

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

  if (!isVisible || !promotion) return null;

  return (
    <div className="bg-[#00c2e0] text-slate-900 px-4 py-2 flex items-center justify-center relative shadow-sm z-50">
      <div className="text-sm font-bold text-center pr-8 max-w-4xl">
        {promotion.message}
      </div>
      <button 
        onClick={handleDismiss}
        className="absolute right-4 p-1 hover:bg-black/10 rounded-full transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
